from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import uuid
import logging
import asyncio
from datetime import datetime, timezone, timedelta

import bcrypt
import jwt
import httpx
import requests
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, UploadFile, File, Form, Header, Query
from starlette.responses import Response as StarletteResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr

from seed_data import ARTWORKS, PRICING, TESTIMONIALS, JOURNAL, SETTINGS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rosh")

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
OWNER_EMAIL = os.environ.get('OWNER_EMAIL', ADMIN_EMAIL)
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ['EMERGENT_EMAIL_KEY']
EMAIL_FROM_NAME = os.environ['EMAIL_FROM_NAME']

# Object storage
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "roshcharcoal"
_storage_key = None

def init_storage(force=False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key

def put_object(path, data, content_type):
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

app = FastAPI()
api = APIRouter(prefix="/api")


# ---------- auth helpers ----------
def hash_password(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def verify_password(p, h): return bcrypt.checkpw(p.encode(), h.encode())

def create_token(email):
    payload = {"sub": email, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def get_admin(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        ah = request.headers.get("Authorization", "")
        if ah.startswith("Bearer "):
            token = ah[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"email": payload["sub"]}, {"password_hash": 0})
    if not user:
        raise HTTPException(401, "User not found")
    user["_id"] = str(user["_id"])
    return user


class LoginReq(BaseModel):
    email: EmailStr
    password: str

@api.post("/auth/login")
async def login(body: LoginReq, response: Response):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(user["email"])
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"email": user["email"], "name": user.get("name", "Admin"), "token": token}

@api.get("/auth/me")
async def me(admin=Depends(get_admin)):
    return {"email": admin["email"], "name": admin.get("name", "Admin")}

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


# ---------- public content ----------
def clean(doc):
    doc.pop("_id", None)
    return doc

@api.get("/artworks")
async def list_artworks(category: str = None):
    q = {"published": True}
    items = await db.artworks.find(q, {"_id": 0}).to_list(1000)
    items.sort(key=lambda x: x.get("order", 999))
    if category and category not in ("all", "All Works"):
        c = category.lower()
        def match(a):
            return (c == a.get("availability", "").lower() or c == a.get("medium", "").lower()
                    or c == a.get("category", "").lower() or c in [t.lower() for t in a.get("tags", [])]
                    or (c == "commissioned portraits" and a.get("availability") == "Commissioned"))
        items = [a for a in items if match(a)]
    return items

@api.get("/artworks/{slug}")
async def get_artwork(slug: str):
    a = await db.artworks.find_one({"slug": slug}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Artwork not found")
    related = await db.artworks.find({"slug": {"$ne": slug}, "category": a.get("category"), "published": True}, {"_id": 0}).to_list(4)
    if len(related) < 3:
        more = await db.artworks.find({"slug": {"$ne": slug}, "published": True}, {"_id": 0}).to_list(4)
        seen = {r["slug"] for r in related}
        for m in more:
            if m["slug"] not in seen and len(related) < 4:
                related.append(m)
    return {"artwork": a, "related": related[:4]}

@api.get("/pricing")
async def get_pricing():
    items = await db.pricing.find({}, {"_id": 0}).to_list(100)
    items.sort(key=lambda x: x.get("order", 999))
    return items

@api.get("/testimonials")
async def get_testimonials():
    items = await db.testimonials.find({}, {"_id": 0}).to_list(100)
    items.sort(key=lambda x: x.get("order", 999))
    return items

@api.get("/journal")
async def list_journal(category: str = None, q: str = None):
    items = await db.journal.find({"status": "published"}, {"_id": 0, "body": 0}).to_list(1000)
    items.sort(key=lambda x: x.get("date", ""), reverse=True)
    if category and category != "All":
        items = [i for i in items if i.get("category") == category]
    if q:
        ql = q.lower()
        items = [i for i in items if ql in i.get("title", "").lower() or ql in i.get("excerpt", "").lower()]
    return items

@api.get("/journal/{slug}")
async def get_journal(slug: str):
    a = await db.journal.find_one({"slug": slug}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Article not found")
    related = await db.journal.find({"slug": {"$ne": slug}, "status": "published"}, {"_id": 0, "body": 0}).to_list(3)
    return {"article": a, "related": related}

@api.get("/settings")
async def get_settings():
    s = await db.settings.find_one({"key": "site"}, {"_id": 0})
    return s.get("value", SETTINGS) if s else SETTINGS


# ---------- uploads (private reference files) ----------
ALLOWED = {"jpg", "jpeg", "png", "webp", "pdf"}
MIME = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp", "pdf": "application/pdf"}

@api.post("/upload/reference")
async def upload_reference(file: UploadFile = File(...)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "").lower()
    if ext not in ALLOWED:
        raise HTTPException(400, "Unsupported file type. Use JPG, PNG, WEBP or PDF.")
    data = await file.read()
    if len(data) > 15 * 1024 * 1024:
        raise HTTPException(400, "File too large. Maximum size is 15MB.")
    fid = str(uuid.uuid4())
    path = f"{APP_NAME}/references/{fid}.{ext}"
    try:
        result = put_object(path, data, MIME.get(ext, file.content_type or "application/octet-stream"))
    except Exception as e:
        logger.error(f"upload failed: {e}")
        raise HTTPException(502, "Upload failed. Please try again or email your reference.")
    await db.files.insert_one({"id": fid, "storage_path": result["path"], "original_filename": file.filename,
                               "content_type": MIME.get(ext), "size": result.get("size", len(data)),
                               "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"id": fid, "filename": file.filename, "path": result["path"]}

@api.get("/files/{path:path}")
async def download_file(path: str, admin=Depends(get_admin)):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(404, "File not found")
    data, ct = get_object(path)
    return StarletteResponse(content=data, media_type=record.get("content_type", ct))


# ---------- enquiries ----------
class Enquiry(BaseModel):
    type: str = "commission"
    name: str
    email: EmailStr
    phone: str = ""
    contact_method: str = ""
    location: str = ""
    subject: str = ""
    purpose: str = ""
    size: str = ""
    subjects: str = ""
    framing: str = ""
    timeline: str = ""
    budget: str = ""
    message: str = ""
    source: str = ""
    consent: bool = False
    updates_optin: bool = False
    reference_files: list = []
    honeypot: str = ""

async def send_email(to, subject, html, reply_to=None):
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to:
        payload["contact_email"] = reply_to
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(f"{EMAIL_BASE_URL}/api/v1/email/send", headers={"X-Email-Key": EMAIL_KEY}, json=payload)
    r.raise_for_status()

@api.post("/enquiries")
async def create_enquiry(body: Enquiry, request: Request):
    if body.honeypot:
        return {"status": "success", "id": "ignored"}
    if not body.consent:
        raise HTTPException(400, "Please accept the privacy policy to continue.")
    eid = str(uuid.uuid4())
    doc = body.model_dump()
    doc.pop("honeypot", None)
    doc.update({"id": eid, "status": "New", "created_at": datetime.now(timezone.utc).isoformat()})
    await db.enquiries.insert_one({**doc})

    backend = str(request.base_url).rstrip("/")
    file_links = "".join(
        f'<li><a href="{backend}/api/files/{f.get("path")}">{f.get("filename")}</a> (admin login required)</li>'
        for f in body.reference_files) or "<li>None</li>"
    admin_html = f"""<div style="font-family:Arial,sans-serif;color:#1c1c1a">
    <h2 style="font-weight:normal">New {body.type} enquiry — Rosh Charcoal</h2>
    <table cellpadding="6" style="border-collapse:collapse">
    <tr><td><b>Name</b></td><td>{body.name}</td></tr>
    <tr><td><b>Email</b></td><td>{body.email}</td></tr>
    <tr><td><b>Phone/WhatsApp</b></td><td>{body.phone}</td></tr>
    <tr><td><b>Preferred contact</b></td><td>{body.contact_method}</td></tr>
    <tr><td><b>Location</b></td><td>{body.location}</td></tr>
    <tr><td><b>Subject</b></td><td>{body.subject}</td></tr>
    <tr><td><b>Purpose</b></td><td>{body.purpose}</td></tr>
    <tr><td><b>Size</b></td><td>{body.size}</td></tr>
    <tr><td><b>Subjects</b></td><td>{body.subjects}</td></tr>
    <tr><td><b>Framing</b></td><td>{body.framing}</td></tr>
    <tr><td><b>Timeline</b></td><td>{body.timeline}</td></tr>
    <tr><td><b>Budget</b></td><td>{body.budget}</td></tr>
    <tr><td><b>How they found us</b></td><td>{body.source}</td></tr>
    </table>
    <p><b>Message:</b><br>{body.message}</p>
    <p><b>Reference files:</b></p><ul>{file_links}</ul></div>"""
    customer_html = f"""<div style="font-family:Arial,sans-serif;color:#1c1c1a;max-width:520px">
    <h2 style="font-weight:normal">Thank you for sharing your idea.</h2>
    <p>Dear {body.name},</p>
    <p>Your enquiry has been received, and Rosh Charcoal will get back to you soon. Every portrait begins with a conversation, and I look forward to hearing more about the story you'd like to preserve.</p>
    <p style="color:#73736e">— Rosh Charcoal<br>roshcharcoal@gmail.com · +91 9035615236</p></div>"""

    email_ok = True
    try:
        await send_email(OWNER_EMAIL, f"New {body.type} enquiry from {body.name}", admin_html, reply_to=body.email)
        await send_email(body.email, "Your enquiry has been received — Rosh Charcoal", customer_html)
    except Exception as e:
        email_ok = False
        logger.error(f"email send failed for enquiry {eid}: {e}")
        await db.enquiries.update_one({"id": eid}, {"$set": {"email_failed": True}})
    return {"status": "success", "id": eid, "email_sent": email_ok}


# ---------- admin ----------
@api.get("/admin/enquiries")
async def admin_enquiries(admin=Depends(get_admin)):
    items = await db.enquiries.find({}, {"_id": 0}).to_list(1000)
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items

@api.patch("/admin/enquiries/{eid}")
async def update_enquiry(eid: str, body: dict, admin=Depends(get_admin)):
    await db.enquiries.update_one({"id": eid}, {"$set": {"status": body.get("status", "New")}})
    return {"ok": True}

class SettingsUpdate(BaseModel):
    value: dict

@api.put("/admin/settings")
async def update_settings(body: SettingsUpdate, admin=Depends(get_admin)):
    await db.settings.update_one({"key": "site"}, {"$set": {"value": body.value}}, upsert=True)
    return {"ok": True}

@api.get("/")
async def root():
    return {"message": "Rosh Charcoal API"}


app.include_router(api)
app.add_middleware(CORSMiddleware, allow_credentials=True,
                   allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
                   allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup():
    # admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if not existing:
        await db.users.insert_one({"email": ADMIN_EMAIL.lower(), "password_hash": hash_password(ADMIN_PASSWORD),
                                   "name": "Rosh", "role": "admin"})
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL.lower()}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
    # seed content
    if await db.artworks.count_documents({}) == 0:
        await db.artworks.insert_many([{**a, "published": True} for a in ARTWORKS])
    if await db.pricing.count_documents({}) == 0:
        await db.pricing.insert_many([{**p} for p in PRICING])
    if await db.testimonials.count_documents({}) == 0:
        await db.testimonials.insert_many([{**t} for t in TESTIMONIALS])
    if await db.journal.count_documents({}) == 0:
        await db.journal.insert_many([{**j, "status": "published"} for j in JOURNAL])
    if await db.settings.find_one({"key": "site"}) is None:
        await db.settings.insert_one({"key": "site", "value": SETTINGS})
    try:
        init_storage()
    except Exception as e:
        logger.error(f"storage init failed: {e}")
    logger.info("Rosh Charcoal API ready")

@app.on_event("shutdown")
async def shutdown():
    client.close()
