import { Link } from "react-router-dom"

const Header: React.FC = () => {

    return (
        <div className="text-center bg-blue-500 text-white p-4">
            <h1 className="text-2xl font-bold">Welcome to my App!</h1>
            <Link to="/register" className="text-blue-300 hover:underline mr-4">Registruj se</Link>
            <Link to="/login" className="text-blue-300 hover:underline">Prijavi se</Link>
        </div>
    )
}

export default Header;