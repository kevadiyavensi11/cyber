import React from 'react';

const StatusBadge = ({ status }) => {
    const s = String(status || 'Pending').toLowerCase();

    const styles = {
        pending: "bg-amber-100 text-amber-600 border-amber-200",
        assigned: "bg-blue-100 text-blue-600 border-blue-200",
        verified: "bg-indigo-100 text-indigo-600 border-indigo-200",
        investigating: "bg-purple-100 text-purple-600 border-purple-200",
        "action taken": "bg-teal-100 text-teal-600 border-teal-200",
        resolved: "bg-emerald-100 text-emerald-600 border-emerald-200",
        rejected: "bg-red-100 text-red-600 border-red-200",
        "resolved with fine": "bg-amber-100 text-amber-600 border-amber-200",
        paid: "bg-emerald-100 text-emerald-600 border-emerald-200",
    };

    const labels = {
        pending: "Pending",
        assigned: "Assigned",
        verified: "Verified",
        investigating: "Investigating",
        "action taken": "Action Taken",
        resolved: "Resolved",
        rejected: "Rejected",
        "resolved with fine": "Fine Pending",
        paid: "Paid",
    };

    return (
        <span className={`px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-300 ${styles[s] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
            {labels[s] || status}
        </span>
    );
};

export default StatusBadge;
