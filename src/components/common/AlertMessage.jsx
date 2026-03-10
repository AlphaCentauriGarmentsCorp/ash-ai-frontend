import React from "react";

const AlertMessage = ({ type = "success", title, message }) => {
  const styles = {
    success: {
      container: "bg-green-50 border-green-200",
      icon: "fa-check-circle text-green-500",
      title: "text-green-800",
      message: "text-green-600",
    },
    error: {
      container: "bg-red-50 border-red-200",
      icon: "fa-exclamation-circle text-red-500",
      title: "text-red-800",
      message: "text-red-600",
    },
  };

  const selected = styles[type];

  return (
    <div className={`mb-6 p-4 border rounded-md ${selected.container}`}>
      <div className="flex items-center">
        <i className={`fa-solid ${selected.icon} mr-3`}></i>
        <div>
          <p className={`font-medium ${selected.title}`}>{title}</p>
          {message && (
            <p className={`text-sm mt-1 ${selected.message}`}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertMessage;
