import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getPublicImageUrl, getImagesForDirectory } from "@/lib/imageCache";

interface GalleryProps {
  category: string;
  subcategory: string;
  onSelectItem?: (path: string) => void;
}

// Simple function to get images from the imageCache
const getImageList = (category: string, subcategory?: string): string[] => {
  return getImagesForDirectory(category, subcategory);
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
        // Get images directly from the cache - no verification needed
        const foundImages = getImageList(category, subcategory);
        
        if (foundImages.length === 0) {
          setError(`No images found in ${category}/${subcategory || ""}`);
        }
        
        setImages(foundImages);
      } catch (error) {
        console.error('[Gallery] Error loading images:', error);
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
      ) :
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
      }
    </div>
  );
} 