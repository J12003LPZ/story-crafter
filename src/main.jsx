import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StoryProvider } from './context/StoryContext.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoryProvider>
        <App />
      </StoryProvider>
    </BrowserRouter>
  </StrictMode>
);
