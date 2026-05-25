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
    () => {
      logout();

      navigate('/login');
    };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() =>
            navigate('/')
          }
          className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl font-black"
        >
          HOME
        </button>

        <button
          onClick={() =>
            navigate('/floor')
          }
          className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl font-black"
        >
          FLOOR
        </button>

        <button
          onClick={() =>
            navigate('/picker')
          }
          className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl font-black"
        >
          PICKER
        </button>

        <button
          onClick={() =>
            navigate('/dashboard')
          }
          className="bg-zinc-900 hover:bg-zinc-800 px-5 py-3 rounded-2xl font-black"
        >
          DASHBOARD
        </button>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-black">
            {user?.name}
          </p>

          <p className="text-zinc-500 text-sm">
            {user?.role}
          </p>
        </div>

        <button
          onClick={
            handleLogout
          }
          className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-2xl font-black"
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
};

export default TopBar;