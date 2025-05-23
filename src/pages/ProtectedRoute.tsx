import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setIsAllowed(false);
        } else {
          const role = userDoc.data().role;
          if (role === 'admin' || role === 'user') {
            setIsAllowed(true);
          } else {
            // Rolle ist "pending" oder ungültig
            setIsAllowed(false);
          }
        }
      } else {
        setIsAllowed(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return isAllowed ? children : <Navigate to="/login" replace />;
}
