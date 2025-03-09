// src/plugins/remarkImagePlugin.mjs
import { visit } from 'unist-util-visit';
import path from 'path';
import fs from 'fs';

// This plugin processes markdown images with @images syntax
export function remarkImagePlugin() {
  return function (tree) {
    visit(tree, 'image', (node) => {
      if (node.url.startsWith('@images/')) {
        node.type = 'html';
        const imgPath = node.url.replace('@images/', '/src/images/');
        node.value = ``;
      }
    });
  };
}