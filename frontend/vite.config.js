import { defineConfig } from 'vite';

export default defineConfig({
  root: './', // Указывает, что корневая директория для Vite - это текущая директория (frontend/)
  build: {
    outDir: 'dist', // Директория для сборки
    rollupOptions: {
      input: {
        main: './index.html', // Основная страница, если есть
        login: './login/index.html', // Страница логина
        admin: './admin/index.html' // Страница админки
        // Добавьте другие страницы админки по мере необходимости
      },
    },
  },
  server: {
    open: '/', // Открывать главную страницу при запуске dev-сервера
  }
});
