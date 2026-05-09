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




class Incident(BaseModel):
    title: str
    description: str
    severity: str
    actor: str #person responsible for identifying the incident
    owner: str | None = None #person responsible for resolving it

class StatusUpdate(BaseModel):
    status: str
    comment: str
    signed_by: str

class AssignmentUpdate(BaseModel):
    owner: str

class User(BaseModel):
    uid: str
    name: str
    email: str
    role: str

@app.post("/users")
def create_user(user: User):
    data = {
        "id": user.uid,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    db.collection("users").document(user.uid).set(data)
    return data

@app.get("/users")
def list_users():
    docs = db.collection("users").stream()
    return [doc.to_dict() for doc in docs]

@app.get("/users/operators")
def get_ops():
    docs = db.collection("users").where("role","==","operator").stream()
    return [doc.to_dict() for doc in docs]

@app.get("/users/{user_id}")
def get_user_profile(user_id: str):
    user_doc = db.collection("users").document(user_id).get()
    if not user_doc.exists:
        return {"error": "User not found."}
    data = user_doc.to_dict()
    return data

@app.post("/incidents")
def create_incident(incident: Incident):
    doc_id = str(uuid.uuid4())

    data = {
        "id": doc_id,
        "title": incident.title,
        "description": incident.description,
        "severity": incident.severity,
        "status": "open",
        "actor": incident.actor,
        "owner": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    actor_ref = db.collection("users").document(incident.actor).get()
    if not actor_ref.exists:
        return {"error": "something went wrong"}
    actor_name = actor_ref.to_dict()["name"]
    ref = db.collection("incidents").document(doc_id)
    ref.set(data)

    ref.collection("history").add({
        "status": "created",
        "comment": "incident created, yet to be assigned",
        "updated_by": actor_name,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    return {
        "id": doc_id,
        "message" : "incident created"
    }

@app.get("/incidents") #main view of all incidents
def get_incidents(uid: str):
    user_doc = db.collection("users").document(uid).get()
    if not user_doc.exists:
        return {"error": "User not found"}
    user = user_doc.to_dict()
    if user["role"] == "admin":
        docs = db.collection("incidents").stream()
    else:
        docs = ( 
            db.collection("incidents")
            .where("owner", "==", uid)
            .stream()
        )
    return [doc.to_dict() for doc in docs]

@app.patch("/incidents/{incident_id}/status")
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
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    return {"message": "updated"}

@app.patch("/incidents/{incident_id}/assign")
def assign_incident(incident_id: str, update:AssignmentUpdate):
    ref = db.collection("incidents").document(incident_id)
    incident_doc = ref.get()
    if not incident_doc.exists:
        return {"error": "Incident not found"}
    
    actor_id = incident_doc.to_dict()["actor"]
    actor_ref = db.collection("users").document(actor_id).get()
    if not actor_ref.exists:
        return {"error": "Actor not found."}
    actor_role = actor_ref.to_dict()["role"]
    if actor_role != "admin":
        return {"error": "User not permitted access to assign incidents."}

    actor_name = actor_ref.to_dict()["name"]

    owner_ref= db.collection("users").document(update.owner).get()

    if not owner_ref.exists:
        return {"error": "Failed to assign incident."}

    ref.update({
        "owner": update.owner
    })

    owner_name = owner_ref.to_dict()["name"]

    ref.collection("history").add({
        "status": "assigned",
        "comment": f"assigned to operator {owner_name}",
        "updated_by": actor_name,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    return {"message": "Incident assigned successfully."}

@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    ref = db.collection("incidents").document(incident_id)
    doc = ref.get()
    if not doc.exists:
        return {"error": "Incident not found."}
    data = doc.to_dict()
    history = ref.collection("history").stream()
    data["history"] = [h.to_dict() for h in history]
    return data