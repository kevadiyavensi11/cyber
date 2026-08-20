# 🛡️ Sequence Diagram: Incident Reporting Flow

The **Sequence Diagram** illustrates the end-to-end operational flow between all actors (Citizen, Officer, and Admin) and the internal backend services (Database and Notification Engine).

---

## 🏗️ End-to-End Sequence (Threat Lifecycle)

```mermaid
sequenceDiagram
    autonumber
    
    actor Citizen as 👤 Citizen
    participant FE as 🖥️ Citizen Frontend
    participant BE as ⚙️ CyberGuard Backend
    participant DB as 💾 MongoDB Store
    actor Officer as 👮 Cyber Officer
    participant OFE as 🏛️ Officer Command Panel
    actor Admin as ⚙️ System Admin

    %% Phase 1: Authentication
    Citizen->>FE: Input Login Credentials
    FE->>BE: POST /api/auth/login
    BE->>DB: Query User Role/Status
    DB-->>BE: User Record Found
    BE-->>FE: Return JWT & Role-Based Access

    %% Phase 2: Report Submission
    Citizen->>FE: File Cyber Report (GPS + Evidence)
    FE->>BE: POST /api/reports/create
    
    Note over BE: Auto-Assignment Algorithm Logic:<br/>Find Officer with Lowest Workload<br/>in the same Zone.
    
    BE->>DB: Create Report & Assign Officer ID
    DB-->>BE: Report Saved (Reference ID)
    
    BE->>DB: Send Notification Entry
    BE-->>FE: Return Confirmation (Uplink Established)

    %% Phase 3: Investigation
    BE-->>OFE: Socket.io Alert (New Assignment)
    Officer->>OFE: Review Incident Dossier
    Officer->>OFE: Add Investigation Note
    OFE->>BE: POST /api/reports/:id/notes
    BE->>DB: Update Report Timeline
    BE-->>FE: Push Real-time Update to Citizen

    %% Phase 4: Resolution
    Officer->>OFE: Set Status to 'Resolved'
    OFE->>BE: PUT /api/reports/update-status/:id
    
    Note over BE: If Fine Required:<br/>Calculate fine & set Status to 'Resolved with Fine'
    
    BE->>DB: Finalize Case & Update Timeline
    BE-->>FE: Final Status Notification
    BE-->>Admin: Log Incident Resolution in Audit Log

    %% Phase 5: Feedback
    Citizen->>FE: View Resolution Summary
    FE->>BE: GET /api/reports/:id
    BE-->>FE: Return Final Processed Dossier
```

---

## 🔍 Flow Breakdown

### 1. **Authentication (Uplink)**
The citizen must establish a secure session with a valid JWT (JSON Web Token). The system enforces that roles (Citizen, Officer, Admin) are strictly separated.

### 2. **Submission & Intelligent Assignment**
When the report is created, the system doesn't just store it:
*   It captures the **IP Address** and **GPS coordinates**.
*   It immediately runs the **Auto-Assignment Logic**, which finds the Officer with the **lowest current workload** (fewest active reports) in the citizen's specific geographical zone.

### 3. **Investigation & Real-time Sync**
Any note added by the officer is immediately "broadcasted" via the **Notification Engine**. The Citizen's dashboard updates in real-time using Socket.io, eliminating the need to refresh the page.

### 4. **Administrative Audit**
Every status transition is logged. If an officer resolves a case, the system notifies the Admin, ensuring high-level quality control and accountability.

---
*Document Version: 1.0.0 | Generated for CyberGuard Infrastructure Documentation*
