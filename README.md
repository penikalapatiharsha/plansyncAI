# PlanSync AI: Autonomous Plan Onboarding & Hyper-Automation Engine

PlanSync AI is a full-stack, enterprise-grade data ingestion and automation platform designed to streamline corporate client onboarding within institutional retirement recordkeeping systems. 

The platform addresses a major industry bottleneck: manually parsing dense, unstructured multi-page legal PDFs (Plan Specifications) and cross-referencing them with messy payroll census files. By pairing an advanced **Multi-Agent AI Verification Loop** with a **Deterministic Data Cleansing Engine**, PlanSync AI cuts operational processing time from hours to seconds while maintaining perfect administrative compliance.

---

## 🚀 System Architecture & Core Features

### 1. Multi-Agent AI Verification Loop (Unstructured Extraction)
Instead of relying on a single, non-deterministic LLM call that is prone to missing subtle legal clauses, the backend utilizes an adversarial **Engineer-Auditor design pattern**:
* **The Implementation Agent (Agent 1):** Extracts raw legal text blocks into a strict data contract enforced by **OpenAI Structured Outputs (Pydantic)**.
* **The Compliance Auditor Agent (Agent 2):** Cross-examines the drafted JSON configuration against the source document text to isolate missed stipulations (e.g., seasonal eligibility, discretionary limits, or termination rules), returning structured feedback for automated self-correction.

### 2. Rules-Driven Data Scrubbing Engine (Deterministic Execution)
Once the plan specifications are verified by the human-in-the-loop canvas, the backend instantly hooks those operational parameters (e.g., baseline auto-enrollment percentage, minimum age requirements) to an automated data pipeline that:
* Standardizes misformatted payroll records (e.g., auto-capitalizing casing anomalies).
* Automatically enforces default deferral rates on unpopulated fields using the AI-extracted rules.
* Isolates legal plan violations (e.g., underage employees or status conflicts) into a real-time **Exceptions Queue** for operational review.

### 3. Reactive Human-in-the-Loop Canvas
A type-safe **React + TypeScript** interface built with Vite that provides decoupled drag-and-drop ingestion hubs, real-time metric counters, synchronized state-locking between operational stages, and editable canvases to review parameters prior to recordkeeping system commitment.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, TypeScript, Vite, Lucide React (UI Assets)
* **Backend:** Python 3.10+, FastAPI (Asynchronous Gateway), PyMuPDF (Stream Extraction)
* **AI Orchestration:** OpenAI API (GPT-4o-mini Engine), Pydantic v2 (Schema Enforcement)

---

## 💻 Local Installation & Setup

### Backend Architecture Setup
1. Navigate to the backend directory and spin up a virtual environment:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
