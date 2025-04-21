import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GalleryProps {
  category: string;
  subcategory: string;
}

// Function to get the correct public URL for images
const getPublicImageUrl = (path: string): string => {
  // Make sure the path uses the correct format for browser URLs
  return `${import.meta.env.BASE_URL || '/'}images/${path}`;
};

// Function to scan for existing files in the public directory
const fetchActualImages = async (category: string, subcategory: string): Promise<string[]> => {
  const basePath = subcategory ? `${category}/${subcategory}` : category;
  
  // Instead of trying to import directly, we'll use a list of known filenames
  // This works around Vite's limitation with public directory imports
  const knownImages: Record<string, Record<string, string[]>> = {
    '2d-arts': {
      'illustrations': ['illustration1.jpg', 'character-design.png', 'landscape.jpg'],
      'sketches': ['sketch1.jpg', 'sketch2.png', 'quick-drawing.jpg', 'day3.png'],
      'character-concept-designs': ['hero.png', 'villain.jpg', 'npc.png'],
      'casual-arts': ['doodle.jpg', 'fanart.png', 'practice.jpg']
    },
    '3d-works': {
      'renders': ['rings01.png', 'rings02.png', 'rings06.png', '0d9c349c_original.jpg', 'e32042c8_original.jpg'],
      'models': ['face01.png', 'face02.png', 'objects01.png', 'objects02.png']
    },
    'pixel-arts': {
      '': ['708f5166_original.png', 'atlas.png', 'c92fc8d1_original.png']
    },
    'animations': {
      'live2d': ['0e347348_original.gif', '5196f39f_original.gif', 'd36cb289_original.gif', 'e0432963_original.gif', 'fce9efc7_original.gif', 'Recording2024-12-22154536-ezgif.com-video-to-gif-converter.gif'],
      '2d-animations': ['ezgif-1-18c7dde900.gif', 'ezgif-1-49dc237468.gif', 'ezgif-1-956afaa4da.gif', 'ezgif-1-c640b44fb7.gif', 'ezgif-1-f44cd6b98a.gif', 'ezgif-1-feeb3b5891.gif'],
      'pixel-animations': ['ghoul.gif', 'imp.gif', 'slime.gif'],
      '3d-animations': ['3d-walk.gif', '3d-action.gif', 'particles.gif']
    },
    'tattoos': {
      'tattoos': ['arm-piece.jpg', 'back-tattoo.jpg', 'sleeve.jpg'],
      'available-designs': ['flash1.jpg', 'flash2.jpg', 'custom-design.jpg'],
      'fake-skins': ['temporary-tattoo.jpg', 'skin-art.jpg', 'body-paint.jpg']
    },
    'about-me': {
      'about': ['profile.jpg', 'bio.txt', 'introduction.png'],
      'skills': ['art-skills.jpg', 'technical-skills.png', 'soft-skills.jpg'],
      'programs': ['photoshop.png', 'illustrator.png', 'blender.png', 'after-effects.png'],
      'work-experience': ['resume.pdf', 'portfolio.jpg', 'achievements.png'],
      'socials': ['twitter.png', 'instagram.png', 'artstation.png', 'deviantart.png'],
      'contact': ['email.png', 'discord.png', 'form.png']
    }
  };

  // Return the list of known images for this category/subcategory
  return knownImages[category]?.[subcategory] || [];
};

export function Gallery({ category, subcategory }: GalleryProps) {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  
  // Generate a placeholder color based on the filename
  const getPlaceholderColor = (filename: string) => {
    const hash = filename.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return `hsl(${hash % 360}, 70%, 80%)`;
  };

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
      
      try {
        // Get the list of possible images
        const foundImages = await fetchActualImages(category, subcategory);
        setImages(foundImages);
      } catch (error) {
        console.error('Error loading images:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadImages();
  }, [category, subcategory]);

  return (
    <div className="w-full h-full flex flex-col">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#000000] border border-[#6D6DD0] shadow-[inset_-1px_-1px_0_#6D6DD0,inset_1px_1px_0_#6D6DD0] p-4">
            <p className="text-sm text-[#6D6DD0]">Loading...</p>
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-[#000000] border border-[#6D6DD0] shadow-[inset_-1px_-1px_0_#6D6DD0,inset_1px_1px_0_#6D6DD0] p-4 mb-4">
            <p className="text-sm text-[#6D6DD0]">No images found in this folder.</p>
          </div>
          <p className="text-xs text-center max-w-xs text-[#6D6DD0]">
            To add images, place files in:<br/>
            <span className="font-mono bg-[#000000] px-1 border border-[#6D6DD0] text-[#6D6DD0]">
              public/images/{category}/{subcategory ? subcategory + '/' : ''}
            </span>
            <br/><br/>
            <span className="text-[10px] mt-2 block text-[#6D6DD0]">
              Reload the page after adding files
            </span>
          </p>
        </div>
      ) : (
        <>
          {/* Thumbnail grid - Flexible layout */}
          <div className="flex flex-wrap gap-4 p-3 bg-[#000000] overflow-y-auto flex-1 content-start">
            {images.map((image, index) => {
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
                    setViewingImage(image);
                  }}
                >
                  <div className="border-[6px] border-[#6D6DD0] flex items-center justify-center overflow-hidden p-1 min-h-[100px] min-w-[100px] max-w-[200px] bg-[#000000]">
                    <img 
                      src={imageUrl}
                      alt={displayName}
                      className="max-h-[120px] w-auto object-contain"
                      onError={(e) => {
                        // If image fails to load, show filename instead
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="h-full w-full flex items-center justify-center bg-[#000000]"
                               style="background-color: #000000;">
                            <p class="text-xs text-center font-bold p-2 text-[#6D6DD0]">${displayName}</p>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <div className="text-center text-xs mt-1 max-w-[200px] px-1 truncate font-bold text-[#6D6DD0]">
                    {displayName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status bar - simplified */}
          <div className="flex items-center px-2 py-1 text-xs border-t-4 border-[#6D6DD0] bg-[#000000] text-[#6D6DD0]">
            <div className="px-1 font-bold">
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
                    src={getPublicImageUrl(subcategory 
                      ? `${category}/${subcategory}/${viewingImage}` 
                      : `${category}/${viewingImage}`
                    )}
                    alt={formatImageName(viewingImage)}
                    className="max-w-full max-h-[70vh] object-contain"
                    onError={(e) => {
                      // If image fails to load, show a placeholder
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="h-64 w-64 flex items-center justify-center bg-[#000000]" 
                             style="background-color: #000000;">
                          <p class="text-sm p-4 text-center font-bold text-[#6D6DD0]">
                            This is a placeholder for: ${formatImageName(viewingImage)}<br/><br/>
                            Add your image file to:<br/>
                            public/images/${category}/${subcategory ? subcategory + '/' : ''}${viewingImage}
                            <br/><br/>
                            <span class="text-xs block mt-2">
                              Make sure the file exists and reload the page
                            </span>
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