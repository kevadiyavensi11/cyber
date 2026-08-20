import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const DashboardCard = ({ label, value, trend, trendValue, icon: Icon, color }) => {
    return (
        <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div className="stat-label">{label}</div>
                {Icon && (
                    <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: `${color}15`, color: color }}>
                        <Icon size={20} />
                    </div>
                )}
            </div>
            <div className="stat-value">{value}</div>
            <div className={`stat-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
                {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{trendValue}% from last month</span>
            </div>
        </div>
    );
};

export const StatsGrid = ({ stats }) => {
    return (
        <div className="stats-grid">
            {stats.map((stat, index) => (
                <DashboardCard key={index} {...stat} />
            ))}
        </div>
    );
};
