from fastapi import FastAPI, Query
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

def add_history(data, event_type): #helper func
    if "history" not in data:
        data["history"] = []

    data["history"].append({
        "type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

class Incident(BaseModel):
    title: str
    description: str
    severity: str

class StatusUpdate(BaseModel):
    status: str
    comment: str
    signed_by:str

@app.post("/incidents")
def create_incident(incident: Incident):
    doc_id = str(uuid.uuid4())

    data = {
        "id": doc_id,
        "title": incident.title,
        "description": incident.description,
        "severity": incident.severity,
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "history": []
    }

    add_history(data, "created")

    db.collection("incidents").document(doc_id).set(data)
    return data

@app.get("/incidents") #main view of all incidents
def list_incidents():
    docs = db.collection("incidents").stream()
    return [doc.to_dict() for doc in docs]

@app.patch("/incidents/{incident_id}")
def update_incident(incident_id: str, update: StatusUpdate):
    ref = db.collection("incidents").document(incident_id)

    # update main status field
    ref.update({
        "status": update.status
    })

    # append to history subcollection
    ref.collection("history").add({
        "status": update.status,
        "comment": update.comment,
        "updated_by": update.signed_by,
        "timestamp": datetime.now(timezone.utc)
    })

    return {"message": "updated"}

@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    doc = db.collection("incidents").document(incident_id).get()
    if not doc.exists:
        return {"error": "Incident not found."}
    return doc.to_dict()

