import { useEffect, useState } from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router-dom';

import toast, {
  Toaster,
} from 'react-hot-toast';

import api from '../api/axios';

import socket from '../socket';

import PalletScanner from '../components/truck/PalletScanner';

const TruckDetailsPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [truck, setTruck] =
    useState(null);

  const [pallets, setPallets] =
    useState([]);

  const [showScanner, setShowScanner] =
    useState(false);

  const [loadingMode, setLoadingMode] =
    useState(false);

  /* =========================
     FETCH TRUCK
  ========================= */
  const fetchTruck = async () => {
    try {
      const { data } = await api.get(
        '/trucks'
      );

      const foundTruck = data.find(
        (t) => t._id === id
      );

      setTruck(foundTruck);

      if (
        foundTruck?.status ===
        'LOADING'
      ) {
        setLoadingMode(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================
     FETCH PALLETS
  ========================= */
  const fetchPallets = async () => {
    try {
      const { data } = await api.get(
        `/pallets/truck/${id}`
      );

      setPallets(data);
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================
     HANDLE SCAN
  ========================= */
  const handleScan = async (
    palletCode
  ) => {
    try {
      /* VIBRATION */
      navigator.vibrate?.(100);

      /* LOADING MODE */
      if (loadingMode) {
        await api.post(
          '/pallets/load',
          {
            palletCode,
            truckId: truck._id,
          }
        );

        toast.success(
          `Pallet ${palletCode.slice(
            -4
          )} LOADED`
        );
      } else {
        /* BUILDING MODE */
        await api.post(
          '/pallets/scan',
          {
            palletCode,
            truckId: truck._id,
          }
        );

        toast.success(
          `Pallet ${palletCode.slice(
            -4
          )} scanned`
        );
      }

      fetchPallets();

      setShowScanner(false);
    } catch (error) {
      navigator.vibrate?.([
        100,
        50,
        100,
      ]);

      toast.error(
        error.response?.data?.message ||
          'Scan failed'
      );
    }
  };

  /* =========================
     SOCKET EVENTS
  ========================= */
  useEffect(() => {
    fetchTruck();

    fetchPallets();

    socket.on(
      'pallet:scanned',
      () => {
        fetchPallets();
        fetchTruck();
      }
    );

    socket.on(
      'pallet:loaded',
      () => {
        fetchPallets();
        fetchTruck();
      }
    );

    socket.on(
      'truck:updated',
      () => {
        fetchTruck();
      }
    );

    socket.on(
      'truck:complete',
      () => {
        navigator.vibrate?.(
          500
        );

        toast.success(
          'TRUCK COMPLETE'
        );

        fetchTruck();
      }
    );

    return () => {
      socket.off(
        'pallet:scanned'
      );

      socket.off(
        'pallet:loaded'
      );

      socket.off(
        'truck:updated'
      );

      socket.off(
        'truck:complete'
      );
    };
  }, []);

  if (!truck) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-2xl">
          Loading Truck...
        </p>
      </div>
    );
  }

  const progress =
    (pallets.length /
      truck.maxPallets) *
    100;

  const loadedCount = pallets.filter(
    (p) => p.status === 'LOADED'
  ).length;

  const loadingProgress =
    (loadedCount /
      truck.maxPallets) *
    100;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Toaster position="top-center" />

      {/* BACK */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-5 py-3 rounded-2xl font-bold transition"
      >
        ← Back
      </button>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-5xl font-black text-orange-500">
          {truck.truckNumber}
        </h1>

        <p className="text-2xl text-zinc-300 mt-3">
          Route: {truck.routeName}
        </p>

        <div className="mt-3">
          <p className="text-sm text-zinc-500">
            Truck ID
          </p>

          <p className="text-zinc-300 font-mono break-all">
            {truck._id}
          </p>
        </div>

        <div className="mt-4 inline-flex">
          <span className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full font-bold">
            {truck.status}
          </span>
        </div>
      </div>

      {/* SCANNED PROGRESS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Scanned Pallets
          </h2>

          <span className="text-orange-500 text-3xl font-black">
            {pallets.length} /{' '}
            {truck.maxPallets}
          </span>
        </div>

        <div className="w-full bg-zinc-800 rounded-full h-5 overflow-hidden">
          <div
            className="bg-orange-500 h-full transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* LOADED PROGRESS */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Loaded Pallets
          </h2>

          <span className="text-green-400 text-3xl font-black">
            {loadedCount} /{' '}
            {truck.maxPallets}
          </span>
        </div>

        <div className="w-full bg-zinc-800 rounded-full h-5 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all"
            style={{
              width: `${loadingProgress}%`,
            }}
          />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* FLOOR READY */}
        <button
          disabled={
            pallets.length !==
            truck.maxPallets
          }
          onClick={async () => {
            try {
              await api.patch(
                `/trucks/${truck._id}/status`,
                {
                  status:
                    'FLOOR READY',
                }
              );

              toast.success(
                'Truck moved to FLOOR READY'
              );

              fetchTruck();
            } catch {
              toast.error(
                'Status update failed'
              );
            }
          }}
          className={`py-5 rounded-2xl font-black text-xl transition ${
            pallets.length ===
            truck.maxPallets
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          FLOOR READY
        </button>

        {/* START LOADING */}
        <button
          onClick={async () => {
            try {
              await api.patch(
                `/trucks/${truck._id}/status`,
                {
                  status:
                    'LOADING',
                }
              );

              setLoadingMode(true);

              toast.success(
                'Loading mode started'
              );

              fetchTruck();
            } catch {
              toast.error(
                'Status update failed'
              );
            }
          }}
          className="bg-green-600 hover:bg-green-700 py-5 rounded-2xl font-black text-xl transition"
        >
          START LOADING
        </button>

        {/* DISPATCH */}
        <button
          disabled={
            truck.status !==
            'COMPLETE'
          }
          onClick={async () => {
            try {
              await api.patch(
                `/trucks/${truck._id}/status`,
                {
                  status:
                    'DISPATCHED',
                }
              );

              toast.success(
                'Truck dispatched'
              );

              fetchTruck();
            } catch {
              toast.error(
                'Dispatch failed'
              );
            }
          }}
          className={`py-5 rounded-2xl font-black text-xl transition ${
            truck.status ===
            'COMPLETE'
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          DISPATCH
        </button>
      </div>

      {/* SCAN BUTTON */}
      <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
        <button
          onClick={() =>
            setShowScanner(true)
          }
          className={`w-full transition py-8 rounded-3xl text-3xl font-black shadow-lg ${
            loadingMode
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {loadingMode
            ? 'VERIFY & LOAD'
            : 'SCAN PALLET'}
        </button>

        <p className="text-center text-zinc-500 mt-4">
          {loadingMode
            ? 'Rescan pallets while loading trailer'
            : 'Scan SAP pallet labels to assign pallets'}
        </p>
      </div>

      {/* CAMERA */}
      {showScanner && (
        <div className="mt-6">
          <PalletScanner
            onScan={handleScan}
          />
        </div>
      )}

      {/* PALLETS */}
      <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black">
            Pallets
          </h2>

          <span className="text-zinc-500">
            {pallets.length} total
          </span>
        </div>

        {pallets.length === 0 ? (
          <p className="text-zinc-500">
            No pallets scanned yet
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pallets.map((pallet) => (
              <div
                key={pallet._id}
                className={`rounded-2xl p-4 border ${
                  pallet.status ===
                  'LOADED'
                    ? 'bg-green-900 border-green-700'
                    : 'bg-zinc-800 border-zinc-700'
                }`}
              >
                <p className="text-zinc-500 text-sm">
                  PALLET
                </p>

                <h3 className="text-3xl font-black text-orange-500 mt-2">
                  #
                  {
                    pallet.last4Digits
                  }
                </h3>

                <p
                  className={`mt-2 text-sm font-bold ${
                    pallet.status ===
                    'LOADED'
                      ? 'text-green-400'
                      : 'text-orange-400'
                  }`}
                >
                  {pallet.status}
                </p>

                <p className="text-xs text-zinc-500 mt-3 break-all">
                  {
                    pallet.palletCode
                  }
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruckDetailsPage;