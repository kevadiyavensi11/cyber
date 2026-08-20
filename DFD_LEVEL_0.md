# 📊 Data Flow Diagram (Level 0 - Context Diagram)

The **Level 0 Data Flow Diagram (Context Diagram)** represents the **CyberGuard Infrastructure** as a single central process and its interactions with all external entities. It defines the boundaries of the system and the information exchanged.

---

## 🏗️ Context Diagram (DFD Level 0)

```mermaid
graph LR
    %% Central Process
    System((🛡️ CyberGuard System))

    %% External Entities
    Citizen[👤 Citizen]
    Officer[👮 Cyber Officer]
    Admin[⚙️ System Admin]
    GAuth[🌐 Google OAuth]
    EmailSMS[📟 Email/SMS Gateway]
    PayGate[💳 Payment Gateway]

    %% Citizen Data Flows
    Citizen -- "Report Submission (GPS, Evidence)" --> System
    Citizen -- "Payment (Fine Settlement)" --> System
    System -- "Reference ID & Notifications" --> Citizen
    System -- "OTP / Security Alerts" --> Citizen

    %% Officer Data Flows
    Officer -- "Investigation & Timeline Updates" --> System
    System -- "Zone-Specific Active Dossiers" --> Officer

    %% Admin Data Flows
    Admin -- "Management Commands & Broadcasts" --> System
    System -- "System Audit Logs & Metrics" --> Admin

    %% External System Flows
    System -- "Identity Verification" --> GAuth
    GAuth -- "Profile Data" --> System
    
    System -- "SMTP/SMS Payloads" --> EmailSMS
    EmailSMS -- "Delivery Status" --> System

    System -- "Payment Initialized" --> PayGate
    PayGate -- "TXN Confirmation" --> System

    %% Styling
    style System fill:#1e293b,stroke:#3b82f6,stroke-width:4px,color:#fff
    style Citizen fill:#0f172a,stroke:#60a5fa,color:#fff
    style Officer fill:#0f172a,stroke:#818cf8,color:#fff
    style Admin fill:#0f172a,stroke:#f472b6,color:#fff
    style GAuth fill:#0f172a,stroke:#fbbf24,color:#fff
    style EmailSMS fill:#0f172a,stroke:#10b981,color:#fff
    style PayGate fill:#0f172a,stroke:#f59e0b,color:#fff
```

---

## 📊 External Entities: Data Exchange Summary

| External Entity | **Provides to System** (Input Data) | **Receives from System** (Output Data) |
| :--- | :--- | :--- |
| **👤 Citizen** | • Incident Details (Title, Type, Desc)<br>• GPS Coordinates (Lat/Lng)<br>• Attached Evidence (Images/Links)<br>• Login Credentials / OAuth Token | • Unique **Reference ID** for tracking<br>• Real-time Investigation Updates<br>• Security Alert Notifications<br>• Account Access Token |
| **👮 Officer** | • Investigation Progress Notes<br>• Status Transitions (Pending → Resolved)<br>• Identity Verification Checks | • Assigned Case Details (Zone-Specific)<br>• Citizen Contact Metadata (Restricted)<br>• Case Severity Analysis Data |
| **⚙️ Admin** | • Global System Configurations<br>• User Management Commands (Block/Unblock)<br>• Broadcast Alert Content | • Comprehensive **Audit Logs**<br>• System-wide Analytics (Graphs/Stats)<br>• Real-time Resource Metrics |
| **🌐 Google OAuth** | • Verified Identity Profile Data<br>• Unique User Identifier (sub) | • Authentication Handshake Request<br>• App-specific Redirect URI |
| **📟 Email/SMS Gateway** | • Delivery Receipts / Error Codes | • OTP Messages (One-Time Password)<br>• Investigation Update Emails<br>• Security Breach Alerts |
| **💳 Payment Gateway** | • Transaction Success/Failure<br>• Secure Transaction Reference (TXN_ID) | • Payment Amount & User Reference<br>• Secure Checkout Handshake |

---

## 📝 Data Flow Definitions

### 1. Citizen ↔️ System
*   **Incoming**:
    *   **Threat Report**: Details including title, type (Phishing/Malware), description, evidence, and **GPS Coordinates (Latitude/Longitude)**.
    *   **Auth Credentials**: Email/Password for manual login.
*   **Outgoing**:
    *   **Reference ID**: A unique tracking ID generated for every new report.
    *   **Real-time Notifications**: Status changes (e.g., "Investigated") pushed via Socket.io.

### 2. Officer ↔️ System
*   **Incoming**:
    *   **Investigation Notes**: Detailed timeline updates and internal assessment of the threat.
    *   **Status Updates**: Changing the lifecycle of a case (Pending -> Investigating -> Resolved).
*   **Outgoing**:
    *   **Zone-Specific Requests**: Reports auto-assigned based on the **Geo-Zone** of the incident.
    *   **Role-Based Data**: Specific access to restricted citizen metadata for case verification.

### 3. Admin ↔️ System
*   **Incoming**:
    *   **Management Commands**: Blocking/Unblocking accounts, clearing system logs.
    *   **Broadcasts**: Global security warnings sent to all citizen panels.
*   **Outgoing**:
    *   **Live HUD Metrics**: Aggregated data on total cases, active officers, and system health.
    *   **Audit Logs**: Comprehensive records of every action taken by any user in the system.

### 4. External Services (Google Auth)
*   **Incoming**: Verification requests from the backend API.
*   **Outgoing**: Validated profile information (Verified Email, Name, Profile Image) used for automatic citizen registration.

---
*Document Version: 1.0.1 | Generated for CyberGuard Infrastructure Documentation*
