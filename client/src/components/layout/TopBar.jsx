import {
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const TopBar = () => {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout =
    async () => {
      await logout();

      navigate('/login');
    };

  /* =========================
     ROLE NAVIGATION
  ========================= */

  const isPicker =
    user?.role ===
    'PICKER';

  const isSupervisor =
    user?.role ===
    'SUPERVISOR';

  const isManager =
    user?.role ===
    'MANAGER';

  const isAdmin =
    user?.role ===
    'ADMIN';

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
      {/* LEFT */}

      <div>
        <h1 className="text-3xl font-black text-orange-500">
          LOADFLOW
        </h1>

        <p className="text-zinc-500">
          Warehouse Execution
          Platform
        </p>
      </div>

      {/* CENTER */}

      {!isPicker && (
        <div className="flex flex-wrap gap-3">
          {/* HOME */}

          <button
            onClick={() =>
              navigate(
                '/admin'
              )
            }
            className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl font-black transition-all"
          >
            HOME
          </button>

          {/* FLOOR */}

          {(isSupervisor ||
            isManager ||
            isAdmin) && (
            <button
              onClick={() =>
                navigate(
                  '/floor'
                )
              }
              className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl font-black transition-all"
            >
              FLOOR
            </button>
          )}

          {/* PICKER */}

          {isAdmin && (
            <button
              onClick={() =>
                navigate(
                  '/picker'
                )
              }
              className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl font-black transition-all"
            >
              PICKER
            </button>
          )}

          {/* DASHBOARD */}

          {(isManager ||
            isAdmin) && (
            <button
              onClick={() =>
                navigate(
                  '/dashboard'
                )
              }
              className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl font-black transition-all"
            >
              DASHBOARD
            </button>
          )}

          {/* USERS */}

          {isAdmin && (
            <button
              onClick={() =>
                navigate(
                  '/admin/users'
                )
              }
              className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl font-black transition-all"
            >
              USERS
            </button>
          )}
        </div>
      )}

      {/* RIGHT */}

      <div className="flex items-center justify-between gap-4">
        {/* PICKER STATUS */}

        {isPicker && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded-2xl font-black">
            ACTIVE
          </div>
        )}

        {/* USER */}

        <div className="text-right">
          <p className="font-black text-lg">
            {user?.name}
          </p>

          <p className="text-zinc-500 text-sm">
            {user?.role}
          </p>
        </div>

        {/* LOGOUT */}

        <button
          onClick={
            handleLogout
          }
          className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-2xl font-black transition-all"
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
};

export default TopBar;