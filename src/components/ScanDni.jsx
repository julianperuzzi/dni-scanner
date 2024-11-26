import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    localStorage.getItem("selectedCamera") || null
  );
  const [rearCameras, setRearCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  // Obtener las cámaras traseras
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

        // Si no hay una cámara seleccionada en localStorage, seleccionar la primera cámara trasera disponible
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
      // Separar los campos por el delimitador "@"
      const fields = code.split("@");

      if (fields.length < 9) {
        throw new Error("Código incompleto. Verifica el escaneo.");
      }

      // Mapear los datos
      const parsed = {
        numeroTramite: fields[0],
        apellidos: correctSpecialChars(fields[1]),
        nombres: correctSpecialChars(fields[2]),
        sexo: fields[3],
        numeroDni: fields[4],
        ejemplar: fields[5],
        fechaNacimiento: validateDate(fields[6]),
        fechaEmision: validateDate(fields[7]),
        cuil: {
          inicio: fields[8]?.slice(0, 2) || null,
          fin: fields[8]?.slice(-1) || null,
        },
      };

      // Validar campos clave
      validateParsedData(parsed);

      // Si todo está correcto, actualizar estado
      setParsedData(parsed);
      setError(null);
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

      {error && <p style={{ color: "red" }}>{error}</p>}

      {parsedData && (
        <div style={{ marginTop: "20px" }}>
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
            <li><strong>CUIL:</strong> {parsedData.cuil.inicio}-{parsedData.cuil.fin}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ScanDni;
