import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/axios';

import TopBar from '../../components/layout/TopBar';

import { useAuth } from '../../context/AuthContext';

const UserManagementPage = () => {
  const {
    updateActivity,
  } = useAuth();

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  /* =========================
     FORM
  ========================= */

  const [name, setName] =
    useState('');

  const [pin, setPin] =
    useState('');

  const [role, setRole] =
    useState('PICKER');

  /* =========================
     FETCH USERS
  ========================= */

  const fetchUsers =
    async () => {
      try {
        const { data } =
          await api.get(
            '/auth'
          );

        setUsers(data);
      } catch (error) {
        console.log(error);
      }
    };

  /* =========================
     PAGE ACTIVITY
  ========================= */

  useEffect(() => {
    updateActivity(
      'USER_MANAGEMENT'
    );

    fetchUsers();

    const interval =
      setInterval(() => {
        fetchUsers();
      }, 5000);

    return () =>
      clearInterval(
        interval
      );
  }, []);

  /* =========================
     CREATE USER
  ========================= */

  const createUser =
    async () => {
      try {
        setLoading(true);

        await api.post(
          '/auth/create',
          {
            name,
            pin,
            role,
          }
        );

        setName('');
        setPin('');
        setRole('PICKER');

        fetchUsers();

        alert(
          'User created'
        );
      } catch (error) {
        console.log(error);

        alert(
          error.response?.data
            ?.message ||
            'Failed to create user'
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* TOPBAR */}

      <TopBar />

      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-5xl font-black text-orange-500">
          USER MANAGEMENT
        </h1>

        <p className="text-zinc-500 mt-2 text-xl">
          Warehouse account
          control
        </p>
      </div>

      {/* CREATE USER */}

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-8">
        <h2 className="text-3xl font-black mb-6">
          Create User
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {/* NAME */}

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            placeholder="Username..."
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-xl outline-none"
          />

          {/* PIN */}

          <input
            type="password"
            value={pin}
            onChange={(e) =>
              setPin(
                e.target.value
              )
            }
            placeholder="PIN..."
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-xl outline-none"
          />

          {/* ROLE */}

          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value
              )
            }
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-xl outline-none"
          >
            <option value="PICKER">
              PICKER
            </option>

            <option value="SUPERVISOR">
              SUPERVISOR
            </option>

            <option value="MANAGER">
              MANAGER
            </option>

            <option value="ADMIN">
              ADMIN
            </option>
          </select>
        </div>

        {/* BUTTON */}

        <button
          onClick={createUser}
          disabled={loading}
          className="mt-6 bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-2xl text-black font-black text-xl"
        >
          {loading
            ? 'CREATING...'
            : 'CREATE USER'}
        </button>
      </div>

      {/* USER LIST */}

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black">
            Warehouse Users
          </h2>

          <div className="bg-orange-500 text-black px-5 py-2 rounded-2xl font-black">
            {users.length}{' '}
            USERS
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
            >
              {/* NAME */}

              <h2 className="text-3xl font-black">
                {user.name}
              </h2>

              {/* ROLE */}

              <div className="inline-flex mt-4 bg-orange-500 text-black px-4 py-2 rounded-2xl font-black">
                {user.role}
              </div>

              {/* ONLINE */}

              <div className="mt-5 flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.isOnline
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                ></div>

                <p className="text-zinc-400 font-bold">
                  {user.isOnline
                    ? 'ONLINE'
                    : 'OFFLINE'}
                </p>
              </div>

              {/* PAGE */}

              <div className="mt-5">
                <p className="text-zinc-500 text-sm">
                  Current Page
                </p>

                <p className="font-black mt-1">
                  {user.currentPage ||
                    '—'}
                </p>
              </div>

              {/* ACTIVE ORDER */}

              <div className="mt-5">
                <p className="text-zinc-500 text-sm">
                  Active Order
                </p>

                <p className="font-black mt-1">
                  {user.activeOrder ||
                    '—'}
                </p>
              </div>

              {/* LAST ACTIVITY */}

              <div className="mt-5">
                <p className="text-zinc-500 text-sm">
                  Last Activity
                </p>

                <p className="font-black mt-1 text-sm">
                  {user.lastActivityAt
                    ? new Date(
                        user.lastActivityAt
                      ).toLocaleString()
                    : '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;