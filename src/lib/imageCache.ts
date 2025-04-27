// Image cache to store preloaded images
const imageCache: Record<string, string[]> = {};

// Known categories and subcategories to preload
const knownDirectories = [
  { category: '3d-works', subcategory: 'renders' },
  { category: '3d-works', subcategory: 'animations' },
  { category: 'animations', subcategory: 'pixel-animations' },
  { category: 'animations', subcategory: 'digital-animations' },
  { category: 'animations', subcategory: 'live2d' },
  { category: 'digital-art', subcategory: 'illustrations' },
  { category: 'digital-art', subcategory: 'pixel-art' },
  { category: 'about-me', subcategory: 'skills' }
];

// Function to get the correct public URL for images
export const getPublicImageUrl = (path: string): string => {
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  if (!path.startsWith('images/')) {
    path = `images/${path}`;
  }
  return `${import.meta.env.BASE_URL || '/'}${path}`;
};

// Load manifests for known directories
const preloadFromManifests = async (): Promise<void> => {
  console.log('[Image Cache] Attempting to preload from manifest.json files');
  
  for (const dir of knownDirectories) {
    try {
      const { category, subcategory } = dir;
      const basePath = subcategory ? `${category}/${subcategory}` : category;
      const manifestUrl = `${import.meta.env.BASE_URL || '/'}images/${basePath}/manifest.json`;
      
      console.log(`[Image Cache] Checking manifest: ${manifestUrl}`);
      
      const response = await fetch(manifestUrl, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.files && Array.isArray(data.files)) {
          // Initialize cache entry for this directory
          if (!imageCache[basePath]) {
            imageCache[basePath] = [];
          }
          
          // Add all files from manifest
          data.files.forEach((file: string) => {
            if (!imageCache[basePath].includes(file)) {
              imageCache[basePath].push(file);
            }
          });
          
          console.log(`[Image Cache] Loaded ${data.files.length} files from manifest for ${basePath}`);
        }
      }
    } catch (error) {
      console.error(`[Image Cache] Error loading manifest for ${dir.category}/${dir.subcategory || ''}:`, error);
    }
  }
};

// Preload images using Vite's import.meta.glob
export const preloadImageDirectories = async (): Promise<Record<string, string[]>> => {
  console.log('[Image Cache] Starting preload of image directories...');
  
  // Try different patterns to find the right path structure
  const patterns = [
    // Standard pattern - looking for images in the public directory that will be at root in production
    '/public/images/**/*.{jpg,jpeg,png,gif,webp,svg,bmp,ico}',
    // Alternative pattern if the above doesn't work
    '/images/**/*.{jpg,jpeg,png,gif,webp,svg,bmp,ico}',
    // Relative pattern from the current directory
    '../public/images/**/*.{jpg,jpeg,png,gif,webp,svg,bmp,ico}'
  ];
  
  let totalImages = 0;
  
  // Try each pattern
    try {
      const imageModules = import.meta.glob('../../dist/images/**/*.{jpg,jpeg,png,gif,webp,svg,bmp,ico}', { 
        eager: true,
        as: 'url'
      });
      
      
      if (Object.keys(imageModules).length > 0) {
        totalImages += Object.keys(imageModules).length;
        
        Object.entries(imageModules).forEach(([path, url]) => {
          // Extract path parts based on the pattern
          let relativePath = path;
          if (path.includes('/images/')) {
            relativePath = path.substring(path.indexOf('/images/') + 8);
          } else if (path.includes('/public/images/')) {
            relativePath = path.substring(path.indexOf('/public/images/') + 15);
          }
          
          console.log(`[Image Cache] Processing image: ${path} -> ${relativePath}`);
          
          const pathParts = relativePath.split('/');
          
          if (pathParts.length >= 2) {
            const category = pathParts[0];
            const subcategory = pathParts.length > 2 ? pathParts[1] : '';
            const fileName = pathParts[pathParts.length - 1];
            
            const dirKey = subcategory ? `${category}/${subcategory}` : category;
            
            console.log(`[Image Cache] Categorizing as: ${dirKey}/${fileName}`);
            
            if (!imageCache[dirKey]) {
              imageCache[dirKey] = [];
            }
            
            if (!imageCache[dirKey].includes(fileName)) {
              imageCache[dirKey].push(fileName);
            }
          }
        });
      }
    } catch (error) {
    }
  
  
  // If no images found with glob patterns, try loading from manifest files
  if (totalImages === 0) {
    console.log('[Image Cache] No images found with glob patterns, trying manifest loading');
    await preloadFromManifests();
  }
  
  console.log(`[Image Cache] Total images found: ${totalImages}`);
  console.log('[Image Cache] Preloaded directories:', Object.keys(imageCache));
  console.log('[Image Cache] Image counts per directory:', 
    Object.entries(imageCache).map(([dir, files]) => `${dir}: ${files.length}`).join(', '));
  
  return imageCache;
};

// Get images for a specific directory
export const getImagesForDirectory = (category: string, subcategory?: string): string[] => {
  const basePath = subcategory ? `${category}/${subcategory}` : category;
  return imageCache[basePath] || [];
};

// Check if the image cache is ready
export const isImageCacheReady = (): boolean => {
  return Object.keys(imageCache).length > 0;
};

// Get a copy of the entire image cache
export const getImageCache = (): Record<string, string[]> => {
  return {...imageCache};
}; 