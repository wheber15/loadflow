import {
  useEffect,
  useRef,
} from 'react';

import {
  Html5QrcodeScanner,
} from 'html5-qrcode';

const PickerScannerModal = ({
  onScan,
  onClose,
}) => {
  const scannedRef =
    useRef(false);

  useEffect(() => {
    let scanner;

    const startScanner =
      async () => {
        try {
          scanner =
            new Html5QrcodeScanner(
              'picker-reader',
              {
                fps: 5,

                qrbox: {
                  width: 340,
                  height: 200,
                },

                aspectRatio:
                  1.777,

                rememberLastUsedCamera: true,

                supportedScanTypes:
                  [0],

                showTorchButtonIfSupported: true,

                experimentalFeatures:
                  {
                    useBarCodeDetectorIfSupported: true,
                  },
              },
              false
            );

          scanner.render(
            async (
              decodedText
            ) => {
              if (
                scannedRef.current
              )
                return;

              scannedRef.current =
                true;

              navigator.vibrate?.(
                120
              );

              const cleanCode =
                decodedText
                  .replace(
                    /\s/g,
                    ''
                  )
                  .trim();

              if (
                cleanCode.length <
                20
              ) {
                scannedRef.current =
                  false;

                return;
              }

              try {
                await scanner.clear();
              } catch {}

              onScan(
                cleanCode
              );
            },

            () => {}
          );
        } catch (error) {
          console.log(
            error
          );

          alert(
            'Scanner failed to start'
          );
        }
      };

    startScanner();

    return () => {
      scannedRef.current =
        false;

      if (scanner) {
        scanner
          .clear()
          .catch(
            () => {}
          );
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* HEADER */}

      <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-orange-500">
            PICKER SCANNER
          </h1>

          <p className="text-zinc-400">
            Scan pallet barcode
          </p>
        </div>

        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-2xl font-black"
        >
          CLOSE
        </button>
      </div>

      {/* SCANNER */}

      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-3xl bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
          <div
            id="picker-reader"
            className="w-full"
          />
        </div>
      </div>

      {/* HELP */}

      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-orange-500 font-black text-xl">
            SCAN TIPS
          </h3>

          <ul className="mt-3 text-zinc-400 space-y-2 text-sm">
            <li>
              • Hold steady for 1 second
            </li>

            <li>
              • Fill scan frame fully
            </li>

            <li>
              • Avoid reflections
            </li>

            <li>
              • SAP barcode optimized
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PickerScannerModal;