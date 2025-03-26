// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";  // Asegúrate de importar el CSS

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://re5gs22uz2.execute-api.sa-east-1.amazonaws.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        // Guardar el usuario y rol en localStorage
        localStorage.setItem("username", data.username);
        localStorage.setItem("rol", data.rol);
        localStorage.setItem("zona", data.zona);

        // Redirigir según el rol
        if (data.rol === "admin") {
          navigate("/admin-dashboard");
        } else if (data.rol === "vendedor") {
          navigate("/vendedor-dashboard");
        }
      } else {
        setError(data.message || "Hubo un error en el login. Intenta nuevamente.");
      }
    } catch (error) {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">IMPACTOS</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-container">
          <label htmlFor="username">Usuario :</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="input-container">
          <label htmlFor="password">Contraseña :</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Cargando..." : "Inicar Sesion"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Login;
