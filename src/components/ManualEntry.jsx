import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ManualEntry() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    apellidos: "",
    nombres: "",
    numeroDni: "",
    fechaNacimiento: "",
    sexo: "",
  });
  const [notification, setNotification] = useState({ message: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Eliminar caracteres no numéricos
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + "/" + value.slice(5, 9);
    setFormData((prevData) => ({ ...prevData, fechaNacimiento: value }));
  };
  

  const handleSave = async () => {
    const { apellidos, nombres, numeroDni, fechaNacimiento, sexo } = formData;

    if (!apellidos || !nombres || !numeroDni || !fechaNacimiento || !sexo) {
      setNotification({ message: "❌ Todos los campos son obligatorios.", type: "error" });
      return;
    }

    try {
      const { error } = await supabase.from("dni_data").insert([{
        user_id: 1,
        last_name: apellidos,
        first_name: nombres,
        dni_number: numeroDni,
        birth_date: formatToISO(fechaNacimiento),
        gender: sexo,
      }]);

      if (error) throw new Error(error.message);

      setNotification({ message: "✅ Datos guardados exitosamente.", type: "success" });

      // Redirige a otra ruta después de guardar
      setTimeout(() => {
        setNotification({ message: "", type: "" });
        navigate("/scan"); // Cambia la ruta según sea necesario
      }, 2000);
    } catch (err) {
      setNotification({ message: "❌ Error al guardar los datos. Intenta nuevamente.", type: "error" });

      setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 2000);
    }
  };

  const handleCancel = () => {
    navigate("/scan"); // Redirige a otra ruta si se cancela
  };

  const formatToISO = (date) => {
    const [day, month, year] = date.split("/");
    return new Date(year, month - 1, day).toISOString();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-xl mx-auto p-4">
        <h3 className="text-2xl font-bold text-center text-blue-600 mb-6">Ingreso Manual de Datos</h3>
        {notification.message && (
          <div className={`fixed top-60 left-1/2 transform text-2xl -translate-x-1/2 bg-indigo-900/70 text-white p-6 rounded-md text-center z-70 font-semibold uppercase`}>
            {notification.message}
          </div>
        )}
        <form className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-700">Apellidos:</label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Nombres:</label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Número de DNI:</label>
            <input
              type="text"
              name="numeroDni"
              value={formData.numeroDni}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
  <label className="block font-semibold text-gray-700">Fecha de Nacimiento (DD/MM/YYYY):</label>
  <input
    type="text"
    name="fechaNacimiento"
    value={formData.fechaNacimiento}
    onChange={handleDateChange}
    maxLength={10}
    placeholder="DD/MM/YYYY"
    className="w-full border border-gray-300 rounded-md p-2"
  />
</div>

     

          <div>
            <label className="block font-semibold text-gray-700">Sexo:</label>
            <select
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Selecciona...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
        </form>
        <div className="flex justify-between mt-6">
          <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md">Guardar</button>
          <button onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default ManualEntry;
