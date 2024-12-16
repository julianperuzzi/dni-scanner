import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import CameraSelect from "./CameraSelect";
import BarcodeScanner from "./BarcodeScannerComponent";
import { useNavigate } from "react-router-dom";

function Scanner() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(localStorage.getItem("selectedCamera") || null);
  const [cameras, setCameras] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const { user } = useUser();

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
    if (result) {
      const parsedData = parsePdf417(result.text);
      if (parsedData) {
        navigate("/parsed-data", { state: { parsedData } }); // Redirigir a la nueva ruta con datos
      }
    } else if (err) {
      setNotification({ message: "Error al escanear. Intente nuevamente.", type: "error" });
    }
  };

  const parsePdf417 = (code) => {
    try {
      const fields = code.split("@");
      if (fields.length < 8) throw new Error("Código incompleto. Verifica el escaneo.");

      const parsed = {
        numeroTramite: fields[0],
        apellidos: correctSpecialChars(fields[1]),
        nombres: correctSpecialChars(fields[2]),
        sexo: fields[3],
        numeroDni: fields[4],
        ejemplar: fields[5],
        fechaNacimiento: validateDate(fields[6]),
        fechaEmision: validateDate(fields[7]),
        cuil: fields[8]
          ? { inicio: fields[8].slice(0, 2), fin: fields[8].slice(-1) }
          : null,
      };

      validateParsedData(parsed);
      return parsed;
    } catch (error) {
      setNotification({ message: error.message, type: "error" });
      return null;
    }
  };

  const correctSpecialChars = (text) => text.replace(/NXX/g, "Ñ").replace(/UXX/g, "Ü");

  const validateDate = (date) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) throw new Error(`Fecha inválida: ${date}`);
    return date;
  };

  const validateParsedData = (data) => {
    if (!data.numeroDni || !data.apellidos || !data.nombres) {
      throw new Error("Faltan datos clave: DNI, apellidos o nombres.");
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
        <div className="fixed top-20 text-white bg-red-600 p-4 rounded-md">{notification.message}</div>
      )}
    </div>
  );
}

export default Scanner;
