import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { validateToken } from '../services/auth/validate-token';

function PublicRoutes() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  useEffect(() => {
    const checkToken = async () => {
      const access_token = localStorage.getItem('access_token');
      if (!access_token) {
        setIsValid(false);
        return;
      }

      try {
        const response = await validateToken(access_token);
        if (response.valid) {
          setIsValid(response.valid);
        } else {
          setIsValid(false);
        }
      } catch (err) {
        setIsValid(false);
      }
    };

    checkToken();
  }, []);

  if (isValid === null) {
    return <div>Carregando...</div>;
  }

  return isValid ? <Navigate to="/home" replace /> : <Outlet />;
}

export default PublicRoutes;
