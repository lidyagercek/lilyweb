# Changelog

## [Unreleased]

### Changed
- Removed `import.meta.glob` usage for loading images
- Images are now loaded entirely from manifest.json files for better performance
- Added scripts/generate-manifests.js to automatically create manifests
- Added npm scripts for manifest generation
- Added prebuild hook to ensure manifests are generated before builds
- Simplified Gallery component to read images directly from the manifest without verification
- Removed all dynamic image discovery and verification code

### Fixed
- Added missing directory entries for casual-arts, character-concept-designs, models, 2d-animations, and 3d-animations
- Improved debug logging for directory discovery and manifest loading
- Added better error handling for manifest loading

### Benefits
- Improved performance by reducing JS bundle size
- Better caching of images in browsers
- Simplified image URL references in code
- More efficient image loading
- Faster initial page load by eliminating unnecessary network requests 