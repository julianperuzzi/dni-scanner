import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    localStorage.getItem("selectedCamera") || null
  );
  const [cameras, setCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter((device) => device.kind === "videoinput");
        
        setCameras(videoInputs); // Listar todas las cámaras disponibles

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

  useEffect(() => {
    // Intentar obtener acceso a la cámara
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => { 
        console.log("Acceso a la cámara concedido");
      })
      .catch((error) => {
        console.error("Error al acceder a la cámara:", error);
      });
  }, []);

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
        cuil: fields[8]? {  // Verificar si el campo 8 tiene datos
          inicio: fields[8].slice(0, 2) || null,  // Tomar los primeros 2 caracteres
          fin: fields[8].slice(-1) || null,       // Tomar el último carácter
        } : null,
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
        <h4>Selecciona una cámara:</h4>
        {cameras.length > 0 ? (
          cameras.map((camera, index) => (
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
          <p>No se encontraron cámaras.</p>
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
              {parsedData.cuil && parsedData.cuil.inicio && parsedData.cuil.fin ? (
          <li>
            <strong>CUIL:</strong> {parsedData.cuil.inicio}-{parsedData.numeroDni}-{parsedData.cuil.fin}
          </li>
        ) : null}
            </ul>
            <button onClick={handleSave} style={{ marginTop: "10px" }}>Guardar</button>
            <button onClick={handleCancel} style={{ marginLeft: "10px" }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanDni;
