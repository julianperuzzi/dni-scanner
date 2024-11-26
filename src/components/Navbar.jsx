import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; // Importamos los iconos de react-icons

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-white text-2xl font-bold">
          <Link to="/">DNI Scanner</Link>
        </div>

        {/* Menu Items */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-gray-300">Inicio</Link>
          <Link to="/scan" className="text-white hover:text-gray-300">Escanear DNI</Link>
          <Link to="/my-data" className="text-white hover:text-gray-300">Mis Datos</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-white">
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />} {/* Mostramos el icono dependiendo del estado */}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col  bg-gray-800 text-white p-4 space-y-4 text-left border-l-2 border-gray-600 py-0 my-4">
          <Link to="/" className="hover:text-gray-300" onClick={toggleMobileMenu}>Inicio</Link>
          <Link to="/scan" className="hover:text-gray-300" onClick={toggleMobileMenu}>Escanear DNI</Link>
          <Link to="/my-data" className="hover:text-gray-300" onClick={toggleMobileMenu}>Mis Datos</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
