import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/axios';

import FloorSlotModal from '../../components/floor/FloorSlotModal';

const FloorMapPage = () => {
  const [slots, setSlots] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedSlot,
    setSelectedSlot,
  ] = useState(null);

  const fetchFloorGrid =
    async () => {
      try {
        const { data } =
          await api.get(
            '/floor'
          );

        setSlots(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchFloorGrid();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-3xl font-black">
        LOADING FLOOR...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-5xl font-black text-orange-500">
          FLOOR MAP
        </h1>

        <p className="text-zinc-500 mt-2 text-lg">
          Live warehouse floor
          visibility
        </p>
      </div>

      {/* GRID */}
      <div className="overflow-auto">
        <div className="grid grid-cols-8 gap-3 min-w-[900px]">
          {slots.map((slot) => {
            let bg =
              'bg-zinc-900 border-zinc-700';

            if (
              slot.status ===
              'PICKING'
            ) {
              bg =
                'bg-yellow-500 border-yellow-300 text-black';
            }

            if (
              slot.status ===
              'WAITING_BULK'
            ) {
              bg =
                'bg-purple-600 border-purple-300';
            }

            if (
              slot.status ===
              'FLOOR_READY'
            ) {
              bg =
                'bg-green-600 border-green-300';
            }

            return (
              <button
                key={slot._id}
                onClick={() =>
                  setSelectedSlot(
                    slot
                  )
                }
                className={`${bg} border-2 rounded-3xl p-4 h-36 flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 text-left`}
              >
                {/* SLOT */}
                <div>
                  <p className="text-xs font-bold opacity-70">
                    {slot.slotCode}
                  </p>

                  <h2 className="text-2xl font-black mt-1">
                    R{slot.row}C
                    {slot.column}
                  </h2>
                </div>

                {/* CONTENT */}
                <div>
                  <p className="text-sm font-bold">
                    {slot.status}
                  </p>

                  {slot.customerName && (
                    <p className="text-xs mt-1 truncate">
                      {
                        slot.customerName
                      }
                    </p>
                  )}

                  {slot.last4Digits && (
                    <p className="text-lg font-black mt-1">
                      #
                      {
                        slot.last4Digits
                      }
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      {selectedSlot && (
        <FloorSlotModal
          slot={selectedSlot}
          onClose={() =>
            setSelectedSlot(null)
          }
          refresh={
            fetchFloorGrid
          }
        />
      )}
    </div>
  );
};

export default FloorMapPage;