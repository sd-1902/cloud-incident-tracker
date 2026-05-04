const BASE_URL = "https://incident-api-10665824183.us-central1.run.app";

export async function getIncidents() {
  const res = await fetch(`${BASE_URL}/incidents`);
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

export async function resolveIncident(id) {
  await fetch(`${BASE_URL}/incidents/${id}?status=resolved`, {
    method: "PATCH"
  });
}

export async function reopenIncident(id) {
  await fetch(`${BASE_URL}/incidents/${id}?status=open`, {
    method: "PATCH"
  });
}