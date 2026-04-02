import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Button, Input } from '../ui';
import { FaSearch, FaBell, FaUserCircle, FaBars } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

function Header({ onOpenMobile }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };
  return (
    <header className="bg-white border-b sticky top-0 z-20">
      <div className="px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Open menu"
          >
            <FaBars />
          </button>

          <Link to="/" className="text-lg font-semibold text-primary-600">Inventory</Link>
          <div className="hidden sm:flex items-center bg-gray-100 rounded-md px-3 py-1 gap-2">
            <FaSearch className="text-gray-400" />
            <Input placeholder="Search..." className="bg-transparent border-0 p-0 text-sm" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <FaBell className="text-gray-500" />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100"
            >
              <FaUserCircle className="text-gray-500 w-6 h-6" />
              <div className="text-sm">{user?.name || 'User'}</div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg py-2 z-30">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
