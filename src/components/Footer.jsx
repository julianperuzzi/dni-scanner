// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto text-center">
        <p>&copy; 2024 DNI Scanner. Desarrollo Julian Peruzzi.</p>
        <div className="mt-4">
          <a href="/" className="text-gray-400 hover:text-gray-300 mr-4">Uso Administrado JulianPeruzzi.dev</a>
          <a href="www.linkedin.com/in/julianperuzzi" className="text-gray-400 hover:text-gray-300">Linkedin</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
