# Image Management

Images in this project are stored in the `public/images` directory and are loaded using manifest files.

## Structure

- All images should be placed in appropriate subdirectories under `public/images/`
- Each subdirectory can have its own subdirectories for better organization
- Manifest files (`manifest.json`) are used to list images in each directory

## Working with Images

### Adding New Images

1. Place your images in the appropriate directory under `public/images/`
2. Run `npm run generate-manifests` to update all manifest files
3. The images will be automatically available in your application

### Referencing Images in Code

You can reference images using their URL path:

```jsx
// For an image in public/images/pixel-arts/game_asset.png
<img src="/images/pixel-arts/game_asset.png" alt="Game Asset" />
```

The images are served directly from the public directory with no additional processing.

### Organizing Images

- Create directories for different categories (e.g., `pixel-arts`, `3d-works`, etc.)
- Create subdirectories for more specific categories
- The manifest files will automatically track the structure

## Manifest Files

Manifest files are JSON files that list all images in a directory. They look like this:

```json
{
  "files": [
    "image1.png",
    "image2.jpg",
    "image3.gif"
  ],
  "subdirectories": [
    "subdir1",
    "subdir2"
  ]
}
```

These files are generated automatically using the `npm run generate-manifests` command.

## How It Works

1. The `generate-manifests` script scans the `public/images` directory and creates a manifest.json file in each folder
2. The application reads these manifest files to know what images are available
3. Images are loaded directly from their paths without any validation or complex processing

This approach is:
- Fast: No dynamic scanning or validation needed
- Reliable: Static files are listed in manifests
- Efficient: Images can be cached by browsers
- Simple: Direct URL references in code

## Before Deployment

Before building the project for deployment, run:

```bash
npm run generate-manifests
```

This will update all manifest files. This step is automatically included in the build process. 