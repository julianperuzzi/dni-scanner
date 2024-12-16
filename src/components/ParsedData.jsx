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
          cuil_full: parsedData.cuil ? `${parsedData.cuil.inicio}${parsedData.numeroDni}${parsedData.cuil.fin}` : null,
        },
      ]);

      if (error) throw new Error(error.message);

      alert("Datos guardados correctamente.");
      navigate("/scanner");
    } catch (error) {
      alert("Error al guardar los datos.");
    }
  };

  const formatToISO = (date) => {
    const [day, month, year] = date.split("/");
    return new Date(year, month - 1, day).toISOString();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Datos Escaneados</h2>
      <ul>
        {Object.keys(parsedData).map((key) => (
          <li key={key}>
            <strong>{key}:</strong> {parsedData[key]}
          </li>
        ))}
      </ul>
      <button onClick={handleSave} className="bg-green-500 p-2 text-white">Guardar</button>
      <button onClick={() => navigate("/scanner")} className="bg-red-500 p-2 text-white">Cancelar</button>
    </div>
  );
}

export default ParsedData;
