import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

interface Criterion {
  id: string;
  label: string;
}

export default function EditRating() {
  const { restaurantId } = useParams();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser || !restaurantId) return;

      // Kriterien laden
      const critSnap = await getDocs(collection(db, 'criteria'));
      const critList = critSnap.docs.map((doc) => ({
        id: doc.id,
        label: doc.data().label || doc.id,
      }));
      setCriteria(critList);

      // Restaurantname laden
      const resSnap = await getDoc(doc(db, 'restaurants', restaurantId));
      if (resSnap.exists()) {
        setRestaurantName(resSnap.data().name || '');
      }

      // Eigene Bewertung laden
      const ratingSnap = await getDocs(collection(db, 'ratings'));
      for (const docSnap of ratingSnap.docs) {
        const data = docSnap.data();
        if (
          data.restaurantId === restaurantId &&
          data.userId === auth.currentUser.uid
        ) {
          setRatings(data.ratings || {});
          setComment(data.comment || '');
          setRatingId(docSnap.id);
          break;
        }
      }
    };

    fetchData();
  }, [restaurantId]);

  const handleRatingChange = (criterionId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [criterionId]: value }));
  };

  const handleUpdate = async () => {
    if (!ratingId) return;

    await updateDoc(doc(db, 'ratings', ratingId), {
      ratings,
      comment,
    });

    navigate('/home');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-4">
        ✏️ Bewertung bearbeiten: <span className="text-blue-400">{restaurantName}</span>
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
        className="space-y-8"
      >
        {/* Kriterien */}
        <div className="grid md:grid-cols-2 gap-6">
          {criteria.map((crit) => (
            <div key={crit.id}>
              <label className="block font-semibold mb-2">
                {crit.label}
              </label>
              <div className="flex flex-wrap gap-2">
                {[...Array(11).keys()].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => handleRatingChange(crit.id, num)}
                    className={`w-10 h-10 text-sm rounded-full font-semibold transition
                      ${
                        ratings[crit.id] === num
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Kommentar */}
        <div>
          <label className="block font-semibold mb-2">💬 Kommentar (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white placeholder-gray-400"
            placeholder="Was möchtest du an deiner Bewertung anpassen?"
          />
        </div>

        {/* Speichern */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded font-bold text-black"
          >
            💾 Änderungen speichern
          </button>
        </div>
      </form>
    </div>
  );
}
