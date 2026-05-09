import { useEffect, useState, useCallback, use } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getIncident, updateIncidentStatus } from "../api/client";
import { useAuth } from "../components/AuthContext";
import { getUserProfile } from "../api/client";
const statusActions = {
  "open": ["assigned", "in_progress"],
  "assigned": ["in_progress", "blocked"],
  "in_progress": ["blocked", "waiting_on_user", "resolved", "in_progress"],
  "blocked": ["in_progress", "waiting_on_vendor"],
  "waiting_on_user": ["in_progress", "resolved"],
  "resolved": ["reopened", "closed"],
  "reopened": ["in_progress"],
  "closed": []
};


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
      signed_by: profile.id,
      signed_by_name: profile.name
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




  if (!incident) return <p>Loading...</p>;
    const allowedActions = statusActions[incident.status] || [];
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
            <div>
              <h3>Status Actions</h3>

              {allowedActions.includes("assigned") && profile?.role === "admin" && (
                <div>

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

              {allowedActions.includes("in_progress") && (
                <button onClick={() => handleUpdateStatus("in_progress")}>
                  In Progress
                </button>
              )}

              {allowedActions.includes("blocked") && (
                <button onClick={() => handleUpdateStatus("blocked")}>
                  Blocked
                </button>
              )}

              {allowedActions.includes("resolved") && profile?.role === "operator" && (
                <button onClick={() => handleUpdateStatus("resolved")}>
                  Resolve
                </button>
              )}

              {allowedActions.includes("closed") && profile?.role === "admin" && (
                <button onClick={() => handleUpdateStatus("closed")}>
                  Close Incident
                </button>
              )}

              {allowedActions.includes("reopened") && (
                <button onClick={() => handleUpdateStatus("reopened")}>
                  Reopen
                </button>
              )}
            </div>

            <br />
            <h3>History</h3>
            <ul>
              {incident.history?.map((h, index) => (
                <li key={index}>
                  <strong> {h.status || h.type}</strong> -{" "}
                  {h.comment || "No comment"} -{" "}
                  {h.updated_by_name } -{" "}
                  {new Date(h.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>

            <Link to="/">Return to Incidents List</Link>
        </div>
    );
}