import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteGlslPlugin from 'vite-plugin-glsl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), ViteGlslPlugin()]
})
