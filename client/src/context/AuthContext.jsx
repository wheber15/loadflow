import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '../api/axios';

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

  const logout =
    async () => {
      try {
        if (user?._id) {
          await api.post(
            `/auth/logout/${user._id}`
          );
        }
      } catch (error) {
        console.log(error);
      }

      setUser(null);

      localStorage.removeItem(
        'loadflow_user'
      );
    };

  /* =========================
     UPDATE ACTIVITY
  ========================= */

  const updateActivity =
    async (
      currentPage,
      activeOrder = ''
    ) => {
      try {
        if (!user?._id) return;

        await api.put(
          `/auth/activity/${user._id}`,
          {
            currentPage,
            activeOrder,
          }
        );

        const updatedUser = {
          ...user,
          currentPage,
          activeOrder,
        };

        setUser(updatedUser);

        localStorage.setItem(
          'loadflow_user',
          JSON.stringify(
            updatedUser
          )
        );
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);