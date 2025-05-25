import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { Menu, X } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setLoggedIn(!!user);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-4 py-3 shadow-md">
        <div className="flex justify-between items-center">
          <div
            onClick={() => navigate("/")}
            className="text-xl font-bold text-blue-400 cursor-pointer"
          >
            fridaysdining
          </div>
          <button className="md:hidden" onClick={toggleMenu}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="hidden md:flex gap-4">
            {loggedIn && (
              <>
                <button onClick={() => navigate("/home")} className="hover:text-blue-400">
                  Home
                </button>
                <button onClick={() => navigate("/create")} className="hover:text-blue-400">
                  Restaurant anlegen
                </button>
                <button onClick={() => navigate("/statistics")} className="hover:text-blue-400">
                  Statistik
                </button>
                <button onClick={() => navigate("/users")} className="hover:text-blue-400">
                  Admin
                </button>
              </>
            )}
            <button onClick={() => navigate("/blog")} className="hover:text-purple-400">
              Blog
            </button>
            {loggedIn ? (
              <button onClick={handleLogout} className="text-red-400 hover:text-red-500">
                Logout
              </button>
            ) : (
              <button onClick={() => navigate("/login")} className="text-green-400 hover:text-green-500">
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 flex flex-col gap-2">
            {loggedIn && (
              <>
                <button onClick={() => { navigate("/home"); setMenuOpen(false); }} className="hover:text-blue-400">
                  Home
                </button>
                <button onClick={() => { navigate("/create"); setMenuOpen(false); }} className="hover:text-blue-400">
                  Restaurant anlegen
                </button>
                <button onClick={() => { navigate("/statistics"); setMenuOpen(false); }} className="hover:text-blue-400">
                  Statistik
                </button>
                <button onClick={() => { navigate("/users"); setMenuOpen(false); }} className="hover:text-blue-400">
                  Admin
                </button>
              </>
            )}
            <button onClick={() => { navigate("/blog"); setMenuOpen(false); }} className="hover:text-purple-400">
              Blog
            </button>
            {loggedIn ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-red-400 hover:text-red-500">
                Logout
              </button>
            ) : (
              <button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="text-green-400 hover:text-green-500">
                Login
              </button>
            )}
          </div>
        )}
      </nav>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
