import { useEffect } from 'react';

import {
  Html5QrcodeScanner,
} from 'html5-qrcode';

const PalletScanner = ({
  onScan,
  onClose,
}) => {
  useEffect(() => {
    const scanner =
      new Html5QrcodeScanner(
        'reader',
        {
          fps: 15,
          qrbox: {
            width: 320,
            height: 160,
          },

          rememberLastUsedCamera: true,

          aspectRatio: 1.777,

          showTorchButtonIfSupported: true,
        },
        false
      );

    scanner.render(
      (decodedText) => {
        navigator.vibrate?.(100);

        onScan(decodedText);

        scanner.clear();
      },
      () => {}
    );

    return () => {
      scanner
        .clear()
        .catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* TOP BAR */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
        <div>
          <h2 className="text-2xl font-black text-orange-500">
            LOADFLOW SCANNER
          </h2>

          <p className="text-zinc-400 text-sm">
            Scan pallet barcode
          </p>
        </div>

        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-2xl font-bold"
        >
          CLOSE
        </button>
      </div>

      {/* SCANNER */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div className="w-full max-w-2xl bg-zinc-900 rounded-3xl border border-zinc-800 p-4">
          <div id="reader" />
        </div>
      </div>

      {/* BOTTOM HELP */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <p className="text-zinc-500 text-sm">
              SCAN MODE
            </p>

            <h3 className="text-xl font-bold text-orange-500 mt-2">
              SAP LABELS
            </h3>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <p className="text-zinc-500 text-sm">
              CAMERA
            </p>

            <h3 className="text-xl font-bold text-emerald-400 mt-2">
              ACTIVE
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalletScanner;