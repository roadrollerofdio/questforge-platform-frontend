import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 企业级 Vite 配置：包含别名解析与跨域代理
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        port: 3000,
        host: '0.0.0.0', // 允许局域网访问
        proxy: {
            // 代理所有的 /api/v1 请求到我们的 Spring Boot 后端
            '/api/v1': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api\/v1/, '') // 如果后端没有配 context-path 则开启重写
            }
        }
    }
})