import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface RatingEntry {
  user: string;
  instagram?: string;
  average: number;
  ratings: Record<string, number>;
  comment?: string;
}

interface Criterion {
  id: string;
  label: string;
}

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<{ name: string; date: string } | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [ratings, setRatings] = useState<RatingEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Restaurant-Daten
      const resSnap = await getDoc(doc(db, 'restaurants', id));
      if (resSnap.exists()) {
        const data = resSnap.data();
        setRestaurant({
          name: data.name,
          date: data.date?.toDate().toLocaleDateString() || '',
        });
      }

      // Kriterien laden
      const critSnap = await getDocs(collection(db, 'criteria'));
      const critList = critSnap.docs.map((doc) => ({
        id: doc.id,
        label: doc.data().label || doc.id,
      }));
      setCriteria(critList);

      // Bewertungen laden
      const ratingsSnap = await getDocs(collection(db, 'ratings'));
      const userRatings: RatingEntry[] = [];

      for (const docSnap of ratingsSnap.docs) {
        const data = docSnap.data();
        if (data.restaurantId !== id) continue;

        const avg =
          Object.values(data.ratings).reduce((a: any, b: any) => a + b, 0) /
          Object.keys(data.ratings).length;

        let name = 'Unbekannt';
        let instagram = '';
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        if (userDoc.exists()) {
          name = userDoc.data().name || name;
          instagram = userDoc.data().instagram || '';
        }

        userRatings.push({
          user: name,
          instagram,
          average: avg,
          ratings: data.ratings,
          comment: data.comment || '',
        });
      }

      setRatings(userRatings);
    };

    fetchData();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      {restaurant ? (
        <>
          <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-gray-400 mb-6">📅 {restaurant.date}</p>

          <h2 className="text-xl font-semibold mb-4">👥 Bewertungen</h2>

          {ratings.length === 0 ? (
            <p className="text-gray-400 italic">Noch keine Bewertungen vorhanden.</p>
          ) : (
            ratings.map((entry, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-lg text-blue-300">
                    {entry.user}
                    {entry.instagram && (
                      <span className="text-sm text-blue-400 ml-2">
                        (@{entry.instagram})
                      </span>
                    )}
                  </div>
                  <div className="text-green-400 font-bold">
                    Ø {Math.round(entry.average * 10) / 10} / 10
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-300">
                  {criteria.map((c) => (
                    <div key={c.id} className="flex justify-between">
                      <span>{c.label}</span>
                      <span>{entry.ratings[c.id] ?? '—'}</span>
                    </div>
                  ))}
                </div>

                {entry.comment && (
                  <p className="mt-3 text-sm text-gray-400 border-t border-gray-700 pt-2 italic">
                    💬 {entry.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </>
      ) : (
        <p className="text-gray-400">Lade Restaurantdaten...</p>
      )}
    </div>
  );
}
