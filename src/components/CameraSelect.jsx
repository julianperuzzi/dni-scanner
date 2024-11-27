import React from "react";

function CameraSelect({ cameras, selectedDeviceId, handleCameraSelect }) {
  return (
    <div className="text-white font-semibold items-center p-4">
      <h4>Selecciona una cámara:</h4>
      <select value={selectedDeviceId} onChange={handleCameraSelect} className="bg-gray-900 border border-gray-600 p-1">
        {cameras.length > 0 ? (
          cameras.map((camera, index) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Cámara ${index + 1}`}
            </option>
          ))
        ) : (
          <option>No se encontraron cámaras.</option>
        )}
      </select>
    </div>
  );
}

export default CameraSelect;
