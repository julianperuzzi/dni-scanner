import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Importamos useNavigate
import { useUser } from "../context/UserContext";
import { supabase } from "../supabaseClient";
import CameraSelect from "./CameraSelect";
import BarcodeScanner from "./BarcodeScannerComponent";

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(localStorage.getItem("selectedCamera") || null);
  const [cameras, setCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [parsedData, setParsedData] = useState(null); // Definir estado para parsedData

  const { user } = useUser();
  const navigate = useNavigate();  // Función para redirigir

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  useEffect(() => {
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
      });
  }, [selectedDeviceId]);

  const handleCameraSelect = (event) => {
    const deviceId = event.target.value;
    setSelectedDeviceId(deviceId);
    localStorage.setItem("selectedCamera", deviceId);
  };

  const handleScan = (err, result) => {
    if (err) {
      setNotification({ message: "❌ Error al escanear. Intenta nuevamente.", type: "error" });
      return;
    }

    if (result) {
      console.log(result); // Verifica si el resultado es correcto

      const parsed = parsePdf417(result.text); // Asegúrate de que parsePdf417 esté funcionando

      if (parsed) {
        setParsedData(parsed);
        validateParsedData(parsed); // Validar los datos inmediatamente
      } else {
        setNotification({ message: "❌ Datos incorrectos. Verifica el código escaneado.", type: "error" });
      }
    }
  };

  const validateParsedData = (data) => {
    const errors = [];

    if (!data.numeroDni || !data.apellidos || !data.nombres) {
      errors.push("Faltan datos clave: DNI, apellidos o nombres.");
    }

    if (errors.length > 0) {
      setNotification({ message: errors.join(" "), type: "error" });
    } else {
      setNotification({ message: "✅ Datos válidos. Listos para guardar.", type: "success" });
    }
  };

  return (
    <div className="bg-gray-900">
      <div className="flex border-b bg-gray-950">
        <h3 className="text-xl font-bold p-2 mt-4 text-gray-300 ">USER: {user?.username}</h3>
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
