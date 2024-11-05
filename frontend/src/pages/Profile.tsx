import React from 'react';
// import { useUser } from '../context/UserContext';

const Profile: React.FC = () => {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user) {
        return <div>Morate se prvo prijaviti.</div>;
    }

    return (
        <div>
            <p>Vase ime je : {user.ime}</p>
            <p>Vase prezime je : {user.prezime}</p>
            <p>Vas datum rodjenja je : {user.dateBirth}</p>
        </div>
    );
};

export default Profile;
