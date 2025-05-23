import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import AdminVisibilityToggle from './AdminVisibilityToggle';

interface Restaurant {
  id: string;
  name: string;
  date: string;
}

interface RatingData {
  user: string;
  instagram?: string;
  average: number;
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'guest' | null>(null);
  const [inviteLinks, setInviteLinks] = useState<Record<string, string>>({});
  const [averages, setAverages] = useState<Record<string, RatingData[]>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const resSnap = await getDocs(collection(db, 'restaurants'));
      const resList = resSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        date: doc.data().date?.toDate()?.toLocaleDateString() || '',
      }));
      setRestaurants(resList);

      if (!auth.currentUser) return;

      const userId = auth.currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      }

      const ratingMap: Record<string, boolean> = {};
      const avgMap: Record<string, RatingData[]> = {};

      try {
        const ratingsSnap = await getDocs(collection(db, 'ratings'));
        for (const docSnap of ratingsSnap.docs) {
          const data = docSnap.data();
          const restId = data.restaurantId;
          const uid = data.userId;
          const ratings = data.ratings;
          if (!restId || !ratings) continue;

          const avg =
            Object.values(ratings).reduce((a: any, b: any) => a + b, 0) /
            Object.keys(ratings).length;

          if (uid === userId) ratingMap[restId] = true;

          const userInfoSnap = await getDoc(doc(db, 'users', uid));
          const name = userInfoSnap.exists() ? userInfoSnap.data().name : 'Unbekannt';
          const instagram = userInfoSnap.data()?.instagram;

          if (!avgMap[restId]) avgMap[restId] = [];
          avgMap[restId].push({ user: name, instagram, average: avg });
        }
      } catch (e) {
        console.warn('ratings collection fehlt oder leer');
      }

      try {
        const guestSnap = await getDocs(collection(db, 'ratings_guest'));
        guestSnap.docs.forEach((doc) => {
          const data = doc.data();
          const restId = data.restaurantId;
          const ratings = data.ratings;
          if (!restId || !ratings) return;

          const avg =
            Object.values(ratings).reduce((a: any, b: any) => a + b, 0) /
            Object.keys(ratings).length;

          if (!avgMap[restId]) avgMap[restId] = [];
          avgMap[restId].push({
            user: data.name || 'Gast',
            instagram: data.instagram,
            average: avg,
          });
        });
      } catch (e) {
        console.warn('ratings_guest collection fehlt oder leer');
      }

      setUserRatings(ratingMap);
      setAverages(avgMap);
    };

    loadData();
  }, []);

  const handleCreateInvite = async (restaurantId: string) => {
    const token = Math.random().toString(36).substring(2, 10);
    await setDoc(doc(db, 'invites', token), {
      restaurantId,
      used: false,
      createdAt: Timestamp.now(),
    });
    const link = `${window.location.origin}/invite/${token}?restaurant=${restaurantId}`;
    setInviteLinks((prev) => ({ ...prev, [restaurantId]: link }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link kopiert!');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">🍽️ Besuchte Restaurants</h1>

      {restaurants.map((res) => {
        const ratings = averages[res.id] || [];
        const avgTotal =
          ratings.length > 0
            ? Math.round(
                ratings.reduce((a, b) => a + b.average, 0) / ratings.length
              )
            : null;

        return (
          <div key={res.id} className="bg-gray-800 p-6 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
              <div>
                <h2
                  className="text-xl font-semibold text-blue-300 hover:underline cursor-pointer"
                  onClick={() => navigate(`/restaurant/${res.id}`)}
                >
                  {res.name}
                </h2>
                <p className="text-sm text-gray-400">📅 {res.date}</p>
              </div>

              {avgTotal !== null && (
                <p className="mt-2 md:mt-0 text-green-400 font-semibold">
                  Durchschnitt: {avgTotal} / 10
                </p>
              )}
            </div>

            {ratings.length > 0 && (
              <div className="text-sm text-gray-300 mb-3">
                Bewertet von:
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  {ratings.map((r, i) => (
                    <li key={i}>
                      {r.user}
                      {r.instagram && (
                        <span className="text-blue-300 ml-1">
                          (@{r.instagram})
                        </span>
                      )}
                      {' – '}
                      <span className="text-white">
                        Ø {Math.round(r.average * 10) / 10}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-4">
              {userRatings[res.id] ? (
                <button
                  onClick={() => navigate(`/edit/${res.id}`)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded"
                >
                  ✏️ Bewertung bearbeiten
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/rate/${res.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded"
                >
                  ⭐ Jetzt bewerten
                </button>
              )}

              {userRole === 'admin' && (
                <>
                  {inviteLinks[res.id] ? (
                    <div className="bg-gray-700 px-3 py-2 rounded text-sm max-w-full overflow-auto">
                      <p className="mb-1">📨 Einladungslink:</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="break-all text-xs">{inviteLinks[res.id]}</span>
                        <button
                          onClick={() => handleCopy(inviteLinks[res.id])}
                          className="bg-green-600 hover:bg-green-700 px-2 py-1 text-xs rounded"
                        >
                          Kopieren
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCreateInvite(res.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                    >
                      🎟️ Einladung erstellen
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {userRole === 'admin' && <AdminVisibilityToggle />}
    </div>
  );
}
