const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        action: {
            type: String,
            required: true,
        },
        entity: {
            type: String,
            enum: ['User', 'Report', 'Message', 'System'],
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        details: {
            type: Object,
        },
        ipAddress: {
            type: String,
        },
        severity: {
            type: String,
            enum: ['info', 'warning', 'critical'],
            default: 'info',
        }
    },
    { timestamps: true }
);

auditLogSchema.index({ entityId: 1 });
auditLogSchema.index({ userId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
