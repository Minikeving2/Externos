import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import VendedorDashboard from "./components/VendedorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import 'bootstrap/dist/css/bootstrap.min.css';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/vendedor-dashboard" element={<VendedorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
