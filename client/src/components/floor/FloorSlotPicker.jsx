const FloorSlotPicker = ({
  slots = [],
  selectedSlot,
  onSelect,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black">
          SELECT FLOOR SLOT
        </h2>

        {selectedSlot && (
          <div className="bg-orange-500 text-black px-4 py-2 rounded-2xl font-black">
            {selectedSlot}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {slots.map((slot) => {
          const occupied =
            slot.status !==
            'EMPTY';

          const active =
            selectedSlot ===
            slot.slotCode;

          return (
            <button
              key={slot._id}
              disabled={occupied}
              onClick={() =>
                onSelect(
                  slot.slotCode
                )
              }
              className={`rounded-2xl border p-3 text-left transition-all ${
                active
                  ? 'bg-orange-500 border-orange-400 text-black'
                  : occupied
                  ? 'bg-red-500/20 border-red-500 text-red-300 opacity-60 cursor-not-allowed'
                  : 'bg-zinc-900 border-zinc-800 hover:border-orange-500'
              }`}
            >
              <p className="text-xs font-bold opacity-70">
                {slot.bay}
              </p>

              <h2 className="text-xl font-black mt-1">
                R{slot.row}C
                {slot.column}
              </h2>

              <p className="text-xs mt-2 font-bold">
                {occupied
                  ? 'OCCUPIED'
                  : 'EMPTY'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FloorSlotPicker;