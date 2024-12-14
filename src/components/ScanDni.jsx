import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { supabase } from "../supabaseClient";
import CameraSelect from "./CameraSelect";
import BarcodeScanner from "./BarcodeScannerComponent";
import ParsedDataModal from "./ParsedDataModal";
import Notification from "./Notification";

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(localStorage.getItem("selectedCamera") || null);
  const [cameras, setCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

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
      setScannedData(result.text);
      parsePdf417(result.text);
    } else if (err) {
      console.error("Error al escanear:", err);
    }
  };

  const parsePdf417 = (code) => {
    try {
      const fields = code.split("@");

      if (fields.length < 8) {
        throw new Error("Código incompleto. Verifica el escaneo.");
      }

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
          ? {
              inicio: fields[8].slice(0, 2) || null,
              fin: fields[8].slice(-1) || null,
            }
          : null,
      };

      validateParsedData(parsed);

      setParsedData(parsed);
      setError(null);
      setShowModal(true);
    } catch (err) {
      setParsedData(null);
      setError(err.message);
    }
  };

  const correctSpecialChars = (text) => {
    return text.replace(/NXX/g, "Ñ").replace(/UXX/g, "Ü");
  };

  const validateDate = (date) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) {
      throw new Error(`Fecha inválida: ${date}`);
    }
    return date;
  };

  const validateParsedData = (data) => {
    if (!data.numeroDni || !data.apellidos || !data.nombres) {
      throw new Error("Faltan datos clave: DNI, apellidos o nombres.");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!parsedData) return;

    try {
      const { data, error } = await supabase.from("dni_data").insert([
        {
          user_id: user.id,
          document_number: parsedData.numeroTramite,
          last_name: parsedData.apellidos,
          first_name: parsedData.nombres,
          gender: parsedData.sexo,
          dni_number: parsedData.numeroDni,
          document_type: parsedData.ejemplar,
          birth_date: formatToISO(parsedData.fechaNacimiento),
          issue_date: formatToISO(parsedData.fechaEmision),
          cuil_full: parsedData.cuil ? `${parsedData.cuil.inicio}${parsedData.numeroDni}${parsedData.cuil.fin}` : null,
        },
      ]);

      if (error) throw new Error(error.message);

      setSuccessMessage("Datos guardados exitosamente.");
      setShowModal(false);
      setParsedData(null);
      setScannedData("");
    } catch (err) {
      setError("Error al guardar los datos. Intenta nuevamente.");
    }
  };

  const formatToISO = (date) => {
    const [day, month, year] = date.split("/");
    return new Date(year, month - 1, day).toISOString();
  };

  return (
    <div className="bg-gray-800">
      <h3 className="text-xl font-bold p-2 text-white uppercase">Usuario: {user?.username}</h3>
      <CameraSelect cameras={cameras} selectedDeviceId={selectedDeviceId} handleCameraSelect={handleCameraSelect} />
      <BarcodeScanner selectedDeviceId={selectedDeviceId} handleScan={handleScan} />
      <ParsedDataModal
        parsedData={parsedData}
        successMessage={successMessage}
        error={error}
        handleSave={handleSave}
        handleCancel={handleCancel}
      />
      <Notification message={successMessage || error} type={successMessage ? "success" : "error"} />
    </div>
  );
}

export default ScanDni;
