import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css' // <-- GARANTA QUE ESTA LINHA ESTEJA AQUI E APONTE PARA O ARQUIVO CORRETO

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)