import { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setSuccess('');
    setError('');
    if (!name || !date) {
      setError('Bitte Name und Datum angeben.');
      return;
    }

    try {
      await addDoc(collection(db, 'restaurants'), {
        name,
        visitDate: Timestamp.fromDate(new Date(date)),
        createdAt: Timestamp.now(),
      });
      setSuccess('Restaurant gespeichert!');
      setName('');
      setDate('');
    } catch (err: any) {
      setError('Fehler beim Speichern: ' + err.message);
    }
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '50px auto',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      backgroundColor: '#fff'
    }}>
      <h2>🍴 Neues Restaurant anlegen</h2>
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ marginTop: '10px' }}>
        <label>Restaurantname:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label>Besuchsdatum:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>
      <button
        onClick={handleSubmit}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Speichern
      </button>
      <button
        onClick={() => navigate('/home')}
        style={{
          marginLeft: '10px',
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#aaa',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Zurück
      </button>
    </div>
  );
}
