import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getIncident, resolveIncident, reopenIncident } from "../api/client";

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getIncident(id).then(setIncident);
  }, [id]);

  async function handleResolve() {
    setLoading(true);

    try {
      await resolveIncident(id);

      // refresh data instead of navigating
      const updated = await getIncident(id);
      setIncident(updated);
    } catch (err) {
      console.error("Failed to resolve incident:", err);
    }

    setLoading(false);
  }

  async function handleReopen() {
  setLoading(true);

  try {
    await reopenIncident(id);
    const updated = await getIncident(id);
    setIncident(updated);
  } catch (err) {
    console.error("Failed to reopen incident:", err);
  }

  setLoading(false);
}

  if (!incident) return <p>Loading...</p>;

    return (
        <div>
            <h1>{incident.title}</h1>
            <p>{incident.description}</p>
            <p>Severity: {incident.severity}</p>
            <p>Status: {incident.status}</p>

            {incident.status === "open" && (
                <button onClick={handleResolve} disabled={loading}>
                    {loading ? "Updating..." : "Resolve Incident"}
                </button>
            )}

            {incident.status === "resolved" && (
                <button onClick={handleReopen} disabled={loading}>
                    {loading ? "Updating..." : "Reopen Incident"}
                </button>
            )}

            <br />

            <Link to="/incidents">Return to Incidents List</Link>
        </div>
    );
}