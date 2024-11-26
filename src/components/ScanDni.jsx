import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

// Función para calcular el CUIL basado en el DNI y el sexo
const calculateCuil = (dni, gender) => {
  let type = gender === "M" ? "20" : "27"; // Hombres: 20, Mujeres: 27
  const dniDigits = dni.toString().padStart(8, "0"); // Asegurarse de que el DNI tenga 8 dígitos
  const dniArray = dniDigits.split("").map(Number);
  
  // Realizar las multiplicaciones
  const multipliers = [2, 3, 4, 5, 6, 7, 8, 9];
  const sum = multipliers.reduce((acc, mul, index) => acc + dniArray[index] * mul, 0);

  // Calcular el dígito de verificación
  const remainder = sum % 11;
  let checkDigit = 11 - remainder;
  if (remainder === 1) {
    checkDigit = gender === "M" ? 9 : 4;
    type = "23"; // Cambiar el tipo a 23 si el resto es 1
  } else if (remainder === 0) {
    checkDigit = 0;
  }

  // Retornar el CUIL
  return `${type}-${dniDigits}-${checkDigit}`;
};

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    localStorage.getItem("selectedCamera") || null
  );
  const [rearCameras, setRearCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter((device) => device.kind === "videoinput");
        const backCameras = videoInputs.filter(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear")
        );

        setRearCameras(backCameras);

        if (!selectedDeviceId && backCameras.length > 0) {
          const defaultCameraId = backCameras[0].deviceId;
          setSelectedDeviceId(defaultCameraId);
          localStorage.setItem("selectedCamera", defaultCameraId);
        }
      })
      .catch((error) => {
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
      parsePdf417(result.text); // Procesar el resultado escaneado
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
        cuil: calculateCuil(fields[4], fields[3]),
      };

      validateParsedData(parsed);

      setParsedData(parsed);
      setError(null);
      setShowModal(true); // Mostrar modal cuando se ha parseado correctamente
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

  const handleSave = () => {
    // Aquí podrías agregar la lógica para guardar los datos en la base de datos
    console.log("Datos guardados:", parsedData);
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Escanear y Procesar DNI</h2>
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
          height={200}
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

      {error && <p style={{ color: "red" }}>{error}</p>}

      {parsedData && showModal && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.7)", padding: "20px" }}>
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px" }}>
            <h3>Datos Parseados:</h3>
            <ul style={{ textAlign: "left", display: "inline-block" }}>
              <li><strong>Número de Trámite:</strong> {parsedData.numeroTramite}</li>
              <li><strong>Apellidos:</strong> {parsedData.apellidos}</li>
              <li><strong>Nombres:</strong> {parsedData.nombres}</li>
              <li><strong>Sexo:</strong> {parsedData.sexo}</li>
              <li><strong>Número de DNI:</strong> {parsedData.numeroDni}</li>
              <li><strong>Ejemplar:</strong> {parsedData.ejemplar}</li>
              <li><strong>Fecha de Nacimiento:</strong> {parsedData.fechaNacimiento}</li>
              <li><strong>Fecha de Emisión:</strong> {parsedData.fechaEmision}</li>
              <li><strong>CUIL:</strong> {parsedData.cuil}</li>
            </ul>
            <button onClick={handleSave} style={{ marginTop: "20px", padding: "10px", backgroundColor: "green", color: "white" }}>
              Guardar en la base de datos
            </button>
            <button onClick={handleCancel} style={{ marginTop: "20px", padding: "10px", backgroundColor: "red", color: "white" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanDni;
