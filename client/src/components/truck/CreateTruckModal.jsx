import { useState } from 'react';

import api from '../../api/axios';

const CreateTruckModal = ({
  onClose,
  refresh,
}) => {
  const [truckNumber, setTruckNumber] =
    useState('');

  const [routeName, setRouteName] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleCreate = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post('/trucks', {
        truckNumber,
        routeName,
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
      <form
        onSubmit={handleCreate}
        className="bg-zinc-950 border-t md:border border-zinc-800 rounded-t-3xl md:rounded-3xl p-6 w-full md:max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-4xl font-black text-orange-500">
              NEW LOAD
            </h2>

            <p className="text-zinc-500 mt-1">
              Create warehouse truck
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 w-12 h-12 rounded-2xl text-xl font-black"
          >
            ✕
          </button>
        </div>

        {/* TRUCK NUMBER */}
        <div className="mb-5">
          <label className="block text-zinc-400 mb-2 font-bold">
            Truck Number
          </label>

          <input
            type="number"
            inputMode="numeric"
            placeholder="12"
            value={truckNumber}
            onChange={(e) =>
              setTruckNumber(
                e.target.value
              )
            }
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 p-6 rounded-2xl text-4xl font-black outline-none"
            required
          />
        </div>

        {/* ROUTE */}
        <div className="mb-6">
          <label className="block text-zinc-400 mb-2 font-bold">
            Route Name
          </label>

          <input
            type="text"
            placeholder="DUBLIN"
            value={routeName}
            onChange={(e) =>
              setRouteName(
                e.target.value.toUpperCase()
              )
            }
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 p-6 rounded-2xl text-2xl font-bold uppercase outline-none"
            required
          />
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 py-5 rounded-2xl font-black text-xl"
          >
            CANCEL
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 py-5 rounded-2xl font-black text-xl"
          >
            {loading
              ? 'CREATING...'
              : 'CREATE'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTruckModal;