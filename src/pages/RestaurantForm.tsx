import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

interface Restaurant {
  id: string;
  name: string;
  date: string;
}

export default function RestaurantForm() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchRestaurants = async () => {
    const snap = await getDocs(collection(db, 'restaurants'));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      date: doc.data().date?.toDate().toLocaleDateString() || '',
    }));
    setRestaurants(list);
  };

  const checkAdmin = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const docSnap = await getDoc(doc(db, 'users', user.uid));
    if (docSnap.exists() && docSnap.data().role === 'admin') {
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    checkAdmin();
  }, []);

  const handleCreate = async () => {
    if (!name || !date) return;
    await addDoc(collection(db, 'restaurants'), {
      name,
      date: Timestamp.fromDate(new Date(date)),
    });
    setName('');
    setDate('');
    fetchRestaurants();
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Möchtest du dieses Restaurant wirklich löschen?');
    if (!confirm) return;

    await deleteDoc(doc(db, 'restaurants', id));
    fetchRestaurants();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">📅 Restaurant erstellen</h1>

      {/* Eingabeformular */}
      <div className="bg-gray-800 p-4 rounded mb-6 space-y-4 shadow">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Herzstück Erlangen"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Datum</label>
          <input
            type="date"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
        >
          ➕ Restaurant speichern
        </button>
      </div>

      {/* Liste bestehender Restaurants */}
      <h2 className="text-xl font-semibold mb-4">📋 Bereits angelegte Restaurants</h2>

      {restaurants.length === 0 ? (
        <p className="text-gray-400 italic">Noch keine Restaurants vorhanden.</p>
      ) : (
        <ul className="space-y-3">
          {restaurants.map((r) => (
            <li
              key={r.id}
              className="bg-gray-800 p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold text-blue-300">{r.name}</p>
                <p className="text-sm text-gray-400">📅 {r.date}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-400 hover:text-red-600 text-sm font-semibold"
                >
                  🗑️ Löschen
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
