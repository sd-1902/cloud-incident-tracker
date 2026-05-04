import { useEffect, useState } from "react";
import { getIncidents } from "../api/client";
import { Link } from "react-router-dom";
import { createIncident } from "../api/client";

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    getIncidents()
      .then((data) => {
        console.log("INCIDENT DATA:", data);
        setIncidents(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Incidents</h1>
      <Link to="/create">Create Incident</Link>
      <ul>
        {incidents.map((i) => (
          <li key={i.id}>
            <Link to={`/incidents/${i.id}`}>
              {i.title}
            </Link>
            {" "} - {i.status}
          </li>
        ))}
      </ul>
    </div>
  );
}