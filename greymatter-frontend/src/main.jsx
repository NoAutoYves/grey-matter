import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import './styles/main.css';
import { UserProvider } from './context/UserContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';
import { fetchCSRFToken } from './utils/api.js';

// Fetch CSRF token when app starts
fetchCSRFToken();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
);