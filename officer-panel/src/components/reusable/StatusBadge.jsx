import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        "in-review": "bg-blue-100 text-blue-700 border-blue-200",
        resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
        high: "bg-red-100 text-red-700 border-red-200",
        medium: "bg-orange-100 text-orange-700 border-orange-200",
        low: "bg-teal-100 text-teal-700 border-teal-200",
        "Resolved with Fine": "bg-amber-100 text-amber-700 border-amber-200",
        Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
        Pending: "bg-blue-100 text-blue-700 border-blue-200",
    };

    const labels = {
        pending: "Pending",
        "in-review": "In Review",
        resolved: "Resolved",
        high: "High Priority",
        medium: "Medium",
        low: "Low",
        "Resolved with Fine": "Fine Pending",
        Paid: "Paid",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${styles[status] || "bg-gray-100 text-gray-700"}`}>
            {labels[status] || status}
        </span>
    );
};

export default StatusBadge;
