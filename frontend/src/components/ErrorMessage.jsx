import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const ErrorMessage = ({ message = "An error occurred", onRetry }) => {
  return (
    <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-light d-flex align-items-center justify-content-between my-3 rounded-3">
      <div className="d-flex align-items-center gap-3">
        <FaExclamationTriangle className="text-danger fs-4 flex-shrink-0" />
        <div>{message}</div>
      </div>
      {onRetry && (
        <button className="btn btn-outline-danger btn-sm" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
