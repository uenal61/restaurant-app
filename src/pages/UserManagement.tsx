import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import AdminVisibilityToggle from './AdminVisibilityToggle';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'pending';
  instagram?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      const list: User[] = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || 'Unbekannt',
        email: doc.data().email || '',
        role: doc.data().role || 'pending',
        instagram: doc.data().instagram || '',
      }));
      setUsers(list);
    };

    const checkCurrentUser = async () => {
      if (auth.currentUser) {
        setCurrentUserId(auth.currentUser.uid);
        const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setIsAdmin(true);
        }
      }
    };

    checkCurrentUser();
    fetchUsers();
  }, []);

  const updateRole = async (userId: string, newRole: 'user' | 'admin') => {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleDelete = async (user: User) => {
    if (
      user.id === currentUserId ||
      user.role === 'admin'
    ) {
      alert('Du kannst dich selbst oder andere Admins nicht löschen.');
      return;
    }

    const confirm = window.confirm(
      `Möchtest du den Benutzer "${user.name}" wirklich löschen?`
    );
    if (!confirm) return;

    await deleteDoc(doc(db, 'users', user.id));
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  const pendingUsers = users.filter((u) => u.role === 'pending');
  const activeUsers = users.filter((u) => u.role !== 'pending');

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">👑 Benutzerverwaltung</h1>

      {/* Freischalten */}
      {pendingUsers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3">🟡 Neue Nutzer warten auf Freischaltung</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pendingUsers.map((user) => (
              <div key={user.id} className="bg-gray-800 p-4 rounded shadow border border-yellow-500">
                <h3 className="text-lg font-semibold text-yellow-400">{user.name}</h3>
                <p className="text-sm text-gray-400">📧 {user.email}</p>
                {user.instagram && (
                  <p className="text-sm text-gray-400">📸 @{user.instagram}</p>
                )}
                <button
                  onClick={() => updateRole(user.id, 'user')}
                  className="mt-3 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-semibold"
                >
                  ✅ Freischalten
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aktive Nutzer */}
      <h2 className="text-xl font-semibold mb-3">👥 Aktive Benutzer</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            className="bg-gray-800 p-4 rounded shadow border border-gray-700 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-blue-300">
                {user.name}
              </h3>
              <p className="text-sm text-gray-400 mb-1">📧 {user.email}</p>
              {user.instagram && (
                <p className="text-sm text-gray-400 mb-1">📸 @{user.instagram}</p>
              )}
              <p className="text-sm mb-2">
                Rolle:{' '}
                <span
                  className={`font-semibold px-2 py-1 rounded text-xs ${
                    user.role === 'admin'
                      ? 'bg-purple-600'
                      : 'bg-gray-600'
                  }`}
                >
                  {user.role}
                </span>
              </p>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() =>
                  updateRole(user.id, user.role === 'admin' ? 'user' : 'admin')
                }
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-medium"
              >
                {user.role === 'admin'
                  ? '👤 Zu Nutzer machen'
                  : '👑 Zum Admin machen'}
              </button>
              {user.role !== 'admin' && (
                <button
                  onClick={() => handleDelete(user)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  🗑️ Löschen
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Admin-Schalter für Topliste */}
      {isAdmin && <AdminVisibilityToggle />}
    </div>
  );
}
