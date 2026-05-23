// src/pages/DashboardPage.jsx

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
      const { data } =
        await api.get('/trucks');

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

      setTrucks(
        trucksWithCounts
      );
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
      'FLOOR_READY'
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
        progress:
          'bg-red-500',
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

  /* DASHBOARD TOTALS */
  const totalPallets =
    trucks.reduce(
      (sum, t) =>
        sum + t.palletCount,
      0
    );

  const totalLoaded =
    trucks.reduce(
      (sum, t) =>
        sum + t.loadedCount,
      0
    );

  const totalBulk =
    trucks.reduce(
      (sum, t) =>
        sum +
        t.bulkWaitingCount,
      0
    );

  const activeLoads =
    trucks.filter(
      (t) =>
        t.status !==
        'DISPATCHED'
    ).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1900px] mx-auto p-4 md:p-6">

        {/* HEADER */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-8">

          <div>
            <h1 className="text-5xl xl:text-6xl font-black text-orange-500">
              LoadFlow
            </h1>

            <p className="text-zinc-400 mt-2 text-lg">
              Warehouse Logistics Dashboard
            </p>
          </div>

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="bg-orange-500 hover:bg-orange-600 transition px-8 py-5 rounded-3xl font-black text-xl shadow-lg"
          >
            + NEW LOAD
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-500 text-sm">
              ACTIVE LOADS
            </p>

            <h2 className="text-5xl font-black text-orange-500 mt-3">
              {activeLoads}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-500 text-sm">
              TOTAL PALLETS
            </p>

            <h2 className="text-5xl font-black text-blue-400 mt-3">
              {totalPallets}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-500 text-sm">
              BULK WAITING
            </p>

            <h2 className="text-5xl font-black text-yellow-400 mt-3">
              {totalBulk}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-500 text-sm">
              LOADED
            </p>

            <h2 className="text-5xl font-black text-green-400 mt-3">
              {totalLoaded}
            </h2>
          </div>
        </div>

        {/* TRUCK GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
          {trucks.map((truck) => {
            const styles =
              getStatusStyles(
                truck
              );

            const totalProgress =
              truck.floorReadyCount +
              truck.bulkWaitingCount;

            const progress =
              (totalProgress /
                truck.maxPallets) *
              100;

            return (
              <div
                key={truck._id}
                onClick={() =>
                  navigate(
                    `/truck/${truck._id}`
                  )
                }
                className={`bg-zinc-900 rounded-3xl p-5 border border-zinc-800 cursor-pointer transition-all duration-300 hover:scale-[1.01] ${styles.border}`}
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h2 className="text-3xl xl:text-4xl font-black">
                      TRUCK{' '}
                      {
                        truck.truckNumber
                      }
                    </h2>

                    <p className="text-zinc-400 mt-2 text-lg">
                      {
                        truck.routeName
                      }
                    </p>

                    <p className="text-xs text-zinc-600 mt-2">
                      {
                        truck.loadId
                      }
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-2xl text-sm font-black whitespace-nowrap ${styles.badge}`}
                  >
                    {truck.status}
                  </span>
                </div>

                {/* COUNTS */}
                <div className="grid grid-cols-3 gap-3 mt-6">

                  <div className="bg-zinc-800 rounded-2xl p-4">
                    <p className="text-zinc-500 text-xs">
                      READY
                    </p>

                    <h3 className="text-3xl font-black text-orange-500 mt-2">
                      {
                        truck.floorReadyCount
                      }
                    </h3>
                  </div>

                  <div className="bg-zinc-800 rounded-2xl p-4">
                    <p className="text-zinc-500 text-xs">
                      BULK
                    </p>

                    <h3 className="text-3xl font-black text-yellow-400 mt-2">
                      {
                        truck.bulkWaitingCount
                      }
                    </h3>
                  </div>

                  <div className="bg-zinc-800 rounded-2xl p-4">
                    <p className="text-zinc-500 text-xs">
                      LOADED
                    </p>

                    <h3 className="text-3xl font-black text-green-400 mt-2">
                      {
                        truck.loadedCount
                      }
                    </h3>
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="mt-6">

                  <div className="flex items-center justify-between mb-3">
                    <p className="text-zinc-500 text-sm">
                      Truck Capacity
                    </p>

                    <p className="text-lg font-black">
                      {totalProgress}
                      /{truck.maxPallets}
                    </p>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-5 overflow-hidden">
                    <div
                      className={`${styles.progress} h-full transition-all duration-500`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-6 flex items-center justify-between">

                  <div>
                    <p className="text-zinc-500 text-xs">
                      PALLETS
                    </p>

                    <h3 className="text-2xl font-black mt-1">
                      {
                        truck.palletCount
                      }
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className="text-zinc-500 text-xs">
                      LOADED %
                    </p>

                    <h3 className="text-2xl font-black mt-1">
                      {Math.round(
                        progress
                      )}
                      %
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY */}
        {trucks.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-20 text-center mt-6">
            <h2 className="text-4xl font-black text-zinc-500">
              NO ACTIVE LOADS
            </h2>

            <p className="text-zinc-600 mt-3">
              Create your first truck load
            </p>
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <CreateTruckModal
            onClose={() =>
              setShowModal(false)
            }
            refresh={fetchTrucks}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;