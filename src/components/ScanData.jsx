import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ScanData() {
  const location = useLocation();
  const navigate = useNavigate();
  const [parsedData, setParsedData] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });

  useEffect(() => {
    if (!location.state?.scannedData) {
      navigate("/scan");  // Redirige a la página de escaneo si no hay datos
    } else {
      parsePdf417(location.state.scannedData);
    }
  }, [location, navigate]);

  const parsePdf417 = (code) => {
    try {
      const fields = code.split("@");

      if (fields.length < 8) {
        navigate("/scan"); // Redirige de vuelta a la página de escaneo
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
        cuil: fields[8]
          ? {
              inicio: fields[8].slice(0, 2) || null,
              fin: fields[8].slice(-1) || null,
            }
          : null,
      };

      validateParsedData(parsed);
      setParsedData(parsed);
      setNotification({ message: "", type: "" });
    } catch (err) {
      setParsedData(null);
      setNotification({ message: err.message, type: "error" });
    }
  };

  const correctSpecialChars = (text) => {
    return text.replace(/NXX/g, "Ñ").replace(/UXX/g, "Ü");
  };

  const validateDate = (date) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) {
      navigate("/scan"); // Redirige de vuelta a la página de escaneo
      throw new Error(`Fecha inválida: ${date}`);    
    }
    return date;
  };

  const validateParsedData = (data) => {
    if (!data.numeroDni || !data.apellidos || !data.nombres) {
      navigate("/scan"); // Redirige de vuelta a la página de escaneo
      throw new Error("Faltan datos clave: DNI, apellidos o nombres.");
    }
  };
  

  const handleSave = async () => {
    if (!parsedData) return;
  
    try {
      const { error } = await supabase.from("dni_data").insert([{
        document_number: parsedData.numeroTramite,
        last_name: parsedData.apellidos,
        first_name: parsedData.nombres,
        gender: parsedData.sexo,
        dni_number: parsedData.numeroDni,
        document_type: parsedData.ejemplar,
        birth_date: formatToISO(parsedData.fechaNacimiento),
        issue_date: formatToISO(parsedData.fechaEmision),
        cuil_full: parsedData.cuil ? `${parsedData.cuil.inicio}${parsedData.numeroDni}${parsedData.cuil.fin}` : null,
      }]);
  
      if (error) throw new Error(error.message);
  
      setNotification({ message: "✅ Datos guardados exitosamente.", type: "success" });
  
      // Mostrar notificación por 2 segundos antes de redirigir
      setTimeout(() => {
        setNotification({ message: "", type: "" });
        navigate("/scan"); // Redirige de vuelta a la página de escaneo
      }, 2000);
  
    } catch (err) {
      setNotification({ message: "❌ Error al guardar los datos. Intenta nuevamente.", type: "error" });
      
      // Mostrar notificación por 2 segundos en caso de error
      setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 2000);
    }
  };
  

  const handleCancel = () => {
    navigate("/scan"); // Redirige de vuelta a la página de escaneo
  };

  const formatToISO = (date) => {
    const [day, month, year] = date.split("/");
    return new Date(year, month - 1, day).toISOString();
  };

  return (
    <div className="bg-gray-100">
      <div className="max-w-xl mx-auto p-4">
        <h3 className="text-2xl font-bold text-center text-green-600 mb-6">Datos del DNI Escaneado</h3>
        {notification.message && (
          <div className={`fixed top-60 left-1/2 transform text-2xl -translate-x-1/2 bg-indigo-900/70 text-white p-6 rounded-md text-center z-70 font-semibold uppercase`}>
            {notification.message}
          </div>
        )}
        {parsedData && (
          <ul className="space-y-3 text-left">
            <li><strong>Número de Trámite:</strong> {parsedData.numeroTramite}</li>
            <li><strong>Apellidos:</strong> {parsedData.apellidos}</li>
            <li><strong>Nombres:</strong> {parsedData.nombres}</li>
            <li><strong>Sexo:</strong> {parsedData.sexo}</li>
            <li><strong>Número de DNI:</strong> {parsedData.numeroDni}</li>
            <li><strong>Ejemplar:</strong> {parsedData.ejemplar}</li>
            <li><strong>Fecha de Nacimiento:</strong> {parsedData.fechaNacimiento}</li>
            <li><strong>Fecha de Emisión:</strong> {parsedData.fechaEmision}</li>
            {parsedData.cuil && parsedData.cuil.inicio && parsedData.cuil.fin && (
              <li><strong>CUIL:</strong> {parsedData.cuil.inicio}-{parsedData.numeroDni}-{parsedData.cuil.fin}</li>
            )}
          </ul>
        )}
        <div className="flex justify-between mt-6">
          <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md">Guardar Datos</button>
          <button onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default ScanData;
