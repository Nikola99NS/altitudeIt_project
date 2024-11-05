import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkEmailVerification, loginUser } from '../../services/authService';

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
            await loginUser({ email, password, verificationCode });
            navigate('/')
        } catch (err) {
            setError('Neispravni podaci za prijavu ili verifikacioni kod.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Verifikacioni kod</label>
                            <div className="flex justify-between mt-1">
                                {[...Array(6)].map((_, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength={1}
                                        className="flex-1 w-1/6 h-12 mx-1 text-center border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                                        onChange={(e) => {
                                            setVerificationCode((prev) => {
                                                const newCode = prev.split('');
                                                newCode[index] = e.target.value;
                                                return newCode.join('');
                                            });
                                            if (e.target.value) {
                                                const nextInput = e.target.nextElementSibling as HTMLInputElement;
                                                if (nextInput) nextInput.focus();
                                            }
                                        }}
                                        onFocus={(e) => e.target.select()}
                                    />
                                ))}
                            </div>
                        </div>
                    )}


                    <button
                        type="submit"
                        className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                    >
                        Prijavi se
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
