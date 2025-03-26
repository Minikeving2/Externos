import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Admin.css"; // Importando el nuevo archivo CSS

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [vendedor, setVendedor] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    if (rol !== "admin") {
      navigate("/"); // Si no es admin, redirigir al login
    }
  }, [navigate]);

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleBuscar = async () => {
    try {
      const response = await fetch("https://re5gs22uz2.execute-api.sa-east-1.amazonaws.com/reporte", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendedor,
          fechaInicio: formatFecha(fechaInicio),
          fechaFin: formatFecha(fechaFin),
        }),
      });
      const data = await response.json();
      
      // Convertimos el objeto en un array ordenada por la clave "visitaX"
      const visitasArray = Object.keys(data)
        .sort((a, b) => parseInt(a.replace("visita", "")) - parseInt(b.replace("visita", "")))
        .map((key) => data[key]);

      setResultados(visitasArray);
    } catch (error) {
      console.error("Error al realizar la consulta:", error);
    }
  };

  return (
    <div className="container dashboard-container">
      <div className="form-container">
        <h2>Administración</h2>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Seleccionar Vendedor</label>
            <select
              className="form-select"
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
            >
              <option value="">TODOS</option>
              <option value="V0030">ALEJANDRA</option>
              <option value="V0011">CHEO</option>
              <option value="V0042">EDGAR</option>
              <option value="V0010">MOLINA</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha Inicial</label>
            <input
              type="date"
              className="form-control"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha Final</label>
            <input
              type="date"
              className="form-control"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleBuscar}>
            Buscar
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              localStorage.removeItem("username");
              localStorage.removeItem("rol");
              navigate("/"); // Cerrar sesión y redirigir al login
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
      <div className="table-container">
        {resultados.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Codigo Cliente</th>
                <th>Nombre Cliente</th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((visita, index) => (
                <tr key={index}>
                  <td>{visita.fecha}</td>
                  <td>{visita.hora}</td>
                  <td>{visita.clienteCodigo}</td>
                  <td>{visita.clienteNombre}</td> 
                  <td>
                    <a
                      href={`https://www.google.com/maps?q=${visita.latitud},${visita.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver en Mapa
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
