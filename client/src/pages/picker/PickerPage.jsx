import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/axios';

import FloorSlotPicker from '../../components/floor/FloorSlotPicker';

import PickerScannerModal from '../../components/picker/PickerScannerModal';

import TopBar from '../../components/layout/TopBar';

import { useAuth } from '../../context/AuthContext';

const PickerPage = () => {
  const {
    user,
    updateActivity,
  } = useAuth();

  /* =========================
     SESSION
  ========================= */

  const [
    activeSession,
    setActiveSession,
  ] = useState(null);

  /* =========================
     FORM
  ========================= */

  const [
    deliveryNumber,
    setDeliveryNumber,
  ] = useState('');

  const [
    customerName,
    setCustomerName,
  ] = useState('');

  const [
    palletCode,
    setPalletCode,
  ] = useState('');

  const [
    selectedSlot,
    setSelectedSlot,
  ] = useState('');

  const [
    showScanner,
    setShowScanner,
  ] = useState(false);

  /* =========================
     UI
  ========================= */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    pallets,
    setPallets,
  ] = useState([]);

  const [
    floorSlots,
    setFloorSlots,
  ] = useState([]);

  /* =========================
     LIVE ACTIVITY
  ========================= */

  useEffect(() => {
    updateActivity(
      'PICKER'
    );
  }, []);

  /* =========================
     FETCH FLOOR
  ========================= */

  const fetchFloorSlots =
    async () => {
      try {
        const { data } =
          await api.get('/floor');

        setFloorSlots(data);
      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
    fetchFloorSlots();
  }, []);

  /* =========================
     START SESSION
  ========================= */

  const handleStartSession =
    async () => {
      try {
        if (
          !deliveryNumber ||
          !customerName
        ) {
          return alert(
            'Complete all fields'
          );
        }

        const { data } =
          await api.post(
            '/picking-sessions/start',
            {
              pickerName:
                user.name,

              deliveryNumber,

              customerName,
            }
          );

        setActiveSession(data);

        updateActivity(
          'PICKING',
          deliveryNumber
        );

        alert(
          'Picking session started'
        );
      } catch (error) {
        console.log(error);

        alert(
          error.response?.data
            ?.message ||
            'Failed to start session'
        );
      }
    };

  /* =========================
     SCAN PALLET
  ========================= */

  const handleScan =
    async () => {
      try {
        if (!activeSession) {
          return alert(
            'Start picking session first'
          );
        }

        if (
          !palletCode ||
          !selectedSlot
        ) {
          return alert(
            'Scan pallet and select slot'
          );
        }

        setLoading(true);

        /* =========================
           CREATE PALLET
        ========================= */

        const { data } =
          await api.post(
            '/pallets/picker-scan',
            {
              palletCode,

              deliveryNumber:
                activeSession.deliveryNumber,

              customerName:
                activeSession.customerName,

              pickerName:
                activeSession.pickerName,
            }
          );

        /* =========================
           FIND SLOT
        ========================= */

        const slot =
          floorSlots.find(
            (s) =>
              s.slotCode ===
              selectedSlot
          );

        if (!slot) {
          throw new Error(
            'Slot not found'
          );
        }

        /* =========================
           PLACE PALLET
        ========================= */

        await api.post(
          '/floor/place',
          {
            slotId: slot._id,

            palletCode,

            pickerName:
              activeSession.pickerName,
          }
        );

        updateActivity(
          'PICKING',
          activeSession.deliveryNumber
        );

        /* =========================
           UPDATE UI
        ========================= */

        setPallets((prev) => [
          data,
          ...prev,
        ]);

        setPalletCode('');

        setSelectedSlot('');

        await fetchFloorSlots();
      } catch (error) {
        console.log(error);

        alert(
          error.response?.data
            ?.message ||
            error.message ||
            'Failed to scan pallet'
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================
     COMPLETE SESSION
  ========================= */

  const handleComplete =
    async () => {
      try {
        if (!activeSession) {
          return;
        }

        await api.put(
          `/picking-sessions/complete/${activeSession._id}`
        );

        updateActivity(
          'PICKER'
        );

        alert(
          'Order completed'
        );

        setActiveSession(null);

        setDeliveryNumber('');

        setCustomerName('');

        setPalletCode('');

        setSelectedSlot('');

        setPallets([]);
      } catch (error) {
        console.log(error);

        alert(
          'Failed to complete order'
        );
      }
    };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* TOPBAR */}

      <TopBar />

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-5xl font-black text-orange-500">
          PICKER MODE
        </h1>

        <p className="text-zinc-500 mt-2">
          Warehouse picking workflow
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT */}

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          {/* ACTIVE SESSION */}

          {activeSession ? (
            <div className="bg-orange-500 text-black rounded-3xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase">
                    Active Order
                  </p>

                  <h2 className="text-3xl font-black mt-1">
                    {
                      activeSession.customerName
                    }
                  </h2>

                  <p className="font-bold mt-2">
                    Delivery:{' '}
                    {
                      activeSession.deliveryNumber
                    }
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    Picker:{' '}
                    {
                      activeSession.pickerName
                    }
                  </p>
                </div>

                <div className="bg-black text-orange-500 px-5 py-3 rounded-2xl font-black text-xl">
                  {
                    pallets.length
                  }{' '}
                  PALLETS
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 mb-6">
              {/* PICKER */}

              <div>
                <label className="block mb-2 font-bold text-zinc-400">
                  Picker
                </label>

                <div className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-5 text-xl font-black">
                  {user.name}
                </div>
              </div>

              {/* DELIVERY */}

              <div>
                <label className="block mb-2 font-bold text-zinc-400">
                  Delivery Number
                </label>

                <input
                  value={
                    deliveryNumber
                  }
                  onChange={(e) =>
                    setDeliveryNumber(
                      e.target.value
                    )
                  }
                  placeholder="Add delivery number..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-5 text-xl font-black outline-none"
                />
              </div>

              {/* CUSTOMER */}

              <div>
                <label className="block mb-2 font-bold text-zinc-400">
                  Customer Name
                </label>

                <input
                  value={
                    customerName
                  }
                  onChange={(e) =>
                    setCustomerName(
                      e.target.value
                    )
                  }
                  placeholder="Add Customer Name..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-5 text-xl font-black outline-none"
                />
              </div>

              <button
                onClick={
                  handleStartSession
                }
                className="w-full bg-orange-500 hover:bg-orange-600 h-16 rounded-2xl text-xl font-black"
              >
                START ORDER
              </button>
            </div>
          )}

          {/* SCAN AREA */}

          {activeSession && (
            <div className="space-y-5">
              {/* PALLET */}

              <div>
                <label className="block mb-2 font-bold text-zinc-400">
                  Scan Pallet
                </label>

                {/* MANUAL INPUT */}

                <input
                  value={palletCode}
                  onChange={(e) =>
                    setPalletCode(
                      e.target.value
                    )
                  }
                  placeholder="Scan pallet barcode..."
                  className="w-full bg-orange-500/10 border-2 border-orange-500 rounded-2xl p-6 text-2xl font-black outline-none"
                />

                {/* CAMERA */}

                <button
                  onClick={() =>
                    setShowScanner(
                      true
                    )
                  }
                  className="mt-4 w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 h-16 rounded-2xl text-xl font-black"
                >
                  OPEN CAMERA SCANNER
                </button>
              </div>

              {/* SLOT PICKER */}

              <FloorSlotPicker
                slots={floorSlots}
                selectedSlot={
                  selectedSlot
                }
                onSelect={
                  setSelectedSlot
                }
              />

              {/* ACTIONS */}

              <div className="grid grid-cols-2 gap-4 pt-3">
                <button
                  onClick={
                    handleScan
                  }
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 h-16 rounded-2xl text-xl font-black"
                >
                  {loading
                    ? 'SCANNING...'
                    : 'SCAN'}
                </button>

                <button
                  onClick={
                    handleComplete
                  }
                  className="bg-green-600 hover:bg-green-700 h-16 rounded-2xl text-xl font-black"
                >
                  COMPLETE
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-3xl font-black">
              ACTIVE PALLETS
            </h2>

            <div className="bg-orange-500 text-black px-4 py-2 rounded-2xl font-black">
              {pallets.length}
            </div>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto">
            {pallets.map(
              (pallet) => (
                <div
                  key={
                    pallet._id
                  }
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-orange-500">
                      #
                      {
                        pallet.last4Digits
                      }
                    </h2>

                    <p className="text-sm text-zinc-500 font-bold">
                      {
                        pallet.status
                      }
                    </p>
                  </div>

                  <p className="mt-2 font-bold">
                    {
                      pallet.customerName
                    }
                  </p>

                  <p className="text-zinc-500 text-sm mt-1">
                    Delivery:{' '}
                    {
                      pallet.deliveryNumber
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* SCANNER MODAL */}

      {showScanner && (
        <PickerScannerModal
          onClose={() =>
            setShowScanner(
              false
            )
          }
          onScan={(code) => {
            setPalletCode(code);

            setShowScanner(
              false
            );
          }}
        />
      )}
    </div>
  );
};

export default PickerPage;