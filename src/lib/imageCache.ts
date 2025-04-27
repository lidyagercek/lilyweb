// Image cache to store preloaded images
const imageCache: Record<string, string[]> = {};

// Known categories and subcategories to preload
const knownDirectories = [
  // 3d-works subdirectories
  { category: '3d-works', subcategory: 'renders' },
  { category: '3d-works', subcategory: 'models' },
  
  // animations subdirectories
  { category: 'animations', subcategory: 'pixel-animations' },
  { category: 'animations', subcategory: '2d-animations' },
  { category: 'animations', subcategory: '3d-animations' },
  { category: 'animations', subcategory: 'live2d' },
  
  // 2d-arts subdirectories
  { category: '2d-arts', subcategory: 'illustrations' },
  { category: '2d-arts', subcategory: 'sketches' },
  { category: '2d-arts', subcategory: 'traditional' },
  { category: '2d-arts', subcategory: 'casual-arts' },
  { category: '2d-arts', subcategory: 'character-concept-designs' },
  
  // other categories
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
  for (const dir of knownDirectories) {
    try {
      const { category, subcategory } = dir;
      const basePath = subcategory ? `${category}/${subcategory}` : category;
      const manifestUrl = `${import.meta.env.BASE_URL || '/'}images/${basePath}/manifest.json`;
      
      const response = await fetch(manifestUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.files && Array.isArray(data.files)) {
          // Store the file list directly
          imageCache[basePath] = data.files;
        } else {
          console.warn(`[Image Cache] No files array found in manifest for ${basePath}`);
          imageCache[basePath] = []; // Initialize with empty array to prevent future lookups
        }
      } else {
        console.warn(`[Image Cache] Failed to load manifest for ${basePath}: ${response.status} ${response.statusText}`);
        imageCache[basePath] = []; // Initialize with empty array to prevent future lookups
      }
    } catch (error) {
      console.error(`[Image Cache] Error loading manifest for ${dir.category}/${dir.subcategory || ''}:`, error);
      // Initialize with empty array to prevent future failed lookups
      const basePath = dir.subcategory ? `${dir.category}/${dir.subcategory}` : dir.category;
      imageCache[basePath] = [];
    }
  }
  
  // Get stats about loaded directories
  const loadedDirs = Object.keys(imageCache);
  const emptyDirs = loadedDirs.filter(dir => imageCache[dir].length === 0);
  
  if (emptyDirs.length > 0) {
    console.warn('[Image Cache] Empty directories:', emptyDirs.join(', '));
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
  // First discover any additional directories from root manifest
  await discoverDirectories();
  
  // Then load manifests for all known directories
  await loadFromManifests();
  
  // Return the cache without logging
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