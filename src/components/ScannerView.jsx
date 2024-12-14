import React, { useEffect, useState } from "react";
import CameraSelect from "./CameraSelect";
import BarcodeScanner from "./BarcodeScannerComponent";

function ScannerView({ onSuccess }) {
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    localStorage.getItem("selectedCamera") || null
  );
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((device) => device.kind === "videoinput");
      setCameras(videoInputs);
      if (!selectedDeviceId && videoInputs.length > 0) {
        const defaultCameraId = videoInputs[0].deviceId;
        setSelectedDeviceId(defaultCameraId);
        localStorage.setItem("selectedCamera", defaultCameraId);
      }
    });
  }, [selectedDeviceId]);

  const handleCameraSelect = (event) => {
    const deviceId = event.target.value;
    setSelectedDeviceId(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
  };

  const handleScan = (err, result) => {
    if (result) {
      onSuccess(result.text);
    } else if (err) {
      console.error("Error al escanear:", err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Escanear DNI</h2>
      <CameraSelect
        cameras={cameras}
        selectedDeviceId={selectedDeviceId}
        handleCameraSelect={handleCameraSelect}
      />
      <BarcodeScanner selectedDeviceId={selectedDeviceId} handleScan={handleScan} />
    </div>
  );
}

export default ScannerView;
