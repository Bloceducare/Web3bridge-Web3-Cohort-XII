import React from "react";
import '../form.css'

const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white shadow-md rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "" }) => {
  return <div className={`p-4 ${className}`} id="card-content">{children}</div>;
};

export { Card, CardContent };
