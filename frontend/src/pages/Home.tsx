import React from 'react';
import { Navigate } from 'react-router-dom';
import Admin from './views/Admin';
import Profile from './views/Profile';

const Home: React.FC = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const roleId = user?.roleId;

    if (!roleId) {
        return <Navigate to="/login" />;
    }

    if (roleId === 1) {
        return <Profile />;
    } else if (roleId === 2) {
        return <Admin />;
    } else {
        return <Navigate to="/login" />;
    }
};

export default Home;
