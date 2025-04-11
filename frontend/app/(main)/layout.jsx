import React from 'react';
import DashboardProvider from './provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';

function DashboardLayout({ children }) {
  return (
    <div>
      <DashboardProvider>
        {children}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </DashboardProvider>
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
