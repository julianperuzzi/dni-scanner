import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function ScanResult({ data, onSaveSuccess, onNewScan }) {
  const [error, setError] = useState(null);

  const handleSave = async () => {
    try {
      const { data: savedData, error } = await supabase.from("dni_data").insert([data]);
      if (error) throw error;
      onSaveSuccess();
    } catch (err) {
      setError("Error al guardar los datos. Intenta nuevamente.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Datos Escaneados</h2>
      <pre className="bg-gray-700 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button onClick={handleSave} className="bg-green-500 px-4 py-2 rounded hover:bg-green-700">
        Guardar Datos
      </button>
      <button onClick={onNewScan} className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-700 mt-2">
        Escanear Otro DNI
      </button>
    </div>
  );
}

export default ScanResult;
