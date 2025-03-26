import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css'; // Importando el CSS personalizado

const VendedorDashboard = () => {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState("");
  const [clienteCodigo, setClienteCodigo] = useState(""); // Almacenar el código del cliente
  const [observacion, setObservacion] = useState(""); // Almacenar el código del cliente
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientesEncontrados, setClientesEncontrados] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false); // Modal para búsqueda
  const [visitSaved, setVisitSaved] = useState(false); // Estado para verificar si la visita fue guardada

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    if (rol !== "vendedor") {
      navigate("/"); // Si no es vendedor, redirigir al login
    }
  }, [navigate]);

  // Obtener la fecha y hora actual en Bogotá (formato dd/mm/yyyy y 24 horas)
  const getCurrentDateTime = () => {
    const now = new Date();
    
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0"); // getMonth() devuelve 0-11, sumamos 1
    const year = now.getFullYear();
    
    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
  
    return {
      fecha: `${day}/${month}/${year}`,
      hora: `${hour}:${minute}`,
    };
  };
  

  // Función para obtener latitud y longitud usando la geolocalización
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (error) => {
            reject("Error al obtener la ubicación: " + error.message);
          }
        );
      } else {
        reject("Geolocalización no soportada en este dispositivo.");
      }
    });
  };

  // Función para buscar clientes
  const searchClients = async () => {
    if (!searchTerm) return; // Si no hay término de búsqueda, no hacer nada

    setIsSearching(true);
    setClientesEncontrados([]); // Limpiar los resultados anteriores
    setError(""); // Limpiar error previo

    try {
      const zona = localStorage.getItem("zona"); 
      const name = searchTerm;
      const response = await fetch("https://re5gs22uz2.execute-api.sa-east-1.amazonaws.com/buscar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, zona }),
      });

      const data = await response.json();

      if (response.ok && data.clientes && data.clientes.length > 0) {
        setClientesEncontrados(data.clientes); // Suponiendo que la respuesta tiene un campo 'clientes'
      }
    } catch (error) {
      setError("Error al realizar la búsqueda.");
      setClientesEncontrados([]); // Limpiar resultados si hay error
    } finally {
      setIsSearching(false);
    }
  };

  // Función para agregar un cliente al formulario
  const addClientToForm = (clienteSeleccionado) => {
    setCliente(clienteSeleccionado.nombre); // Setear el nombre en el input visible
    setClienteCodigo(clienteSeleccionado.codigo); // Setear el código en el estado oculto
    setShowSearchModal(false); // Cerrar el modal de búsqueda
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { fecha, hora } = getCurrentDateTime();

    try {
      const location = await getLocation();

      const requestData = {
        clienteNombre: cliente, // Enviar el nombre del cliente
        clienteCodigo: clienteCodigo, // Enviar el código del cliente
        fecha,
        hora,
        latitud: location.lat,
        longitud: location.lon,
        vendedor: localStorage.getItem("username"),
        observacion: observacion
      };

      console.log("Datos a enviar:", requestData);

      const response = await fetch("https://re5gs22uz2.execute-api.sa-east-1.amazonaws.com/saveVisita", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Respuesta de la API:", data);

      if (response.status === 200) {
        alert("Cliente guardado correctamente");

        // Limpiar los campos después de guardar el cliente
        setCliente(""); // Limpiar el nombre del cliente
        setClienteCodigo(""); // Limpiar el código del cliente
        setObservacion(""); // Limpiar el código del cliente
        setVisitSaved(true); // Marcar que la visita fue guardada
      } else {
        setError(data.message || "Hubo un error al guardar el cliente.");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      setError(`Error al conectar con el servidor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Nuevo Impacto</h2>
      <div className="dashboard-content">
        <form onSubmit={handleSubmit} className="client-form">
          <div className="input-container">
            <label htmlFor="cliente">Cliente</label>
            <div className="input-with-button">
              <input
                type="text"
                id="cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                required
                className="input-field"
              />
              <button
                type="button"
                className="search-button"
                onClick={() => setShowSearchModal(true)} // Mostrar modal de búsqueda
              >
                🔍
              </button>
            </div>
          </div>

          <div className="input-container">
            <label htmlFor="cliente">Observacion</label>
            <input
                type="text"
                id="Observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                name= "Observacion"
                className="input-field-obs"
              />
          </div>

          {/* Input oculto para enviar el código del cliente */}
          <input
            type="hidden"
            value={clienteCodigo} // Se almacenará el código aquí
            name="clienteCodigo" // Este será el nombre que se enviará en el formulario
          />

          {/* Mostrar errores fuera del modal solo si no se ha guardado una visita */}
          {error && !visitSaved && !showSearchModal && (
            <p className="error-message">{error}</p>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>

        {/* Modal de búsqueda */}
        {showSearchModal && (
          <div className="modal fade show" tabIndex="-1" aria-hidden="true" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Buscar Cliente</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowSearchModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cliente"
                    className="form-control"
                  />
                  <button
                    onClick={searchClients}
                    className="btn btn-primary mt-2"
                    disabled={isSearching}
                  >
                    {isSearching ? "Buscando..." : "Buscar"}
                  </button>
                  <div className="client-results mt-3">
                    <table className="table mt-3">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isSearching ? (
                          <p>Buscando clientes...</p>
                        ) : clientesEncontrados.length === 0 ? (
                          <tr>
                            <td colSpan="2" className="text-center text-danger">
                              No se encontraron clientes.
                            </td>
                          </tr>
                        ) : (
                          clientesEncontrados.map((cliente) => (
                            <tr key={cliente.id}>
                              <td>{cliente.nombre}</td>
                              <td>
                                <button
                                  onClick={() => addClientToForm(cliente)} // Ahora pasamos todo el objeto cliente
                                  className="btn btn-success"
                                >
                                  Seleccionar
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowSearchModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="logout-container">
          <button
            className="logout-button"
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
    </div>
  );
};

export default VendedorDashboard;
