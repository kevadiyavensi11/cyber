let io;

module.exports = {
    init: (server) => {
        io = require('socket.io')(server, {
            cors: {
                origin: '*', // In production, specify your frontend URLs
                methods: ['GET', 'POST'],
            },
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('join', (userId) => {
                socket.join(userId);
                console.log(`User ${userId} joined their private room`);
            });

            socket.on('joinRole', (role) => {
                socket.join(`role:${role}`);
                console.log(`Socket joined role room: role:${role}`);
            });

            socket.on('joinReportRoom', (reportId) => {
                socket.join(reportId);
                console.log(`Socket ${socket.id} joined investigation room: ${reportId}`);
            });

            socket.on('sendMessage', async (data) => {
                const { reportId, senderId, senderRole, message, messageType, fileUrl, fileName } = data;

                try {
                    const Message = require('./models/Message');
                    const Report = require('./models/Report');

                    // Security Verification
                    const report = await Report.findById(reportId);
                    if (!report) return;

                    if (senderRole === 'citizen' && report.createdBy.toString() !== senderId.toString()) return;
                    if (senderRole === 'officer' && report.assignedTo?.toString() !== senderId.toString()) return;

                    const newMessage = await Message.create({
                        reportId,
                        senderId,
                        senderRole,
                        message,
                        messageType: messageType || 'text',
                        fileUrl,
                        fileName,
                        status: 'sent'
                    });

                    // Emit to room
                    io.to(reportId).emit('newMessage', newMessage);
                } catch (error) {
                    console.error('Socket Message Error:', error);
                }
            });

            socket.on('markSeen', async (data) => {
                const { reportId, userId } = data;
                try {
                    const Message = require('./models/Message');
                    await Message.updateMany(
                        { reportId, senderId: { $ne: userId }, status: { $ne: 'seen' } },
                        { $set: { status: 'seen' } }
                    );
                    io.to(reportId).emit('messagesSeen', { reportId, readerId: userId });
                } catch (err) {
                    console.info('MarkSeen socket error:', err.message);
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    },
};
