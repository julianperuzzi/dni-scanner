import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function DniScanner() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    localStorage.getItem("selectedCamera") || null
  );
  const [rearCameras, setRearCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");

  // Obtener las cámaras traseras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((device) => device.kind === "videoinput");
      const backCameras = videoInputs.filter(
        (device) =>
          device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear")
      );

      setRearCameras(backCameras);

      // Si no hay una cámara seleccionada en localStorage, seleccionar la primera cámara trasera disponible
      if (!selectedDeviceId && backCameras.length > 0) {
        const defaultCameraId = backCameras[0].deviceId;
        setSelectedDeviceId(defaultCameraId);
        localStorage.setItem("selectedCamera", defaultCameraId);
      }
    }).catch((error) => {
      console.error("Error al enumerar dispositivos:", error);
    });
  }, [selectedDeviceId]);

  const handleCameraSelect = (deviceId) => {
    setSelectedDeviceId(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
  };

  const handleScan = (err, result) => {
    if (result) {
      setScannedData(result.text);
    } else if (err) {
      console.error("Error al escanear:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Escanear DNI</h2>
      <div>
        <h4>Selecciona una cámara trasera:</h4>
        {rearCameras.length > 0 ? (
          rearCameras.map((camera, index) => (
            <button
              key={camera.deviceId}
              onClick={() => handleCameraSelect(camera.deviceId)}
              style={{
                margin: "5px",
                padding: "10px",
                backgroundColor: selectedDeviceId === camera.deviceId ? "green" : "gray",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {camera.label || `Cámara ${index + 1}`}
            </button>
          ))
        ) : (
          <p>No se encontraron cámaras traseras.</p>
        )}
      </div>
      {selectedDeviceId ? (
        <BarcodeScannerComponent
          width={500}
          height={500}
          onUpdate={handleScan}
          videoConstraints={{
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          }}
        />
      ) : (
        <p>Cargando escáner...</p>
      )}
      <h2>Resultado del escaneo:</h2>
      <p>{scannedData || "Aún no se ha escaneado ningún código."}</p>
    </div>
  );
}

export default DniScanner;
