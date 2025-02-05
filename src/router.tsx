import { createBrowserRouter } from 'react-router-dom';
import Home from './routes/Home';
import Join from './routes/Join';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'join',
        element: <Join />
      }
    ]
  }
]);
