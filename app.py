from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import firestore
from datetime import datetime,timezone
import uuid 
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
db = firestore.Client()

class Incident(BaseModel):
    title: str
    description: str
    severity: str

@app.post("/incidents") #called when incident is reported
def create_incident(incident: Incident):
    doc_id = str(uuid.uuid4())
    data = {
        "id": doc_id,
        "title": incident.title,
        "description": incident.description,
        "severity": incident.severity,
        "status": "open", #default
        "created_at": datetime.now(timezone.utc)
    } #document storing incident data

    db.collection("incidents").document(doc_id).set(data)
    return data

@app.get("/incidents") #main view of all incidents
def list_incidents():
    docs = db.collection("incidents").stream()
    return [doc.to_dict() for doc in docs]

@app.patch("/incidents/{incident_id}") #called when an incident is resolved
def update_incident(incident_id: str, status: str):
    ref = db.collection("incidents").document(incident_id)
    ref.update({"status" : status})
    return {"message": "updated"}

@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    doc = db.collection("incidents").document(incident_id).get()
    if not doc.exists:
        return {"error": "Incident not found."}
    return doc.to_dict()

