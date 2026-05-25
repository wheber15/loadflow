import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import api from '../api/axios';

import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [name, setName] =
    useState('');

  const [pin, setPin] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  /* =========================
     LOGIN
  ========================= */

  const handleLogin =
    async () => {
      try {
        setLoading(true);

        const { data } =
          await api.post(
            '/auth/login',
            {
              name,
              pin,
            }
          );

        login(data);

        /* =========================
           ROLE REDIRECT
        ========================= */

        if (
          data.role ===
          'PICKER'
        ) {
          navigate('/picker');
        } else if (
          data.role ===
          'SUPERVISOR'
        ) {
          navigate('/floor');
        } else {
          navigate('/admin');
        }
      } catch (error) {
        console.log(error);

        alert(
          error.response?.data
            ?.message ||
            'Login failed'
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden flex items-center justify-center px-4 sm:px-6 py-8">
      {/* WRAPPER */}

      <div className="w-full max-w-md lg:max-w-lg bg-zinc-950 border border-zinc-800 rounded-[32px] p-5 sm:p-8 shadow-2xl">
        {/* LOGO */}

        <div className="flex items-center gap-3 sm:gap-5 mb-8 sm:mb-10">
          {/* ICON */}

          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-orange-500 flex items-center justify-center text-black text-2xl sm:text-4xl font-black shrink-0">
            LF
          </div>

          {/* TEXT */}

          <div className="min-w-0">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-orange-500 leading-none break-words">
              LOADFLOW
            </h1>

            <p className="text-zinc-500 mt-1 text-sm sm:text-base">
              Warehouse Execution
              System
            </p>
          </div>
        </div>

        {/* USERNAME */}

        <div className="mb-5">
          <label className="block mb-2 font-bold text-zinc-300 text-sm sm:text-lg">
            Username
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            placeholder="Enter username..."
            className="w-full h-16 sm:h-20 bg-zinc-900 border border-zinc-800 rounded-3xl px-5 text-xl sm:text-3xl outline-none focus:border-orange-500 transition-all"
          />
        </div>

        {/* PIN */}

        <div className="mb-8">
          <label className="block mb-2 font-bold text-zinc-300 text-sm sm:text-lg">
            PIN
          </label>

          <input
            type="password"
            value={pin}
            onChange={(e) =>
              setPin(
                e.target.value
              )
            }
            placeholder="****"
            className="w-full h-16 sm:h-20 bg-zinc-900 border border-zinc-800 rounded-3xl px-5 text-xl sm:text-3xl outline-none focus:border-orange-500 transition-all"
          />
        </div>

        {/* BUTTON */}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-16 sm:h-20 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] transition-all rounded-3xl text-xl sm:text-4xl font-black text-black"
        >
          {loading
            ? 'LOGGING IN...'
            : 'LOGIN'}
        </button>

        {/* FOOTER */}

        <div className="mt-8 text-center">
          <p className="text-zinc-600 text-xs sm:text-sm">
            LoadFlow Warehouse
            Control Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;