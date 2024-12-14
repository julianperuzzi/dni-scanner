import React from "react";

function ParsedDataModal({ parsedData, handleSave, handleCancel, handleRescan, successMessage, error }) {
  return (
    <>
      {successMessage && (
        <div className="bg-green-500 text-white p-3 rounded-md text-center mb-4">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md text-center mb-4">
          {error}
        </div>
      )}
      {parsedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 animate-fade-in-down">
            <h3 className="text-2xl font-bold text-green-600 text-center mb-6">
              <i className="fas fa-id-card mr-2"></i>Datos del DNI Escaneado
            </h3>
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
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Guardar Datos
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleRescan}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Escanear Otro DNI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind Animations */}
      <style>
        {`
          .animate-fade-in-down {
            animation: fade-in-down 0.3s ease-out;
          }
          @keyframes fade-in-down {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </>
  );
}

export default ParsedDataModal;
