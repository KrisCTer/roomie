import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Main/Home";
import Profile from "../pages/User/Profile";
import Message from "../pages/User/Message";
import Admin from "../pages/User/Admin";
import Dashboard from "../pages/User/Dashboard";
import AddProperty from "../pages/User/AddProperty";
import MyProperties from "../pages/User/MyProperties";
import PropertyDetail from "../pages/Main/PropertyDetail";
import PropertySearch from "../pages/Main/PropertySearch";
import ContractSigning from "../pages/User/ContractSigning";
import MyContracts from "../pages/User/MyContracts";
import { SocketProvider } from "../contexts/SocketContext";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/message" element={<Message />} />{" "}
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/my-properties" element={<MyProperties />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/property-search" element={<PropertySearch />} />
        <Route path="/contract-signing" element={<ContractSigning />} />
        <Route path="/my-contracts" element={<MyContracts />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
