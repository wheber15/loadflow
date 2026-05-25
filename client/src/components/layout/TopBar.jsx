import {
  useState,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Menu,
  X,
} from 'lucide-react';

import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

const TopBar = () => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const {
    user,
    logout,
  } = useAuth();

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout =
    async () => {
      try {
        await logout();

        toast.success(
          'Logged out successfully'
        );

        navigate('/login');
      } catch (error) {
        console.log(error);

        toast.error(
          'Logout failed'
        );
      }
    };

  /* =========================
     ROLES
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

  /* =========================
     NAV BUTTON
  ========================= */

  const NavButton = ({
    label,
    path,
  }) => {
    const active =
      location.pathname ===
      path;

    return (
      <button
        onClick={() => {
          navigate(path);

          setMenuOpen(false);
        }}
        className={`
          px-5 py-3 rounded-2xl font-black transition-all whitespace-nowrap
          ${
            active
              ? 'bg-orange-500 text-black'
              : 'bg-zinc-900 hover:bg-zinc-800 text-white'
          }
        `}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="sticky top-0 z-50 mb-6">
      <div className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-[32px] p-4 sm:p-5 shadow-2xl">
        {/* TOP */}

        <div className="flex items-center justify-between gap-4">
          {/* LEFT */}

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-orange-500 leading-none truncate">
              LOADFLOW
            </h1>

            <p className="text-zinc-500 text-xs sm:text-sm mt-1">
              Warehouse Execution
              Platform
            </p>
          </div>

          {/* MOBILE MENU */}

          {!isPicker && (
            <button
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
              className="lg:hidden w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center"
            >
              {menuOpen ? (
                <X size={28} />
              ) : (
                <Menu size={28} />
              )}
            </button>
          )}

          {/* DESKTOP RIGHT */}

          <div className="hidden lg:flex items-center gap-4">
            {/* USER */}

            <div className="text-right">
              <p className="font-black text-lg leading-none">
                {user?.name}
              </p>

              <p className="text-zinc-500 text-sm mt-1">
                {user?.role}
              </p>
            </div>

            {/* STATUS */}

            {isPicker && (
              <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded-2xl font-black">
                ACTIVE
              </div>
            )}

            {/* LOGOUT */}

            <button
              onClick={
                handleLogout
              }
              className="bg-red-500 hover:bg-red-600 active:scale-[0.98] transition-all px-5 py-3 rounded-2xl font-black"
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* DESKTOP NAV */}

        {!isPicker && (
          <div className="hidden lg:flex flex-wrap gap-3 mt-5">
            <NavButton
              label="HOME"
              path="/admin"
            />

            {(isSupervisor ||
              isManager ||
              isAdmin) && (
              <NavButton
                label="FLOOR"
                path="/floor"
              />
            )}

            {isAdmin && (
              <NavButton
                label="PICKER"
                path="/picker"
              />
            )}

            {(isManager ||
              isAdmin) && (
              <NavButton
                label="DASHBOARD"
                path="/dashboard"
              />
            )}

            {(isManager ||
              isAdmin) && (
              <NavButton
                label="OFFICE"
                path="/office/bulk"
              />
            )}

            {isAdmin && (
              <NavButton
                label="USERS"
                path="/admin/users"
              />
            )}
          </div>
        )}

        {/* MOBILE NAV */}

        {!isPicker &&
          menuOpen && (
            <div className="lg:hidden mt-5 border-t border-zinc-800 pt-5">
              <div className="flex flex-col gap-3">
                <NavButton
                  label="HOME"
                  path="/admin"
                />

                {(isSupervisor ||
                  isManager ||
                  isAdmin) && (
                  <NavButton
                    label="FLOOR"
                    path="/floor"
                  />
                )}

                {isAdmin && (
                  <NavButton
                    label="PICKER"
                    path="/picker"
                  />
                )}

                {(isManager ||
                  isAdmin) && (
                  <NavButton
                    label="DASHBOARD"
                    path="/dashboard"
                  />
                )}

                {(isManager ||
                  isAdmin) && (
                  <NavButton
                    label="OFFICE"
                    path="/office/bulk"
                  />
                )}

                {isAdmin && (
                  <NavButton
                    label="USERS"
                    path="/admin/users"
                  />
                )}

                {/* MOBILE USER */}

                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 mt-3">
                  <p className="font-black text-lg">
                    {user?.name}
                  </p>

                  <p className="text-zinc-500 text-sm mt-1">
                    {user?.role}
                  </p>

                  {isPicker && (
                    <div className="mt-3 bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded-2xl font-black inline-flex">
                      ACTIVE
                    </div>
                  )}

                  <button
                    onClick={
                      handleLogout
                    }
                    className="w-full mt-4 bg-red-500 hover:bg-red-600 active:scale-[0.98] transition-all py-3 rounded-2xl font-black"
                  >
                    LOGOUT
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* PICKER MOBILE */}

        {isPicker && (
          <div className="flex items-center justify-between gap-4 mt-5 lg:hidden">
            <div>
              <p className="font-black text-lg leading-none">
                {user?.name}
              </p>

              <p className="text-zinc-500 text-sm mt-1">
                {user?.role}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded-2xl font-black">
                ACTIVE
              </div>

              <button
                onClick={
                  handleLogout
                }
                className="bg-red-500 hover:bg-red-600 active:scale-[0.98] transition-all px-5 py-3 rounded-2xl font-black"
              >
                LOGOUT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;