import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import CameraSelect from "./CameraSelect";
import BarcodeScanner from "./BarcodeScannerComponent";

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  const { user } = useUser();
  const navigate = useNavigate();

  // Verifica si el usuario está autenticado
  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  // Obtiene la lista de cámaras y selecciona una por defecto
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === "videoinput");
        setCameras(videoInputs);

        // Selecciona la cámara predeterminada si no hay una seleccionada
        if (videoInputs.length > 0) {
          const savedCamera = localStorage.getItem("selectedCamera");
          const defaultCamera = savedCamera || videoInputs[0].deviceId;
          setSelectedDeviceId(defaultCamera);
          localStorage.setItem("selectedCamera", defaultCamera);
        }
      } catch (error) {
        console.error("Error al enumerar dispositivos:", error);
      }
    };

    fetchCameras();
  }, []); // Solo se ejecuta una vez al montar el componente

  // Actualiza la cámara seleccionada
  const handleCameraSelect = (event) => {
    const deviceId = event.target.value;
    setSelectedDeviceId(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
  };

  // Maneja los resultados del escáner
  const handleScan = (err, result) => {
    if (result) {
      setScannedData(result.text);
      navigate("/data", { state: { scannedData: result.text } }); // Redirige a /data con los datos escaneados
    } else if (err) {
      console.error("Error al escanear:", err);
    }
  };

  return (
    <div className="bg-gray-900">
      <div className="flex border-b bg-gray-950">
        <h3 className="text-xl font-bold p-2 mt-4 text-gray-300">USER: {user?.username}</h3>
        <CameraSelect cameras={cameras} selectedDeviceId={selectedDeviceId} handleCameraSelect={handleCameraSelect} />
      </div>
      <BarcodeScanner selectedDeviceId={selectedDeviceId} handleScan={handleScan} />
      {notification.message && (
        <div className={`fixed top-60 left-1/2 transform text-2xl -translate-x-1/2 bg-indigo-900/70 text-white p-6 rounded-md text-center z-70 font-semibold uppercase`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default ScanDni;
