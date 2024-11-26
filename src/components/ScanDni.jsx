import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';

function ScanDni() {
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    localStorage.getItem("selectedCamera") || null
  );
  const [cameras, setCameras] = useState([]);
  const [scannedData, setScannedData] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { user, setUser } = useUser(); // Verificar y actualizar el estado del usuario

  useEffect(() => {
    // Verificar sesión al cargar
    const checkSession = async () => {
      const { data: session, error } = await supabase.auth.getSession();
      if (session?.session?.user) {
        setUser(session.session.user);
      } else if (error) {
        console.error("Error al recuperar la sesión:", error);
      }
    };
    checkSession();
  }, [setUser]);

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
    if (!parsedData) {
      console.error("No hay datos para guardar.");
      return;
    }

    if (!user || !user.id) {
      console.error("El usuario no está autenticado.");
      return;
    }

    try {
      const { data, error } = await supabase.from("dni_data").insert([{
        user_id: user.id,
        document_number: parsedData.numeroTramite,
        last_name: parsedData.apellidos,
        first_name: parsedData.nombres,
        gender: parsedData.sexo,
        dni_number: parsedData.numeroDni,
        document_type: parsedData.ejemplar,
        birth_date: formatToISO(parsedData.fechaNacimiento),
        issue_date: formatToISO(parsedData.fechaEmision),
      }]);

      if (error) {
        throw error;
      }

      setShowModal(false);
      setShowSuccessModal(true); // Mostrar modal de éxito
    } catch (err) {
      console.error("Error al guardar los datos en la base de datos:", err.message);
    }
  };

  const formatToISO = (date) => {
    const [day, month, year] = date.split("/");
    return `${year}-${month}-${day}`;
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Escanear y Procesar DNI</h2>
      <div>
        <h4>Selecciona una cámara:</h4>
        <select onChange={handleCameraSelect} value={selectedDeviceId}>
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || "Cámara sin etiqueta"}
            </option>
          ))}
        </select>
      </div>
      {selectedDeviceId ? (
        <BarcodeScannerComponent
          width={600}
          height={400}
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
        <div className="modal">
          <div>
            <h3>Datos Parseados:</h3>
            <ul>
              <li><strong>Número de Trámite:</strong> {parsedData.numeroTramite}</li>
              <li><strong>Apellidos:</strong> {parsedData.apellidos}</li>
              <li><strong>Nombres:</strong> {parsedData.nombres}</li>
              <li><strong>Sexo:</strong> {parsedData.sexo}</li>
              <li><strong>DNI:</strong> {parsedData.numeroDni}</li>
              <li><strong>Fecha de Nacimiento:</strong> {parsedData.fechaNacimiento}</li>
            </ul>
            <button onClick={handleSave}>Guardar Datos</button>
            <button onClick={handleCancel}>Cancelar</button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="success-modal">
          <p>¡Datos guardados correctamente!</p>
          <button onClick={() => setShowSuccessModal(false)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}

export default ScanDni;
