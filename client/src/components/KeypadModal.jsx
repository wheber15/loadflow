// src/components/KeypadModal.jsx

import { useState } from 'react';

const letters = [
  '1','2','3',
  '4','5','6',
  '7','8','9',
  '0',
  'A','B','C',
  'D','E','F',
  'G','H','I',
  'J','K','L',
  'M','N','O',
  'P','Q','R',
  'S','T','U',
  'V','W','X',
  'Y','Z',
];

const KeypadModal = ({
  title,
  value = '',
  onClose,
  onSubmit,
}) => {
  const [input, setInput] =
    useState(value);

  const addChar = (char) => {
    setInput(
      (prev) => prev + char
    );
  };

  const removeChar = () => {
    setInput((prev) =>
      prev.slice(0, -1)
    );
  };

  const handleConfirm = () => {
    if (!input.trim()) {
      return;
    }

    onSubmit(input.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[999] flex items-end md:items-center justify-center">
      <div className="w-full md:max-w-2xl bg-zinc-950 border-t md:border border-zinc-800 rounded-t-3xl md:rounded-3xl p-5">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-3xl font-black text-orange-500">
              {title}
            </h2>

            <p className="text-zinc-500 mt-1">
              Tap to enter
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-red-500 px-5 py-3 rounded-2xl font-black"
          >
            CLOSE
          </button>
        </div>

        {/* DISPLAY */}
        <div className="bg-zinc-900 border-2 border-orange-500 rounded-2xl p-5 min-h-[90px] flex items-center mb-5">
          <p className="text-3xl font-black break-all">
            {input || '_'}
          </p>
        </div>

        {/* KEYS */}
        <div className="grid grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {letters.map((char) => (
            <button
              key={char}
              onClick={() =>
                addChar(char)
              }
              className="bg-zinc-900 hover:bg-orange-500 active:scale-95 transition-all h-16 rounded-2xl text-2xl font-black"
            >
              {char}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={removeChar}
            className="bg-zinc-800 h-16 rounded-2xl text-2xl font-black"
          >
            DELETE
          </button>

          <button
            onClick={handleConfirm}
            className="bg-orange-500 h-16 rounded-2xl text-2xl font-black"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeypadModal;