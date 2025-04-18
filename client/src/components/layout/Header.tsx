import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-slate-800 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
                <div className="flex gap-4">
                    <Link to="/" className="hover:text-slate-300">Tasks</Link>
                    <Link to="/projects" className="hover:text-slate-300">Projects</Link>
                </div>
                <button 
                    onClick={handleLogout}
                    className="text-white hover:text-slate-300"
                >
                    Logout
                </button>
            </nav>
        </header>
    );
};