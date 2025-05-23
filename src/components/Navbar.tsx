import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`block px-4 py-2 rounded transition-colors ${
        location.pathname === to
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-gray-900 border-b border-gray-700 shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/home" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
          🍽️ fridaysdining
        </Link>

        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-1 text-sm">
            {navLink('/home', 'Home')}
            {navLink('/statistics', 'Statistik')}
            {navLink('/top', 'Bestenliste')}
            {navLink('/create', 'Neues Restaurant')}
            {isAdmin && (
              <>
                {navLink('/criteria', 'Kriterien')}
                {navLink('/users', 'Admin')}
              </>
            )}
            <button
              onClick={handleLogout}
              className="ml-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        )}

        {isLoggedIn && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white focus:outline-none text-2xl"
          >
            ☰
          </button>
        )}
      </div>

      {menuOpen && isLoggedIn && (
        <div className="md:hidden px-4 pb-3 space-y-1 text-sm">
          {navLink('/home', 'Home')}
          {navLink('/statistics', 'Statistik')}
          {navLink('/top', 'Bestenliste')}
          {navLink('/create', 'Neues Restaurant')}
          {isAdmin && (
            <>
              {navLink('/criteria', 'Kriterien')}
              {navLink('/users', 'Admin')}
            </>
          )}
          <button
            onClick={handleLogout}
            className="block w-full text-left bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
