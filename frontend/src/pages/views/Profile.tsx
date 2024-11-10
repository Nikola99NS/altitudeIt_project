import React, { useState } from 'react';
import { change2FAStatus, checkPassword, updatePassword } from '../../services/authService';
import { saveUserInfo, uploadProfileImage } from '../../services/userService';
import { User, EditState, PasswordChange } from '../../types/models';

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

const Profile: React.FC = () => {
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');
    const email = user.email;


    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [isEditingPassword, setIsEditingPassword] = useState<boolean>(false);
    const [passwordChange, setPasswordChange] = useState<PasswordChange>({
        currentPassword: '',
        newPassword: '',
        isPasswordValid: false,
        isChangingPassword: false,
    });

    const [isEditing, setIsEditing] = useState<EditState>({
        ime: false,
        prezime: false,
        dateBirth: false,
    });

    const [userInfo, setUserInfo] = useState<User>({
        email,
        twoFA: user.twoFA,
        ime: user.ime,
        prezime: user.prezime,
        dateBirth: user.dateBirth,
        urlSlike: user.urlSlike,
        roleId: user.roleId,
    });

    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<number>(user.twoFA);


    const handleVerifyPassword = async () => {
        const valid = await checkPassword({ email, password: passwordChange.currentPassword });
        setPasswordChange((prev) => ({
            ...prev,
            isPasswordValid: valid,
        }));
        if (!valid) {
            alert('Trenutna lozinka nije ispravna!');
        } else {
            setIsEditingPassword(true);
        }
    };

    const handleSaveNewPassword = async () => {
        setPasswordChange((prev) => ({ ...prev, isChangingPassword: true }));
        const response = await updatePassword({ email, newPassword: passwordChange.newPassword });
        if (response) {
            alert('Lozinka uspešno promenjena!');
            setPasswordChange({
                currentPassword: '',
                newPassword: '',
                isPasswordValid: false,
                isChangingPassword: false,
            });
            setIsEditingPassword(false);
        } else {
            alert('Greška prilikom promene lozinke!');
            setPasswordChange((prev) => ({ ...prev, isChangingPassword: false }));
        }
    };

    const handleEditToggle = (field: keyof EditState) => {
        setIsEditing((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleChange = (field: keyof User, value: string) => {
        setUserInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveChanges = async () => {
        const response = await saveUserInfo({ ...userInfo });
        if (response) {
            alert('Podaci uspešno sačuvani!');
            setIsEditing({ ime: false, prezime: false, dateBirth: false });
            setUserInfo({
                ...userInfo,
                ime: userInfo.ime,
                prezime: userInfo.prezime,
                dateBirth: userInfo.dateBirth,
            });
        } else {
            alert('Greška prilikom čuvanja podataka!');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setProfileImage(e.target.files[0]);
        }
    };

    const handleUploadImage = async () => {
        if (!profileImage) return;

        const newProfileImageUrl = await uploadProfileImage({ email, profileImage });
        if (newProfileImageUrl) {
            setUserInfo((prev) => ({
                ...prev,
                urlSlike: `${API_URL}${newProfileImageUrl}`,
            }));
            alert('Profile image updated successfully!');
        } else {
            alert('Failed to upload profile image.');
        }
    };

    const toggleTwoFactor = async () => {
        console.log(isTwoFactorEnabled)
        const newStatus = isTwoFactorEnabled ? 0 : 1;
        console.log(newStatus)
        const success = await change2FAStatus({ email, newStatus });

        if (success) {
            setIsTwoFactorEnabled(newStatus);
            alert(`Two-Factor Authentication ${newStatus ? 'activated' : 'deactivated'}!`);
        } else {
            alert(`Failed to ${newStatus ? 'activate' : 'deactivate'} Two-Factor Authentication.`);
        }
    };


    return (
        <div className="max-w-2xl w-1/2 mx-auto mt-10 p-5 border rounded bg-white shadow-lg">
            <div className="flex flex-col items-start p-5">
                {/* Profile pic */}
                <div className="flex flex-col space-y-4 items-start mb-5">
                    <img
                        src={userInfo.urlSlike}
                        alt="Profile"
                        width="140"
                        height="130"
                        className="rounded-3xl object-cover"
                    />
                    {/* Div sa flex za input i button u istom redu */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="file-upload" className="custom-file-upload border-2 p-1 bg-blue-200 text-blue-800 cursor-pointer hover:bg-blue-300">
                            Izaberi sliku
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <button onClick={handleUploadImage} className="border-2 p-1 bg-green-200 text-green-800 hover:bg-green-300">
                            Upload Profile Image
                        </button>
                        <button
                            onClick={toggleTwoFactor}
                            className={`px-4 py-2 rounded text-white font-semibold transition duration-200 
                        ${isTwoFactorEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            {isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </button>
                    </div>
                </div>

                <div className="space-y-7">
                    {/* User Info fields */}
                    {['ime', 'prezime', 'dateBirth'].map((field) => (
                        <div key={field} className="grid grid-cols-3 gap-x-4 items-center">
                            <span className="font-semibold capitalize">{field} :</span>
                            {isEditing[field as keyof EditState] ? (
                                <input
                                    type={field === 'dateBirth' ? 'date' : 'text'}
                                    value={userInfo[field as keyof User]}
                                    onChange={(e) => handleChange(field as keyof User, e.target.value)}
                                    className="border border-gray-300 rounded p-2 w-[150px]"
                                />
                            ) : (
                                <span className="p-2 w-[150px]">{userInfo[field as keyof User]}</span>
                            )}
                            <button
                                onClick={() => handleEditToggle(field as keyof EditState)}
                                className="text-blue-500 ml-4"
                            >
                                {isEditing[field as keyof EditState] ? 'Save' : 'Edit'}
                            </button>
                        </div>
                    ))}
                    <div className="mt-4">
                        <button
                            onClick={handleSaveChanges}
                            className="px-4 py-2 border-2 border-blue-500 bg-blue-500  text-white rounded-lg hover:bg-blue-600 hover:border-blue-600 transition duration-200"
                        >
                            Save Changes
                        </button>
                    </div>

                    {/* Password change */}
                    <div className="flex">
                        {!isEditingPassword ? (
                            <button
                                className="text-blue-400"
                                onClick={() => setIsEditingPassword(true)}
                            >
                                Change Password
                            </button>
                        ) : (
                            <div>
                                {!passwordChange.isPasswordValid && (
                                    <div>
                                        <input
                                            type="password"
                                            value={passwordChange.currentPassword}
                                            onChange={(e) =>
                                                setPasswordChange({
                                                    ...passwordChange,
                                                    currentPassword: e.target.value,
                                                })
                                            }
                                            placeholder="Enter current password"
                                            className="border border-gray-300 rounded p-2 w-[250px] mr-4"
                                        />
                                        <button
                                            onClick={handleVerifyPassword}
                                            className="px-4 py-2 border-2 border-blue-500 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:border-blue-600 transition duration-200"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                )}

                                {passwordChange.isPasswordValid && (
                                    <div>
                                        <input
                                            type="password"
                                            value={passwordChange.newPassword}
                                            onChange={(e) =>
                                                setPasswordChange({
                                                    ...passwordChange,
                                                    newPassword: e.target.value,
                                                })
                                            }
                                            placeholder="Enter new password"
                                            className="border border-gray-300 rounded p-2 w-[250px] mr-4"
                                        />
                                        <button
                                            onClick={handleSaveNewPassword}
                                            disabled={passwordChange.isChangingPassword}
                                            className="px-4 py-2 border-2 border-blue-500 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 hover:border-blue-600 transition duration-200"
                                        >
                                            {passwordChange.isChangingPassword
                                                ? 'Changing...'
                                                : 'Save Password'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Profile;
