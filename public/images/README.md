# Images Gallery Directory

This directory contains all images for the gallery. The system will scan this directory structure to display images in the gallery application.

## Directory Structure

- Each category should be a separate folder
- Subcategories should be folders inside the category folders
- Images should be placed in the appropriate category/subcategory folders

Example:
```
/images
  /2d-arts
    /illustrations
      image1.jpg
      image2.png
    /sketches
      sketch1.png
  /3d-works
    /models
      model1.jpg
```

## How the Gallery Finds Images

The gallery uses two methods to find images:

1. **Manifest Files** (recommended): Create a `manifest.json` file in any folder to explicitly list files:

```json
{
  "files": [
    "image1.jpg",
    "image2.png",
    "image3.webp"
  ]
}
```

2. **Dynamic Scanning**: If no manifest exists, the gallery will try to find images with common names and extensions.

## Adding New Images

1. Create the appropriate category/subcategory folders if they don't exist
2. Add your image files to the folder
3. Either:
   - Add the filenames to the manifest.json file in that folder
   - Name your files with common patterns (1.jpg, 2.png, image.jpg, etc.)
4. Refresh the gallery page to see your images 