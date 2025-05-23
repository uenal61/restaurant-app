import { Outlet, useNavigate } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function Layout() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setLoggedIn(!!user);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-4 py-3 shadow-md flex flex-wrap justify-between items-center">
        <div
          onClick={() => navigate('/')}
          className="text-xl font-bold text-blue-400 cursor-pointer"
        >
          fridaysdining
        </div>
        <div className="flex gap-3 mt-2 sm:mt-0 flex-wrap">
          {loggedIn && (
            <>
              <button onClick={() => navigate('/home')} className="hover:text-blue-400">
                Home
              </button>
              <button onClick={() => navigate('/create')} className="hover:text-blue-400">
                Restaurant anlegen
              </button>
              <button onClick={() => navigate('/statistics')} className="hover:text-blue-400">
                Statistik
              </button>
              <button onClick={() => navigate('/users')} className="hover:text-blue-400">
                Admin
              </button>
            </>
          )}
          {/* Blog immer sichtbar */}
          <button onClick={() => navigate('/blog')} className="hover:text-purple-400">
            Blog
          </button>
          {loggedIn ? (
            <button onClick={handleLogout} className="text-red-400 hover:text-red-500">
              Logout
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="text-green-400 hover:text-green-500">
              Login
            </button>
          )}
        </div>
      </nav>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
