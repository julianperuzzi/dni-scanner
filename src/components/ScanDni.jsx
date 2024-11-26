import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

// Función para calcular el CUIL basado en el DNI y el sexo
const calculateCuil = (dni, gender) => {
  // Primero, limpiamos el DNI de caracteres no numéricos
  const cleanedDni = dni.replace(/\D/g, '');

  // Verificamos si el DNI es válido (debe ser entre 7 y 8 dígitos)
  if (cleanedDni.length < 7 || cleanedDni.length > 8) {
      throw new Error("¡DNI inválido! Debe estar entre 7 y 8 dígitos.");
  }

  // Si el DNI tiene 7 dígitos, lo completamos con un cero adelante
  const formattedDni = cleanedDni.length === 7 ? `0${cleanedDni}` : cleanedDni;

  // Asignamos el valor de SEXO dependiendo del sexo ingresado
  let tipoSexo;
  switch (gender.toUpperCase()) {
      case 'M':
          tipoSexo = 20;
          break;
      case 'F':
          tipoSexo = 27;
          break;
      case 'E':
          tipoSexo = 30;
          break;
      default:
          throw new Error("Sexo inválido. Debe ser 'M', 'F' o 'E'.");
  }

  // Generamos la secuencia de 10 dígitos
  const parcial = `${tipoSexo}${formattedDni}`;

  // Secuencia para calcular el verificador
  const secuencia = '2345672345';

  let acumulado = 0;
  for (let i = 0; i < parcial.length; i++) {
      acumulado += parseInt(parcial.charAt(i)) * parseInt(secuencia.charAt(i));
  }

  // Calculamos el dígito verificador
  let verificador = 11 - (acumulado % 11);

  // Verificamos si el dígito verificador es 10 o 11 y ajustamos
  if (verificador === 10) {
      if (tipoSexo === 20 || tipoSexo === 27) {
          verificador = 23;
      } else if (tipoSexo === 30) {
          verificador = 33;
      }
  } else if (verificador === 11) {
      verificador = 0;
  }

  // Devolvemos el CUIL completo en el formato adecuado
  return `${tipoSexo}-${formattedDni}-${verificador}`;
};

// Ejemplo de uso:
try {
  const dni = '12345678';  // DNI de ejemplo
  const sexo = 'M';        // Sexo de la persona (M/F/E)
  const cuil = calculateCuil(dni, sexo);
  console.log(`El CUIL/CUIT calculado es: ${cuil}`);
} catch (error) {
  console.error(error.message);
}


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
        // Si se obtiene acceso, se puede utilizar la cámara
        console.log("Acceso a la cámara concedido");
      })
      .catch((error) => {
        // Si ocurre un error (por ejemplo, permisos denegados), manejarlo aquí
        console.error("Error al acceder a la cámara: ", error);
        alert("No se pudo acceder a la cámara. Asegúrate de que los permisos estén habilitados.");
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
