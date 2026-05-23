import { useEffect } from 'react';

import {
  Html5QrcodeScanner,
} from 'html5-qrcode';

const PalletScanner = ({
  onScan,
}) => {
  useEffect(() => {
    const scanner =
      new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: {
            width: 280,
            height: 120,
          },
        },
        false
      );

    scanner.render(
      (decodedText) => {
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4">
      <div id="reader" />
    </div>
  );
};

export default PalletScanner;