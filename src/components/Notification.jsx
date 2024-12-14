import React from "react";

function Notification({ message, type }) {
  if (!message) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded text-white ${bgColor}`}>
      {message}
    </div>
  );
}

export default Notification;
