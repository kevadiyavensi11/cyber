import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const ChartComponent = ({ type = 'area', data, dataKey, colors = ['#3b82f6'] }) => {
    const renderChart = () => {
        switch (type) {
            case 'area':
                return (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '1.5rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                color: '#f1f5f9'
                            }}
                            itemStyle={{ color: '#3b82f6', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase' }}
                            labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={colors[0]}
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                );
            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }}
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '1.5rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        />
                        <Bar
                            dataKey={dataKey}
                            fill={colors[0]}
                            radius={[8, 8, 0, 0]}
                            barSize={32}
                            animationDuration={1500}
                        />
                    </BarChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={10}
                            dataKey="value"
                            stroke="none"
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                    className="hover:opacity-80 transition-opacity"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '1.5rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        />
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            wrapperStyle={{
                                paddingTop: '40px',
                                fontSize: '10px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: '#475569'
                            }}
                        />
                    </PieChart>
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-full w-full opacity-90">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default ChartComponent;
