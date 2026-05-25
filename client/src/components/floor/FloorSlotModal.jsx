import {
  useState,
} from 'react';

import api from '../../api/axios';

const FloorSlotModal = ({
  slot,
  onClose,
  refresh,
}) => {
  const [
    palletCode,
    setPalletCode,
  ] = useState('');

  const [
    pickerName,
    setPickerName,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const handlePlace =
    async () => {
      try {
        setLoading(true);

        await api.post(
          '/floor/place',
          {
            slotId: slot._id,
            palletCode,
            pickerName,
          }
        );

        await refresh();

        onClose();
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            'Failed to place pallet'
        );
      } finally {
        setLoading(false);
      }
    };

  const handleClear =
    async () => {
      try {
        setLoading(true);

        await api.delete(
          `/floor/${slot._id}`
        );

        await refresh();

        onClose();
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            'Failed to clear slot'
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-md">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black text-orange-500">
              {slot.slotCode}
            </h2>

            <p className="text-zinc-500 mt-1">
              Floor slot control
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 w-12 h-12 rounded-2xl font-black"
          >
            ✕
          </button>
        </div>

        {/* EMPTY SLOT */}
        {slot.status ===
        'EMPTY' ? (
          <>
            <div className="mb-4">
              <label className="block mb-2 font-bold text-zinc-400">
                Pallet Code
              </label>

              <input
                value={palletCode}
                onChange={(e) =>
                  setPalletCode(
                    e.target.value
                  )
                }
                placeholder="Scan pallet..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-5 outline-none text-xl font-black"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-bold text-zinc-400">
                Picker Name
              </label>

              <input
                value={pickerName}
                onChange={(e) =>
                  setPickerName(
                    e.target.value
                  )
                }
                placeholder="Enter picker..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-5 outline-none text-xl font-black"
              />
            </div>

            <button
              onClick={
                handlePlace
              }
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 h-16 rounded-2xl text-xl font-black"
            >
              {loading
                ? 'PLACING...'
                : 'PLACE PALLET'}
            </button>
          </>
        ) : (
          <>
            {/* SLOT INFO */}
            <div className="bg-zinc-900 rounded-2xl p-5 mb-5">
              <p className="text-zinc-500 text-sm">
                CUSTOMER
              </p>

              <h2 className="text-2xl font-black">
                {
                  slot.customerName
                }
              </h2>

              <p className="text-zinc-500 text-sm mt-4">
                DELIVERY
              </p>

              <h2 className="text-xl font-black">
                {
                  slot.deliveryNumber
                }
              </h2>

              <p className="text-zinc-500 text-sm mt-4">
                PALLET
              </p>

              <h2 className="text-3xl font-black text-orange-500">
                #
                {
                  slot.last4Digits
                }
              </h2>
            </div>

            <button
              onClick={
                handleClear
              }
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 h-16 rounded-2xl text-xl font-black"
            >
              CLEAR SLOT
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FloorSlotModal;