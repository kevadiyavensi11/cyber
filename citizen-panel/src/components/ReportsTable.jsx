import React from 'react';
import { MoreHorizontal, ExternalLink } from 'lucide-react';

const ReportsTable = ({ reports, onAction }) => {
    return (
        <div className="table-container animate-fade-in">
            <div className="table-header">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Reports</h3>
                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>View All</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Severity</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report) => (
                            <tr key={report._id}>
                                <td style={{ fontWeight: 600 }}>#{report._id.slice(-6)}</td>
                                <td>{report.category}</td>
                                <td>{report.location}</td>
                                <td>
                                    <span style={{
                                        color: report.severity === 'high' ? '#ef4444' : report.severity === 'medium' ? '#f59e0b' : '#3b82f6',
                                        fontWeight: 600,
                                        textTransform: 'capitalize'
                                    }}>
                                        {report.severity}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-pill status-${report.status.toLowerCase()}`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => onAction && onAction(report)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    >
                                        <ExternalLink size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {reports.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No reports found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default ReportsTable;
