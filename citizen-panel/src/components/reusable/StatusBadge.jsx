import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: "bg-amber-50 text-amber-600 border-amber-100",
        "in-review": "bg-blue-50 text-blue-600 border-blue-100",
        resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
        high: "bg-red-50 text-red-600 border-red-100",
        medium: "bg-orange-50 text-orange-600 border-orange-100",
        low: "bg-teal-50 text-teal-600 border-teal-100",
        "Resolved with Fine": "bg-amber-50 text-amber-600 border-amber-100",
        Paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
        Pending: "bg-blue-50 text-blue-600 border-blue-100",
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
