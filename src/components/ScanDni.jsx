import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import CameraSelect from "./CameraSelect";
import BarcodeScanner from "./BarcodeScannerComponent";

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [loadingCameras, setLoadingCameras] = useState(true);

  const { user } = useUser();
  const navigate = useNavigate();

  // Redirige al usuario al login si no está autenticado
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Obtiene las cámaras disponibles
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === "videoinput");

        setCameras(videoInputs);

        if (videoInputs.length > 0) {
          const savedCamera = localStorage.getItem("selectedCamera");
          const defaultCamera = savedCamera || videoInputs[0].deviceId;
          setSelectedDeviceId(defaultCamera);
          localStorage.setItem("selectedCamera", defaultCamera);
        } else {
          console.error("No se encontraron cámaras.");
        }
      } catch (error) {
        console.error("Error al obtener cámaras:", error);
      } finally {
        setLoadingCameras(false);
      }
    };

    fetchCameras();
  }, []);

  // Maneja la selección de cámara
  const handleCameraSelect = (event) => {
    const deviceId = event.target.value;
    setSelectedDeviceId(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
  };

  // Maneja el resultado del escaneo
  const handleScan = (result) => {
    if (result) {
      navigate("/data", { state: { scannedData: result } });
    }
  };

  // Maneja errores en el escaneo
  const handleError = (error) => {
    console.error("Error durante el escaneo:", error);
  };

  if (loadingCameras) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <p>Cargando cámaras...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900">
      <div className="flex border-b bg-gray-950">
        <h3 className="text-xl font-bold p-2 mt-4 text-gray-300">
          USER: {user?.username || "Invitado"}
        </h3>
        <CameraSelect
          cameras={cameras}
          selectedDeviceId={selectedDeviceId}
          handleCameraSelect={handleCameraSelect}
        />
      </div>
      {selectedDeviceId ? (
        <BarcodeScanner
          selectedDeviceId={selectedDeviceId}
          onScan={handleScan}
          onError={handleError}
        />
      ) : (
        <p className="text-center text-white mt-4">Seleccione una cámara para comenzar.</p>
      )}
    </div>
  );
}

export default ScanDni;
