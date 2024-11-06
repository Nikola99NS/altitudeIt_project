import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';

const Register: React.FC = () => {
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [birthDate, setBirthDate] = useState(new Date().toISOString().slice(0, 10));
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!firstName || !lastName || !email || !password || !birthDate) {
            setError('Sva polja su obavezna.');
            return;
        }

        try {
            await registerUser({ firstName, lastName, email, password, birthDate });
            setSuccessMessage('Uspešno ste se registrovali!');

            // Preusmeravanje na stranicu za prijavu
            navigate('/login', { state: { email, notVerified: true } });

        } catch (err: any) {
            setError(err.message || 'Došlo je do greške prilikom registracije.');
        }
    };

    return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center">Registracija</h2>
            {error && <p className="mt-4 text-red-500">{error}</p>}
            {successMessage && <p className="mt-4 text-green-500">{successMessage}</p>}

            <form onSubmit={handleSubmit} className="mt-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Ime</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Prezime</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Lozinka</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Datum rođenja</label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                    Registruj se
                </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                Već imate nalog? <a href="/login" className="text-blue-500">Prijavite se ovde</a>
            </p>
        </div>
    );
};

export default Register;
