import React from 'react';

const DataTable = ({ columns, data, loading, emptyMessage = "Operational data currently unavailable." }) => {
    return (
        <div className="w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-50/50 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-50/50">
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 first:rounded-tl-[2.5rem] last:rounded-tr-[2.5rem]">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/80">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-8 py-6">
                                            <div className="h-4 bg-gray-50 rounded-lg w-full opacity-50"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (data && data.length > 0) ? (
                            data.map((row, i) => (
                                <tr key={i} className="hover:bg-blue-50/30 transition-all duration-300 group">
                                    {columns?.map((col, j) => (
                                        <td key={j} className="px-8 py-6 text-sm text-gray-600 font-medium whitespace-nowrap">
                                            <div className="transition-transform duration-300 group-hover:translate-x-1">
                                                {col.render ? col.render(row) : (row && col.accessor ? row[col.accessor] : '—')}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns?.length || 1} className="px-8 py-24 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-40">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                                            <div className="w-4 h-4 rounded-full border-2 border-blue-100 animate-ping" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Footer Decoration */}
            <div className="px-8 py-4 bg-gray-50/30 border-t border-gray-100 flex justify-between items-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Showing {(data || []).length} Registered Nodes
                </p>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-100" />
                </div>
            </div>
        </div>
    );
};

export default DataTable;
