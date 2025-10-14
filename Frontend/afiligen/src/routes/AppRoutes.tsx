import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import CreateAccountPage from '../features/auth/pages/CreateAccountPage';
import Home from '../features/home/Home';
import PrivateRoutes from './PrivateRoutes';
import PublicRoutes from './PublicRoutes';
import { ToastContainer } from 'react-toastify';
import Integrations from '../features/integrations/Integrations';
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/" element={<LoginPage />} />
        </Route>
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/home" element={<Home />} />
          <Route path="/integrations" element={<Integrations />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
};

export default AppRoutes;
