import React from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";



function BarcodeScanner({ selectedDeviceId, handleScan }) {
  return (
    <div >
      <BarcodeScannerComponent
        width={500}
        height={300}        
        delay={100}
        onUpdate={handleScan}
        videoConstraints={{
          deviceId: { exact: selectedDeviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        }}
      />
    </div>
  );
}

export default BarcodeScanner;
