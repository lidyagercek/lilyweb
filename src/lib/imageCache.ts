// Image cache to store preloaded images
const imageCache: Record<string, string[]> = {};

// Known categories and subcategories to preload
const knownDirectories = [
  { category: '3d-works', subcategory: 'renders' },
  { category: '3d-works', subcategory: 'animations' },
  { category: 'animations', subcategory: 'pixel-animations' },
  { category: 'animations', subcategory: 'digital-animations' },
  { category: 'animations', subcategory: 'live2d' },
  { category: '2d-arts', subcategory: 'illustrations' },
  { category: '2d-arts', subcategory: 'sketches' },
  { category: '2d-arts', subcategory: 'traditional' },
  { category: 'pixel-arts', subcategory: null },
  { category: 'tattoos', subcategory: 'tattoos' },
  { category: 'tattoos', subcategory: 'fake-skin' },
  { category: 'tattoos', subcategory: 'flashes' },
  { category: 'about-me', subcategory: 'skills' },
  { category: 'cursors', subcategory: null },
  { category: 'icons', subcategory: null },
  { category: 'wallpapers', subcategory: null }
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

// Load manifests for known directories - no validation needed for static files
const loadFromManifests = async (): Promise<void> => {
  console.log('[Image Cache] Loading from manifest.json files');
  
  for (const dir of knownDirectories) {
    try {
      const { category, subcategory } = dir;
      const basePath = subcategory ? `${category}/${subcategory}` : category;
      const manifestUrl = `${import.meta.env.BASE_URL || '/'}images/${basePath}/manifest.json`;
      
      console.log(`[Image Cache] Loading manifest: ${manifestUrl}`);
      
      const response = await fetch(manifestUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.files && Array.isArray(data.files)) {
          // Store the file list directly
          imageCache[basePath] = data.files;
          console.log(`[Image Cache] Loaded ${data.files.length} files from manifest for ${basePath}`);
        }
      }
    } catch (error) {
      console.error(`[Image Cache] Error loading manifest for ${dir.category}/${dir.subcategory || ''}:`, error);
    }
  }
};

// Discover directories from root manifest
const discoverDirectories = async (): Promise<void> => {
  try {
    const rootManifestUrl = `${import.meta.env.BASE_URL || '/'}images/manifest.json`;
    const response = await fetch(rootManifestUrl);
    
    if (response.ok) {
      // The root manifest might have a list of subdirectories
      const mainManifest = await response.json();
      
      if (mainManifest.subdirectories && Array.isArray(mainManifest.subdirectories)) {
        // For each top level directory, check if it has a manifest
        for (const category of mainManifest.subdirectories) {
          try {
            const categoryManifestUrl = `${import.meta.env.BASE_URL || '/'}images/${category}/manifest.json`;
            const categoryResponse = await fetch(categoryManifestUrl);
            
            if (categoryResponse.ok) {
              const categoryManifest = await categoryResponse.json();
              
              // If this category has subdirectories, add them to knownDirectories
              if (categoryManifest.subdirectories && Array.isArray(categoryManifest.subdirectories)) {
                categoryManifest.subdirectories.forEach((subcategory: string) => {
                  // Add to knownDirectories if not already there
                  if (!knownDirectories.some(dir => 
                      dir.category === category && dir.subcategory === subcategory)) {
                    knownDirectories.push({
                      category,
                      subcategory
                    });
                  }
                });
              }
              
              // Also add the main category if it has files directly
              if (categoryManifest.files && Array.isArray(categoryManifest.files)) {
                if (!knownDirectories.some(dir => 
                    dir.category === category && dir.subcategory === null)) {
                  knownDirectories.push({
                    category,
                    subcategory: null
                  });
                }
              }
            }
          } catch (error) {
            console.error(`[Image Cache] Error loading category manifest for ${category}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('[Image Cache] Error discovering directories:', error);
  }
};

// Preload all image directories
export const preloadImageDirectories = async (): Promise<Record<string, string[]>> => {
  console.log('[Image Cache] Starting preload of image directories...');
  
  // First discover any additional directories from root manifest
  await discoverDirectories();
  
  // Then load manifests for all known directories
  await loadFromManifests();
  
  console.log(`[Image Cache] Total directories loaded: ${Object.keys(imageCache).length}`);
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