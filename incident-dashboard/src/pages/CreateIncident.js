import { useState } from "react";
import { createIncident } from "../api/client";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function CreateIncident() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "low",
    actor: "2416ec57-c95b-4359-9aaf-851cd5adcf54"
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const created = await createIncident(form);
      navigate(`/incidents/${created.id}`);
    } catch (err) {
      console.error("Failed to create incident:", err);
    }

    setLoading(false);
  }

  return (
    <div>
      <h1>Create Incident</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />

        <br />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <br />

        <select name="severity" value={form.severity} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Incident"}
        </button>
        <Link to="/">Cancel</Link>
      </form>
    </div>
  );
}