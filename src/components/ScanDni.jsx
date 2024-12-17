import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import { useUser } from "../context/UserContext";
import { supabase } from "../supabaseClient";
import CameraSelect from "./CameraSelect";
import BarcodeScanner from "./BarcodeScannerComponent";

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(localStorage.getItem("selectedCamera") || null);
  const [cameras, setCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  const { user } = useUser();
  const navigate = useNavigate(); // Función para redirigir

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  useEffect(() => {
    const initializeCameraPermissions = async () => {
      try {
        // Solicitar permisos para usar la cámara
        await navigator.mediaDevices.getUserMedia({ video: true });

        // Enumerar dispositivos de entrada de video
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === "videoinput");

        setCameras(videoInputs);

        if (!selectedDeviceId && videoInputs.length > 0) {
          const defaultCameraId = videoInputs[0].deviceId;
          setSelectedDeviceId(defaultCameraId);
          localStorage.setItem("selectedCamera", defaultCameraId);
        }
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        setNotification({
          message: "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
          type: "error",
        });
      }
    };

    initializeCameraPermissions();
  }, [selectedDeviceId]);

  const handleCameraSelect = (event) => {
    const deviceId = event.target.value;
    setSelectedDeviceId(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
  };

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
        <div
          className={`fixed top-60 left-1/2 transform text-2xl -translate-x-1/2 bg-indigo-900/70 text-white p-6 rounded-md text-center z-70 font-semibold uppercase`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default ScanDni;
