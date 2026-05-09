import { BrowserRouter, Routes, Route } from "react-router-dom";
import IncidentList from "./pages/IncidentList";
import IncidentDetails from "./pages/IncidentDetails";
import CreateIncident from "./pages/CreateIncident";
import Login from "./pages/Login";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRouteAccess from "./components/RouteAccess";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRouteAccess><IncidentList /></ProtectedRouteAccess>} />
          <Route path="/create" element={<ProtectedRouteAccess><CreateIncident /></ProtectedRouteAccess>} />
          <Route path="/incidents/:id" element={<ProtectedRouteAccess><IncidentDetails /></ProtectedRouteAccess>} />
          <Route path ="/login" element={<Login />}/>
          <Route path="/signup" element={<Signup />}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}




