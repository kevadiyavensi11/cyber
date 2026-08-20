# 🔄 Report State Transition Diagram

The **State Transition Diagram** represents the lifecycle of a **Cyber Threat Report** as it moves through various operational statuses within the CyberGuard ecosystem.

---

## 🏗️ State Machine (Report Status)

```mermaid
stateDiagram-v2
    [*] --> Pending : "Citizen Submits Report"
    
    Pending --> Assigned : "Auto-Assignment Algorithm / Admin Assignment"
    Pending --> Rejected : "Invalid Report (Incomplete/Duplicate)"
    
    Assigned --> Investigating : "Officer Starts Investigation"
    Assigned --> Rejected : "Initial Review Denied"
    
    Investigating --> Verified : "Threat Authenticated"
    Investigating --> Action_Taken : "Technical/Legal Response Active"
    
    Verified --> Action_Taken : "Response Deployed"
    Action_Taken --> Resolved : "Threat Neutralized"
    Action_Taken --> Resolved_With_Fine : "Neutralized + Admin Fine"
    
    Resolved --> Reopened : "Citizen Disputes Resolution"
    Reopened --> Investigating : "New Evidence Found"
    
    Resolved --> Closed : "Archive (No further action)"
    Rejected --> Closed : "Archive"
    
    Resolved_With_Fine --> Resolved : "Fine Paid Sucessfully"

    state Resolved_With_Fine {
        [*] --> Fine_Pending
        Fine_Pending --> Fine_Paid : "Transaction Confirmed"
    }

    style Pending fill:#f97316,color:#fff
    style Investigating fill:#3b82f6,color:#fff
    style Resolved fill:#22c55e,color:#fff
    style Rejected fill:#ef4444,color:#fff
    style Closed fill:#64748b,color:#fff
```

---

## 📝 Status Definitions

### 1. **Pending**
The initial entry state. The report has been received but not yet assigned to a specific officer for a formal review.

### 2. **Assigned**
The report is tied to a specific Officer's ID. This triggers a notification to the officer to begin their review.

### 3. **Investigating (Active)**
The officer is actively looking into the case. During this state, investigation notes are added to the official timeline, and a chat channel may be opened with the citizen.

### 4. **Verified / Action Taken**
The threat has been confirmed as real. The officer has initiated technical (e.g., blocking a phishing site) or legal protocols.

### 5. **Resolved / Resolved with Fine**
The official conclusion of a case. The threat no longer presents a danger. If a fine is issued, the case remains in a 'Pending Payment' state until the citizen completes the transaction.

### 6. **Rejected**
The report was determined to be out of scope, a duplicate, or lacked sufficient evidence to proceed.

### 7. **Reopened**
A unique state triggered only by the Citizen if they feel the threat persists after the officer has marked it as Resolved.

---
*Document Version: 1.0.0 | Generated for CyberGuard Infrastructure Documentation*
