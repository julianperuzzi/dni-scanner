import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

// Función para calcular el CUIL basado en el DNI y el sexo
// Factores para el cálculo del dígito verificador
const factores = "5432765432";

// Función para convertir una cadena en una matriz de números
const cadenaANumeros = (cadena) => cadena.split("").map((c) => parseInt(c));

// Función para agregar ceros a la izquierda a una cadena hasta alcanzar la longitud deseada
const agregarCerosIzquierda = (cadena, longitud = 8, caracterCero = "0") => {
  const diferencia = longitud - cadena.length;
  return diferencia <= 0 ? cadena : `${caracterCero.repeat(diferencia)}${cadena}`;
};

// Función para combinar dos matrices en una matriz de pares
const combinarMatrices = (matriz1, matriz2) => {
  let i, indice, len1, n, resultado;
  resultado = [];
  for (indice = i = 0, len1 = matriz1.length; i < len1; indice = ++i) {
    n = matriz1[indice];
    resultado.push([n, matriz2[indice]]);
  }
  return resultado;
};

// Función principal para calcular el CUIL
function calcularCUIL(tipoDocumento, numeroDocumento) {
  // Verificar si el tipo de documento es válido
  if (!tipoDocumento || !["M", "F", "E"].includes(tipoDocumento)) {
    return null;
  }

  // Convertir a mayúsculas el tipo de documento
  tipoDocumento = tipoDocumento.toUpperCase();

  // Verificar si el número de documento es un número válido
  if (typeof numeroDocumento !== "number" || isNaN(numeroDocumento)) {
    return null;
  }

  // Pad del número de documento con ceros a la izquierda
  const numeroDocumentoPad = agregarCerosIzquierda(numeroDocumento.toString());

  // Determinar el prefijo según el tipo de documento
  let prefijo = tipoDocumento === "M" ? "20" : tipoDocumento === "F" ? "27" : "30";

  // Crear la cadena con prefijo y número de documento
  const cadenaCompleta = `${prefijo}${numeroDocumentoPad}`;

  // Combinar los factores con los dígitos de la cadena completa
  const combinacion = combinarMatrices(cadenaANumeros(factores), cadenaANumeros(cadenaCompleta));

  // Calcular los productos de las combinaciones
  const productos = combinacion.map((par) => par[0] * par[1]);

  // Calcular la suma de los productos
  const suma = productos.reduce((acumulado, producto) => acumulado + producto, 0);

  // Calcular el resto de la suma dividido por 11
  const resto = suma % 11;

  // Variable para almacenar el dígito verificador
  let digitoVerificador;

  // Determinar el dígito verificador según el tipo de documento
  if (tipoDocumento === "E") {
    // Para extranjeros, el dígito verificador es 11 menos el resto
    digitoVerificador = (11 - resto).toString();
  } else {
    // Para argentinos, el cálculo del dígito verificador es más complejo
    switch (resto) {
      case 0:
        digitoVerificador = "0";
        break;
      case 1:
        prefijo = "23";
        if (tipoDocumento === "F") digitoVerificador = "4";
        if (tipoDocumento === "M") digitoVerificador = "9";
        break;
      default:
        // El dígito verificador es 11 menos el resto
        digitoVerificador = (11 - resto).toString();
    }
  }

  // Devolver el CUIL formateado
  return `${prefijo}-${numeroDocumentoPad}-${digitoVerificador}`;
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
