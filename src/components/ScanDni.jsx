import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../supabaseClient";
import CameraSelect from "./CameraSelect";
import BarcodeScanner from "./BarcodeScannerComponent";

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(localStorage.getItem("selectedCamera") || null);
  const [cameras, setCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  useEffect(() => {
    // Solicitar permisos de cámara
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setCameraPermissionGranted(true);
        fetchCameras(); // Llamar a la función para enumerar cámaras si se otorgan permisos
      })
      .catch((error) => {
        console.error("Permisos de cámara rechazados:", error);
        setNotification({
          message: "Permiso para usar la cámara denegado. Por favor, habilítalo en la configuración del navegador.",
          type: "error",
        });
      });
  }, []);

  const fetchCameras = () => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter((device) => device.kind === "videoinput");
        setCameras(videoInputs);

        if (!selectedDeviceId && videoInputs.length > 0) {
          const defaultCameraId = videoInputs[0].deviceId;
          setSelectedDeviceId(defaultCameraId);
          localStorage.setItem("selectedCamera", defaultCameraId);
        }
      })
      .catch((error) => {
        console.error("Error al enumerar dispositivos:", error);
        setNotification({
          message: "Error al acceder a las cámaras del dispositivo.",
          type: "error",
        });
      });
  };

  const handleCameraSelect = (event) => {
    const deviceId = event.target.value;
    setSelectedDeviceId(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
  };

  const handleScan = (err, result) => {
    if (result) {
      setScannedData(result.text);
      navigate('/data', { state: { scannedData: result.text } }); // Redirige a /data con los datos escaneados
    } else if (err) {
      console.error("Error al escanear:", err);
    }
  };

  return (
    <div className="bg-gray-900">
      <div className="flex border-b bg-gray-950">
        <h3 className="text-xl font-bold p-2 mt-4 text-gray-300 ">USER: {user?.username}</h3>
        {cameraPermissionGranted && (
          <CameraSelect cameras={cameras} selectedDeviceId={selectedDeviceId} handleCameraSelect={handleCameraSelect} />
        )}
      </div>

      <button onClick={() => navigate("/manual-entry")} className=" m-2 bg-gray-600 text-white px-4 py-2 rounded-md ">
       Ingreso Manual
      </button>

      {cameraPermissionGranted ? (
        <BarcodeScanner selectedDeviceId={selectedDeviceId} handleScan={handleScan} />
      ) : (
        <div className="text-center text-white p-6">
          <p className="text-xl">Por favor, habilita el acceso a la cámara para continuar.</p>
        </div>
      )}
      {notification.message && (
        <div
          className={`fixed top-60 left-1/2 transform text-2xl -translate-x-1/2 ${
            notification.type === "error" ? "bg-red-600" : "bg-indigo-900/70"
          } text-white p-6 rounded-md text-center z-70 font-semibold uppercase`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default ScanDni;
