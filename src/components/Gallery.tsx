import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GalleryProps {
  category: string;
  subcategory: string;
  onSelectItem?: (path: string) => void;
}

// Function to get the correct public URL for images
const getPublicImageUrl = (path: string): string => {
  // Make sure the path uses the correct format for browser URLs
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  if (!path.startsWith('images/')) {
    path = `images/${path}`;
  }
  return `${import.meta.env.BASE_URL || '/'}${path}`;
};

// Images cache to store preloaded images
const imageCache: Record<string, string[]> = {};

// Preload images using Vite's import.meta.glob during the boot phase
const preloadImageDirectories = () => {
  // Use import.meta.glob to get all image files
  // During build time, Vite will statically analyze this pattern and include all matching files
  // The pattern should match the structure in the public directory
  // Using '/images/**/*' matches what would be available at runtime (after public directory is copied to root)
  const imageModules = import.meta.glob('/images/**/*.{jpg,jpeg,png,gif,webp,svg,bmp,ico}', { 
    eager: true, // Load all matches immediately rather than on-demand
    as: 'url'    // Get the public URL of each asset
  });

  // Process the loaded modules to organize them by directory
  Object.entries(imageModules).forEach(([path, url]) => {
    // Extract directories from path: /images/category/subcategory/file.jpg
    const relativePath = path.replace('/images/', '');
    const pathParts = relativePath.split('/');
    
    // Handle files at different directory depths
    if (pathParts.length >= 2) {
      const category = pathParts[0];
      const subcategory = pathParts.length > 2 ? pathParts[1] : '';
      const fileName = pathParts[pathParts.length - 1];
      
      // Create directory key - either category or category/subcategory
      const dirKey = subcategory ? `${category}/${subcategory}` : category;
      
      // Initialize array for this directory if not exists
      if (!imageCache[dirKey]) {
        imageCache[dirKey] = [];
      }
      
      // Add the file to the cache
      if (!imageCache[dirKey].includes(fileName)) {
        imageCache[dirKey].push(fileName);
      }
    }
  });
  
  console.log('[Gallery] Preloaded image directories:', Object.keys(imageCache));
  return imageCache;
};

// Preload images during module initialization
preloadImageDirectories();

// Helper function to check if image cache is ready - can be called during app initialization
export const isImageCacheReady = (): boolean => {
  return Object.keys(imageCache).length > 0;
};

// Export the imageCache for potential use in other components
export const getImageCache = (): Record<string, string[]> => {
  return {...imageCache};
};

// Direct approach to scan a directory using file system module or cached images
const scanDirectoryForImages = async (directoryPath: string, subDir?: string): Promise<string[]> => {
  try {
    // Build the path to scan
    let basePath = directoryPath;
    if (subDir) {
      basePath = `${directoryPath}/${subDir}`;
    }
    
    // Attempt 1: Try to use manifest.json if available
    try {
      const manifestUrl = `${import.meta.env.BASE_URL || '/'}images/${basePath}/manifest.json`;
      
      const response = await fetch(manifestUrl, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.files && Array.isArray(data.files)) {
          
          // Verify each file exists and has content
          const verifiedFiles = [];
          for (const file of data.files) {
            const fileUrl = getPublicImageUrl(`${basePath}/${file}`);
            
            try {
              const fileCheck = await fetch(fileUrl, { method: 'HEAD' });
              if (fileCheck.ok && parseInt(fileCheck.headers.get('content-length') || '0') > 0) {
                verifiedFiles.push(file);
              } else {
              }
            } catch (e) {
            }
          }
          
          if (verifiedFiles.length > 0) {
            return verifiedFiles;
          } else {
          }
        }
      }
    } catch (e) {
      console.error(`[Gallery Debug] Error scanning directory ${directoryPath}/${subDir || ''}:`, e);

    }
    
    // Attempt 2: Try to directly scan the directory using more aggressive methods
    return await scanDirectoryDirectly(basePath);
  } catch (err) {
    return [];
  }
};

// Directly scan a directory for all possible image files
const scanDirectoryDirectly = async (basePath: string): Promise<string[]> => {
  const foundImages: string[] = [];
  
  // Common image extensions to check
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const baseImageUrl = `${import.meta.env.BASE_URL || '/'}images/${basePath}/`;
  
  try {
    // Attempt 1: Try to use fetch to get a directory listing (some servers support this)
    const dirResponse = await fetch(baseImageUrl);
    if (dirResponse.ok) {
      const html = await dirResponse.text();
      
      // Look for links to image files in the directory listing
      const regex = /href="([^"]*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico))"/gi;
      const matches = [...html.matchAll(regex)];
      
      if (matches && matches.length > 0) {
        const imageFiles = matches.map(m => m[1].split('/').pop() || '').filter(Boolean);
        return imageFiles;
      }
    }
  } catch (e) {
    console.log('Directory listing not supported by server');
  }
  
  // Attempt 2: Try common filenames
  // This includes sequential numbers (1.jpg, 2.jpg, etc) and common image names
  const filePatterns = [
    // Sequential numbers
    ...Array.from({ length: 50 }, (_, i) => `${i + 1}`),
    
    // Common image names
    'image', 'photo', 'artwork', 'picture', 'wallpaper', 'background',
    'illustration', 'drawing', 'sketch', 'design', 'render', 'shot',
    'img', 'pic', 'sample', 'cover', 'thumbnail', 'preview',
    
    // Try to detect files matching the category or subcategory name
    basePath.split('/').pop() || ''
  ];
  
  // Check all combinations of patterns and extensions
  const checkPromises: Promise<string>[] = [];
  
  // For each pattern and extension, try to find a matching file
  for (const pattern of filePatterns) {
    for (const ext of extensions) {
      const filename = `${pattern}.${ext}`;
      
      checkPromises.push(
        fetch(`${baseImageUrl}${filename}`, { method: 'HEAD' })
          .then(response => {
            // Check if the file exists and has content
            if (response.ok) {
              const contentLength = parseInt(response.headers.get('content-length') || '0');
              if (contentLength > 0) {
                return filename;
              }
            }
            throw new Error(`File ${filename} not found or empty`);
          })
          .catch(() => '')
      );
    }
  }
  
  // Also check if there are any files simply named with the extensions
  // (e.g., .jpg, .png) without a specific name
  for (const ext of extensions) {
    checkPromises.push(
      fetch(`${baseImageUrl}.${ext}`, { method: 'HEAD' })
        .then(response => response.ok ? `.${ext}` : '')
        .catch(() => '')
    );
  }
  
  // Wait for all check requests to complete
  const results = await Promise.all(checkPromises);
  
  // Filter out empty results and add valid files to the list
  results.filter(Boolean).forEach(filename => {
    if (!foundImages.includes(filename)) {
      foundImages.push(filename);
    }
  });
  
  
  // If we still haven't found any images, try one last approach - looking for any image files
  if (foundImages.length === 0) {
    try {
      // Try a different approach for the last attempt
      // Check for any files that might exist with common image patterns
      const lastAttemptPatterns = [
        'main', 'header', 'banner', 'logo', 'icon', 'avatar',
        'profile', 'gallery', 'showcase', 'portfolio', 'art',
        'work', 'project', 'example', 'demo', 'test', 'sample'
      ];
      
      for (const pattern of lastAttemptPatterns) {
        for (const ext of extensions) {
          try {
            const checkUrl = `${baseImageUrl}${pattern}.${ext}`;
            const response = await fetch(checkUrl, { method: 'HEAD' });
            if (response.ok) {
              foundImages.push(`${pattern}.${ext}`);
            }
          } catch (e) {
            // Ignore errors for this last-ditch effort
          }
        }
      }
    } catch (e) {
      console.log('Final image scan attempt failed');
    }
  }
  
  return foundImages;
};

// Consolidated function to get images either from cache or fallback methods
const getImageList = async (category: string, subcategory?: string): Promise<string[]> => {
  const basePath = subcategory ? `${category}/${subcategory}` : category;
  
  // First, check if we have cached images for this path
  if (imageCache[basePath] && imageCache[basePath].length > 0) {
    console.log(`[Gallery] Using cached images for ${basePath}:`, imageCache[basePath].length);
    return imageCache[basePath];
  }
  
  // If no cached images, fall back to the original scanning methods
  console.log(`[Gallery] No cached images for ${basePath}, falling back to scan methods`);
  return await scanDirectoryForImages(category, subcategory);
};

export function Gallery({ category, subcategory, onSelectItem }: GalleryProps) {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Format image filename for display
  const formatImageName = (filename: string): string => {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    // Replace hyphens and underscores with spaces
    return nameWithoutExt.replace(/[-_]/g, " ");
  };

  // Load images from the directories
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      setSelectedImage(null);
      setError(null);
      
      try {
        // Get images using the consolidated function
        const foundImages = await getImageList(category, subcategory);
        
        if (foundImages.length === 0) {
          setError(`No images found in ${category}/${subcategory || ""}`);
        }
        
        setImages(foundImages);
      } catch (error) {
        console.error('[Gallery Debug] Error loading images:', error);
        setError(`Error loading images: ${error}`);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadImages();
  }, [category, subcategory]);

  return (
    <div className="w-full h-full flex flex-col bg-[#000000]">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#000000] border border-[#6D6DD0] shadow-[inset_-1px_-1px_0_#6D6DD0,inset_1px_1px_0_#6D6DD0] p-4">
            <p className="text-sm text-[#6D6DD0]">Loading...</p>
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center bg-[#000000]" style={{ backgroundImage: 'none' }}>
          <div className="bg-[#000000] border-4 border-[#6D6DD0] p-6 w-64 h-32 flex items-center justify-center">
            <p className="text-center text-xl text-[#6D6DD0] font-bold">
              This folder is empty
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Thumbnail grid - Flexible layout */}
          <div className="flex flex-wrap gap-4 p-3 bg-[#000000] overflow-y-auto flex-1 content-start">
            {images.map((image, index) => {
              // Build the proper image path
              const imagePath = subcategory 
                ? `${category}/${subcategory}/${image}`
                : `${category}/${image}`;
              
              const imageUrl = getPublicImageUrl(imagePath);
              const displayName = formatImageName(image);
              
              
              return (
                <div 
                  key={index} 
                  className={cn(
                    "flex flex-col cursor-pointer",
                    selectedImage === image ? "outline outline-8 outline-[#6D6DD0]" : ""
                  )}
                  onClick={() => {
                    setSelectedImage(image);
                    setViewingImage(imagePath);
                    if (onSelectItem) {
                      onSelectItem(imagePath);
                    }
                  }}
                >
                  <div className="border-[2.5px] border-[#6D6DD0] flex items-center justify-center overflow-hidden p-1 min-h-[100px] min-w-[100px] max-w-[200px] bg-[#000000]">
                    <img 
                      src={imageUrl}
                      alt={displayName}
                      className="max-h-[120px] w-auto object-contain select-none pointer-events-none"
                      draggable="false"
                      onError={(e) => {
                        console.error(`Failed to load image: ${imageUrl}`);
                        
                        // If image fails to load, show filename instead
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="h-full w-full flex items-center justify-center bg-[#000000]"
                               style="background-color: #000000;">
                            <p class="text-xs text-center p-2 text-[#6D6DD0]">${displayName}</p>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <div className="text-center text-xs mt-1 max-w-[200px] px-1 truncate text-[#6D6DD0]">
                    {displayName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status bar - simplified */}
          <div className="flex items-center px-2 py-1 text-xs border-t-4 border-[#6D6DD0] bg-[#000000] text-[#6D6DD0]">
            <div className="px-1">
              {images.length} item{images.length !== 1 ? 's' : ''}
            </div>
            {selectedImage && (
              <div className="ml-2 truncate font-bold">
                Selected: {formatImageName(selectedImage)}
              </div>
            )}
          </div>
          
          {/* Image viewer modal */}
          {viewingImage && (
            <div 
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={() => setViewingImage(null)}
            >
              <div 
                className="bg-[#000000] border-4 border-[#6D6DD0] p-1 m-4 max-w-[90%] max-h-[90%] shadow-md"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-[#000000] text-[#6D6DD0] text-xs px-1 py-0.5 flex justify-between items-center mb-1 border-4 border-[#6D6DD0]">
                  <span className="font-bold">{formatImageName(viewingImage)}</span>
                  <button 
                    className="text-xs bg-[#6D6DD0] text-[#000000] w-4 h-4 flex items-center justify-center"
                    onClick={() => setViewingImage(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="bg-[#000000] p-2 flex items-center justify-center">
                  <img 
                    src={getPublicImageUrl(viewingImage)}
                    alt={formatImageName(viewingImage)}
                    className="max-w-full max-h-[70vh] object-contain select-none pointer-events-none"
                    draggable="false"
                    onError={(e) => {
                      // If image fails to load, show a placeholder
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="h-64 w-64 flex items-center justify-center bg-[#000000]" 
                             style="background-color: #000000;">
                          <p class="text-sm p-4 text-center font-bold text-[#6D6DD0]">
                            Image failed to load
                          </p>
                        </div>
                      `;
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 