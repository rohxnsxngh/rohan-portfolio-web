// src/plugins/remarkImagePlugin.mjs
import { visit } from 'unist-util-visit';
import path from 'path';
import fs from 'fs';

// This plugin processes markdown images with @images syntax
export function remarkImagePlugin() {
  return (tree, file) => {
    visit(tree, 'image', (node) => {
      // Check if the image URL starts with @images
      if (node.url.startsWith('@images/')) {
        // Replace with a path that Astro can process
        const imagePath = node.url.replace('@images/', '/src/images/');
        node.url = imagePath;
      }
    });
  };
}