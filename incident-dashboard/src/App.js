import { BrowserRouter, Routes, Route } from "react-router-dom";
import IncidentList from "./pages/IncidentList";
import IncidentDetails from "./pages/IncidentDetails";
import CreateIncident from "./pages/CreateIncident";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IncidentList />} />
        <Route path="/create" element={<CreateIncident />} />
        <Route path="/incidents/:id" element={<IncidentDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


