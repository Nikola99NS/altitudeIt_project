import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../../components/auth/Login';
import Register from '../../components/auth/Register';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Home from '../Home';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<div>404 - Stranica nije pronađena</div>} />
        </Routes>
    );
};

export default AppRoutes;
