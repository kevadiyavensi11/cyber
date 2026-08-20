const mongoose = require('mongoose');

const reportSchema = mongoose.Schema(
    {
        threatTitle: { type: String, required: true },
        threatType: {
            type: String,
            required: true,
            enum: [
                'Phishing Attack',
                'Malware Infection',
                'Ransomware',
                'Data Breach',
                'Social Engineering',
                'Identity Theft',
                'Financial Fraud',
                'Unauthorized Access',
                'Suspicious Email / Link',
                'Other Cyber Threat'
            ]
        },
        description: { type: String, required: true },
        urlOrPhone: { type: String },
        evidenceURL: { type: String },
        severity: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Under Investigation', 'Investigating', 'Investigation Completed', 'Payment Pending', 'Payment Completed', 'Awaiting Citizen Response', 'Case Closed', 'Reopened', 'Closed', 'Assigned', 'Verified', 'Rejected'],
            default: 'Pending',
        },

        fineAmount: { type: Number, default: 0 },
        paymentStatus: {
            type: String,
            enum: ['Not Required', 'Pending', 'Completed', 'Paid'],
            default: 'Pending'
        },
        paymentAmount: { type: Number, default: 0 },
        isClosed: { type: Boolean, default: false },
        paymentDate: { type: Date },
        transactionId: { type: String },

        ipAddress: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String },
        zone: {
            type: String,
            required: true,
            enum: [
                "Central",
                "North",
                "South",
                "East",
                "West",
                "North-East",
                "North-West",
                "South-East",
                "South-West"
            ]
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Officer",
        },
        assigned_officer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Officer",
        },
        assignment_type: {
            type: String,
            enum: ["automatic", "manual"],
            default: "automatic"
        },
        reassigned_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reassigned_at: {
            type: Date
        },
        assignedOfficer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Officer",
        },
        investigationNotes: [
            {
                note: String,
                addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        timeline: [
            {
                title: String,
                description: String,
                role: { type: String, enum: ['citizen', 'officer', 'admin', 'system'] },
                timestamp: { type: Date, default: Date.now }
            }
        ],
        evidence: [
            {
                type: { type: String, enum: ['image', 'document', 'link', 'text'] },
                url: String,
                content: String,
                addedAt: { type: Date, default: Date.now }
            }
        ],
        resolution: {
            summary: String,
            date: Date,
            officerName: String,
            finalMessage: String
        },
        aiMetadata: {
            isValid: { type: Boolean, default: false },
            confidence: { type: Number, default: null },
            detectedThreat: { type: String },
            extractedText: { type: String },
            summary: { type: String },
            aiStatus: { 
                type: String, 
                default: 'PENDING'
            }
        },
        reopenAttempts: { type: Number, default: 0 },
        closedAt: { type: Date },
        
        slaDeadline: { type: Date },
        slaStartTime: { type: Date },
        slaStatus: {
            type: String,
            enum: ["ON_TIME", "BREACHED"],
            default: "ON_TIME"
        },
        isSlaBreached: { type: Boolean, default: false }
    },
    { timestamps: true }
);


reportSchema.index({ createdBy: 1, createdAt: -1 });
reportSchema.index({ assignedTo: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ zone: 1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
