import { useEffect, useState } from 'react';
import {
  getDocs,
  collection,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface Criterion {
  id: string;
  label: string;
}

interface User {
  id: string;
  name: string;
}

export default function UserComparison() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      const userSnap = await getDocs(collection(db, 'users'));
      setUsers(
        userSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name ?? 'Unbekannt',
        }))
      );

      const critSnap = await getDocs(collection(db, 'criteria'));
      setCriteria(
        critSnap.docs.map((doc) => ({
          id: doc.id,
          label: doc.data().label ?? doc.id,
        }))
      );
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadRatings = async () => {
      if (selectedUsers.length === 0 || criteria.length === 0) return;

      const snap = await getDocs(collection(db, 'ratings'));
      const rawRatings = snap.docs.map((doc) => doc.data());

      const perUser: Record<string, Record<string, number[]>> = {};

      for (const userId of selectedUsers) {
        perUser[userId] = {};
        const userRatings = rawRatings.filter((r) => r.userId === userId);

        for (const r of userRatings) {
          for (const [critId, value] of Object.entries(r.ratings)) {
            if (!perUser[userId][critId]) perUser[userId][critId] = [];
            perUser[userId][critId].push(Number(value));
          }
        }
      }

      // Strukturieren für Chart
      const combined: any[] = criteria.map((crit) => {
        const entry: any = { criterion: crit.label };
        for (const userId of selectedUsers) {
          const values = perUser[userId][crit.id];
          const avg =
            values && values.length > 0
              ? values.reduce((a, b) => a + b, 0) / values.length
              : null;
          const user = users.find((u) => u.id === userId);
          entry[user?.name ?? userId] = avg !== null ? Math.round(avg * 10) / 10 : null;
        }
        return entry;
      });

      setChartData(combined);
    };

    loadRatings();
  }, [selectedUsers, criteria, users]);

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">👥 Nutzervergleich</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {users.map((user) => (
          <label key={user.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.id)}
              onChange={() => toggleUser(user.id)}
            />
            <span>{user.name}</span>
          </label>
        ))}
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="criterion" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            {selectedUsers.map((userId, index) => {
              const user = users.find((u) => u.id === userId);
              return (
                <Bar
                  key={userId}
                  dataKey={user?.name ?? userId}
                  fill={`hsl(${index * 60}, 70%, 50%)`}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
