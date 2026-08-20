import React from 'react';

const DataTable = ({ columns, data, loading, emptyMessage = "No data available." }) => {
    return (
        <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-6 py-5">
                                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length > 0 ? (
                            data.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    {columns.map((col, j) => (
                                        <td key={j} className="px-6 py-5 text-sm text-gray-700 font-medium">
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-20 text-center">
                                    <p className="text-gray-400 font-medium">{emptyMessage}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
