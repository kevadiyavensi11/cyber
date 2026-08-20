/**
 * SLA Rules:
 * LOW      -> 72 working hours
 * MEDIUM   -> 48 working hours
 * HIGH     -> 24 working hours
 * CRITICAL -> 6 absolute hours (24/7)
 * 
 * Business Hours: 09:00 - 18:00 (9 AM - 6 PM)
 * Working Days: Monday to Friday (1-5)
 */

const getSlaConfiguration = (severity) => {
    switch (severity.toLowerCase()) {
        case 'critical': return { hours: 6, is24x7: true };
        case 'high': return { hours: 24, is24x7: false };
        case 'medium': return { hours: 48, is24x7: false };
        case 'low': return { hours: 72, is24x7: false };
        default: return { hours: 48, is24x7: false };
    }
};

const isWorkingTime = (date) => {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = date.getHours();
    return (day >= 1 && day <= 5) && (hour >= 9 && hour < 18);
};

const getNextWorkingStartTime = (date) => {
    let nextDate = new Date(date);
    
    // If it's after hours or weekend, move to next possible start
    while (true) {
        // If it's before 9 AM on a working day, set to 9 AM today
        if (nextDate.getDay() >= 1 && nextDate.getDay() <= 5 && nextDate.getHours() < 9) {
            nextDate.setHours(9, 0, 0, 0);
            return nextDate;
        }
        
        // If it's after 6 PM or is weekend, move to next day 9 AM
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(9, 0, 0, 0);
        
        if (nextDate.getDay() >= 1 && nextDate.getDay() <= 5) {
            return nextDate;
        }
    }
};

/**
 * Calculates SLA Start Time and Deadline
 */
const calculateSLA = (createdAt, severity) => {
    const config = getSlaConfiguration(severity);
    let slaStartTime = new Date(createdAt);
    let slaDeadline = new Date(createdAt);

    if (config.is24x7) {
        // Critical: 24/7 SLA
        slaDeadline.setHours(slaDeadline.getHours() + config.hours);
        return { slaStartTime, slaDeadline };
    }

    // Business Hours SLA
    // 1. Determine Start Time
    if (!isWorkingTime(createdAt)) {
        slaStartTime = getNextWorkingStartTime(createdAt);
    }

    // 2. Determine Deadline by skipping non-working hours
    let remainingHours = config.hours;
    let current = new Date(slaStartTime);

    while (remainingHours > 0) {
        // Move to end of current working day or remaining hours, whichever is sooner
        const endOfDay = new Date(current);
        endOfDay.setHours(18, 0, 0, 0);

        const hoursUntilEndOfDay = (endOfDay - current) / (1000 * 60 * 60);

        if (hoursUntilEndOfDay >= remainingHours) {
            // Finishes today
            current.setMilliseconds(current.getMilliseconds() + (remainingHours * 3600000));
            remainingHours = 0;
        } else {
            // Carries over to next working day
            remainingHours -= hoursUntilEndOfDay;
            current = getNextWorkingStartTime(endOfDay);
        }
    }

    slaDeadline = current;
    return { slaStartTime, slaDeadline };
};

module.exports = { calculateSLA, isWorkingTime, getNextWorkingStartTime };
