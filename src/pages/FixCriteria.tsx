import { useEffect } from 'react';
import {
  getDocs,
  collection,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function FixCriteria() {
  useEffect(() => {
    const runFix = async () => {
      const snap = await getDocs(collection(db, 'criteria'));

      for (const c of snap.docs) {
        const id = c.id;
        const label = id
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()); // z. B. preis_leistung → Preis Leistung

        await updateDoc(doc(db, 'criteria', id), { label });
        console.log(`✔️ ${id} → ${label}`);
      }

      alert('Alle Kriterien wurden aktualisiert.');
    };

    runFix();
  }, []);

  return (
    <div className="text-white p-4">
      <h1 className="text-xl font-bold mb-2">🛠️ Kriterien aktualisieren</h1>
      <p>Die `label`-Felder werden automatisch ergänzt.</p>
    </div>
  );
}
