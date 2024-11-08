import React, { useEffect, useState } from 'react';
import { activeProfile, checkPassword, saveUserInfo, updatePassword, uploadProfileImage } from '../services/authService';

const API_URL = "http://localhost:5000";


const Profile: React.FC = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const email = user.email;


    const [usersList, setUsersList] = useState<any[]>([]); // Drži korisnike u state-u

    const [profileImage, setProfileImage] = useState(null);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);


    const [emailFilter, setEmailFilter] = useState('');
    const [birthDateFilter, setBirthDateFilter] = useState('');

    // Funkcija za filtriranje korisnika po emailu i datumu rođenja
    const filteredUsers = usersList.filter((user) => {
        const matchesEmail = emailFilter ? user.email.includes(emailFilter) : true;
        const matchesBirthDate = birthDateFilter ? user.dateBirth === birthDateFilter : true;
        return matchesEmail && matchesBirthDate;
    });



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

    useEffect(() => {
        if (user.roleId === 2) {
            const fetchUsers = async () => {
                try {
                    const response = await fetch(`${API_URL}/users`);
                    const data = await response.json();

                    if (data.success !== false) {
                        setUsersList(data);
                    } else {
                        console.error('Failed to fetch users');
                    }
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };
            fetchUsers();
        }
    }, [user.roleId]);


    const handleToggleActiveStatus = async (userId: number, isActive: number) => {
        try {
            const response = await activeProfile({ userId, isActive })

            if (response) {
                // Update users list to reflect the new status
                setUsersList((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === userId ? { ...user, isActive: isActive ? 0 : 1 } : user
                    )
                );
                alert(`User has been ${isActive ? "deactivated" : "activated"}.`);
            } else {
                alert("Failed to update user status.");
            }
        } catch (error) {
            console.error("Error updating user status:", error);
            alert("An error occurred.");
        }
    };

    return (
        <>
            {user.roleId === 1 ? (
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
            ) : user.roleId === 2 ? (
                <div className="mx-auto mt-10 p-5 border rounded bg-white shadow-lg inline-block">
                    <div className="flex flex-col items-start p-5">
                        <h1 className="text-2xl">Admine dobrodošli!</h1>
                        <h3>Filtriraj korisnike:</h3>

                        {/* Polja za unos filtera */}
                        <input
                            type="text"
                            placeholder="Filtriraj po emailu"
                            value={emailFilter}
                            onChange={(e) => setEmailFilter(e.target.value)}
                            className="p-2 mt-2 mb-4 border rounded w-full"
                        />
                        <input
                            type="date"
                            placeholder="Filtriraj po datumu rođenja"
                            value={birthDateFilter}
                            onChange={(e) => setBirthDateFilter(e.target.value)}
                            className="p-2 mb-4 border rounded w-full"
                        />

                        <h3>Korisnici:</h3>
                        <ul >
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <li className="p-2" key={user.id}>
                                        <span>
                                            {user.ime} {user.prezime} - {user.email} - {user.datum_rodjenja}
                                        </span>
                                        <button
                                            onClick={() => handleToggleActiveStatus(user.id, user.isActive)}
                                            className={`ml-4 px-3 py-1 rounded ${user.isActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                                }`}
                                        >
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <p>Trenutno nema korisnika koji odgovaraju filterima.</p>
                            )}
                        </ul>
                    </div>
                </div>

            ) : null}
        </>
    );
};

export default Profile;

