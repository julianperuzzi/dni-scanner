import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ParsedData() {
  const location = useLocation();
  const navigate = useNavigate();
  const { parsedData } = location.state || {};

  if (!parsedData) {
    navigate("/scanner");
    return null;
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("dni_data").insert([
        {
          document_number: parsedData.numeroTramite,
          last_name: parsedData.apellidos,
          first_name: parsedData.nombres,
          gender: parsedData.sexo,
          dni_number: parsedData.numeroDni,
          document_type: parsedData.ejemplar,
          birth_date: formatToISO(parsedData.fechaNacimiento),
          issue_date: formatToISO(parsedData.fechaEmision),
          cuil_full: parsedData.cuil || null,
        },
      ]);

      if (error) throw new Error(error.message);

      alert("Datos guardados correctamente.");
      navigate("/scanner");
    } catch (error) {
      alert("Error al guardar los datos: " + error.message);
    }
  };

  const formatToISO = (date) => {
    const [day, month, year] = date.split("/");
    return new Date(year, month - 1, day).toISOString();
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Datos Escaneados</h2>
      <ul className="space-y-4">
        <li>
          <strong className="text-gray-600">Número de Trámite:</strong>{" "}
          <span className="text-gray-800">{parsedData.numeroTramite}</span>
        </li>
        <li>
          <strong className="text-gray-600">Apellidos:</strong>{" "}
          <span className="text-gray-800">{parsedData.apellidos}</span>
        </li>
        <li>
          <strong className="text-gray-600">Nombres:</strong>{" "}
          <span className="text-gray-800">{parsedData.nombres}</span>
        </li>
        <li>
          <strong className="text-gray-600">Sexo:</strong>{" "}
          <span className="text-gray-800">{parsedData.sexo}</span>
        </li>
        <li>
          <strong className="text-gray-600">DNI:</strong>{" "}
          <span className="text-gray-800">{parsedData.numeroDni}</span>
        </li>
        <li>
          <strong className="text-gray-600">Ejemplar:</strong>{" "}
          <span className="text-gray-800">{parsedData.ejemplar}</span>
        </li>
        <li>
          <strong className="text-gray-600">Fecha de Nacimiento:</strong>{" "}
          <span className="text-gray-800">{parsedData.fechaNacimiento}</span>
        </li>
        <li>
          <strong className="text-gray-600">Fecha de Emisión:</strong>{" "}
          <span className="text-gray-800">{parsedData.fechaEmision}</span>
        </li>
        {parsedData.cuil && (
          <li>
            <strong className="text-gray-600">CUIL:</strong>{" "}
            <span className="text-gray-800">{parsedData.cuil}</span>
          </li>
        )}
      </ul>
      <div className="mt-6 flex justify-between">
        <button
          onClick={handleSave}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded shadow"
        >
          Guardar
        </button>
        <button
          onClick={() => navigate("/scanner")}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded shadow"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default ParsedData;
