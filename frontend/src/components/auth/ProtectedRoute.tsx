import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = sessionStorage.getItem('token')
    if (!token) {
        // Ako token ne postoji, preusmerimo na stranicu za prijavu
        return <Navigate to="/login" />;
    }

    return <>{children} </>
};

export default ProtectedRoute;
