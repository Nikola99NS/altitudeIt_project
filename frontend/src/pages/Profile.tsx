import React, { useState } from 'react';
import { checkPassword, saveUserInfo, updatePassword, uploadProfileImage } from '../services/authService';

const API_URL = "http://localhost:5000";


const Profile: React.FC = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const email = user.email;

    console.log(user)


    const [profileImage, setProfileImage] = useState(null);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);


    const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({
        name: false,
        surname: false,
        birthdate: false,
        password: false,
    });

    const [userInfo, setUserInfo] = useState({
        name: user.ime,
        surname: user.prezime,
        // birthdate: (user.dateBirth).match(/^\d{4}-\d{2}-\d{2}/)[0],
        birthdate: user.dateBirth,
        profileImage: user.urlSlike,
    });


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



    // Funkcija za prebacivanje između prikaza i uređivanja
    const handleEditToggle = (field: string) => {
        setIsEditing((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    // Funkcija za promenu podataka
    const handleChange = (field: string, value: string) => {
        setUserInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    };


    // Funkcija za čuvanje ažuriranih podataka u bazi
    const handleSaveChanges = async () => {
        const response = await saveUserInfo({ email, ...userInfo });
        if (response) {
            alert('Podaci uspešno sačuvani!');
            setIsEditing({ name: false, surname: false, birthdate: false });
            setUserInfo({
                ...userInfo,
                name: userInfo.name, // ažurirani name
                surname: userInfo.surname, // ažurirani lastName
                birthdate: userInfo.birthdate, // ažurirani birthdate
            });

        } else {
            alert('Greška prilikom čuvanja podataka!');
        }
    };

    const handleImageChange = (e: any) => {
        setProfileImage(e.target.files[0]);
    };

    const handleUploadImage = async () => {
        if (!profileImage) return;

        const newProfileImageUrl = await uploadProfileImage({ email, profileImage });

        if (newProfileImageUrl) {
            setUserInfo((prev) => ({
                ...prev,
                profileImage: `${API_URL}${newProfileImageUrl}`, // ažurira URL profilne slike
            }));
            alert("Profile image updated successfully!");
        } else {
            alert("Failed to upload profile image.");
        }
    };



    return (
        <div className="max-w-2xl w-1/2 mx-auto mt-10 p-5 border rounded bg-white shadow-lg">
            <div className="flex flex-col items-start p-5">
                {/* Profile pic */}
                <div className="flex flex-col items-start mb-5">
                    <img
                        src={userInfo.profileImage}
                        alt="Profile"
                        width="150"
                        height="150"
                    />
                    <input type="file" onChange={handleImageChange} />
                    <button onClick={handleUploadImage}>Upload Profile Image</button>
                </div>
                <div className="space-y-7">
                    {/* Ime */}
                    <div className="grid grid-cols-3 gap-x-4 items-center">
                        <span className="font-semibold">Ime:</span>
                        {isEditing.name ? (
                            <input
                                type="text"
                                value={userInfo.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="border border-gray-300 rounded p-2 w-[150px]" />
                        ) : (
                            <span className="p-2 w-[150px]">{userInfo.name}</span>
                        )}
                        <button
                            onClick={() => handleEditToggle('name')}
                            className="text-blue-500 ml-4"
                        >
                            {isEditing.name ? 'Sačuvaj' : 'Izmeni'}
                        </button>
                    </div>
                    {/* Prezime */}
                    <div className="grid grid-cols-3 gap-x-4 items-center">
                        <span className="font-semibold">Prezime:</span>
                        {isEditing.surname ? (
                            <input
                                type="text"
                                value={userInfo.surname}
                                onChange={(e) => handleChange('surname', e.target.value)}
                                className="border border-gray-300 rounded p-2 w-[150px]" />
                        ) : (
                            <span className="p-2 w-[150px]">{userInfo.surname}</span>
                        )}
                        <button
                            onClick={() => handleEditToggle('surname')}
                            className="text-blue-500 ml-4"
                        >
                            {isEditing.surname ? 'Sačuvaj' : 'Izmeni'}
                        </button>
                    </div>

                    {/* Datum rođenja */}
                    <div className="grid grid-cols-3 gap-x-4 items-center">
                        <span className="font-semibold">Datum rođenja:</span>
                        {isEditing.birthdate ? (
                            <input
                                type="date"
                                value={userInfo.birthdate}
                                onChange={(e) => handleChange('birthdate', e.target.value)}
                                className="border border-gray-300 rounded p-2 w-[150px]" />
                        ) : (
                            <span className="p-2 w-[150px]">{userInfo.birthdate}</span>
                        )}
                        <button
                            onClick={() => handleEditToggle('birthdate')}
                            className="text-blue-500 ml-4"
                        >
                            {isEditing.birthdate ? 'Sačuvaj' : 'Izmeni'}
                        </button>
                    </div>
                    {/* Dugme za čuvanje svih promena */}
                    <div className="mt-4">
                        <button
                            onClick={handleSaveChanges}
                            className="px-4 py-2 border-2 border-blue-500 bg-blue-500  text-white rounded-lg hover:bg-blue-600 hover:border-blue-600 transition duration-200"
                        >
                            Sačuvaj promene
                        </button>
                    </div>
                    {/* password */}
                    <div className="flex">
                        {!isEditingPassword ? (
                            <button
                                className="text-blue-400"
                                onClick={() => setIsEditingPassword(true)}
                            >
                                Promenite Vašu lozinku
                            </button>
                        ) : (
                            <div>
                                {/* Polja za trenutnu lozinku i potvrdu */}
                                {!isPasswordValid && (
                                    <div>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Unesite trenutnu lozinku"
                                            className="border border-gray-300 rounded p-2 w-[250px] mr-4"
                                        />
                                        <button
                                            onClick={handleVerifyPassword}
                                            className="px-4 py-2 border-2 border-blue-500 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:border-blue-600 transition duration-200"
                                        >
                                            Unesi
                                        </button>
                                    </div>
                                )}

                                {/* Polja za novu lozinku i čuvanje */}
                                {isPasswordValid && (
                                    <div>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Unesite novu lozinku"
                                            className="border border-gray-300 rounded p-2 w-[250px] mr-4"
                                        />
                                        <button
                                            onClick={handleSaveNewPassword}
                                            disabled={isChangingPassword}
                                            className="px-4 py-2 border-2 border-blue-500 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:border-blue-600 transition duration-200"
                                        >
                                            {isChangingPassword ? 'Promena u toku...' : 'Sačuvaj'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Profile;

