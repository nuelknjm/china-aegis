# backend/main.py
import asyncio
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from schemas import UserLogin, TokenResponse, IncidentReport
from security import hash_password, verify_password, create_access_token, verify_token

# 1. Inisialisasi FastAPI & Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock DB User
MOCK_USER_DB = {
    "admin": hash_password("admin123")
}

# Mock Data Incident Feed dari DeepSeek Pipeline
MOCK_INCIDENTS = [
    {
        "id": "INC-001",
        "timestamp": "2026-09-18T10:30:00Z",
        "equipment_id": "EXCAVATOR-CAT320",
        "title": "Overheating Hydraulic System",
        "severity": "CRITICAL",
        "root_cause": "Hydraulic Main Relief Valve Leakage & High Temp",
        "oem_part": "CAT-9X3200-VALVE",
        "confidence_score": 0.95
    },
    {
        "id": "INC-002",
        "timestamp": "2026-09-18T11:15:00Z",
        "equipment_id": "DUMPTRUCK-KOM730",
        "title": "Abnormal Engine Vibration",
        "severity": "HIGH",
        "root_cause": "Fuel Injector Cylinder #3 Misfire",
        "oem_part": "KOM-6250-INJECTOR",
        "confidence_score": 0.88
    },
    {
        "id": "INC-003",
        "timestamp": "2026-09-18T12:00:00Z",
        "equipment_id": "BULLDOZER-CAT-D8T",
        "title": "Track Tension Drop Warning",
        "severity": "MEDIUM",
        "root_cause": "Grease Adjuster Seal Wear",
        "oem_part": "CAT-211-7890-SEAL",
        "confidence_score": 0.81
    },
    {
        "id": "INC-004",
        "timestamp": "2026-09-18T12:10:00Z",
        "equipment_id": "LOADER-VOLVO-L250",
        "title": "Minor Transmission Slip",
        "severity": "LOW",
        "root_cause": "Low Transmission Fluid Pressure",
        "oem_part": "VOL-1108-FLUID-KIT",
        "confidence_score": 0.76
    }
]

# --- Endpoints ---

@app.post("/api/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, user_data: UserLogin):
    stored_hash = MOCK_USER_DB.get(user_data.username)
    if not stored_hash or not verify_password(user_data.password, stored_hash):
        raise HTTPException(status_code=401, detail="Username atau password salah")
    
    token = create_access_token({"sub": user_data.username})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/incidents", response_model=list[IncidentReport])
async def get_incident_feed():
    return MOCK_INCIDENTS

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Simulasi indikasi fault acak
            is_fault = random.choice([False, False, False, True])
            
            data = {
                "engine_rpm": random.randint(1500, 2200),
                "hydraulic_pressure": random.randint(180, 250),
                "vibration_rms": round(random.uniform(0.8, 4.2), 2),
                "temperature": random.randint(75, 105),
                "workload_stress_pct": random.randint(65, 92),
                "health_score": random.randint(85, 100),
                "fault_detected": is_fault,
                "diagnostic": {
                    "oem_part": "CAT-9X3200-VALVE",
                    "failure_mode": "Hydraulic Main Relief Valve Leakage & High Temp",
                    "mitigation_steps": [
                        "Inspect main relief valve line pressure",
                        "Check hydraulic oil filter for metallic debris",
                        "Recalibrate pressure regulator valve"
                    ]
                }
            }
            await websocket.send_json(data)
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        print("Client disconnected")