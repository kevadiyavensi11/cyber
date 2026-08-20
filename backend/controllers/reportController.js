const Report = require('../models/Report');
const Message = require('../models/Message');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { createNotification } = require('../utils/notificationUtils');
const { createLog } = require('./systemLogController');
const { resolveZone } = require('../utils/zoneResolver');
const Zone = require('../models/Zone');
const { analyzeThreatImage } = require('../utils/geminiService');
const { calculateSLA } = require('../utils/slaCalculator');
const fs = require('fs');
const path = require('path');


const Officer = require('../models/Officer');

// @desc    Create a new report
// @route   POST /api/reports/create
// @access  Private (Citizen)
const createReport = async (req, res) => {
    console.log('--- START REPORT CREATION WITH AI ---');
    console.log('Incoming Body Parts:', req.body);
    let { threatTitle, description, threatType, urlOrPhone, severity, evidenceURL, latitude, longitude, address, zone } = req.body;


    // Detect IP address
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        let finalEvidenceURL = evidenceURL;
        let absoluteFilePath = null;

        if (req.file) {
            finalEvidenceURL = `/uploads/${req.file.filename}`;
            absoluteFilePath = path.join(__dirname, '..', 'uploads', req.file.filename);
        }

        // --- AUTO-ZONE RESOLUTION PROTOCOL ---
        // If zone is missing from payload, resolve geographically from coordinates
        if (!zone && latitude && longitude) {
            const allZones = await Zone.find({});
            const resolved = resolveZone(Number(latitude), Number(longitude), allZones);
            if (resolved) zone = resolved.name;
        }

        // Final safety fallback for Schema Requirement
        if (!zone) zone = 'Central';

        // 1. Initialize and Save FAST
        const reportData = {
            threatTitle,
            description,
            threatType,
            urlOrPhone,
            severity,
            evidenceURL: finalEvidenceURL,
            ipAddress,
            latitude: Number(latitude) || 0,
            longitude: Number(longitude) || 0,
            address,
            zone,
            createdBy: req.user._id,
            paymentAmount: 0,
            fineAmount: 0,
            status: 'Pending',
            timeline: [{
                title: 'Report Submitted',
                description: 'Your report has been successfully transmitted to the CyberGuard network.',
                role: 'citizen',
                timestamp: new Date()
            }]
        };

        // 1. Prepare and Save EARLY (Protocol: Visibility-First Persistence)
        // This ensures if the user refreshes during AI processing, the report is already recorded.
        let report = new Report(reportData);
        const { slaStartTime, slaDeadline } = calculateSLA(new Date(), severity);
        report.slaStartTime = slaStartTime;
        report.slaDeadline = slaDeadline;
        report.slaStatus = "ON_TIME";
        
        if (absoluteFilePath) {
            report.aiMetadata = { aiStatus: 'PENDING' };
        }

        let savedReport = await report.save();

        // 2. STRICT AI VERIFICATION (Async Background Task)
        if (absoluteFilePath) {
            // FIRE AND FORGET
            (async () => {
                try {
                    console.log("[AI] Launching Async Strict Gemini Image Diagnostics...");
                    const aiAnalysisResult = await analyzeThreatImage(absoluteFilePath, threatType, description);

                    if (!aiAnalysisResult) {
                        console.warn("[AI] Service unavailable in background. Keeping manual report.");
                    } else if (aiAnalysisResult.isValid === false) {
                        savedReport.status = 'Rejected';
                        savedReport.aiMetadata = {
                            ...aiAnalysisResult,
                            aiStatus: 'ANOMALY',
                            confidence: aiAnalysisResult.confidence
                        };
                        savedReport.timeline.push({
                            title: 'AI Forensic Rejection',
                            description: `Sentinel AI flagged evidence as non-relevant. [Reason: ${aiAnalysisResult.summary}]`,
                            role: 'system',
                            timestamp: new Date()
                        });
                        await savedReport.save();
                    } else {
                        savedReport.aiMetadata = {
                            ...aiAnalysisResult,
                            aiStatus: 'VERIFIED',
                            confidence: aiAnalysisResult.confidence
                        };

                        if (!savedReport.urlOrPhone && aiAnalysisResult.extractedText) {
                            savedReport.urlOrPhone = aiAnalysisResult.extractedText;
                        }

                        const AI_CONFIDENCE_THRESHOLD = 0.85;
                        if (aiAnalysisResult.confidence >= AI_CONFIDENCE_THRESHOLD) {
                            savedReport.status = 'Verified';
                            savedReport.timeline.push({
                                title: 'AI Verification Success',
                                description: `Sentinel AI diagnostic confirmed threat authenticity [Confidence: ${Math.round(aiAnalysisResult.confidence * 100)}%]. Case data validated and prioritized.`,
                                role: 'admin',
                                timestamp: new Date()
                            });
                        }
                        await savedReport.save();
                    }
                    
                    // Assignment Logic for Verified/Valid reports
                    if (savedReport.status !== 'Rejected' && zone && savedReport.status !== 'Assigned') {
                        const officers = await Officer.find({
                            role: 'officer',
                            zone: zone,
                            isActive: true
                        }).sort({ assignedReportsCount: 1 });

                        if (officers.length > 0) {
                            const selectedOfficer = officers[0];
                            savedReport.assignedTo = selectedOfficer._id;
                            savedReport.status = 'Assigned';

                            selectedOfficer.assignedReportsCount = (selectedOfficer.assignedReportsCount || 0) + 1;
                            await selectedOfficer.save();

                            savedReport.timeline.push({
                                title: 'Auto-Assigned: Mission Protocol',
                                description: `Dossier detected in ${zone} Zone. Load-balanced assignment to Officer ${selectedOfficer.name}.`,
                                role: 'admin',
                                timestamp: new Date()
                            });
                            
                            await savedReport.save();

                            createNotification({
                                userId: savedReport.assignedTo,
                                role: 'officer',
                                title: 'New Automated Assignment',
                                message: `You have been automatically assigned a new report in your zone: ${threatTitle}`,
                                type: 'assignment',
                                reportId: savedReport._id
                            });
                        }
                    }

                    // Async real-time update emission
                    const { getIO } = require('../socket');
                    try {
                        const io = getIO();
                        io.to(savedReport._id.toString()).emit('reportUpdated', savedReport);
                        io.to(savedReport.createdBy.toString()).emit('reportUpdated', savedReport);
                        io.to('role:admin').emit('reportUpdated', savedReport);
                        io.to('role:officer').emit('reportUpdated', savedReport);
                    } catch (err) {
                        console.error('Socket emission failed:', err.message);
                    }
                } catch (bgError) {
                    console.error('Background AI validation failed:', bgError.message);
                }
            })();
        } else {
            // Synchronous Assignment Logic for non-image reports
            if (zone && savedReport.status !== 'Assigned') {
                const officers = await Officer.find({
                    role: 'officer',
                    zone: zone,
                    isActive: true
                }).sort({ assignedReportsCount: 1 });

                if (officers.length > 0) {
                    const selectedOfficer = officers[0];
                    savedReport.assignedTo = selectedOfficer._id;
                    savedReport.status = 'Assigned';

                    selectedOfficer.assignedReportsCount = (selectedOfficer.assignedReportsCount || 0) + 1;
                    await selectedOfficer.save();

                    savedReport.timeline.push({
                        title: 'Auto-Assigned: Mission Protocol',
                        description: `Dossier detected in ${zone} Zone. Load-balanced assignment to Officer ${selectedOfficer.name}.`,
                        role: 'admin',
                        timestamp: new Date()
                    });
                    
                    await savedReport.save();

                    createNotification({
                        userId: savedReport.assignedTo,
                        role: 'officer',
                        title: 'New Automated Assignment',
                        message: `You have been automatically assigned a new report in your zone: ${threatTitle}`,
                        type: 'assignment',
                        reportId: savedReport._id
                    });
                }
            }
        }

        // Send Initial Global Notifications
        const responders = await User.find({ role: { $in: ['officer', 'admin'] } });
        responders.forEach(responder => {
            createNotification({
                userId: responder._id,
                role: responder.role,
                title: 'New Incident Reported',
                message: `Threat: ${threatTitle}${zone ? ` [Zone: ${zone}]` : ''}`,
                type: 'system',
            });
        });

        // Real-time Initial Emission
        const { getIO } = require('../socket');
        try {
            const io = getIO();
            io.to(savedReport._id.toString()).emit('reportUpdated', savedReport);
            io.to(savedReport.createdBy.toString()).emit('reportUpdated', savedReport);
            io.to('role:admin').emit('newReportCreated', savedReport);
            io.to('role:officer').emit('newReportCreated', savedReport);
        } catch (err) {
            console.error('Socket emission failed:', err.message);
        }

        res.status(201).json(savedReport);

    } catch (error) {
        console.error("Submission Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};

/**
 * @desc    Analyze evidence before submission
 * @route   POST /api/reports/analyze-evidence
 * @access  Private (Citizen)
 */
const analyzeEvidence = async (req, res) => {
    try {
        const { threatType, description } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: "No evidence file uploaded" });
        }

        const absoluteFilePath = path.join(__dirname, '..', 'uploads', req.file.filename);
        const aiMetadata = await analyzeThreatImage(absoluteFilePath, threatType, description);

        if (!aiMetadata) {
            return res.status(503).json({ message: "Image verification temporarily unavailable. Please try again." });
        }

        res.json(aiMetadata);
    } catch (error) {
        console.error("[PRE-SCAN AI ERROR]:", error.message);
        res.status(503).json({ message: "Image verification temporarily unavailable. Please try again." });
    }
};

// @desc    Get user's reports
// @route   GET /api/reports/user/:id
// @access  Private (Citizen/Admin)
const getUserReports = async (req, res) => {
    try {
        // Authorization check: Only self or admin
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized to view these reports' });
        }
        const reports = await Report.find({ createdBy: req.params.id }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reports assigned to officer
// @route   GET /api/reports/officer/:id
// @access  Private (Officer/Admin)
const getOfficerReports = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation to prevent CastError
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Officer Reference ID' });
        }

        // Authorization check: Only self or admin
        const isSelf = String(req.user._id) === String(id);
        const isAdmin = String(req.user.role) === 'admin';

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ message: 'Not authorized to view these assigned reports' });
        }
        const officer = await User.findById(req.params.id);
        if (!officer) {
            return res.status(404).json({ message: 'Officer not found' });
        }

        // Fetch reports specifically assigned to officer
        const reports = await Report.find({ assignedTo: req.params.id })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reports
// @route   GET /api/reports/all
// @access  Private (Admin)
const getAllReports = async (req, res) => {
    try {
        const query = {};

        const reports = await Report.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update report status
// @route   PUT /api/reports/update-status/:id
// @access  Private (Officer/Admin)
const updateReportStatus = async (req, res) => {
    const { status, note, assignedTo, resolutionSummary, finalMessage } = req.body;

    try {
        const report = await Report.findById(req.params.id);

        if (report) {
            const oldStatus = report.status;

            // 1. Handle Assignment (Admin Action)
            if (assignedTo && assignedTo !== report.assignedTo?.toString()) {
                const newOfficer = await User.findById(assignedTo);

                if (!newOfficer) {
                    return res.status(404).json({ message: 'Officer not found in the mainframe.' });
                }

                if (newOfficer.role !== 'officer') {
                    return res.status(400).json({ message: 'Selected user is not a authorized officer.' });
                }

                // If it's a manual assignment, we allow assigning officers from different zones
                const assignmentType = req.body.assignment_type || 'automatic';

                if (assignmentType !== 'manual' && newOfficer.zone !== report.zone) {
                    return res.status(400).json({ message: `Jurisdiction Conflict: Officer ${newOfficer.name} belongs to ${newOfficer.zone || 'No'} Zone, but this incident is in ${report.zone} Zone.` });
                }

                // Workload Transfer: Decrement old officer (if exists)
                if (report.assignedTo) {
                    await User.findByIdAndUpdate(report.assignedTo, { $inc: { assignedReportsCount: -1 } });
                }

                // Workload Transfer: Increment new officer
                newOfficer.assignedReportsCount = (newOfficer.assignedReportsCount || 0) + 1;
                await newOfficer.save();

                report.assignedTo = assignedTo;
                report.assigned_officer_id = assignedTo;
                report.assignment_type = assignmentType;

                if (assignmentType === 'manual') {
                    report.reassigned_by = req.user._id;
                    report.reassigned_at = new Date();
                }

                report.status = 'Assigned';

                // Timeline entry
                report.timeline.push({
                    title: assignmentType === 'manual' ? 'Emergency Reassignment' : 'Case Reassigned',
                    description: assignmentType === 'manual'
                        ? `Strategic Override: Dossier manually reassigned to ${newOfficer.name} by Administrative Command.`
                        : `Dossier transferred to ${newOfficer.name} for prioritized investigation.`,
                    role: 'admin',
                    timestamp: new Date()
                });

                // Notifications...
                createNotification({
                    userId: assignedTo,
                    role: 'officer',
                    title: 'New Case Assignment',
                    message: `You have been assigned: ${report.threatTitle}`,
                    type: 'assignment',
                    reportId: report._id
                });

                createNotification({
                    userId: report.createdBy,
                    role: 'citizen',
                    title: 'Investigator Updated',
                    message: `A new officer has been assigned to your report: ${report.threatTitle}`,
                    type: 'update',
                    reportId: report._id
                });
            }


            // 2. Add Investigation Note (Officer Action)
            if (note) {
                report.investigationNotes.push({
                    note,
                    addedBy: req.user._id
                });

                // Notify Citizen about the note if the role is officer
                if (req.user.role === 'officer') {
                    createNotification({
                        userId: report.createdBy,
                        role: 'citizen',
                        title: 'Officer Added Note',
                        message: `Your investigating officer added a note to case #${report._id.toString().slice(-4)}`,
                        type: 'update',
                        reportId: report._id
                    });
                }
            }

            // 3. STRICT SLA ENFORCEMENT logic
            const statusToRestrict = ['Case Closed', 'Investigation Completed', 'Resolved', 'Resolved with Fine'];
            if (status && statusToRestrict.includes(status)) {
                const now = new Date();
                const isLate = report.slaDeadline && now > new Date(report.slaDeadline);
                const isBreached = isLate || report.slaStatus === 'BREACHED';

                // System Check: Only Admin can resolve a breached case
                if (isBreached && req.user.role !== 'admin') {
                    return res.status(403).json({
                        message: 'SLA BREACH DETECTED: Resolution protocol is locked for standard units. Please escalate for Admin Override or request an SLA extension.',
                        slaBreached: true
                    });
                }

                // If admin is resolving a breached case, log the override
                if (isBreached && req.user.role === 'admin') {
                    console.log(`[ADMIN OVERRIDE] Protocol forced by ${req.user.name} for Case #${report._id}`);
                    report.timeline.push({
                        title: 'Admin Override Active',
                        description: `SLA breach detected, but resolution authorized via Admin Protocol Override [Signed: ${req.user.name}]`,
                        role: 'admin',
                        timestamp: new Date()
                    });
                }
            }

            // Update Status (Officer/Admin Action)
            if (status && status !== oldStatus) {
                // Backend Logic: Block "Case Closed" status if paymentStatus !== "Completed"
                if (status === 'Case Closed' && report.paymentStatus !== 'Completed') {
                    if (report.paymentStatus === 'Not Required' && report.paymentAmount === 0 && report.fineAmount === 0) {
                        // Allow if no fines
                    } else {
                        return res.status(400).json({ message: 'Validation Error: Case cannot be marked as "Case Closed" until payment is successfully completed by the citizen.' });
                    }
                }

                let finalStatus = status;

                // Handle passing dynamic payment
                if (req.body.paymentAmount !== undefined) {
                    report.paymentAmount = req.body.paymentAmount;
                    report.fineAmount = req.body.paymentAmount; // Sync fineAmount
                    if (report.paymentAmount > 0 && finalStatus !== 'Payment Completed') {
                        report.paymentStatus = 'Pending';
                    } else if (report.paymentAmount === 0) {
                        report.paymentStatus = 'Not Required';
                    }
                }

                // Handle Investigation Completed auto-flow if the requested status is 'Investigation Completed'
                if (status === 'Investigation Completed') {
                    const amountDue = report.paymentAmount !== undefined && report.paymentAmount !== null 
                        ? report.paymentAmount 
                        : (report.fineAmount || 0);

                    if (report.paymentStatus === 'Completed') {
                        finalStatus = 'Payment Completed'; 
                    } else if (amountDue <= 0) {
                        // Fix for 0 cases
                        report.paymentStatus = 'Not Required';
                        finalStatus = 'Investigation Completed';
                    } else {
                        finalStatus = 'Payment Pending';
                        report.paymentStatus = 'Pending'; // Payment is now required
                    }
                }
                
                report.status = finalStatus;

                const statusMap = {
                    'Verified': { title: 'Dossier Verified', desc: 'Critical verification protocols completed. Validated incident.' },
                    'Investigating': { title: 'Investigation Initiated', desc: 'Secure investigative measures are now active on this case.' },
                    'Investigation Completed': { title: 'Investigation Completed', desc: 'The investigation phase is complete.' },
                    'Payment Pending': { title: 'Payment Required', desc: 'The case investigation is complete. Awaiting payment for final resolution.' },
                    'Payment Completed': { title: 'Payment Completed', desc: 'Payment has been successfully received. Awaiting case resolution by officer.' },
                    'Case Closed': { title: 'Threat Neutralized', desc: 'The reported threat has been addressed and the case is closed.' },
                    'Rejected': { title: 'Case Rejected', desc: 'Incident did not meet reporting criteria or was invalid.' }
                };

                const update = statusMap[finalStatus] || { title: `Status: ${finalStatus}`, desc: `Incident status transitioned to ${finalStatus}` };

                report.timeline.push({
                    title: update.title,
                    description: update.desc,
                    role: req.user.role,
                    timestamp: new Date()
                });

                // If resolved, populate resolution panel and DECREASE workload
                if (finalStatus === 'Case Closed' || finalStatus === 'Rejected') {
                    if (finalStatus === 'Case Closed') {
                        report.isClosed = true;
                    }
                    
                    // Decrease workload count for the assigned officer
                    if (report.assignedTo) {
                        await User.findByIdAndUpdate(report.assignedTo, { $inc: { assignedReportsCount: -1 } });
                    }

                    report.resolution = {
                        summary: resolutionSummary || (finalStatus === 'Case Closed' ? 'Case successfully closed by cyber command.' : 'Case closed following review.'),
                        date: new Date(),
                        officerName: req.user.name,
                        finalMessage: finalMessage || (finalStatus === 'Case Closed' ? 'System integrity maintained.' : 'Insufficient evidence for further action.')
                    };
                }

                // Notify the citizen
                createNotification({
                    userId: report.createdBy,
                    role: 'citizen',
                    title: 'Operational Update',
                    message: `Case #${report._id.toString().slice(-4)}: ${update.title}`,
                    type: 'update',
                    reportId: report._id
                });

                // Notify Admin if an Officer updates the milestone
                if (req.user.role === 'officer') {
                    const admins = await User.find({ role: 'admin' });
                    admins.forEach(admin => {
                        createNotification({
                            userId: admin._id,
                            role: 'admin',
                            title: 'Officer Milestone',
                            message: `Officer ${req.user.name} updated case #${report._id.toString().slice(-4)} to ${status}`,
                            type: 'update',
                            reportId: report._id
                        });
                    });
                }

                // System Log
                createLog({
                    level: status === 'Rejected' ? 'warn' : 'info',
                    category: 'REPORT',
                    message: `Incident #INC-${report._id.toString().slice(-6)} status updated to ${status} by ${req.user.name}`,
                    userId: req.user._id,
                    metadata: { reportId: report._id, newStatus: status }
                });

                // --- NEW: Insert System Message into Chat ---
                try {
                    const systemMessageText = status === 'Case Closed'
                        ? `Officer marked case as Case Closed. ${resolutionSummary ? `Action Taken: ${resolutionSummary}` : ''}`
                        : `System: Status updated to "${status}". ${update.desc}`;

                    const systemMsg = await Message.create({
                        reportId: report._id,
                        senderRole: 'system',
                        message: systemMessageText
                    });

                    if (status === 'Case Closed' || status === 'Closed' || status === 'Rejected') {
                        report.closedAt = new Date();
                    }
                    
                    // Real-time broadcast of the system message
                    const { getIO } = require('../socket');
                    const io = getIO();
                    io.to(report._id.toString()).emit('newMessage', systemMsg);
                } catch (msgErr) {
                    console.error('System message insertion failed:', msgErr.message);
                }
            }


            const updatedReport = await report.save();

            // Real-time emission
            const { getIO } = require('../socket');
            try {
                const io = getIO();
                io.to(report._id.toString()).emit('reportUpdated', updatedReport);
                io.to(report.createdBy.toString()).emit('reportUpdated', updatedReport);
            } catch (err) {
                console.error('Socket emission failed:', err.message);
            }

            res.json(updatedReport);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        console.error('CRITICAL: Update Report Status Logic Failure:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update report details (Admin only)
// @route   PUT /api/reports/edit/:id
// @access  Private (Admin)
const editReport = async (req, res) => {
    try {
        console.log("Backend received update for ID:", req.params.id);
        console.log("Backend received body:", req.body);

        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            {
                threatTitle: req.body.threatTitle,
                threatType: req.body.threatType,
                severity: req.body.severity,
                description: req.body.description
            },
            { returnDocument: 'after', runValidators: true }
        );

        if (updatedReport) {
            // Real-time emission
            const { getIO } = require('../socket');
            try {
                const io = getIO();
                io.to(updatedReport._id.toString()).emit('reportUpdated', updatedReport);
            } catch (err) {
                console.error('Socket emission failed:', err.message);
            }

            res.json(updatedReport);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        console.error("Edit report error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Admin)
const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (report) {
            await report.deleteOne();
            res.json({ message: 'Report removed' });
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid Incident ID format' });
        }

        const report = await Report.findById(id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('investigationNotes.addedBy', 'name');

        if (report) {
            // Security: Restrict location visibility to Admin, Assigned Officer, and Reporter
            const visitorId = String(req.user._id);
            const assignedId = report.assignedTo?._id ? String(report.assignedTo._id) : String(report.assignedTo);
            const creatorId = report.createdBy?._id ? String(report.createdBy._id) : String(report.createdBy);

            const isAuthorized =
                req.user.role === 'admin' ||
                visitorId === assignedId ||
                visitorId === creatorId;

            if (!isAuthorized) {
                report.latitude = undefined;
                report.longitude = undefined;
                report.address = undefined;
                report.zone = undefined;
            }

            // SLA Breach Logic
            if (report.slaDeadline && new Date() > new Date(report.slaDeadline) && report.slaStatus !== "BREACHED" && !report.isClosed) {
                report.slaStatus = "BREACHED";
                report.isSlaBreached = true;
                await report.save();
                
                // System notification for breach
                createNotification({
                    userId: report.assignedTo?._id || report.assignedTo,
                    role: 'officer',
                    title: 'SLA BREACH ALERT',
                    message: `Case #${report._id.toString().slice(-4)} has breached its SLA deadline!`,
                    type: 'system',
                    reportId: report._id
                });
            }

            res.json(report);
        } else {
            res.status(404).json({ message: 'Incident dossier not found' });
        }
    } catch (error) {
        console.error('CRITICAL: Error in getReportById:', error.message);
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

// @desc    Get report timeline
// @route   GET /api/reports/:id/timeline
// @access  Private
const getReportTimeline = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).select('timeline');
        if (report) {
            res.json(report.timeline);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get report evidence
// @route   GET /api/reports/:id/evidence
// @access  Private
const getReportEvidence = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).select('evidence urlOrPhone evidenceURL');
        if (report) {
            res.json({
                evidence: report.evidence,
                urlOrPhone: report.urlOrPhone,
                evidenceURL: report.evidenceURL
            });
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add investigation note
// @route   POST /api/reports/:id/notes
// @access  Private (Officer/Admin)
const addOfficerNote = async (req, res) => {
    try {
        const { note } = req.body;
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.investigationNotes.push({
            note,
            addedBy: req.user._id
        });

        await report.save();

        // Notify Citizen
        createNotification({
            userId: report.createdBy,
            role: 'citizen',
            title: 'Investigation Update',
            message: `An officer added a note to your report #${report._id.toString().slice(-4)}`,
            type: 'update',
            reportId: report._id
        });

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add evidence to report
// @route   POST /api/reports/:id/evidence
// @access  Private (Officer/Admin)
const addReportEvidence = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        let evidenceData = {};

        if (req.file) {
            // It's a file upload
            evidenceData = {
                type: req.file.mimetype.startsWith('image') ? 'image' : 'document',
                url: `http://localhost:5000/uploads/${req.file.filename}`,
                content: req.body.content || req.file.originalname,
                addedAt: new Date()
            };
        } else {
            // It's a manual link or text entry
            const { type, url, content } = req.body;
            evidenceData = {
                type: type || 'link',
                url: url,
                content: content,
                addedAt: new Date()
            };
        }

        report.evidence.push(evidenceData);
        await report.save();
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manual timeline update
// @route   PUT /api/reports/:id/timeline
// @access  Private (Officer/Admin)
const updateReportTimelineManual = async (req, res) => {
    try {
        const { title, description } = req.body;
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.timeline.push({
            title,
            description,
            role: req.user.role,
            timestamp: new Date()
        });

        await report.save();
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reopenReport = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || reason.trim().length < 10) {
            return res.status(400).json({ message: 'A valid reason (min 10 chars) is required to reopen a high-priority case.' });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Incident dossier not found' });
        }

        // Security: Only the creator can reopen
        const isOwner = report.createdBy?.[0]?._id ? String(report.createdBy[0]._id) === String(req.user._id) : String(report.createdBy._id) === String(req.user._id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Unauthorized entry: Only the case reporter can trigger a tactical reopen' });
        }

        // Logic Rule 1: Must be closed
        if (report.status !== 'Case Closed' && report.status !== 'Closed') {
            return res.status(400).json({ message: 'Operation failed: Only finalized cases can be reopened' });
        }

        // Logic Rule 2: 48 Hour Limit
        if (report.closedAt) {
            const now = new Date();
            const closedAt = new Date(report.closedAt);
            const hoursSinceClosure = (now - closedAt) / (1000 * 60 * 60);
            if (hoursSinceClosure > 48) {
                return res.status(400).json({ message: 'Protocol expired: Reopen requests must be initiated within 48 hours of closure' });
            }
        }

        // Logic Rule 3: Reopen Limit (Max 2)
        if (report.reopenAttempts >= 2) {
            return res.status(400).json({ message: 'Resource limit reached: You have exhausted the maximum of 2 reopen attempts for this case' });
        }

        // Protocol-required Reopen status
        report.status = 'Reopened'; 
        report.reopenAttempts = (report.reopenAttempts || 0) + 1;
        
        report.timeline.push({
            title: `Tactical Reopen #${report.reopenAttempts}`,
            description: `Case status reverted to Reopened by citizen. Reason: ${reason}`,
            role: 'citizen',
            timestamp: new Date()
        });

        // Add to investigation notes as well
        report.investigationNotes.push({
            note: `[REOPEN REASON]: ${reason}`,
            addedBy: req.user._id,
            createdAt: new Date()
        });

        // Notify via Chat System Message
        const systemMsg = await Message.create({
            reportId: report._id,
            senderRole: 'system',
            message: `CASE REOPENED (#${report.reopenAttempts}). Status: REOPENED. Reason provided: ${reason}. Communication channel restored.`
        });

        const savedReport = await report.save();

        // Real-time broadcast
        const { getIO } = require('../socket');
        const io = getIO();
        io.to(report._id.toString()).emit('reportUpdated', savedReport);
        io.to(report._id.toString()).emit('newMessage', systemMsg);

        res.json(savedReport);
    } catch (error) {
        console.error('Reopen Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const processPayment = async (req, res) => {
    try {
        if (!req.body.isAgreed) {
            return res.status(400).json({ message: 'User must accept terms before payment' });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Incident dossier not found' });
        }

        if (report.paymentStatus === 'Paid' || report.paymentStatus === 'Completed') {
            return res.status(400).json({ message: 'Payment already processed and completed' });
        }

        const amountPaid = report.paymentAmount || report.fineAmount;

        // Simulate processing delay
        // In a real app, this would happen after a successful gateway response
        report.paymentStatus = 'Completed';
        report.paymentDate = new Date();
        report.transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Update Timeline
        report.timeline.push({
            title: 'Payment Successful',
            description: `Payment of ₹${amountPaid} confirmed via Secure Gateway. Transaction Ref: ${report.transactionId}`,
            role: 'citizen',
            timestamp: new Date()
        });

        if (report.status === 'Payment Pending' || report.status === 'Payment Completed') {
            report.status = 'Case Closed';
            report.isClosed = true;
            report.closedAt = new Date();
            report.timeline.push({
                title: 'Case Closed by Automated Protocol',
                description: 'Payment has been verified. Case has been automatically marked as closed.',
                role: 'system',
                timestamp: new Date()
            });
            report.resolution = {
                summary: 'Payment completed. Case resolved and closed automatically.',
                date: new Date(),
                officerName: 'System Validation',
                finalMessage: 'Penalty processed successfully.'
            };
            
            // Decrease workload for assigned officer
            if (report.assignedTo) {
                await User.findByIdAndUpdate(report.assignedTo, { $inc: { assignedReportsCount: -1 } });
            }
        }

        // Add System Message
        try {
            const { createMessage } = require('./messageController'); // Adjust if needed
            // Alternatively, use Message model directly
            await Message.create({
                reportId: report._id,
                senderRole: 'system',
                message: `SUCCESS: Payment of ₹${amountPaid} has been verified. Transaction ID: ${report.transactionId}`
            });
        } catch (msgErr) {
            console.error('System message for payment failed:', msgErr.message);
        }

        // Persistent Payment Record Creation
        try {
            const existingPayment = await Payment.findOne({ reportId: report._id });
            if (!existingPayment) {
                await Payment.create({
                    reportId: report._id,
                    citizenId: report.createdBy,
                    category: report.threatType,
                    amount: amountPaid,
                    status: "Completed",
                    transactionId: report.transactionId,
                    paymentDate: report.paymentDate
                });
            }
        } catch (payErr) {
            console.error('Shadow Payment storage failed:', payErr.message);
        }

        const updatedReport = await report.save();

        // Real-time broadcast
        const { getIO } = require('../socket');
        try {
            const io = getIO();
            io.to(report._id.toString()).emit('reportUpdated', updatedReport);
        } catch (err) {
            console.error('Socket emission failed:', err.message);
        }

        res.json({
            message: 'Payment processed successfully',
            report: updatedReport
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Extend SLA deadline (Admin only)
// @route   PUT /api/reports/:id/extend-sla
// @access  Private (Admin)
const extendSla = async (req, res) => {
    try {
        const { id } = req.params;
        const { additionalHours, reason } = req.body;

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (!report.slaDeadline) {
            return res.status(400).json({ message: 'SLA not active for this case' });
        }

        const oldDeadline = new Date(report.slaDeadline);
        const newDeadline = new Date(oldDeadline);
        newDeadline.setHours(newDeadline.getHours() + parseInt(additionalHours || 24));

        report.slaDeadline = newDeadline;
        report.slaStatus = "ON_TIME";
        report.isSlaBreached = false;

        report.timeline.push({
            title: 'SLA Extended',
            description: `SLA deadline extended by ${additionalHours} hours. Reason: ${reason || 'Administrative adjustment.'}`,
            role: 'admin',
            timestamp: new Date()
        });

        await report.save();

        createNotification({
            userId: report.assignedTo?._id || report.assignedTo,
            role: 'officer',
            title: 'SLA Updated',
            message: `SLA for case #${report._id.toString().slice(-4)} has been extended.`,
            type: 'system',
            reportId: report._id
        });

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReport,
    getUserReports,
    getOfficerReports,
    getAllReports,
    updateReportStatus,
    reopenReport,
    editReport,
    deleteReport,
    getReportById,
    getReportTimeline,
    getReportEvidence,
    addOfficerNote,
    addReportEvidence,
    updateReportTimelineManual,
    processPayment,
    analyzeEvidence,
    extendSla,
    escalateReport: async (req, res) => {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const report = await Report.findById(id);
            if (!report) return res.status(404).json({ message: 'Dossier not found' });

            report.timeline.push({
                title: 'Case Escalated to Command',
                description: `Emergency Escalation: ${reason || 'SLA Time Limit Exceeded. Action required by Senior Architect.'}`,
                role: req.user.role,
                timestamp: new Date()
            });

            // Re-assign to a generic admin pool or specific admin if found
            const admin = await User.findOne({ role: 'admin' });
            if (admin) {
                report.assignedTo = admin._id;
            }
            
            await report.save();

            createNotification({
                userId: admin?._id,
                role: 'admin',
                title: 'High Priority Escalation',
                message: `Case #${report._id.toString().slice(-4)} has been escalated due to SLA pressure.`,
                type: 'system',
                reportId: report._id
            });

            res.json({ message: 'Tactical escalation sequence complete. Command notified.', report });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    generateReportPDF: async (req, res) => {
        try {
            const PDFDocument = require('pdfkit');
            const report = await Report.findById(req.params.id)
                .populate('createdBy', 'name email')
                .populate('assignedTo', 'name email')
                .populate('investigationNotes.addedBy', 'name');

            if (!report) return res.status(404).json({ message: 'Dossier not found' });

            // Security: Only owner/officer/admin
            const isOwner = report.createdBy?.[0]?._id ? String(report.createdBy[0]._id) === String(req.user._id) : String(report.createdBy._id) === String(req.user._id);
            const isOfficer = String(report.assignedTo?._id) === String(req.user._id);
            if (req.user.role !== 'admin' && !isOwner && !isOfficer) {
                return res.status(403).json({ message: 'Unauthorized access to restricted intelligence' });
            }

            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const filename = `Cyber_Report_${String(report._id).slice(-6).toUpperCase()}.pdf`;

            res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-type', 'application/pdf');

            doc.pipe(res);

            // HEADER
            doc.rect(0, 0, 600, 80).fill('#0f172a');
            doc.fillColor('#38bdf8').fontSize(20).font('Helvetica-Bold').text('CYBERGUARD COMMAND', 50, 30);
            doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('FEDERAL THREAT MONITORING & INVESTIGATION REPORT', 50, 55);
            
            // INCIDENT INFO
            doc.moveDown(4);
            doc.fillColor('#000000').fontSize(16).font('Helvetica-Bold').text(`Incident Ref: #INC-${String(report._id).slice(-6).toUpperCase()}`);
            doc.fontSize(10).font('Helvetica').text(`Status: ${report.status.toUpperCase()}`, { continued: true });
            doc.text(` | Priority: ${report.severity.toUpperCase()}`, { align: 'right' });
            doc.moveDown();
            doc.underline(50, doc.y, 500, 1, { color: '#e2e8f0' });

            // SUBJECT INFO
            doc.moveDown(2);
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text(' REPORTER IDENTIFICATION');
            doc.fontSize(10).font('Helvetica').fillColor('#475569');
            doc.text(`Name: ${report.createdBy?.name || 'Authorized Citizen'}`);
            doc.text(`Email: ${report.createdBy?.email || 'N/A'}`);
            doc.text(`Protocol IP: ${report.ipAddress || 'Anonymized'}`);

            // THREAT DETAILS
            doc.moveDown(2);
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text(' THREAT INTELLIGENCE');
            doc.fontSize(10).font('Helvetica').fillColor('#475569');
            doc.text(`Classification: ${report.threatType}`);
            doc.text(`Vector Entity: ${report.urlOrPhone || 'Internal Probe'}`);
            doc.moveDown(0.5);
            doc.font('Helvetica-Oblique').text(`"${report.description}"`);

            // AI DIAGNOSTIC
            if (report.aiMetadata) {
                doc.moveDown(2);
                doc.rect(doc.x - 5, doc.y - 5, 510, 80).fill('#f8fafc');
                doc.fillColor('#1e40af').font('Helvetica-Bold').text(' [AI] SYNTHETIC DIAGNOSTIC SUMMARY');
                doc.fillColor('#475569').font('Helvetica').text(`Gemini Confidence: ${Math.round((report.aiMetadata.confidence || 0) * 100)}%`);
                doc.text(`Verification: ${report.aiMetadata.isValid ? 'THREAT AUTHENTICATED' : 'ANOMALY DETECTED'}`);
                doc.fontSize(9).font('Helvetica-Oblique').text(report.aiMetadata.summary || 'Diagnostic complete.', { width: 480 });
            }

            // TIMELINE
            doc.moveDown(3);
            doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text(' OPERATIONAL TIMELINE');
            report.timeline.forEach(t => {
                const date = new Date(t.timestamp).toLocaleString();
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#0284c7').text(`${date} - ${t.title}`);
                doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(t.description);
                doc.moveDown(0.5);
            });

            // OFFICER REMARKS
            if (report.investigationNotes && report.investigationNotes.length > 0) {
                doc.moveDown(2);
                doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text(' OFFICIAL INVESTIGATION REMARKS');
                report.investigationNotes.forEach(n => {
                    doc.fontSize(9).fillColor('#475569').text(`[Officer ${n.addedBy?.name || 'Authorized'}]: ${n.note}`);
                });
            }

            // FINANCIALS
            if (report.paymentStatus === 'Completed') {
                doc.moveDown(2);
                doc.rect(doc.x - 5, doc.y - 5, 510, 40).fill('#ecfdf5');
                doc.fillColor('#065f46').font('Helvetica-Bold').text(' TRANSACTION VERIFIED');
                doc.text(`Amount: INR ${report.paymentAmount || report.fineAmount} | TXN: ${report.transactionId || 'INTERNAL_REMIT'}`);
            }

            // FOOTER - Simple and safe
            doc.moveDown(4);
            doc.fontSize(8).fillColor('#94a3b8').text(
                'This document is an electronically generated federal dossier. System hash verification required for authenticity.',
                { align: 'center' }
            );

            doc.end();

        } catch (error) {
            console.error('PDF Gen Error:', error);
            res.status(500).json({ message: error.message });
        }
    }
};

