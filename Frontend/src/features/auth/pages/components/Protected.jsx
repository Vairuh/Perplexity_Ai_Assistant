import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';
import { useAuth } from '../hook/useAuth';

const Protected = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const { handlegetMe } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    handlegetMe().finally(() => setChecking(false));
  }, []);

  if (checking) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default Protected;