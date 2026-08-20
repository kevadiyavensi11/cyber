const cron = require('node-cron');
const Report = require('../models/Report');
const { createNotification } = require('./notificationUtils');

/**
 * SLA Monitor Cron Job
 * Checks for breached SLAs every 15 minutes
 */
const initCronJobs = () => {
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log('--- RUNNING SLA BREACH CHECK ---');
        try {
            const now = new Date();
            
            // Find reports that:
            // 1. Are not closed
            // 2. Are not already marked as BREACHED
            // 3. Have the deadline passed
            const breachedReports = await Report.find({
                isClosed: { $ne: true },
                slaStatus: { $ne: 'BREACHED' },
                slaDeadline: { $lt: now }
            }).populate('assignedTo');

            if (breachedReports.length > 0) {
                console.log(`[SLA] Found ${breachedReports.length} newly breached reports.`);
                
                for (const report of breachedReports) {
                    report.slaStatus = 'BREACHED';
                    report.isSlaBreached = true;
                    
                    // Add to timeline
                    report.timeline.push({
                        title: 'SLA BREACHED',
                        description: 'Operational deadline exceeded. Tactical escalation triggered.',
                        role: 'admin',
                        timestamp: now
                    });

                    await report.save();

                    // Notify Officer if assigned
                    if (report.assignedTo) {
                        await createNotification({
                            recipient: report.assignedTo._id,
                            title: 'SLA BREACH ALERT',
                            message: `Case #INC-${String(report._id).slice(-6).toUpperCase()} has breached its service level agreement.`,
                            type: 'CRITICAL',
                            link: `/officer/investigation/${report._id}`
                        });
                    }
                }
            }
        } catch (error) {
            console.error('[CRON ERROR] SLA Check failed:', error);
        }
    });

    console.log('✅ [CRON] SLA Monitoring Engine Initialized {Interval: 15m}');
};

module.exports = { initCronJobs };
