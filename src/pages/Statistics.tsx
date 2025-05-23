import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface Rating {
  userId: string;
  restaurantId: string;
  ratings: Record<string, number>;
  createdAt: any;
}

export default function Statistics() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [restaurants, setRestaurants] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [criteria, setCriteria] = useState<Record<string, string>>({});
  const [selectedCriterion, setSelectedCriterion] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const ratingSnap = await getDocs(collection(db, 'ratings'));
      const allRatings = ratingSnap.docs.map((doc) => ({
        userId: doc.data().userId,
        restaurantId: doc.data().restaurantId,
        ratings: doc.data().ratings,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      const restaurantSnap = await getDocs(collection(db, 'restaurants'));
      const nameMap: Record<string, string> = {};
      restaurantSnap.docs.forEach((doc) => {
        nameMap[doc.id] = doc.data().name;
      });

      const userSnap = await getDocs(collection(db, 'users'));
      const userMap: Record<string, string> = {};
      userSnap.docs.forEach((doc) => {
        userMap[doc.id] = doc.data().name || doc.data().email;
      });

      const critSnap = await getDocs(collection(db, 'criteria'));
      const critMap: Record<string, string> = {};
      critSnap.docs.forEach((doc) => {
        critMap[doc.id] = doc.data().name;
      });

      setRestaurants(nameMap);
      setUserNames(userMap);
      setCriteria(critMap);
      setRatings(allRatings);
      setSelectedCriterion(Object.keys(critMap)[0] || '');
      setLoading(false);
    };

    loadStats();
  }, []);

  const userStats = ratings.reduce((acc, r) => {
    if (!acc[r.userId]) {
      acc[r.userId] = { count: 0, total: 0 };
    }
    const avg = Object.values(r.ratings).reduce((a, b) => a + b, 0) / Object.keys(r.ratings).length;
    acc[r.userId].count += 1;
    acc[r.userId].total += avg;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const restaurantStats = ratings.reduce((acc, r) => {
    const id = r.restaurantId;
    const avg = Object.values(r.ratings).reduce((a, b) => a + b, 0) / Object.keys(r.ratings).length;
    if (!acc[id]) acc[id] = { count: 0, total: 0 };
    acc[id].count += 1;
    acc[id].total += avg;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const chartData = Object.entries(userStats).map(([userId, stat]) => ({
    name: userNames[userId] || userId,
    Bewertungen: stat.count,
  }));

  const monthlyMap: Record<string, { total: number; count: number }> = {};
  ratings.forEach((r) => {
    const date: Date = r.createdAt;
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const avg = Object.values(r.ratings).reduce((a, b) => a + b, 0) / Object.keys(r.ratings).length;
    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { total: 0, count: 0 };
    monthlyMap[monthKey].total += avg;
    monthlyMap[monthKey].count += 1;
  });

  const monthlyAverages = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, stat]) => ({
      month,
      average: Math.round((stat.total / stat.count) * 10) / 10,
    }));

  const criterionStats: Record<string, { total: number; count: number }> = {};
  ratings.forEach((r) => {
    for (const [critId, score] of Object.entries(r.ratings)) {
      if (!criterionStats[critId]) {
        criterionStats[critId] = { total: 0, count: 0 };
      }
      criterionStats[critId].total += score;
      criterionStats[critId].count += 1;
    }
  });

  const criterionChartData = Object.entries(criterionStats).map(([id, stat]) => ({
    kriterium: criteria[id] || id,
    durchschnitt: Math.round((stat.total / stat.count) * 10) / 10,
  }));

  // 📈 Trend für gewähltes Kriterium
  const selectedTrendData: { month: string; average: number }[] = [];
  if (selectedCriterion) {
    const monthlyCritMap: Record<string, { total: number; count: number }> = {};
    ratings.forEach((r) => {
      if (r.ratings[selectedCriterion] !== undefined) {
        const date: Date = r.createdAt;
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyCritMap[monthKey]) {
          monthlyCritMap[monthKey] = { total: 0, count: 0 };
        }
        monthlyCritMap[monthKey].total += r.ratings[selectedCriterion];
        monthlyCritMap[monthKey].count += 1;
      }
    });
    Object.entries(monthlyCritMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, stat]) => {
        selectedTrendData.push({
          month,
          average: Math.round((stat.total / stat.count) * 10) / 10,
        });
      });
  }

  return (
    <div style={{ padding: '30px', maxWidth: '850px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>📊 Statistik</h1>

      {loading ? (
        <p>Lade Statistik...</p>
      ) : (
        <>
          <h2>📆 Ø Bewertung pro Monat</h2>
          <div style={{ width: '100%', height: 300, background: '#fff', padding: 10, borderRadius: 8, marginBottom: 30 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h2>📐 Ø pro Kriterium</h2>
          <div style={{ width: '100%', height: 300, background: '#fff', padding: 10, borderRadius: 8, marginBottom: 30 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={criterionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="kriterium" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="durchschnitt" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2>📈 Kriterium-Trend</h2>
          <label>
            Kriterium wählen:
            <select
              value={selectedCriterion}
              onChange={(e) => setSelectedCriterion(e.target.value)}
              style={{ marginLeft: 10, padding: 6, borderRadius: 6 }}
            >
              {Object.entries(criteria).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <div style={{ width: '100%', height: 300, background: '#fff', padding: 10, borderRadius: 8, marginTop: 10, marginBottom: 30 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h2>👤 Bewertungen pro Nutzer</h2>
          <div style={{ width: '100%', height: 300, background: '#fff', padding: 10, borderRadius: 8, marginBottom: 30 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Bewertungen" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2>🏅 Beste Restaurants</h2>
          <ul>
            {Object.entries(restaurantStats)
              .sort(([, a], [, b]) => b.total / b.count - a.total / a.count)
              .map(([id, stat]) => (
                <li key={id}>
                  <strong>{restaurants[id] || id}</strong> – Ø {Math.round(stat.total / stat.count)} / 10 ({stat.count} Bewertungen)
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
}
