// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto text-center">
        <p>&copy; 2024 DNI Scanner. Desarrollo Julian Peruzzi.</p>
        <div className="mt-4">
          <a href="/terms" className="text-gray-400 hover:text-gray-300 mr-4">Términos y condiciones</a>
          <a href="/privacy" className="text-gray-400 hover:text-gray-300">Política de privacidad</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
