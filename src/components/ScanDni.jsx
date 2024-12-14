import React, { useState } from "react";
import ScannerView from "./ScannerView";
import ScanResult from "./ScanResult";
import SuccessNotification from "./SuccessNotification";

function ScanDni() {
  const [step, setStep] = useState("start"); // start, scanner, result, success
  const [scannedData, setScannedData] = useState(null);

  const handleStartScan = () => {
    setStep("scanner");
  };

  const handleScanSuccess = (data) => {
    setScannedData(data);
    setStep("result");
  };

  const handleSaveSuccess = () => {
    setStep("success");
  };

  const handleNewScan = () => {
    setScannedData(null);
    setStep("scanner");
  };

  return (
    <div className="bg-gray-800 min-h-screen flex flex-col items-center justify-center text-white">
      {step === "start" && (
        <button
          onClick={handleStartScan}
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-700"
        >
          Escanear DNI
        </button>
      )}
      {step === "scanner" && <ScannerView onSuccess={handleScanSuccess} />}
      {step === "result" && (
        <ScanResult
          data={scannedData}
          onSaveSuccess={handleSaveSuccess}
          onNewScan={handleNewScan}
        />
      )}
      {step === "success" && (
        <SuccessNotification onNewScan={handleNewScan} />
      )}
    </div>
  );
}

export default ScanDni;
