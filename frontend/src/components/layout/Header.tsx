import { Link, useNavigate } from "react-router-dom"

const Header: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userData");
        sessionStorage.removeItem("token")
        navigate("/login");
    };

    const token = sessionStorage.getItem("token")

    return (
        <div className="text-center bg-blue-500 text-white p-4">
            <h1 className="text-2xl font-bold">Welcome to my App!</h1>
            {token ? (
                <button
                    onClick={handleLogout}
                    className="text-blue-300 hover:underline">
                    Odjavi me
                </button>
            ) : (
                <>
                    <Link to="/register" className="text-blue-300 hover:underline mr-4">Registruj se</Link>
                    <Link to="/login" className="text-blue-300 hover:underline">Prijavi se</Link>
                </>
            )}
        </div>
    )
}

export default Header;