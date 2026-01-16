
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Go'Top Pro: Initialisation de l'application...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Go'Top Pro: Élément #root introuvable !");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Go'Top Pro: Application montée avec succès.");
}
