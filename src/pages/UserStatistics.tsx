import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface Criterion {
  id: string;
  label: string;
}

interface UserOption {
  id: string;
  name: string;
}

export default function UserStatistics() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [data, setData] = useState<{ criterion: string; average: number }[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name ?? 'Unbekannt',
      }));
      setUsers(list);
    };

    const loadCriteria = async () => {
      const snap = await getDocs(collection(db, 'criteria'));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        label: doc.data().label ?? doc.id,
      }));
      setCriteria(list);
    };

    loadUsers();
    loadCriteria();
  }, []);

  useEffect(() => {
    if (!selectedUser || criteria.length === 0) return;

    const loadRatings = async () => {
      const snap = await getDocs(collection(db, 'ratings'));
      const userRatings = snap.docs
        .map((doc) => doc.data())
        .filter((r) => r.userId === selectedUser);

      const result: { [criterion: string]: number[] } = {};
      for (const rating of userRatings) {
        for (const key in rating.ratings) {
          if (!result[key]) result[key] = [];
          result[key].push(rating.ratings[key]);
        }
      }

      const avgData = Object.entries(result).map(([id, values]) => {
        const crit = criteria.find((c) => c.id === id);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return {
          criterion: crit?.label ?? id,
          average: Math.round(avg * 10) / 10,
        };
      });

      setData(avgData);
    };

    loadRatings();
  }, [selectedUser, criteria]);

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">📊 Nutzerstatistik</h1>

      <select
        className="mb-6 p-2 rounded text-black"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">— Nutzer auswählen —</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="criterion" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="average" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
