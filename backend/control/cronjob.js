// backend/common/cronJobs.js

const cron = require('node-cron');
const User = require('../model/auth');
const { sendMail } = require('../common/common');

const scheduleWeeklyTrackerReminders = () => {
    cron.schedule('0 11 * * *', async () => {
        console.log('Running daily check for weekly tracker reminders...');

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        try {
            const usersToRemind = await User.find({
                'weeklyLogs.lastUpdated': { $lte: sevenDaysAgo },
                'weeklyLogs.weeklyReminderSent': false,
                'role': 'patient' // Ensure we only email patients
            });
            for (const user of usersToRemind) {
                const subject = 'Reminder to Update Your Weekly Health Tracker';
                const html = `<p>Hi ${user.name},</p><p>This is a friendly reminder to update your weekly health tracker in your Medimitra profile. Staying consistent helps you and your doctor monitor your progress.</p><p>Thank you!</p>`;
                await sendMail({ to: user.username, subject, html });
                await User.updateOne(
                    { _id: user._id },
                    { $set: { 'weeklyLogs.weeklyReminderSent': true } }
                );

                console.log(`Weekly tracker reminder sent to user: ${user.username}`);
            }

        } catch (error) {
            console.error('Error during weekly reminder cron job:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
};

module.exports = { 
    scheduleWeeklyTrackerReminders
};