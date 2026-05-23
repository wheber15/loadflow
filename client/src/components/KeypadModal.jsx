// src/components/KeypadModal.jsx

import { useState } from 'react';

const letters = [
  'A','B','C','D','E','F',
  'G','H','I','J','K','L',
  'M','N','O','P','Q','R',
  'S','T','U','V','W','X',
  'Y','Z','0','1','2','3',
  '4','5','6','7','8','9',
];

const KeypadModal = ({
  title,
  value = '',
  onClose,
  onSubmit,
}) => {
  const [input, setInput] =
    useState(value);

  const add = (char) => {
    setInput(
      (prev) => prev + char
    );
  };

  const remove = () => {
    setInput((prev) =>
      prev.slice(0, -1)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[200] flex items-end md:items-center justify-center">
      <div className="w-full md:max-w-2xl bg-zinc-950 border-t md:border border-zinc-800 rounded-t-3xl md:rounded-3xl p-5">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-3xl font-black text-orange-500">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="bg-red-500 px-5 py-3 rounded-2xl font-black"
          >
            CLOSE
          </button>
        </div>

        {/* DISPLAY */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 text-3xl font-black mb-5 min-h-[90px] break-all">
          {input || '_'}
        </div>

        {/* KEYS */}
        <div className="grid grid-cols-6 gap-3">
          {letters.map((char) => (
            <button
              key={char}
              onClick={() =>
                add(char)
              }
              className="bg-zinc-900 hover:bg-orange-500 h-16 rounded-2xl font-black text-2xl"
            >
              {char}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={remove}
            className="bg-zinc-800 h-16 rounded-2xl font-black text-2xl"
          >
            DELETE
          </button>

          <button
            onClick={() =>
              onSubmit(input)
            }
            className="bg-orange-500 h-16 rounded-2xl font-black text-2xl"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeypadModal;