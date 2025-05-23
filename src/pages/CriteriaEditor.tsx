import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Criterion {
  id: string;
  label: string;
}

export default function CriteriaEditor() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [newLabel, setNewLabel] = useState('');

  const fetchCriteria = async () => {
    const snap = await getDocs(collection(db, 'criteria'));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      label: doc.data().label,
    }));
    setCriteria(list);
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    await addDoc(collection(db, 'criteria'), { label: newLabel });
    setNewLabel('');
    fetchCriteria();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'criteria', id));
    fetchCriteria();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">🛠️ Kriterien verwalten</h1>

      {/* Hinzufügen */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Neues Kriterium z. B. Service"
          className="flex-1 bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
        />
        <button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
        >
          ➕ Hinzufügen
        </button>
      </div>

      {/* Bestehende Kriterien */}
      {criteria.length === 0 ? (
        <p className="text-gray-400 italic">Noch keine Kriterien vorhanden.</p>
      ) : (
        <ul className="space-y-3">
          {criteria.map((crit) => (
            <li
              key={crit.id}
              className="bg-gray-800 p-4 rounded flex justify-between items-center"
            >
              <span>{crit.label}</span>
              <button
                onClick={() => handleDelete(crit.id)}
                className="text-red-400 hover:text-red-600 font-semibold text-sm"
              >
                🗑️ Löschen
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
