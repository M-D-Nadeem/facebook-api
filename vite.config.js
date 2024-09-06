import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    https:{
      key:"./myapp-privateKey.key",
      cert:"./myapp.crt",

    }
  },
  plugins: [react()],
})
