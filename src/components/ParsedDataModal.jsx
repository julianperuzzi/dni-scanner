import React from "react";

function ParsedDataModal({ parsedData, handleSave, handleCancel, successMessage, error }) {
  return (
    <>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {parsedData && (
        <div
          className="modal"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.1)",
            padding: "10px",
          }}
        >
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
              {parsedData.cuil && parsedData.cuil.inicio && parsedData.cuil.fin && (
                <li>
                  <strong>CUIL:</strong> {parsedData.cuil.inicio}-{parsedData.numeroDni}-{parsedData.cuil.fin}
                </li>
              )}
            </ul>
            <button onClick={handleSave} style={{ marginTop: "10px" }}>
              Guardar Datos
            </button>
            <button onClick={handleCancel} style={{ marginLeft: "10px" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ParsedDataModal;
