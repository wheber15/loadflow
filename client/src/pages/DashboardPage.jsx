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

              const readyCount =
                pallets.filter(
                  (p) =>
                    p.status ===
                    'READY'
                ).length;

              const loadingCount =
                pallets.filter(
                  (p) =>
                    p.status ===
                    'LOADING'
                ).length;

              return {
                ...truck,
                palletCount:
                  pallets.length,
                loadedCount,
                readyCount,
                loadingCount,
              };
            } catch {
              return {
                ...truck,
                palletCount: 0,
                loadedCount: 0,
                readyCount: 0,
                loadingCount: 0,
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

    socket.on(
      'delivery:updated',
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

      socket.off(
        'delivery:updated'
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
          'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        progress:
          'bg-purple-500',
        border:
          'hover:border-purple-500',
        glow:
          'hover:shadow-purple-500/20',
      };
    }

    if (
      truck.status ===
      'COMPLETE'
    ) {
      return {
        badge:
          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        progress:
          'bg-emerald-500',
        border:
          'hover:border-emerald-500',
        glow:
          'hover:shadow-emerald-500/20',
      };
    }

    if (
      truck.status ===
      'LOADING'
    ) {
      return {
        badge:
          'bg-green-500/20 text-green-400 border border-green-500/30',
        progress:
          'bg-green-500',
        border:
          'hover:border-green-500',
        glow:
          'hover:shadow-green-500/20',
      };
    }

    if (
      truck.status ===
      'FLOOR_READY'
    ) {
      return {
        badge:
          'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        progress:
          'bg-blue-500',
        border:
          'hover:border-blue-500',
        glow:
          'hover:shadow-blue-500/20',
      };
    }

    if (
      truck.status ===
      'WAITING_BULK'
    ) {
      return {
        badge:
          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        progress:
          'bg-yellow-500',
        border:
          'hover:border-yellow-500',
        glow:
          'hover:shadow-yellow-500/20',
      };
    }

    return {
      badge:
        'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      progress:
        'bg-orange-500',
      border:
        'hover:border-orange-500',
      glow:
        'hover:shadow-orange-500/20',
    };
  };

  /* TOTALS */
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

  const totalReady =
    trucks.reduce(
      (sum, t) =>
        sum +
        t.floorReadyCount,
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
      <div className="max-w-[2200px] mx-auto px-4 md:px-6 py-5">

        {/* HEADER */}
        <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-5 mb-8">

          <div>
            <h1 className="text-5xl md:text-6xl 2xl:text-7xl font-black text-orange-500 tracking-tight">
              LoadFlow
            </h1>

            <p className="text-zinc-400 mt-2 text-base md:text-lg">
              Warehouse Logistics Dashboard
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <button
              onClick={() =>
                fetchTrucks()
              }
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition px-6 py-4 rounded-3xl font-black text-lg"
            >
              REFRESH
            </button>

            <button
              onClick={() =>
                setShowModal(true)
              }
              className="bg-orange-500 hover:bg-orange-600 transition px-8 py-4 rounded-3xl font-black text-lg shadow-lg"
            >
              + NEW LOAD
            </button>

          </div>
        </div>

        {/* LIVE OVERVIEW */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-500 text-xs md:text-sm">
              ACTIVE LOADS
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-orange-500 mt-3">
              {activeLoads}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-500 text-xs md:text-sm">
              READY
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-blue-400 mt-3">
              {totalReady}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-500 text-xs md:text-sm">
              BULK WAITING
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-yellow-400 mt-3">
              {totalBulk}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <p className="text-zinc-500 text-xs md:text-sm">
              LOADED
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-green-400 mt-3">
              {totalLoaded}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 col-span-2 xl:col-span-1">
            <p className="text-zinc-500 text-xs md:text-sm">
              TOTAL PALLETS
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-white mt-3">
              {totalPallets}
            </h2>
          </div>

        </div>

        {/* TRUCKS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">

          {trucks.map((truck) => {
            const styles =
              getStatusStyles(
                truck
              );

            const totalProgress =
              truck.floorReadyCount +
              truck.bulkWaitingCount +
              truck.loadedCount;

            const progress =
              (totalProgress /
                truck.maxPallets) *
              100;

            const loadedPercent =
              (truck.loadedCount /
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
                className={`group bg-zinc-900 rounded-[32px] p-5 border border-zinc-800 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${styles.border} ${styles.glow}`}
              >

                {/* TOP */}
                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">
                    <h2 className="text-3xl xl:text-4xl font-black truncate">
                      TRUCK{' '}
                      {
                        truck.truckNumber
                      }
                    </h2>

                    <p className="text-zinc-300 mt-2 text-lg">
                      {
                        truck.routeName
                      }
                    </p>

                    <p className="text-xs text-zinc-600 mt-2 break-all">
                      {
                        truck.loadId
                      }
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap ${styles.badge}`}
                  >
                    {truck.status}
                  </span>
                </div>

                {/* COUNTS */}
                <div className="grid grid-cols-3 gap-3 mt-6">

                  <div className="bg-zinc-800/80 rounded-2xl p-4 border border-zinc-700">
                    <p className="text-zinc-500 text-xs">
                      READY
                    </p>

                    <h3 className="text-3xl font-black text-orange-500 mt-2">
                      {
                        truck.floorReadyCount
                      }
                    </h3>
                  </div>

                  <div className="bg-zinc-800/80 rounded-2xl p-4 border border-zinc-700">
                    <p className="text-zinc-500 text-xs">
                      BULK
                    </p>

                    <h3 className="text-3xl font-black text-yellow-400 mt-2">
                      {
                        truck.bulkWaitingCount
                      }
                    </h3>
                  </div>

                  <div className="bg-zinc-800/80 rounded-2xl p-4 border border-zinc-700">
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
                <div className="mt-7">

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

                {/* LIVE BREAKDOWN */}
                <div className="mt-7 grid grid-cols-2 gap-4">

                  <div className="bg-black/30 rounded-2xl p-4 border border-zinc-800">
                    <p className="text-zinc-500 text-xs">
                      TOTAL PALLETS
                    </p>

                    <h3 className="text-3xl font-black mt-2">
                      {
                        truck.palletCount
                      }
                    </h3>
                  </div>

                  <div className="bg-black/30 rounded-2xl p-4 border border-zinc-800">
                    <p className="text-zinc-500 text-xs">
                      LOADED %
                    </p>

                    <h3 className="text-3xl font-black text-green-400 mt-2">
                      {Math.round(
                        loadedPercent
                      )}
                      %
                    </h3>
                  </div>

                </div>

                {/* BOTTOM ACTION */}
                <div className="mt-6">
                  <div className="bg-zinc-800 group-hover:bg-orange-500 transition-all rounded-2xl py-4 text-center font-black text-lg">
                    OPEN TRUCK
                  </div>
                </div>

              </div>
            );
          })}

        </div>

        {/* EMPTY */}
        {trucks.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-20 text-center mt-8">
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