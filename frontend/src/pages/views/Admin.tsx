

import { useEffect, useState } from "react";
import { activeProfile } from "../../services/userService";

const API_URL = process.env.REACT_APP_BACKEND_API_URL;

// Define types
interface User {
    id: number;
    ime: string;
    prezime: string;
    email: string;
    dateBirth: string;
    isActive: number;
}

const Admin: React.FC = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [emailFilter, setEmailFilter] = useState<string>("");
    const [birthDateFilter, setBirthDateFilter] = useState<string>("");
    const [usersList, setUsersList] = useState<User[]>([]);

    const filteredUsers = usersList.filter((user) => {
        const matchesEmail = emailFilter ? user.email.includes(emailFilter) : true;
        const matchesBirthDate = birthDateFilter ? user.dateBirth === birthDateFilter : true;
        return matchesEmail && matchesBirthDate;
    });


    const handleToggleActiveStatus = async (userId: number, isActive: number) => {
        try {
            const response = await activeProfile({ userId, isActive });

            if (response) {
                setUsersList((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === userId ? { ...user, isActive: isActive === 1 ? 0 : 1 } : user
                    )
                );
                alert(`User has been ${isActive === 1 ? "deactivated" : "activated"}.`);
            } else {
                alert("Failed to update user status.");
            }
        } catch (error) {
            console.error("Error updating user status:", error);
            alert("An error occurred.");
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/user/users`);
                const data = await response.json();

                if (data.success !== false) {
                    const formattedData: User[] = data.map((user: { datum_rodjenja: string }) => ({
                        ...user,
                        dateBirth: new Date(user.datum_rodjenja).toISOString().slice(0, 10),
                    }));

                    setUsersList(formattedData);
                } else {
                    console.error("Failed to fetch users");
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, [user.roleId]);

    return (
        <div className="mx-auto mt-10 p-5 border rounded bg-white shadow-lg inline-block">
            <div className="flex flex-col items-start p-5">
                <h1 className="text-2xl">Admine dobrodošli!</h1>
                <h3 className="mt-4 mb-2">Filtriraj korisnike:</h3>

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

                <h3 className="text-xl my-4">Korisnici:</h3>
                <ul>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <li className="p-2 grid grid-cols-4 gap-4 items-center" key={user.id}>
                                <span>{user.ime} {user.prezime}</span>
                                <span>{user.email}</span>
                                <span className="flex justify-center">{user.dateBirth}</span>
                                <button
                                    onClick={() => handleToggleActiveStatus(user.id, user.isActive)}
                                    className={`px-3 py-1 rounded ${user.isActive ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
                                >
                                    {user.isActive ? "Deactivate" : "Activate"}
                                </button>
                            </li>
                        ))
                    ) : (
                        <p>Trenutno nema korisnika koji odgovaraju filterima.</p>
                    )}
                </ul>
            </div>
        </div >
    );
};

export default Admin;

