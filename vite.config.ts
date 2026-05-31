import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run dev` (vite 단독) 사용 시 /api 요청을 로컬 wrangler(8788)로 프록시한다.
// `npm run dev:pages` 를 쓰면 wrangler가 Functions와 정적 자산을 함께 서빙하므로 프록시가 필요 없다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
