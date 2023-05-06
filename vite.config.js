import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'


import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: { //主要是加上这段代码
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/__admin__': {
        target: 'http://127.0.0.1:8012',	//实际请求地址
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/test/, '')
      },
    }
  }
})
