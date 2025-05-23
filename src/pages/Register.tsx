import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Firebase Auth-Profil setzen (optional, z. B. für displayName)
      await updateProfile(userCredential.user, { displayName: name });

      // Benutzer in Firestore anlegen
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        instagram,
        role: 'pending', // Admin muss aktivieren
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('Registrierung fehlgeschlagen. Bitte überprüfe deine Eingaben.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 text-white">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          Registrierung
        </h1>

        {success ? (
          <div className="text-green-400 text-center">
            ✅ Registrierung erfolgreich!<br />
            Ein Admin muss deinen Account freischalten.
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block mb-1 font-semibold">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="Max Mustermann"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Instagram (optional)</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="@deinname"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                placeholder="deine@email.de"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Passwort</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2 right-2 text-sm text-gray-300 hover:text-white"
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded"
            >
              {loading ? '⏳ Registrieren...' : '✅ Registrieren'}
            </button>
          </form>
        )}

        <div className="text-sm text-gray-400 text-center mt-4">
          Schon registriert?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-400 hover:underline"
          >
            Zum Login
          </button>
        </div>
      </div>
    </div>
  );
}
