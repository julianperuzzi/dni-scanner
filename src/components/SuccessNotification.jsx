import React from "react";

function SuccessNotification({ onNewScan }) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-green-500 mb-4">Datos guardados exitosamente.</h2>
      <button onClick={onNewScan} className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-700">
        Escanear Otro DNI
      </button>
    </div>
  );
}

export default SuccessNotification;
