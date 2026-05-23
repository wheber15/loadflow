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

  const [bulkMode, setBulkMode] =
    useState(false);

  const [selectedDelivery, setSelectedDelivery] =
    useState(null);

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
      } else {
        setLoadingMode(false);
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
     SUBMIT FLOOR PALLET
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

      try {
        await api.post(
          '/pallets/check',
          {
            palletCode,
          }
        );
      } catch (error) {
        navigator.vibrate?.([
          200,
          100,
          200,
        ]);

        toast.error(
          'PALLET ALREADY EXISTS'
        );

        setShowScanner(false);

        return;
      }

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

      if (bulkMode) {
        await api.post(
          '/pallets/bulk',
          {
            palletCode,
            truckId: truck._id,
            deliveryNumber:
              selectedDelivery.deliveryNumber,
          }
        );

        toast.success(
          `Bulk pallet ${palletCode.slice(
            -4
          )} scanned`
        );

        fetchTruck();

        fetchPallets();

        fetchDeliveries();

        setBulkMode(false);

        setSelectedDelivery(null);

        setShowScanner(false);

        return;
      }

      setPendingPallet(
        palletCode
      );

      setShowScanner(false);

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
     BULK ARRIVED
  ========================= */
  const markBulkReady =
    async (deliveryId) => {
      try {
        await api.post(
          '/pallets/bulk-arrived',
          {
            deliveryId,
          }
        );

        toast.success(
          'Bulk pallets moved to floor'
        );

        fetchTruck();

        fetchPallets();

        fetchDeliveries();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            'Failed to update bulk pallets'
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
    <div className="min-h-screen bg-black text-white">
      <Toaster position="top-center" />

      <div className="max-w-[1800px] mx-auto xl:grid xl:grid-cols-[340px_1fr_320px] xl:gap-6">

        {/* LEFT SIDEBAR */}
        <div className="xl:sticky xl:top-0 xl:h-screen xl:border-r border-zinc-800 bg-black p-4">

          <button
            onClick={() =>
              navigate('/')
            }
            className="mb-4 bg-zinc-900 hover:bg-zinc-800 px-4 py-3 rounded-2xl w-full"
          >
            ← Back
          </button>

          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">
            <h1 className="text-6xl font-black text-orange-500">
              {truck.truckNumber}
            </h1>

            <p className="text-zinc-400 text-2xl mt-2">
              {truck.routeName}
            </p>

            <div
              className={`mt-5 px-5 py-4 rounded-2xl text-center font-black text-xl ${
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

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <p className="text-zinc-500 text-xs">
                FLOOR
              </p>

              <h2 className="text-3xl font-black text-orange-500 mt-2">
                {truck.floorReadyCount}
              </h2>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <p className="text-zinc-500 text-xs">
                BULK
              </p>

              <h2 className="text-3xl font-black text-yellow-400 mt-2">
                {truck.bulkWaitingCount}
              </h2>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <p className="text-zinc-500 text-xs">
                LOADED
              </p>

              <h2 className="text-3xl font-black text-green-400 mt-2">
                {loadedCount}
              </h2>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <p className="text-zinc-500 text-xs">
                DELIVERIES
              </p>

              <h2 className="text-3xl font-black text-blue-400 mt-2">
                {deliveries.length}
              </h2>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="space-y-4 mt-4">
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex justify-between mb-2">
                <span className="font-black">
                  FLOOR READY
                </span>

                <span className="text-orange-500 font-black">
                  {truck.floorReadyCount}/{truck.maxPallets}
                </span>
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-orange-500 h-full"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex justify-between mb-2">
                <span className="font-black">
                  LOADED
                </span>

                <span className="text-green-400 font-black">
                  {loadedCount}/{truck.maxPallets}
                </span>
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-green-500 h-full"
                  style={{
                    width: `${loadingProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="p-4 pb-40 xl:pb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-4xl font-black">
              Deliveries
            </h2>

            <div className="hidden xl:flex items-center gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3">
                <span className="text-zinc-500 text-sm">
                  TOTAL PALLETS
                </span>

                <h3 className="text-2xl font-black mt-1">
                  {pallets.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {deliveries.map(
              (delivery) => (
                <div
                  key={delivery._id}
                  className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                    <div>
                      <p className="text-zinc-500 text-xs">
                        DELIVERY
                      </p>

                      <h2 className="text-2xl xl:text-3xl font-black text-orange-500">
                        {delivery.deliveryNumber}
                      </h2>

                      <p className="text-zinc-300 mt-1">
                        {delivery.customerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">

                      <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                        <p className="text-zinc-500 text-xs">
                          FLOOR
                        </p>

                        <h3 className="text-xl font-black text-orange-500 mt-1">
                          {delivery.floorPallets}
                        </h3>
                      </div>

                      <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                        <p className="text-zinc-500 text-xs">
                          BULK
                        </p>

                        <h3 className="text-xl font-black text-yellow-400 mt-1">
                          {delivery.bulkPallets}
                        </h3>
                      </div>

                      <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                        <p className="text-zinc-500 text-xs">
                          LOADED
                        </p>

                        <h3 className="text-xl font-black text-green-400 mt-1">
                          {delivery.loadedPallets}
                        </h3>
                      </div>

                      <div
                        className={`px-5 py-4 rounded-2xl font-black ${
                          delivery.status ===
                          'COMPLETE'
                            ? 'bg-green-500'
                            : delivery.status ===
                              'WAITING_BULK'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-blue-500'
                        }`}
                      >
                        {delivery.status}
                      </div>
                    </div>
                  </div>

                  {/* PALLETS */}
                  <div className="mt-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
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
                              : pallet.palletType ===
                                'BULK'
                              ? 'bg-yellow-500/10 border-yellow-500'
                              : 'bg-zinc-800 border-zinc-700'
                          }`}
                        >
                          <p className="text-zinc-500 text-xs">
                            {pallet.palletType}
                          </p>

                          <h3 className="text-2xl xl:text-3xl font-black text-orange-500 mt-1">
                            #{pallet.last4Digits}
                          </h3>

                          <p
                            className={`mt-2 font-bold text-sm ${
                              pallet.status ===
                              'LOADED'
                                ? 'text-green-400'
                                : pallet.palletType ===
                                  'BULK'
                                ? 'text-yellow-400'
                                : 'text-orange-400'
                            }`}
                          >
                            {pallet.status}
                          </p>
                        </div>
                      ))}
                  </div>

                  {!loadingMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                      <button
                        onClick={() => {
                          setSelectedDelivery(
                            delivery
                          );

                          setBulkMode(true);

                          setShowScanner(
                            true
                          );
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black py-4 rounded-2xl font-black text-lg"
                      >
                        SCAN BULK
                      </button>

                      {delivery.bulkPallets >
                        0 && (
                        <button
                          onClick={() =>
                            markBulkReady(
                              delivery._id
                            )
                          }
                          className="bg-orange-500 hover:bg-orange-600 py-4 rounded-2xl font-black text-lg"
                        >
                          BULK ARRIVED
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT ACTION PANEL */}
        <div className="hidden xl:block xl:sticky xl:top-0 xl:h-screen border-l border-zinc-800 bg-black p-4">
          <div className="space-y-4">

            {!loadingMode && (
              <button
                disabled={
                  truck.bulkWaitingCount >
                    0 ||
                  truck.floorReadyCount <
                    truck.maxPallets
                }
                onClick={startLoading}
                className={`w-full py-5 rounded-3xl text-2xl font-black ${
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
              className={`w-full py-6 rounded-3xl text-3xl font-black ${
                loadingMode
                  ? 'bg-green-600'
                  : bulkMode
                  ? 'bg-yellow-500 text-black'
                  : 'bg-orange-500'
              }`}
            >
              {loadingMode
                ? 'VERIFY & LOAD'
                : bulkMode
                ? 'SCAN BULK'
                : 'SCAN PALLET'}
            </button>

            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-5">
              <h3 className="text-2xl font-black mb-4">
                LIVE STATUS
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    Total Pallets
                  </span>

                  <span className="font-black">
                    {pallets.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    Deliveries
                  </span>

                  <span className="font-black">
                    {deliveries.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    Loaded
                  </span>

                  <span className="font-black text-green-400">
                    {loadedCount}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* MOBILE ACTION BAR */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 p-4 space-y-3">

        {!loadingMode && (
          <button
            disabled={
              truck.bulkWaitingCount >
                0 ||
              truck.floorReadyCount <
                truck.maxPallets
            }
            onClick={startLoading}
            className={`w-full py-5 rounded-3xl text-2xl font-black ${
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
          className={`w-full py-6 rounded-3xl text-3xl font-black ${
            loadingMode
              ? 'bg-green-600'
              : bulkMode
              ? 'bg-yellow-500 text-black'
              : 'bg-orange-500'
          }`}
        >
          {loadingMode
            ? 'VERIFY & LOAD'
            : bulkMode
            ? 'SCAN BULK'
            : 'SCAN PALLET'}
        </button>
      </div>

      {/* DELIVERY NUMBER */}
      {showDeliveryPad && (
        <KeypadModal
          title="DELIVERY NUMBER"
          value={deliveryNumber}
          type="delivery"
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

      {/* CUSTOMER */}
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
          onClose={() => {
            setShowScanner(false);

            setBulkMode(false);

            setSelectedDelivery(
              null
            );
          }}
        />
      )}
    </div>
  );
};

export default TruckDetailsPage;