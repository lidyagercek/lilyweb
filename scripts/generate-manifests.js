#!/usr/bin/env node

/**
 * Generate manifest.json files for all image directories
 * This script scans public/images and creates manifest.json files in each directory
 * with a list of image files to make it easier for the web application to find them.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Set to true to enable debug output

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(path.dirname(__dirname), 'public', 'images');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
const IGNORE_FILES = ['.DS_Store', 'thumbs.db', 'desktop.ini', 'manifest.json', 'README.md'];

// Utility to check if a path is a directory
const isDirectory = (source) => fs.statSync(source).isDirectory();

// Utility to check if a file is an image based on extension
const isImage = (file) => {
  const ext = path.extname(file).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
};

// Utility to get directories in a directory
const getDirectories = (source) => 
  fs.readdirSync(source)
    .filter(file => !IGNORE_FILES.includes(file))
    .map(name => path.join(source, name))
    .filter(isDirectory);

// Utility to get image files in a directory
const getImageFiles = (source) => 
  fs.readdirSync(source)
    .filter(file => !IGNORE_FILES.includes(file))
    .filter(file => isImage(file))
    .sort();

// Generate manifest.json for a directory
const generateManifest = (dir) => {
  const imageFiles = getImageFiles(dir);
  const subdirectories = getDirectories(dir).map(d => path.basename(d));
  
  const manifest = {
    files: imageFiles
  };
  
  // If there are subdirectories, include them in the manifest
  if (subdirectories.length > 0) {
    manifest.subdirectories = subdirectories;
  }
  
  // Write the manifest file
  const manifestPath = path.join(dir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  

  
  // Process subdirectories recursively
  subdirectories.forEach(subdir => {
    generateManifest(path.join(dir, subdir));
  });
};

// Main function
const main = () => {
  if (DEBUG) {
    console.log('🔍 Generating image manifests...');
    console.log(`🗂️  Root directory: ${ROOT_DIR}`);
  }
  
  // Create the root manifest.json with information
  const rootManifest = {
    description: "This manifest.json file helps the gallery application find images in the public directory",
    usage: "You can place a manifest.json file in any subdirectory of public/images to list files",
    example: "Place manifest.json files in each category folder to list files in that category",
    structure: {
      files: ["Array of filenames in this directory"]
    }
  };
  
  fs.writeFileSync(path.join(ROOT_DIR, 'manifest.json'), JSON.stringify(rootManifest, null, 2) + '\n');
  if (DEBUG) {
    console.log('✅ Generated root manifest.json');
  }
  
  // Process all directories recursively
  const topLevelDirs = getDirectories(ROOT_DIR);
  topLevelDirs.forEach(dir => {
    generateManifest(dir);
  });
  
  if (DEBUG) {
    console.log('✨ All manifests generated successfully!');
  }
};

// Run the script
main(); 