import { useEffect, useState } from 'react';
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

interface Rating {
  id: string;
  restaurantId: string;
  userId?: string;
  name?: string;
  instagram?: string;
  comment?: string;
  ratings: Record<string, number>;
  createdAt: string;
}

interface CriteriaMap {
  [id: string]: string;
}

export default function BlogView() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [criteria, setCriteria] = useState<CriteriaMap>({});
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const resSnap = await getDocs(collection(db, 'restaurants'));
      const restaurantList: Restaurant[] = resSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        date: doc.data().date?.toDate().toLocaleDateString() || '',
      }));
      setRestaurants(restaurantList);

      const critSnap = await getDocs(collection(db, 'criteria'));
      const critMap: CriteriaMap = {};
      critSnap.docs.forEach((doc) => {
        critMap[doc.id] = doc.data().label || doc.id;
      });
      setCriteria(critMap);

      const ratingList: Rating[] = [];

      const ratingsSnap = await getDocs(collection(db, 'ratings'));
      for (const docSnap of ratingsSnap.docs) {
        const data = docSnap.data();
        const userId = data.userId;
        const userDoc = userId
          ? await getDoc(doc(db, 'users', userId))
          : null;
        ratingList.push({
          id: docSnap.id,
          restaurantId: data.restaurantId,
          userId,
          name: userDoc?.exists() ? userDoc.data().name : 'Unbekannt',
          instagram: userDoc?.exists() ? userDoc.data().instagram : '',
          comment: data.comment,
          ratings: data.ratings,
          createdAt: data.createdAt?.toDate()?.toLocaleDateString() || '',
        });
      }

      const guestSnap = await getDocs(collection(db, 'ratings_guest'));
      guestSnap.docs.forEach((doc) => {
        const data = doc.data();
        ratingList.push({
          id: doc.id,
          restaurantId: data.restaurantId,
          name: data.name || 'Gast',
          instagram: data.instagram || '',
          comment: data.comment,
          ratings: data.ratings,
          createdAt: data.createdAt?.toDate()?.toLocaleDateString() || '',
        });
      });

      setRatings(ratingList);
    };

    loadData();
  }, []);

  const getRestaurantName = (id: string) =>
    restaurants.find((r) => r.id === id)?.name || 'Unbekannt';

  const getRestaurantDate = (id: string) =>
    restaurants.find((r) => r.id === id)?.date || '';

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">📝 Blog: Unsere Bewertungen</h1>

      {ratings.length === 0 ? (
        <p className="text-gray-400">Noch keine Bewertungen vorhanden.</p>
      ) : (
        ratings.map((r) => {
          const avg =
            Object.values(r.ratings).reduce((a, b) => a + b, 0) /
            Object.keys(r.ratings).length;

          return (
            <div key={r.id} className="bg-gray-800 p-4 rounded mb-6 shadow">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h2 className="text-xl font-semibold text-green-400">
                    {getRestaurantName(r.restaurantId)}
                  </h2>
                  <p className="text-sm text-gray-400 mb-1">
                    📅 {getRestaurantDate(r.restaurantId)} – bewertet am {r.createdAt}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-300">
                  👤 {r.name}
                  {r.instagram && (
                    <span className="text-blue-300 ml-2">
                      (@{r.instagram})
                    </span>
                  )}
                </div>
              </div>

              {r.comment && (
                <div className="text-sm text-gray-300 italic mb-3">💬 „{r.comment}“</div>
              )}

              <div className="mb-3">
                <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
                  {Object.entries(r.ratings).map(([key, val]) => (
                    <li key={key}>
                      {criteria[key] || key}: <span className="font-semibold">{val}</span> / 10
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-green-400 text-sm font-bold">
                Ø Gesamt: {Math.round(avg * 10) / 10} / 10
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
