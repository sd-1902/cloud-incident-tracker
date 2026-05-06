import { useEffect, useState } from "react";
import { getIncidents } from "../api/client";
import { Link } from "react-router-dom";
import { createIncident } from "../api/client";

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIncidents()
      .then((data) => {
        console.log("INCIDENT DATA:", data);
        setIncidents(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) {
    return <p>Loading incidents...</p>;
  }

  return (
    <div>
      <h1>Incidents</h1>
      <Link to="/create">Create Incident</Link>
      <ul>
        {Array.isArray(incidents) && incidents.length > 0 ? (
          incidents.map((i) => (
            <li key={i.id}>
              <Link to={`/incidents/${i.id}`}>
                {i.title}
              </Link>
              {" "} - {i.status}
            </li>
          ))
        ) : (
          <p>No incidents found</p>
        )}
      </ul>
    </div>
  );
}