import {
  Navigate,
} from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({
  children,
  roles = [],
}) => {
  const { user } =
    useAuth();

  /* =========================
     NOT LOGGED
  ========================= */

  if (!user) {
    return (
      <Navigate to="/login" />
    );
  }

  /* =========================
     ROLE BLOCK
  ========================= */

  if (
    roles.length > 0 &&
    !roles.includes(
      user.role
    )
  ) {
    return (
      <Navigate to="/" />
    );
  }

  return children;
};

export default ProtectedRoute;