// src/components/KeypadModal.jsx

import { useState } from 'react';

const fullKeys = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '0',
  'A', 'B', 'C',
  'D', 'E', 'F',
  'G', 'H', 'I',
  'J', 'K', 'L',
  'M', 'N', 'O',
  'P', 'Q', 'R',
  'S', 'T', 'U',
  'V', 'W', 'X',
  'Y', 'Z',
  'SPACE',
];

const numberKeys = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '0',
];

const KeypadModal = ({
  title,
  value = '',
  onClose,
  onSubmit,
  type = 'text',
}) => {
  const [input, setInput] =
    useState(value);

  const [error, setError] =
    useState('');

  const keys =
    type === 'delivery'
      ? numberKeys
      : fullKeys;

  const addChar = (char) => {
    setError('');

    const valueToAdd =
      char === 'SPACE'
        ? ' '
        : char;

    /* DELIVERY NUMBER RULES */
    if (type === 'delivery') {
      /* ONLY NUMBERS */
      if (
        !/^\d$/.test(valueToAdd)
      ) {
        return;
      }

      /* MAX 10 */
      if (input.length >= 10) {
        setError(
          'Delivery number too long'
        );

        return;
      }
    }

    setInput(
      (prev) =>
        prev + valueToAdd
    );
  };

  const removeChar = () => {
    setError('');

    setInput((prev) =>
      prev.slice(0, -1)
    );
  };

  const handleConfirm = () => {
    const trimmed =
      input.trim();

    if (!trimmed) {
      setError(
        'Field cannot be empty'
      );

      return;
    }

    /* DELIVERY VALIDATION */
    if (type === 'delivery') {
      if (
        !/^\d+$/.test(trimmed)
      ) {
        setError(
          'Delivery number must contain only numbers'
        );

        return;
      }

      if (
        trimmed.length < 10
      ) {
        setError(
          'Delivery number too short'
        );

        return;
      }

      if (
        trimmed.length > 10
      ) {
        setError(
          'Delivery number too long'
        );

        return;
      }
    }

    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[999] flex items-end md:items-center justify-center">
      <div className="w-full md:max-w-2xl bg-zinc-950 border-t md:border border-zinc-800 rounded-t-3xl md:rounded-3xl p-5">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-3xl font-black text-orange-500 uppercase">
              {title}
            </h2>

            <p className="text-zinc-500 mt-1">
              Tap to enter
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-2xl font-black"
          >
            CLOSE
          </button>
        </div>

        {/* DISPLAY */}
        <div className="bg-zinc-900 border-2 border-orange-500 rounded-2xl p-5 min-h-[90px] flex flex-col justify-center mb-4">
          <p className="text-3xl font-black break-all text-white">
            {input || '_'}
          </p>

          {/* LENGTH */}
          {type === 'delivery' && (
            <p className="text-zinc-500 text-sm mt-2">
              {input.length}/10 digits
            </p>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-2xl p-4 mb-4 font-bold">
            {error}
          </div>
        )}

        {/* KEYS */}
        <div
          className={`grid gap-3 max-h-[420px] overflow-y-auto pr-1 ${
            type === 'delivery'
              ? 'grid-cols-3'
              : 'grid-cols-3'
          }`}
        >
          {keys.map((char) => (
            <button
              key={char}
              onClick={() =>
                addChar(char)
              }
              className="bg-zinc-900 hover:bg-orange-500 active:scale-95 transition-all h-20 rounded-2xl text-3xl font-black text-white"
            >
              {char === 'SPACE'
                ? 'SPACE'
                : char}
            </button>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={removeChar}
            className="bg-zinc-800 hover:bg-zinc-700 h-20 rounded-2xl text-2xl font-black"
          >
            DELETE
          </button>

          <button
            onClick={handleConfirm}
            className="bg-orange-500 hover:bg-orange-600 h-20 rounded-2xl text-2xl font-black"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeypadModal;