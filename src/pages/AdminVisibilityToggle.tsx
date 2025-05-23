import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminVisibilityToggle() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSetting = async () => {
      const ref = doc(db, 'settings', 'visibility');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setVisible(snap.data().showToplist);
      } else {
        await setDoc(ref, { showToplist: false });
        setVisible(false);
      }
      setLoading(false);
    };
    fetchSetting();
  }, []);

  const toggle = async () => {
    const ref = doc(db, 'settings', 'visibility');
    await updateDoc(ref, { showToplist: !visible });
    setVisible(!visible);
  };

  if (loading) return null;

  return (
    <div className="mt-6 bg-gray-800 p-4 rounded text-white shadow">
      <h3 className="text-lg font-semibold mb-2">🌐 Bestenliste öffentlich anzeigen?</h3>
      <div className="flex items-center gap-4">
        <span
          className={`text-sm font-semibold px-3 py-1 rounded ${
            visible ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {visible ? 'Öffentlich' : 'Privat'}
        </span>
        <button
          onClick={toggle}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
        >
          {visible ? 'Ausblenden' : 'Sichtbar machen'}
        </button>
      </div>
    </div>
  );
}
