import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DashboardCard = ({ title, value, icon: Icon, color = "primary", percentage }) => {
    // Standardize colors for richer aesthetics
    const getStandardizedColor = (c) => {
        if (c === "blue" || c === "#3b82f6" || c === "#0ea5e9") return "primary";
        if (c === "emerald" || c === "success" || c === "#10b981") return "success";
        if (c === "amber" || c === "warning" || c === "#f59e0b") return "warning";
        if (c === "danger" || c === "red" || c === "#ef4444") return "danger";
        return c;
    };

    const standardizedColor = getStandardizedColor(color);

    const themeStyles = {
        primary: {
            light: "from-blue-500 via-blue-600 to-indigo-600",
            dark: "from-blue-700 via-blue-800 to-indigo-950"
        },
        success: {
            light: "from-emerald-400 via-emerald-500 to-teal-600",
            dark: "from-emerald-600 via-emerald-800 to-teal-950"
        },
        warning: {
            light: "from-amber-300 via-orange-400 to-orange-500",
            dark: "from-amber-600 via-orange-700 to-orange-900"
        },
        danger: {
            light: "from-red-400 via-red-500 to-rose-600",
            dark: "from-red-600 via-red-800 to-rose-950"
        },
        secondary: {
            light: "from-slate-400 via-slate-500 to-slate-600",
            dark: "from-slate-700 via-slate-800 to-slate-950"
        }
    };

    const styles = themeStyles[standardizedColor] || themeStyles.primary;

    return (
        <div className={`relative p-8 rounded-[2.5rem] bg-gradient-to-br ${styles.light} dark:${styles.dark} shadow-2xl dark:shadow-none hover:-translate-y-2 transition-all duration-500 group border border-white/20 dark:border-white/10 active:scale-[0.98] overflow-hidden`}>
            {/* Background Decorative Blob for Depth */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-20 group-hover:scale-150 transition-transform duration-1000 blur-3xl opacity-50" />

            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="flex items-center justify-between">
                    <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 text-white shadow-inner group-hover:rotate-6 transition-transform duration-500">
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    {percentage !== undefined && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-semibold tracking-widest uppercase text-white border border-white/10">
                            {percentage > 0 ? <TrendingUp size={12} /> : percentage < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                            {Math.abs(percentage)}%
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-4xl font-semibold text-white tracking-tighter leading-none">{value}</h3>
                    <p className="text-[10px] font-semibold uppercase text-white/60 tracking-[0.25em] leading-none mb-1">{title}</p>
                </div>
            </div>

            {/* Glossy Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </div>
    );
};

export default DashboardCard;
