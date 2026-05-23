// src/pages/TruckDetailsPage.jsx

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

import KeypadModal from '../components/KeypadModal';

const TruckDetailsPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [truck, setTruck] =
    useState(null);

  const [pallets, setPallets] =
    useState([]);

  const [deliveries, setDeliveries] =
    useState([]);

  const [showScanner, setShowScanner] =
    useState(false);

  const [loadingMode, setLoadingMode] =
    useState(false);

  const [showBulkModal, setShowBulkModal] =
    useState(false);

  const [selectedDelivery, setSelectedDelivery] =
    useState(null);

  const [bulkQty, setBulkQty] =
    useState(1);

  const [showDeliveryPad, setShowDeliveryPad] =
    useState(false);

  const [showCustomerPad, setShowCustomerPad] =
    useState(false);

  const [pendingPallet, setPendingPallet] =
    useState('');

  const [deliveryNumber, setDeliveryNumber] =
    useState('');

  const [customerName, setCustomerName] =
    useState('');

  /* =========================
     FETCH TRUCK
  ========================= */
  const fetchTruck = async () => {
    try {
      const { data } =
        await api.get('/trucks');

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
      const { data } =
        await api.get(
          `/pallets/truck/${id}`
        );

      setPallets(data);
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================
     FETCH DELIVERIES
  ========================= */
  const fetchDeliveries =
    async () => {
      try {
        const { data } =
          await api.get(
            `/pallets/deliveries/${id}`
          );

        setDeliveries(data);
      } catch (error) {
        console.error(error);
      }
    };

  /* =========================
     SUBMIT PALLET
  ========================= */
  const submitPallet =
    async (
      deliveryValue,
      customerValue
    ) => {
      try {
        await api.post(
          '/pallets/scan',
          {
            palletCode:
              pendingPallet,
            truckId: truck._id,
            deliveryNumber:
              deliveryValue,
            customerName:
              customerValue,
          }
        );

        toast.success(
          `Pallet ${pendingPallet.slice(
            -4
          )} scanned`
        );

        fetchTruck();

        fetchPallets();

        fetchDeliveries();

        setShowScanner(false);

        setDeliveryNumber('');

        setCustomerName('');

        setPendingPallet('');
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            'Scan failed'
        );
      }
    };

  /* =========================
     HANDLE SCAN
  ========================= */
  const handleScan = async (
    palletCode
  ) => {
    try {
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

        fetchTruck();

        fetchPallets();

        fetchDeliveries();

        setShowScanner(false);

        return;
      }

      /* SAVE PALLET */
      setPendingPallet(
        palletCode
      );

      /* OPEN DELIVERY PAD */
      setShowDeliveryPad(true);
    } catch (error) {
      navigator.vibrate?.([
        100,
        50,
        100,
      ]);

      toast.error(
        error.response?.data
          ?.message ||
          'Scan failed'
      );
    }
  };

  /* =========================
     ADD BULK
  ========================= */
  const addBulkPallets =
    async () => {
      try {
        await api.post(
          '/pallets/bulk',
          {
            truckId: truck._id,
            deliveryNumber:
              selectedDelivery.deliveryNumber,
            quantity: bulkQty,
          }
        );

        toast.success(
          'Bulk pallets added'
        );

        setShowBulkModal(false);

        fetchDeliveries();

        fetchTruck();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            'Bulk add failed'
        );
      }
    };

  /* =========================
     START LOADING
  ========================= */
  const startLoading =
    async () => {
      try {
        await api.post(
          '/pallets/start-loading',
          {
            truckId: truck._id,
          }
        );

        toast.success(
          'Loading started'
        );

        setLoadingMode(true);

        fetchTruck();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            'Cannot start loading'
        );
      }
    };

  /* =========================
     SOCKET EVENTS
  ========================= */
  useEffect(() => {
    fetchTruck();

    fetchPallets();

    fetchDeliveries();

    socket.on(
      'pallet:scanned',
      () => {
        fetchTruck();

        fetchPallets();

        fetchDeliveries();
      }
    );

    socket.on(
      'pallet:loaded',
      () => {
        fetchTruck();

        fetchPallets();

        fetchDeliveries();
      }
    );

    socket.on(
      'delivery:updated',
      () => {
        fetchTruck();

        fetchDeliveries();
      }
    );

    socket.on(
      'truck:updated',
      () => {
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
        'delivery:updated'
      );

      socket.off(
        'truck:updated'
      );
    };
  }, []);

  if (!truck) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const loadedCount = pallets.filter(
    (p) => p.status === 'LOADED'
  ).length;

  const progress =
    (truck.floorReadyCount /
      truck.maxPallets) *
    100;

  const loadingProgress =
    (loadedCount /
      truck.maxPallets) *
    100;

  return (
    <div className="min-h-screen bg-black text-white pb-40">
      <Toaster position="top-center" />

      {/* TOP */}
      <div className="sticky top-0 z-40 bg-black border-b border-zinc-800 p-4">
        <button
          onClick={() =>
            navigate('/')
          }
          className="mb-4 bg-zinc-900 px-4 py-3 rounded-2xl"
        >
          ← Back
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-orange-500">
              {
                truck.truckNumber
              }
            </h1>

            <p className="text-zinc-400 text-xl mt-2">
              {truck.routeName}
            </p>
          </div>

          <div
            className={`px-5 py-3 rounded-2xl font-black ${
              truck.status ===
              'COMPLETE'
                ? 'bg-green-500'
                : truck.status ===
                  'LOADING'
                ? 'bg-blue-500'
                : truck.status ===
                  'WAITING_BULK'
                ? 'bg-yellow-500 text-black'
                : 'bg-orange-500'
            }`}
          >
            {truck.status}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
          <p className="text-zinc-500 text-sm">
            FLOOR READY
          </p>

          <h2 className="text-4xl font-black text-orange-500 mt-2">
            {
              truck.floorReadyCount
            }
          </h2>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
          <p className="text-zinc-500 text-sm">
            BULK WAITING
          </p>

          <h2 className="text-4xl font-black text-yellow-400 mt-2">
            {
              truck.bulkWaitingCount
            }
          </h2>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
          <p className="text-zinc-500 text-sm">
            LOADED
          </p>

          <h2 className="text-4xl font-black text-green-400 mt-2">
            {loadedCount}
          </h2>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800">
          <p className="text-zinc-500 text-sm">
            DELIVERIES
          </p>

          <h2 className="text-4xl font-black text-blue-400 mt-2">
            {
              deliveries.length
            }
          </h2>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="px-4">
        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 mb-4">
          <div className="flex justify-between mb-3">
            <h2 className="text-2xl font-black">
              FLOOR READY
            </h2>

            <span className="text-orange-500 font-black text-2xl">
              {
                truck.floorReadyCount
              }
              /{truck.maxPallets}
            </span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-5 overflow-hidden">
            <div
              className="bg-orange-500 h-full"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <div className="flex justify-between mb-3">
            <h2 className="text-2xl font-black">
              LOADED
            </h2>

            <span className="text-green-400 font-black text-2xl">
              {loadedCount}/
              {truck.maxPallets}
            </span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-5 overflow-hidden">
            <div
              className="bg-green-500 h-full"
              style={{
                width: `${loadingProgress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* DELIVERY GROUPS */}
      <div className="p-4">
        <h2 className="text-3xl font-black mb-4">
          Deliveries
        </h2>

        <div className="space-y-4">
          {deliveries.map(
            (delivery) => (
              <div
                key={delivery._id}
                className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-zinc-500 text-sm">
                      DELIVERY
                    </p>

                    <h2 className="text-3xl font-black text-orange-500">
                      {
                        delivery.deliveryNumber
                      }
                    </h2>

                    <p className="text-zinc-300 mt-2">
                      {
                        delivery.customerName
                      }
                    </p>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-xl font-bold ${
                      delivery.status ===
                      'COMPLETE'
                        ? 'bg-green-500'
                        : delivery.status ===
                          'WAITING_BULK'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-blue-500'
                    }`}
                  >
                    {
                      delivery.status
                    }
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {pallets
                    .filter(
                      (p) =>
                        p.deliveryNumber ===
                        delivery.deliveryNumber
                    )
                    .map((pallet) => (
                      <div
                        key={pallet._id}
                        className={`rounded-2xl p-4 border ${
                          pallet.status ===
                          'LOADED'
                            ? 'bg-green-500/10 border-green-500'
                            : 'bg-zinc-800 border-zinc-700'
                        }`}
                      >
                        <p className="text-zinc-500 text-xs">
                          PALLET
                        </p>

                        <h3 className="text-3xl font-black text-orange-500 mt-1">
                          #
                          {
                            pallet.last4Digits
                          }
                        </h3>

                        <p
                          className={`mt-3 font-bold ${
                            pallet.status ===
                            'LOADED'
                              ? 'text-green-400'
                              : 'text-orange-400'
                          }`}
                        >
                          {pallet.status}
                        </p>

                        <p className="text-zinc-600 text-xs mt-2 break-all">
                          {
                            pallet.palletCode
                          }
                        </p>
                      </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="bg-zinc-800 rounded-2xl p-3">
                    <p className="text-zinc-500 text-xs">
                      FLOOR
                    </p>

                    <h3 className="text-2xl font-black text-orange-500 mt-2">
                      {
                        delivery.floorPallets
                      }
                    </h3>
                  </div>

                  <div className="bg-zinc-800 rounded-2xl p-3">
                    <p className="text-zinc-500 text-xs">
                      BULK
                    </p>

                    <h3 className="text-2xl font-black text-yellow-400 mt-2">
                      {
                        delivery.bulkPallets
                      }
                    </h3>
                  </div>

                  <div className="bg-zinc-800 rounded-2xl p-3">
                    <p className="text-zinc-500 text-xs">
                      LOADED
                    </p>

                    <h3 className="text-2xl font-black text-green-400 mt-2">
                      {
                        delivery.loadedPallets
                      }
                    </h3>
                  </div>
                </div>

                {!loadingMode && (
                  <button
                    onClick={() => {
                      setSelectedDelivery(
                        delivery
                      );

                      setShowBulkModal(
                        true
                      );
                    }}
                    className="w-full mt-5 bg-yellow-500 hover:bg-yellow-600 text-black py-4 rounded-2xl font-black text-xl"
                  >
                    ADD BULK
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 p-4 space-y-3">
        {!loadingMode && (
          <button
            disabled={
              truck.bulkWaitingCount >
                0 ||
              truck.floorReadyCount <
                truck.maxPallets
            }
            onClick={startLoading}
            className={`w-full py-6 rounded-3xl text-3xl font-black ${
              truck.bulkWaitingCount >
                0 ||
              truck.floorReadyCount <
                truck.maxPallets
                ? 'bg-zinc-800 text-zinc-500'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            START LOADING
          </button>
        )}

        <button
          onClick={() =>
            setShowScanner(true)
          }
          className={`w-full py-7 rounded-3xl text-4xl font-black ${
            loadingMode
              ? 'bg-green-600'
              : 'bg-orange-500'
          }`}
        >
          {loadingMode
            ? 'VERIFY & LOAD'
            : 'SCAN PALLET'}
        </button>
      </div>

      {/* DELIVERY PAD */}
      {showDeliveryPad && (
        <KeypadModal
          title="DELIVERY NUMBER"
          value={deliveryNumber}
          onClose={() =>
            setShowDeliveryPad(false)
          }
          onSubmit={(value) => {
            setDeliveryNumber(
              value
            );

            setShowDeliveryPad(
              false
            );

            setShowCustomerPad(
              true
            );
          }}
        />
      )}

      {/* CUSTOMER PAD */}
      {showCustomerPad && (
        <KeypadModal
          title="CUSTOMER NAME"
          value={customerName}
          onClose={() =>
            setShowCustomerPad(false)
          }
          onSubmit={(value) => {
            setCustomerName(
              value
            );

            setShowCustomerPad(
              false
            );

            submitPallet(
              deliveryNumber,
              value
            );
          }}
        />
      )}

      {/* SCANNER */}
      {showScanner && (
        <PalletScanner
          onScan={handleScan}
          onClose={() =>
            setShowScanner(false)
          }
        />
      )}

      {/* BULK MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-3xl p-6 w-full max-w-md border border-zinc-800">
            <h2 className="text-3xl font-black mb-5">
              ADD BULK PALLETS
            </h2>

            <input
              type="number"
              value={bulkQty}
              onChange={(e) =>
                setBulkQty(
                  e.target.value
                )
              }
              className="w-full bg-zinc-800 rounded-2xl p-5 text-3xl font-black"
            />

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() =>
                  setShowBulkModal(
                    false
                  )
                }
                className="bg-zinc-800 py-4 rounded-2xl font-black"
              >
                CANCEL
              </button>

              <button
                onClick={
                  addBulkPallets
                }
                className="bg-yellow-500 text-black py-4 rounded-2xl font-black"
              >
                ADD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckDetailsPage;