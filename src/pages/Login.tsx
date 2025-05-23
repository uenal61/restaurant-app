import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (err: any) {
      setError('Login fehlgeschlagen. Bitte überprüfe deine Daten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 text-white">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          fridaysdining
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* E-Mail */}
          <div>
            <label className="block mb-1 font-semibold">E-Mail</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white"
              placeholder="z. B. max@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Passwort */}
          <div>
            <label className="block mb-1 font-semibold">Passwort</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          {/* Fehleranzeige */}
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded"
          >
            {loading ? '⏳ Einloggen...' : '✅ Einloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
