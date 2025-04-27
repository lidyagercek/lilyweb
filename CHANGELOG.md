# Changelog

## [Unreleased]

### Changed
- Removed `import.meta.glob` usage for loading images
- Images are now loaded entirely from manifest.json files for better performance
- Added scripts/generate-manifests.js to automatically create manifests
- Added npm scripts for manifest generation
- Added prebuild hook to ensure manifests are generated before builds

### Benefits
- Improved performance by reducing JS bundle size
- Better caching of images in browsers
- Simplified image URL references in code
- More efficient image loading 