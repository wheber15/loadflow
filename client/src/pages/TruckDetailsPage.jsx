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

import CustomerNameModal from '../components/truck/CustomerNameModal';

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

  const [showBulkPad, setShowBulkPad] =
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
     ADD BULK EXPECTATION
  ========================= */
  const addBulkQuantity =
    async (quantity) => {
      try {
        await api.post(
          '/pallets/bulk',
          {
            deliveryId:
              selectedDelivery._id,
            quantity:
              Number(quantity),
          }
        );

        toast.success(
          `Bulk quantity set to ${quantity}`
        );

        fetchTruck();

        fetchPallets();

        fetchDeliveries();

        setSelectedDelivery(
          null
        );

        setShowBulkPad(false);
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            'Failed to add bulk'
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

        const data =
          error.response?.data;

        toast.error(
          data?.truckNumber
            ? `PALLET IN TRUCK ${data.truckNumber}`
            : 'PALLET ALREADY EXISTS'
        );

        setShowScanner(false);

        return;
      }

      /* =========================
         LOADING MODE
      ========================= */
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

      /* =========================
         BULK MODE
      ========================= */
      if (bulkMode) {
        await api.post(
          '/pallets/bulk-scan',
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

      /* =========================
         NORMAL FLOOR PALLET
      ========================= */
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

      <div className="max-w-[2200px] mx-auto 2xl:px-6 xl:grid xl:grid-cols-[300px_1.6fr_360px] 2xl:grid-cols-[320px_1.9fr_380px] xl:gap-6">

        {/* LEFT SIDEBAR */}
        <div className="xl:sticky xl:top-0 xl:h-screen xl:border-r border-zinc-800 bg-black p-4">

          <button
            onClick={() =>
              navigate('/')
            }
            className="mb-4 bg-zinc-900 hover:bg-zinc-800 transition px-4 py-3 rounded-2xl w-full text-lg"
          >
            ← Back
          </button>

          {/* TRUCK INFO */}
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6">

            <h1 className="text-6xl xl:text-7xl font-black text-orange-500 leading-none">
              {truck.truckNumber}
            </h1>

            <p className="text-zinc-400 text-2xl mt-3">
              {truck.routeName}
            </p>

            <p className="text-zinc-500 mt-3 text-sm">
              {truck.shiftDate}
            </p>

            {truck.shiftType ===
              'PRELOAD' && (
              <div className="mt-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-2xl font-black text-center">
                PRELOAD
              </div>
            )}

            <div
              className={`mt-6 px-5 py-4 rounded-2xl text-center font-black text-xl ${
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

            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <p className="text-zinc-500 text-xs">
                FLOOR
              </p>

              <h2 className="text-4xl font-black text-orange-500 mt-2">
                {truck.floorReadyCount}
              </h2>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <p className="text-zinc-500 text-xs">
                BULK
              </p>

              <h2 className="text-4xl font-black text-yellow-400 mt-2">
                {truck.bulkWaitingCount}
              </h2>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <p className="text-zinc-500 text-xs">
                LOADED
              </p>

              <h2 className="text-4xl font-black text-green-400 mt-2">
                {loadedCount}
              </h2>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
              <p className="text-zinc-500 text-xs">
                DELIVERIES
              </p>

              <h2 className="text-4xl font-black text-blue-400 mt-2">
                {deliveries.length}
              </h2>
            </div>

          </div>

        </div>

        {/* CENTER */}
        <div className="p-4 pb-44 xl:pb-10">

          <div className="space-y-5">

            {deliveries.map(
              (delivery) => (
                <div
                  key={delivery._id}
                  className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden"
                >

                  <div className="xl:grid xl:grid-cols-[380px_1fr]">

                    {/* DELIVERY */}
                    <div className="p-5 xl:border-r border-zinc-800">

                      <p className="text-zinc-500 text-xs">
                        DELIVERY
                      </p>

                      <h2 className="text-3xl xl:text-4xl font-black text-orange-500 mt-1 break-all">
                        {delivery.deliveryNumber}
                      </h2>

                      <p className="text-zinc-300 text-lg mt-3">
                        {delivery.customerName}
                      </p>

                      {/* STATS */}
                      <div className="grid grid-cols-3 gap-3 mt-5">

                        <div className="bg-zinc-800 rounded-2xl p-4">
                          <p className="text-zinc-500 text-xs">
                            FLOOR
                          </p>

                          <h3 className="text-2xl font-black text-orange-500 mt-1">
                            {delivery.floorPallets}
                          </h3>
                        </div>

                        <div className="bg-zinc-800 rounded-2xl p-4">
                          <p className="text-zinc-500 text-xs">
                            BULK
                          </p>

                          <h3 className="text-2xl font-black text-yellow-400 mt-1">
                            {delivery.scannedBulkPallets || 0}
                            /
                            {delivery.bulkPallets || 0}
                          </h3>
                        </div>

                        <div className="bg-zinc-800 rounded-2xl p-4">
                          <p className="text-zinc-500 text-xs">
                            LOADED
                          </p>

                          <h3 className="text-2xl font-black text-green-400 mt-1">
                            {delivery.loadedPallets}
                          </h3>
                        </div>

                      </div>

                      {/* STATUS */}
                      <div
                        className={`mt-5 px-5 py-4 rounded-2xl text-center font-black text-lg ${
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

                      {/* BULK ACTIONS */}
                      {!loadingMode && (
                        <div className="grid grid-cols-1 gap-3 mt-5">

                          {/* ADD BULK */}
                          {(!delivery.bulkPallets ||
                            delivery.bulkPallets === 0) && (
                            <button
                              onClick={() => {
                                setSelectedDelivery(
                                  delivery
                                );

                                setShowBulkPad(
                                  true
                                );
                              }}
                              className="bg-yellow-500 hover:bg-yellow-600 transition text-black py-4 rounded-2xl font-black text-lg"
                            >
                              ADD BULK
                            </button>
                          )}

                          {/* SCAN BULK */}
                          {delivery.bulkPallets >
                            0 &&
                            delivery.scannedBulkPallets <
                              delivery.bulkPallets && (
                              <button
                                onClick={() => {
                                  setSelectedDelivery(
                                    delivery
                                  );

                                  setBulkMode(
                                    true
                                  );

                                  setShowScanner(
                                    true
                                  );
                                }}
                                className="bg-yellow-500 hover:bg-yellow-600 transition text-black py-4 rounded-2xl font-black text-lg"
                              >
                                SCAN BULK (
                                {
                                  delivery.scannedBulkPallets
                                }
                                /
                                {
                                  delivery.bulkPallets
                                }
                                )
                              </button>
                            )}

                          {/* BULK ARRIVED */}
                          {delivery.bulkPallets >
                            0 &&
                            delivery.scannedBulkPallets ===
                              delivery.bulkPallets && (
                              <button
                                onClick={() =>
                                  markBulkReady(
                                    delivery._id
                                  )
                                }
                                className="bg-orange-500 hover:bg-orange-600 transition py-4 rounded-2xl font-black text-lg"
                              >
                                BULK ARRIVED
                              </button>
                            )}

                        </div>
                      )}

                    </div>

                    {/* PALLETS */}
                    <div className="p-5">

                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">

                        {pallets
                          .filter(
                            (p) =>
                              p.deliveryNumber ===
                              delivery.deliveryNumber
                          )
                          .map((pallet) => (
                            <div
                              key={pallet._id}
                              className={`rounded-2xl p-4 border min-h-[150px] flex flex-col justify-between ${
                                pallet.status ===
                                'LOADED'
                                  ? 'bg-green-500/10 border-green-500'
                                  : pallet.palletType ===
                                    'BULK'
                                  ? 'bg-yellow-500/10 border-yellow-500'
                                  : 'bg-zinc-800 border-zinc-700'
                              }`}
                            >

                              <div>

                                <p className="text-zinc-500 text-xs">
                                  {pallet.palletType}
                                </p>

                                <h3 className="text-2xl xl:text-3xl font-black text-orange-500 mt-2">
                                  #{pallet.last4Digits}
                                </h3>

                              </div>

                              <div>

                                <p
                                  className={`font-black text-sm ${
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

                                <p className="text-zinc-600 text-xs mt-2 break-all">
                                  {pallet.palletCode}
                                </p>

                              </div>

                            </div>
                          ))}

                      </div>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* RIGHT PANEL */}
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
                className={`w-full py-5 rounded-3xl text-2xl font-black transition ${
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
              className={`w-full py-6 rounded-3xl text-3xl font-black transition ${
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
        <CustomerNameModal
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

      {/* BULK QUANTITY */}
      {showBulkPad && (
        <KeypadModal
          title="BULK QUANTITY"
          value=""
          onClose={() => {
            setShowBulkPad(false);

            setSelectedDelivery(
              null
            );
          }}
          onSubmit={(value) => {
            addBulkQuantity(
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