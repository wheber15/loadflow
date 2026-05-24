// src/components/truck/CustomerNameModal.jsx

import { useState } from 'react';

const CustomerNameModal = ({
  value = '',
  onClose,
  onSubmit,
}) => {
  const [input, setInput] =
    useState(value);

  const [error, setError] =
    useState('');

  const handleSubmit = () => {
    const trimmed =
      input.trim();

    if (!trimmed) {
      setError(
        'Customer name required'
      );

      return;
    }

    onSubmit(
      trimmed.toUpperCase()
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[999] flex items-end md:items-center justify-center p-0 md:p-5">

      <div className="w-full md:max-w-2xl bg-zinc-950 border-t md:border border-zinc-800 rounded-t-3xl md:rounded-3xl p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-4xl font-black text-orange-500">
              CUSTOMER NAME
            </h2>

            <p className="text-zinc-500 mt-1">
              Type customer name
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 transition px-5 py-3 rounded-2xl font-black"
          >
            CLOSE
          </button>

        </div>

        {/* INPUT */}
        <div className="mb-5">

          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => {
              setError('');

              setInput(
                e.target.value.toUpperCase()
              );
            }}
            placeholder="ENTER CUSTOMER NAME"
            className="w-full bg-zinc-900 border-2 border-orange-500 rounded-3xl p-6 text-3xl font-black uppercase outline-none"
            onKeyDown={(e) => {
              if (
                e.key === 'Enter'
              ) {
                handleSubmit();
              }
            }}
          />

        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-2xl p-4 mb-5 font-bold">
            {error}
          </div>
        )}

        {/* QUICK HELP */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-5">

          <p className="text-zinc-500 text-sm">
            Desktop:
            Use keyboard for fast typing
          </p>

          <p className="text-zinc-500 text-sm mt-2">
            Mobile:
            Your phone keyboard will open automatically
          </p>

        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 transition h-20 rounded-2xl text-2xl font-black"
          >
            CANCEL
          </button>

          <button
            onClick={handleSubmit}
            className="bg-orange-500 hover:bg-orange-600 transition h-20 rounded-2xl text-2xl font-black"
          >
            CONFIRM
          </button>

        </div>

      </div>
    </div>
  );
};

export default CustomerNameModal;