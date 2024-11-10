import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkEmailVerification, loginUser } from '../../services/authService';
import VerificationCodeInput from './VerificationCodeInput';

const API_URL = process.env.REACT_APP_BACKEND_API_URL;


const Login: React.FC = () => {
    const location = useLocation();
    const [email, setEmail] = useState<string>(location.state?.email || '');
    const [password, setPassword] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [showVerificationCode, setShowVerificationCode] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();



    const notVerified = location.state?.notVerified || false;

    useEffect(() => {
        if (email && notVerified) {
            const checkVerificationStatus = async () => {
                try {
                    const isVerified = await checkEmailVerification(email);
                    console.log('is verified', isVerified)
                    if (!isVerified) {
                        setShowVerificationCode(true);
                        setError('Vaš nalog nije verifikovan. Unesite verifikacioni kod.');
                    }
                } catch (err) {
                    setError('Greška prilikom provere verifikacije.');
                }
            };
            checkVerificationStatus();
        }
    }, [email, notVerified]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const responseData = await loginUser({ email, password, verificationCode });
            if (responseData.success) {
                sessionStorage.setItem("token", responseData.token)
                localStorage.setItem('user', JSON.stringify({
                    id: responseData.user.id,
                    ime: responseData.user.ime,
                    prezime: responseData.user.prezime,
                    email: responseData.user.email,
                    dateBirth: new Date(responseData.user.dateBirth).toISOString().slice(0, 10),
                    urlSlike: API_URL + responseData.user.urlSlike,
                    roleId: responseData.user.role_id,
                    isActive: responseData.user.isActive
                }));
            }
            alert(responseData.message)
            navigate('/')

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center">Prijava</h2>
            {error && <p className="mt-4 text-red-500">{error}</p>}
            <form onSubmit={handleLogin} className="mt-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Lozinka</label>
                    <input
                        type="password"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {showVerificationCode && (
                    <VerificationCodeInput
                        verificationCode={verificationCode}
                        setVerificationCode={setVerificationCode}
                    />
                )}
                <button
                    type="submit"
                    className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                    Prijavi se
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
                Nemate nalog? <a href="/register" className="text-blue-500">Registrujte se ovde</a>
            </p>

            <button className="google-login-button">
                Prijavi se preko Google naloga
            </button>
        </div>
    );
};

export default Login;
