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
          navigate('/');
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8">
        {/* LOGO */}

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-black text-2xl font-black">
            LF
          </div>

          <div>
            <h1 className="text-5xl font-black text-orange-500 leading-none">
              LOADFLOW
            </h1>

            <p className="text-zinc-500 mt-1">
              Warehouse
              Execution System
            </p>
          </div>
        </div>

        {/* USERNAME */}

        <div className="mb-5">
          <label className="block mb-2 font-bold text-zinc-300">
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
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-2xl outline-none focus:border-orange-500"
          />
        </div>

        {/* PIN */}

        <div className="mb-8">
          <label className="block mb-2 font-bold text-zinc-300">
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
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-2xl outline-none focus:border-orange-500"
          />
        </div>

        {/* BUTTON */}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 transition-all rounded-2xl py-4 text-2xl font-black text-black"
        >
          {loading
            ? 'LOGGING IN...'
            : 'LOGIN'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;