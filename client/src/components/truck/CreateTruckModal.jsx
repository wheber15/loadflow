// src/components/truck/CreateTruckModal.jsx

import { useState } from 'react';

import api from '../../api/axios';

const CreateTruckModal = ({
  onClose,
  refresh,
  selectedDate,
}) => {
  const today =
    new Date()
      .toISOString()
      .split('T')[0];

  const [truckNumber, setTruckNumber] =
    useState('');

  const [routeName, setRouteName] =
    useState('');

  const [shiftDate, setShiftDate] =
    useState(
      selectedDate || today
    );

  const [shiftType, setShiftType] =
    useState('DAY');

  const [loading, setLoading] =
    useState(false);

  /* =========================
     CREATE TRUCK
  ========================= */
  const handleCreate = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post('/trucks', {
        truckNumber:
          Number(
            truckNumber
          ),
        routeName:
          routeName.toUpperCase(),
        shiftDate,
        shiftType,
      });

      await refresh();

      onClose();
    } catch (error) {
      alert(
        error.response?.data
          ?.message ||
          'Failed to create truck'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-5">

      <form
        onSubmit={handleCreate}
        className="w-full md:max-w-2xl bg-zinc-950 border-t md:border border-zinc-800 rounded-t-3xl md:rounded-3xl p-6 md:p-8 max-h-screen overflow-y-auto"
      >

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-8">

          <div>
            <h2 className="text-4xl md:text-5xl font-black text-orange-500">
              NEW LOAD
            </h2>

            <p className="text-zinc-500 mt-2 text-sm md:text-base">
              Create warehouse truck load
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 transition w-14 h-14 rounded-2xl text-2xl font-black flex items-center justify-center"
          >
            ✕
          </button>

        </div>

        {/* TRUCK NUMBER */}
        <div className="mb-6">

          <label className="block text-zinc-400 mb-3 font-black text-sm uppercase tracking-wide">
            Truck Number
          </label>

          <input
            type="number"
            inputMode="numeric"
            placeholder="Enter truck number"
            value={truckNumber}
            onChange={(e) =>
              setTruckNumber(
                e.target.value
              )
            }
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 transition p-6 rounded-3xl text-2xl font-black outline-none"
            required
          />

        </div>

        {/* ROUTE NAME */}
        <div className="mb-6">

          <label className="block text-zinc-400 mb-3 font-black text-sm uppercase tracking-wide">
            Route Name
          </label>

          <input
            type="text"
            placeholder="Enter route name"
            value={routeName}
            onChange={(e) =>
              setRouteName(
                e.target.value.toUpperCase()
              )
            }
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 transition p-6 rounded-3xl text-2xl font-black uppercase outline-none"
            required
          />

        </div>

        {/* SHIFT DATE */}
        <div className="mb-6">

          <label className="block text-zinc-400 mb-3 font-black text-sm uppercase tracking-wide">
            Shift Date
          </label>

          <input
            type="date"
            value={shiftDate}
            onChange={(e) =>
              setShiftDate(
                e.target.value
              )
            }
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 transition p-6 rounded-3xl text-xl font-black outline-none"
            required
          />

        </div>

        {/* SHIFT TYPE */}
        <div className="mb-8">

          <label className="block text-zinc-400 mb-3 font-black text-sm uppercase tracking-wide">
            Shift Type
          </label>

          <div className="grid grid-cols-3 gap-3">

            <button
              type="button"
              onClick={() =>
                setShiftType(
                  'DAY'
                )
              }
              className={`py-5 rounded-3xl font-black text-lg transition ${
                shiftType ===
                'DAY'
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-900 border border-zinc-800'
              }`}
            >
              DAY
            </button>

            <button
              type="button"
              onClick={() =>
                setShiftType(
                  'NIGHT'
                )
              }
              className={`py-5 rounded-3xl font-black text-lg transition ${
                shiftType ===
                'NIGHT'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 border border-zinc-800'
              }`}
            >
              NIGHT
            </button>

            <button
              type="button"
              onClick={() =>
                setShiftType(
                  'PRELOAD'
                )
              }
              className={`py-5 rounded-3xl font-black text-lg transition ${
                shiftType ===
                'PRELOAD'
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-900 border border-zinc-800'
              }`}
            >
              PRELOAD
            </button>

          </div>

        </div>

        {/* PREVIEW */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-8">

          <p className="text-zinc-500 text-sm uppercase font-black">
            Load Preview
          </p>

          <div className="mt-4 space-y-3">

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">
                Truck
              </span>

              <span className="font-black text-xl">
                {truckNumber ||
                  '--'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">
                Route
              </span>

              <span className="font-black text-xl uppercase">
                {routeName ||
                  '--'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">
                Date
              </span>

              <span className="font-black text-xl">
                {shiftDate}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400">
                Shift
              </span>

              <span
                className={`px-4 py-2 rounded-2xl text-sm font-black ${
                  shiftType ===
                  'PRELOAD'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : shiftType ===
                      'NIGHT'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}
              >
                {shiftType}
              </span>
            </div>

          </div>

        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-4">

          <button
            type="button"
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 transition py-5 rounded-3xl font-black text-xl"
          >
            CANCEL
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 transition py-5 rounded-3xl font-black text-xl disabled:opacity-50"
          >
            {loading
              ? 'CREATING...'
              : 'CREATE LOAD'}
          </button>

        </div>

      </form>
    </div>
  );
};

export default CreateTruckModal;