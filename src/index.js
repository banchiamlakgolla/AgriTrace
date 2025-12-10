import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';  // Import from App.js
import { BlockchainProvider } from './contexts/BlockchainContext'; // If you added this

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BlockchainProvider>  {/* If you added blockchain */}
      <App />
    </BlockchainProvider>
  </React.StrictMode>
);