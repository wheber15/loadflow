import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const AuthContext =
  createContext();

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  /* =========================
     RESTORE SESSION
  ========================= */

  useEffect(() => {
    const stored =
      localStorage.getItem(
        'loadflow_user'
      );

    if (stored) {
      setUser(
        JSON.parse(stored)
      );
    }
  }, []);

  /* =========================
     LOGIN
  ========================= */

  const login = (data) => {
    setUser(data);

    localStorage.setItem(
      'loadflow_user',
      JSON.stringify(data)
    );
  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {
    setUser(null);

    localStorage.removeItem(
      'loadflow_user'
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);