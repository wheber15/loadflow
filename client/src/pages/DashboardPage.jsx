import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import api from '../api/axios';

import socket from '../socket';

import CreateTruckModal from '../components/truck/CreateTruckModal';

const DashboardPage = () => {
  const navigate = useNavigate();

  const [trucks, setTrucks] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const fetchTrucks = async () => {
    try {
      const { data } = await api.get(
        '/trucks'
      );

      const trucksWithCounts =
        await Promise.all(
          data.map(async (truck) => {
            try {
              const palletRes =
                await api.get(
                  `/pallets/truck/${truck._id}`
                );

              const pallets =
                palletRes.data;

              const loadedCount =
                pallets.filter(
                  (p) =>
                    p.status ===
                    'LOADED'
                ).length;

              return {
                ...truck,
                palletCount:
                  pallets.length,
                loadedCount,
              };
            } catch {
              return {
                ...truck,
                palletCount: 0,
                loadedCount: 0,
              };
            }
          })
        );

      setTrucks(trucksWithCounts);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTrucks();

    socket.on(
      'pallet:scanned',
      fetchTrucks
    );

    socket.on(
      'pallet:loaded',
      fetchTrucks
    );

    socket.on(
      'truck:updated',
      fetchTrucks
    );

    socket.on(
      'truck:complete',
      () => {
        navigator.vibrate?.(
          300
        );
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

  const getStatusStyles = (
    truck
  ) => {
    if (
      truck.status ===
      'DISPATCHED'
    ) {
      return {
        badge:
          'bg-purple-500/20 text-purple-400',
        progress:
          'bg-purple-500',
        border:
          'hover:border-purple-500',
      };
    }

    if (
      truck.status ===
      'COMPLETE'
    ) {
      return {
        badge:
          'bg-emerald-500/20 text-emerald-400',
        progress:
          'bg-emerald-500',
        border:
          'hover:border-emerald-500',
      };
    }

    if (
      truck.status ===
      'LOADING'
    ) {
      return {
        badge:
          'bg-green-500/20 text-green-400',
        progress:
          'bg-green-500',
        border:
          'hover:border-green-500',
      };
    }

    if (
      truck.status ===
      'FLOOR READY'
    ) {
      return {
        badge:
          'bg-blue-500/20 text-blue-400',
        progress:
          'bg-blue-500',
        border:
          'hover:border-blue-500',
      };
    }

    if (
      truck.palletCount === 0
    ) {
      return {
        badge:
          'bg-red-500/20 text-red-400',
        progress: 'bg-red-500',
        border:
          'hover:border-red-500',
      };
    }

    return {
      badge:
        'bg-orange-500/20 text-orange-400',
      progress:
        'bg-orange-500',
      border:
        'hover:border-orange-500',
    };
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black text-orange-500">
            LoadFlow
          </h1>

          <p className="text-zinc-400 mt-2">
            Warehouse Logistics Dashboard
          </p>
        </div>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className="bg-orange-500 hover:bg-orange-600 transition px-6 py-4 rounded-2xl font-bold shadow-lg"
        >
          + Create Truck
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {trucks.map((truck) => {
          const progress =
            (truck.loadedCount /
              truck.maxPallets) *
            100;

          const styles =
            getStatusStyles(truck);

          return (
            <div
              key={truck._id}
              onClick={() =>
                navigate(
                  `/truck/${truck._id}`
                )
              }
              className={`bg-zinc-900 rounded-2xl p-5 border border-zinc-800 cursor-pointer ${styles.border} hover:scale-[1.02] transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {truck.truckNumber}
                </h2>

                <span
                  className={`${styles.badge} px-3 py-1 rounded-full text-sm font-semibold`}
                >
                  {truck.status}
                </span>
              </div>

              <p className="text-zinc-400 mt-3">
                Route:{' '}
                {truck.routeName}
              </p>

              <div className="mt-5">
                <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
                  <div
                    className={`${styles.progress} h-full transition-all duration-500`}
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-zinc-500">
                    {
                      truck.loadedCount
                    }{' '}
                    /{' '}
                    {
                      truck.maxPallets
                    }{' '}
                    loaded
                  </p>

                  <p className="text-sm font-bold text-zinc-400">
                    {Math.round(
                      progress
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <CreateTruckModal
          onClose={() =>
            setShowModal(false)
          }
          refresh={fetchTrucks}
        />
      )}
    </div>
  );
};

export default DashboardPage;