import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Restaurant {
  id: string;
  name: string;
  date: string;
}

interface RatingEntry {
  restaurantId: string;
  average: number;
}

export default function TopRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [averages, setAverages] = useState<Record<string, number>>({});
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVisibility = async () => {
      const ref = doc(db, 'settings', 'visibility');
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().showToplist) {
        setAllowed(true);
      } else {
        navigate('/');
      }
    };

    checkVisibility();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const resSnap = await getDocs(collection(db, 'restaurants'));
      const resList = resSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        date: doc.data().date?.toDate().toLocaleDateString() || '',
      }));
      setRestaurants(resList);

      const ratingsSnap = await getDocs(collection(db, 'ratings'));
      const avgMap: Record<string, number[]> = {};

      ratingsSnap.docs.forEach((doc) => {
        const data = doc.data();
        const restId = data.restaurantId;
        const ratings = data.ratings;
        if (!restId || !ratings) return;

        const avg =
          Object.values(ratings).reduce((a: any, b: any) => a + b, 0) /
          Object.keys(ratings).length;

        if (!avgMap[restId]) avgMap[restId] = [];
        avgMap[restId].push(avg);
      });

      const averagePerRestaurant: Record<string, number> = {};
      Object.entries(avgMap).forEach(([restId, values]) => {
        const avg =
          values.reduce((a, b) => a + b, 0) / values.length;
        averagePerRestaurant[restId] = avg;
      });

      setAverages(averagePerRestaurant);
    };

    loadData();
  }, []);

  if (!allowed) return null;

  const sortedRestaurants = restaurants
    .filter((r) => averages[r.id] !== undefined)
    .sort((a, b) => (averages[b.id] ?? 0) - (averages[a.id] ?? 0));

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">🏆 Bestenliste</h1>

      {sortedRestaurants.length === 0 ? (
        <p className="text-gray-400">Noch keine Bewertungen vorhanden.</p>
      ) : (
        <ul className="space-y-4">
          {sortedRestaurants.map((r, index) => (
            <li
              key={r.id}
              className="bg-gray-800 p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold text-blue-300">
                  #{index + 1} {r.name}
                </p>
                <p className="text-sm text-gray-400">📅 {r.date}</p>
              </div>
              <div className="text-green-400 text-xl font-bold">
                Ø {Math.round((averages[r.id] ?? 0) * 10) / 10}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
