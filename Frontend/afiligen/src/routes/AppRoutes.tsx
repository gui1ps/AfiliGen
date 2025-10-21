import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import CreateAccountPage from '../features/auth/pages/CreateAccountPage';
import Home from '../features/home/pages/Home';
import PrivateRoutes from './PrivateRoutes';
import PublicRoutes from './PublicRoutes';
import { ToastContainer } from 'react-toastify';
import Integrations from '../features/integrations/pages/Integrations';
import Automations from '../features/automations/pages/Automations';
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
          <Route path="/automations" element={<Automations />} />
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
