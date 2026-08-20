import React from 'react';

const DataTable = ({ columns, data, loading, emptyMessage = "No Data Records Detected" }) => {
    return (
        <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100/50">
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-8 py-6 text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-8 py-6">
                                            <div className="h-5 bg-slate-50 rounded-xl w-full"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length > 0 ? (
                            data.map((row, i) => (
                                <tr key={i} className="hover:bg-blue-50/30 transition-all duration-300 group/row border-l-4 border-transparent hover:border-blue-500">
                                    {columns.map((col, j) => (
                                        <td key={j} className="px-8 py-6 text-sm text-slate-700 font-semibold group-hover/row:text-slate-900 transition-colors">
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-8 py-24 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                        <p className="text-slate-400 font-semibold uppercase text-xs tracking-[0.25em]">{emptyMessage}</p>
                                    </div>
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
