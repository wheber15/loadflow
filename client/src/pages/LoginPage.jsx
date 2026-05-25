import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';

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
        if (!name || !pin) {
          return toast.error(
            'Enter username and PIN'
          );
        }

        setLoading(true);

        const loadingToast =
          toast.loading(
            'Authenticating...'
          );

        const { data } =
          await api.post(
            '/auth/login',
            {
              name,
              pin,
            }
          );

        toast.dismiss(
          loadingToast
        );

        login(data);

        toast.success(
          `Welcome ${data.name}`
        );

        /* ROLE REDIRECT */

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

        toast.error(
          error.response?.data
            ?.message ||
            'Login failed'
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================
     ENTER KEY
  ========================= */

  const handleKeyDown =
    (e) => {
      if (
        e.key === 'Enter'
      ) {
        handleLogin();
      }
    };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative flex items-center justify-center px-4 py-8">
      {/* BACKGROUND */}

      <div className="absolute inset-0">
        <div className="absolute top-[-300px] left-[-300px] w-[700px] h-[700px] bg-orange-500/10 rounded-full blur-[150px]" />

        <div className="absolute bottom-[-300px] right-[-300px] w-[700px] h-[700px] bg-orange-500/5 rounded-full blur-[150px]" />
      </div>

      {/* CARD */}

      <div className="relative z-10 w-full max-w-[560px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-[38px] p-6 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        {/* HEADER */}

        <div className="flex items-center gap-5 mb-10">
          {/* LOGO */}

          <div className="w-20 h-20 rounded-[28px] bg-orange-500 flex items-center justify-center shrink-0">
            <span className="text-black font-black text-4xl">
              LF
            </span>
          </div>

          {/* TEXT */}

          <div className="min-w-0 flex-1">
            <h1 className="text-orange-500 font-black leading-none tracking-tight text-[42px] sm:text-[58px] whitespace-nowrap">
              LOADFLOW
            </h1>

            <p className="text-zinc-500 mt-2 text-sm sm:text-lg">
              Warehouse Execution
              System
            </p>
          </div>
        </div>

        {/* USERNAME */}

        <div className="mb-6">
          <label className="block text-zinc-300 font-bold mb-3 text-sm sm:text-lg">
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
            onKeyDown={
              handleKeyDown
            }
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Enter username..."
            className="
              w-full
              h-16 sm:h-20
              rounded-3xl
              bg-zinc-900
              border border-zinc-800
              px-6
              text-xl sm:text-3xl
              text-white
              outline-none
              transition-all
              focus:border-orange-500
              focus:bg-zinc-900
            "
          />
        </div>

        {/* PIN */}

        <div className="mb-8">
          <label className="block text-zinc-300 font-bold mb-3 text-sm sm:text-lg">
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
            onKeyDown={
              handleKeyDown
            }
            inputMode="numeric"
            autoComplete="off"
            placeholder="••••"
            className="
              w-full
              h-16 sm:h-20
              rounded-3xl
              bg-zinc-900
              border border-zinc-800
              px-6
              text-xl sm:text-3xl
              text-white
              outline-none
              transition-all
              focus:border-orange-500
              focus:bg-zinc-900
            "
          />
        </div>

        {/* BUTTON */}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="
            w-full
            h-16 sm:h-20
            rounded-3xl
            bg-orange-500
            hover:bg-orange-600
            active:scale-[0.99]
            transition-all
            font-black
            text-black
            text-2xl sm:text-4xl
            disabled:opacity-70
          "
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