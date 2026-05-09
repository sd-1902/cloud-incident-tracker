const BASE_URL = "https://incident-api-10665824183.us-central1.run.app";

export async function getIncidents(id) {
  if (!id) return [];
  const res = await fetch(`${BASE_URL}/incidents?uid=${id}`);
  return res.json();
}

export async function getIncident(id) {
  const res = await fetch(`${BASE_URL}/incidents/${id}`);
  return res.json();
}

export async function createIncident(data) {
  const res = await fetch(`${BASE_URL}/incidents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function signupUser(data){
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

export async function updateIncidentStatus(id, data) {
  const res = await fetch(`${BASE_URL}/incidents/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}