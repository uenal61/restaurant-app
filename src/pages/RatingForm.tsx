import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

interface Criterion {
  id: string;
  label: string;
}

export default function RatingForm() {
  const { restaurantId } = useParams();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) return;

      const critSnap = await getDocs(collection(db, 'criteria'));
      const critList = critSnap.docs.map((doc) => ({
        id: doc.id,
        label: doc.data().label || doc.id,
      }));
      setCriteria(critList);

      const resSnap = await getDoc(doc(db, 'restaurants', restaurantId));
      if (resSnap.exists()) {
        setRestaurantName(resSnap.data().name || '');
      }
    };

    fetchData();
  }, [restaurantId]);

  const handleRatingChange = (criterionId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [criterionId]: value }));
  };

  const handleSubmit = async () => {
    if (!auth.currentUser || !restaurantId) return;

    await setDoc(doc(collection(db, 'ratings')), {
      userId: auth.currentUser.uid,
      restaurantId,
      ratings,
      comment,
      createdAt: Timestamp.now(),
    });

    setSuccess(true);

    setTimeout(() => {
      navigate('/home');
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-4">
        ⭐ Bewertung für: <span className="text-blue-400">{restaurantName}</span>
      </h1>

      {success && (
        <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded text-center shadow">
          ✅ Bewertung erfolgreich gespeichert!
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
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
                          ? 'bg-blue-500 text-white'
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
            placeholder="Was hat dir gefallen oder nicht gefallen?"
          />
        </div>

        {/* Abschicken */}
        <div className="text-center">
          <button
            type="submit"
            disabled={success}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-bold text-white"
          >
            ✅ Bewertung absenden
          </button>
        </div>
      </form>
    </div>
  );
}
