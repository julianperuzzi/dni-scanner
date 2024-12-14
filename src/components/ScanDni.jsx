import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { supabase } from "../supabaseClient";
import CameraSelect from "./CameraSelect";
import BarcodeScanner from "./BarcodeScannerComponent";

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(localStorage.getItem("selectedCamera") || null);
  const [cameras, setCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
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
      setNotification({ message: "", type: "" });
      setShowModal(true);
    } catch (err) {
      setParsedData(null);
      setNotification({ message: err.message, type: "error" });
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

  const handleSave = async () => {
    if (!parsedData) return;

    try {
      const { error } = await supabase.from("dni_data").insert([
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

      setNotification({ message: "Datos guardados exitosamente ✅", type: "success" });
      setTimeout(() => setNotification({ message: "", type: "" }), 1000);

      setShowModal(false);
      setParsedData(null);
      setScannedData("");
    } catch (err) {
      setNotification({ message: "❌ Error al guardar los datos. Intenta nuevamente ❌", type: "error" });
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const formatToISO = (date) => {
    const [day, month, year] = date.split("/");
    return new Date(year, month - 1, day).toISOString();
  };

  return (
    <div className="bg-gray-900">
      <div className="flex border-b bg-gray-950">
      <h3 className="text-xl font-bold p-2 mt-4 text-gray-300 ">USER: {user?.username}</h3>
      <CameraSelect cameras={cameras} selectedDeviceId={selectedDeviceId} handleCameraSelect={handleCameraSelect} />
      </div>
      <BarcodeScanner selectedDeviceId={selectedDeviceId} handleScan={handleScan} />
      {notification.message && (
        <div
          className={`fixed top-60 left-1/2 transform text-2xl -translate-x-1/2 bg-indigo-700 text-white p-6 rounded-md text-center z-70 font-bold`}
        >
          {notification.message}
        </div>
      )}
      {showModal && parsedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-2xl font-bold text-green-600 text-center mb-6">Datos del DNI Escaneado</h3>
            <ul className="space-y-3 text-left">
              <li>
                <strong>Número de Trámite:</strong> {parsedData.numeroTramite}
              </li>
              <li>
                <strong>Apellidos:</strong> {parsedData.apellidos}
              </li>
              <li>
                <strong>Nombres:</strong> {parsedData.nombres}
              </li>
              <li>
                <strong>Sexo:</strong> {parsedData.sexo}
              </li>
              <li>
                <strong>Número de DNI:</strong> {parsedData.numeroDni}
              </li>
              <li>
                <strong>Ejemplar:</strong> {parsedData.ejemplar}
              </li>
              <li>
                <strong>Fecha de Nacimiento:</strong> {parsedData.fechaNacimiento}
              </li>
              <li>
                <strong>Fecha de Emisión:</strong> {parsedData.fechaEmision}
              </li>
              {parsedData.cuil && parsedData.cuil.inicio && parsedData.cuil.fin && (
                <li>
                  <strong>CUIL:</strong> {parsedData.cuil.inicio}-{parsedData.numeroDni}-{parsedData.cuil.fin}
                </li>
              )}
            </ul>
            <div className="flex justify-between mt-6">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md"
              >
                Guardar Datos
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanDni;
