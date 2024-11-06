import React, { useState } from 'react';
import { checkPassword, updatePassword } from '../services/authService'; // Pretpostavljamo da imate funkciju koja proverava lozinku

const Profile: React.FC = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const email = user.email;

    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false); // Da li šaljemo novu lozinku na server

    // Funkcija za proveru trenutne lozinke
    const handleVerifyPassword = async () => {
        const valid = await checkPassword({ email, password: currentPassword });
        setIsPasswordValid(valid);
        if (!valid) {
            alert('Trenutna lozinka nije ispravna!');
        } else {
            setIsEditingPassword(true); // Ako je lozinka tačna, dozvoliti unos nove lozinke
        }
    };

    const handleSaveNewPassword = async () => {
        setIsChangingPassword(true);
        const response = await updatePassword({ email, newPassword });
        if (response) {
            alert('Lozinka uspešno promenjena!');
            setCurrentPassword('');
            setNewPassword('');
            setIsEditingPassword(false);
            setIsChangingPassword(false);
        } else {
            alert('Greška prilikom promene lozinke!');
            setIsChangingPassword(false);
        }
    };

    return (
        <div>
            <div>
                {!isEditingPassword ? (
                    <button onClick={() => setIsEditingPassword(true)}>Promenite lozinku</button>
                ) : (
                    <div>
                        <div>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Unesite trenutnu lozinku"
                            />
                            <button onClick={handleVerifyPassword}>Proverite trenutnu lozinku</button>
                        </div>

                        {isPasswordValid && (
                            <div>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Unesite novu lozinku"
                                />
                                <button onClick={handleSaveNewPassword} disabled={isChangingPassword}>
                                    {isChangingPassword ? 'Promena u toku...' : 'Sačuvaj novu lozinku'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
