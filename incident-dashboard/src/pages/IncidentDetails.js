import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getIncident, resolveIncident, reopenIncident, updateIncidentStatus } from "../api/client";

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [comment, setComment] = useState("");
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getIncident(id).then(setIncident);
  }, [id]);

  async function handleUpdateStatus(newStatus) {
    setLoading(true);
    if (!comment.trim()) {
    alert("Comment is required");
    return;}

    await updateIncidentStatus(incident.id, {
      status: newStatus,
      comment: comment,
      signed_by: "test-user"
    });
    const updated = await getIncident(incident.id);
    setIncident(updated);


    setLoading(false);
    setComment("");
  }


  if (!incident) return <p>Loading...</p>;

    return (
        <div>
            <h1>{incident.title}</h1>
            <p>{incident.description}</p>
            <br />
            <p>Severity: {incident.severity}</p>
            <br />
            <p>Status: {incident.status}</p>

            <br />
            <textarea placeholder="Add comment..." value={comment} onChange={(e) => setComment(e.target.value)}/>
            <br />
            {incident.status === "open" && (
                <button onClick={() => handleUpdateStatus("resolved")} disabled={loading}>Mark incident as resolved</button>
            )}

            {incident.status === "resolved" && (
                <button onClick={() => handleUpdateStatus("open")} disabled={loading}>Re-open Incident</button>
            )}

            <br />
            <h3>History</h3>
            <ul>
              {incident.history?.map((h, index) => (
                <li key={index}>
                  {h.type} — {new Date(h.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>

            <Link to="/incidents">Return to Incidents List</Link>
        </div>
    );
}