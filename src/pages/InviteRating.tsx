import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Criterion {
  id: string;
  label: string;
}

export default function InviteRating() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const restaurantId = searchParams.get('restaurant');
  const [valid, setValid] = useState(false);
  const [used, setUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token || !restaurantId) return;

      const inviteSnap = await getDoc(doc(db, 'invites', token));
      if (!inviteSnap.exists()) return setLoading(false);
      if (inviteSnap.data().used) {
        setUsed(true);
        setLoading(false);
        return;
      }

      setValid(true);

      const critSnap = await getDocs(collection(db, 'criteria'));
      const crits: Criterion[] = critSnap.docs.map((d) => ({
        id: d.id,
        label: d.data().label ?? d.id,
      }));
      setCriteria(crits);

      const init: Record<string, number> = {};
      crits.forEach((c) => (init[c.id] = 5));
      setRatings(init);
      setLoading(false);
    };

    verify();
  }, [token, restaurantId]);

  const handleSubmit = async () => {
    if (!name.trim()) return alert('Bitte gib deinen Namen ein.');
    if (!token || !restaurantId) return;

    await setDoc(doc(db, 'ratings_guest', token), {
      ratings,
      restaurantId,
      name,
      instagram,
      createdAt: Timestamp.now(),
    });

    await updateDoc(doc(db, 'invites', token), { used: true });

    alert('Vielen Dank für deine Bewertung!');
    navigate('/');
  };

  if (loading) return <p className="text-white p-4">Lade...</p>;
  if (!valid) return <p className="text-red-500 p-4">Ungültiger Einladungslink.</p>;
  if (used) return <p className="text-yellow-500 p-4">Dieser Link wurde bereits verwendet.</p>;

  return (
    <div className="max-w-md mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">🎟️ Gästebewertung</h1>

      <input
        className="w-full p-2 mb-3 rounded text-black"
        placeholder="Dein Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full p-2 mb-4 rounded text-black"
        placeholder="Instagram (optional)"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
      />

      {criteria.map((crit) => (
        <div key={crit.id} className="mb-3">
          <label className="block">{crit.label}</label>
          <input
            type="number"
            min={0}
            max={10}
            value={ratings[crit.id]}
            onChange={(e) =>
              setRatings({ ...ratings, [crit.id]: Number(e.target.value) })
            }
            className="w-full p-2 rounded text-black"
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
      >
        Bewertung absenden
      </button>
    </div>
  );
}
