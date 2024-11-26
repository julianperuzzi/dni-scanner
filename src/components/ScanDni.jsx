import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

function DniScanner() {
  const [scannedData, setScannedData] = useState("");
  const [parsedData, setParsedData] = useState(null);

  // Validar formato del escaneo
  const validateAndParse = (rawData) => {
    const parts = rawData.split("@");
    if (parts.length !== 9) return null;

    const [
      tramiteNumber,
      lastName,
      firstName,
      gender,
      dniNumber,
      ejemplar,
      birthDate,
      issueDate,
      cuil,
    ] = parts;

    // Validar fechas
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(birthDate) || !dateRegex.test(issueDate)) return null;

    // Validar número de DNI
    if (!/^\d+$/.test(dniNumber)) return null;

    // Validar género
    if (!["M", "F"].includes(gender)) return null;

    return {
      tramiteNumber,
      lastName,
      firstName,
      gender,
      dniNumber,
      ejemplar,
      birthDate,
      issueDate,
      cuil,
    };
  };

  const handleScan = (err, result) => {
    if (result) {
      const rawData = result.text;
      setScannedData(rawData);

      const parsed = validateAndParse(rawData);
      if (parsed) {
        setParsedData(parsed);
      } else {
        setParsedData(null);
        alert("Formato de escaneo inválido.");
      }
    } else {
      setScannedData("No se encontró ningún código.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <BarcodeScannerComponent width={500} height={500} onUpdate={handleScan} />
      <h2>Resultado del escaneo:</h2>
      <p>{scannedData}</p>
      {parsedData ? (
        <div>
          <h3>Datos Procesados:</h3>
          <ul>
            <li><strong>Número de Trámite:</strong> {parsedData.tramiteNumber}</li>
            <li><strong>Apellidos:</strong> {parsedData.lastName}</li>
            <li><strong>Nombres:</strong> {parsedData.firstName}</li>
            <li><strong>Sexo:</strong> {parsedData.gender}</li>
            <li><strong>DNI:</strong> {parsedData.dniNumber}</li>
            <li><strong>Ejemplar:</strong> {parsedData.ejemplar}</li>
            <li><strong>Fecha de Nacimiento:</strong> {parsedData.birthDate}</li>
            <li><strong>Fecha de Emisión:</strong> {parsedData.issueDate}</li>
            <li><strong>CUIL:</strong> {parsedData.cuil}</li>
          </ul>
        </div>
      ) : (
        <p>No se pudo procesar el escaneo correctamente.</p>
      )}
    </div>
  );
}

export default DniScanner;
