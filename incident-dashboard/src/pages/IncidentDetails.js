import { useEffect, useState, useCallback, use } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getIncident, updateIncidentStatus } from "../api/client";
import { useAuth } from "../components/AuthContext";
import { getUserProfile } from "../api/client";

export default function IncidentDetails() {
  const { id } = useParams();
  //const navigate = useNavigate();

  const [comment, setComment] = useState("");
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const {profile} = useAuth();
  const [operators, setOperators] = useState([]);
  const [selectedOp, setSelectedOp] = useState("");
  const [ownerName, setOwnerName] = useState("");

  const loadPage = useCallback(async () => {
    const data = await getIncident(id);
    setIncident(data);
  }, [id]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (profile?.role !== "admin") return;

    fetch("https://incident-api-10665824183.us-central1.run.app/users/operators")
      .then((res) => res.json())
      .then((data) => setOperators(data))
      .catch(console.error);
  }, [profile]);

  useEffect(() => {

    async function loadOwner() {

      if (!incident?.owner) return;

      try {
        const owner = await getUserProfile(incident.owner);

        setOwnerName(owner.name);

      } catch (err) {
        console.error(err);
      }
    }

    loadOwner();

  }, [incident]);

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
    
    await loadPage();


    setLoading(false);
    setComment("");
  }

  async function handleAssign(){
    if(!selectedOp){
      alert("Please select an operator");
      return;
    }

    await fetch(
      `https://incident-api-10665824183.us-central1.run.app/incidents/${incident.id}/assign`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          owner: selectedOp
        })
      }
    );

    await loadPage();

    alert("Incident assigned");
  }

  async function getOwnerName(actor_id){
    await fetch(
      `https://incident-api-10665824183.us-central1.run.app/users/${actor_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          owner: selectedOp
        })
      }
    );

  }


  if (!incident) return <p>Loading...</p>;

    return (
        <div>
            <h1>{incident.title}</h1>
            <p>{incident.description}</p>
            <p>Assigned To: {ownerName || "Unassigned"}</p>
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
            {profile?.role === "admin" && (
              <div>

                <h3>Assign Operator</h3>

                <select
                  value={selectedOp}
                  onChange={(e) => setSelectedOp(e.target.value)}
                >
                  <option value="">Select Operator</option>

                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>

                <button onClick={handleAssign}>
                  Assign
                </button>

              </div>
            )}
            <h3>History</h3>
            <ul>
              {incident.history?.map((h, index) => (
                <li key={index}>
                  <strong> {h.status || h.type}</strong> -{" "}
                  {h.comment || "No comment"} -{" "}
                  {h.signed_by || "System"} -{" "}
                  {new Date(h.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>

            <Link to="/">Return to Incidents List</Link>
        </div>
    );
}