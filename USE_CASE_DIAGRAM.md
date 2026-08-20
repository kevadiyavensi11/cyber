# 👥 Use Case Diagram

The **Use Case Diagram** defines the functional requirements of the **CyberGuard** system by showing the interactions between the primary actors and the system's core functionalities.

---

## 🏗️ System Use Cases

```mermaid
useCaseDiagram
    actor "👤 Citizen" as Citizen
    actor "👮 Cyber Officer" as Officer
    actor "⚙️ System Admin" as Admin
    actor "🌐 Google Auth" as OAuth

    package "CyberGuard Infrastructure" {
        usecase "🔐 Authenticate (Login/Signup)" as UC1
        usecase "📝 File Cyber Report" as UC2
        usecase "📡 Track Report Timeline" as UC3
        usecase "💬 Chat with Officer" as UC4
        usecase "💳 Pay Fine (If applicable)" as UC5
        
        usecase "📋 View Assigned Cases" as UC6
        usecase "🔍 Investigate & Add Notes" as UC7
        usecase "🔄 Update Case Status" as UC8
        usecase "📢 Broadcast Warning" as UC9
        
        usecase "📈 System Analytics HUD" as UC10
        usecase "👤 Manage User status" as UC11
        usecase "🛠️ Re-assign Officers" as UC12
    }

    %% Citizen Interactions
    Citizen --> UC1
    Citizen --> UC2
    Citizen --> UC3
    Citizen --> UC4
    Citizen --> UC5
    
    %% Officer Interactions
    Officer --> UC1
    Officer --> UC6
    Officer --> UC7
    Officer --> UC8
    Officer --> UC9
    Officer --> UC4

    %% Admin Interactions
    Admin --> UC1
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC9

    %% System Interactions
    UC1 ..> OAuth : "verifies identity"
```

---

## 🔑 Actor Descriptions

### 1. Citizen
The primary end-user who reports incidents. They have limited access, restricted to their own reports and public security broadcasts.

### 2. Cyber Officer
Law enforcement personnel responsible for investigating assigned dossiers. They can interact with citizens via chat and update the official timeline of a case.

### 3. System Admin
The super-user with global oversight. They do not investigate cases personally but ensure system integrity, manage officer workloads, and monitor global threat trends.

### 4. Google OAuth (Supporting Actor)
An external authentication provider that simplifies the onboarding process for citizens while ensuring email verification.

---
*Document Version: 1.0.0 | Generated for CyberGuard Infrastructure Documentation*
