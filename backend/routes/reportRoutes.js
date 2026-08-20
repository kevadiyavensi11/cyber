const express = require('express');
const {
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
    generateReportPDF,
    extendSla,
    escalateReport
} = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../utils/uploadUtils');
const router = express.Router();

router.post('/create', protect, authorize('citizen'), upload.single('evidence'), createReport);
router.post('/analyze-evidence', protect, authorize('citizen'), upload.single('evidence'), analyzeEvidence);
router.get('/citizen/:id', protect, authorize('citizen', 'admin'), getUserReports);
router.get('/officer/:id', protect, authorize('officer', 'admin'), getOfficerReports);
router.get('/all', protect, authorize('admin', 'officer'), getAllReports);
router.get('/:id', protect, getReportById);
router.get('/:id/timeline', protect, getReportTimeline);
router.get('/:id/evidence', protect, getReportEvidence);
router.put('/update-status/:id', protect, authorize('officer', 'admin'), updateReportStatus);
router.put('/reopen/:id', protect, authorize('citizen'), reopenReport);
router.put('/edit/:id', protect, authorize('admin'), editReport);
router.delete('/:id', protect, authorize('admin'), deleteReport);

// New Officer Action Routes
router.post('/:id/notes', protect, authorize('officer', 'admin'), addOfficerNote);
router.post('/:id/evidence', protect, authorize('officer', 'admin'), upload.single('file'), addReportEvidence);
router.put('/:id/timeline', protect, authorize('officer', 'admin'), updateReportTimelineManual);
router.put('/pay/:id', protect, authorize('citizen'), processPayment);
router.get('/:id/pdf', protect, generateReportPDF);
router.put('/:id/extend-sla', protect, authorize('admin'), extendSla);
router.put('/:id/escalate', protect, authorize('officer'), escalateReport);


module.exports = router;
