import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    if (user !== null) {
      setLoading(false); 
    }
  }, [user]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  
  if (!user) {
    console.log('No hay usuario, redirigiendo...');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
