import { defineConfig } from 'vite';

export default defineConfig({
  root: './', // Указывает, что корневая директория для Vite - это текущая директория (frontend/)
  build: {
    outDir: 'dist', // Директория для сборки
    rollupOptions: {
      input: {
        main: './index.html', // Основная страница
        login: './login/login.html', // Страница логина
        'admin/main': './admin/main/index.html', // Админка главная
        'admin/edit': './admin/editing/index.html', // Админка редактирование
        'admin/database': './admin/database/index.html', // Админка база данных
        'for_users': './for_users/index.html', // Пользовательская страница
        'for_users/database': './for_users/database.html', // Пользовательская база данных
      },
    },
  },
  server: {
    open: '/for_users/index.html', // Дефолтная страница - for_users
    port: 5173,
  },
  // Плагин для обработки редиректов в dev режиме
  plugins: [
    {
      name: 'redirect-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Редирект корня на for_users
          if (req.url === '/' || req.url === '/index.html') {
            res.writeHead(302, { Location: '/for_users/index.html' });
            res.end();
            return;
          }
          
          // Редирект /login на страницу логина
          if (req.url === '/login' || req.url === '/login/') {
            res.writeHead(302, { Location: '/login/login.html' });
            res.end();
            return;
          }
          
          // Редирект /admin на главную админки
          if (req.url === '/admin' || req.url === '/admin/') {
            res.writeHead(302, { Location: '/admin/main/index.html' });
            res.end();
            return;
          }
          
          // Редирект /admin/edit на страницу редактирования
          if (req.url === '/admin/edit' || req.url === '/admin/edit/') {
            res.writeHead(302, { Location: '/admin/editing/index.html' });
            res.end();
            return;
          }
          
          // Редирект /admin/database на страницу базы данных
          if (req.url === '/admin/database' || req.url === '/admin/database/') {
            res.writeHead(302, { Location: '/admin/database/index.html' });
            res.end();
            return;
          }
          
          next();
        });
      },
    },
  ],
});
