const Booking = require('../models/bookingModel');

// Get all bookings
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
};

// Create a new booking
exports.addBooking = async (req, res) => {
    try {
        const bookingData = req.body;

        // Validate required fields
        if (!bookingData.guestName || !bookingData.mobileNumber || !bookingData.roomNumber || 
            !bookingData.checkInDate || !bookingData.checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check for duplicate room booking
        const existingBooking = await Booking.findOne({
            roomNumber: bookingData.roomNumber,
            $or: [
                {
                    checkInDate: { $lt: new Date(bookingData.checkOutDate) },
                    checkOutDate: { $gt: new Date(bookingData.checkInDate) }
                }
            ],
            status: { $in: ['Upcoming', 'Checked-in'] }
        });

        if (existingBooking) {
            return res.status(409).json({
                success: false,
                message: 'Room is already booked for the selected dates'
            });
        }

        const booking = new Booking(bookingData);
        
        console.log('Creating booking with data:', bookingData);
        
        // Add initial room charge transaction
        const checkInDate = new Date(bookingData.checkInDate);
        const initialTransaction = {
            type: 'charge',
            day: checkInDate.toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                weekday: 'short'
            }),
            particulars: 'Room Tariff',
            description: `Room Charges - ${bookingData.totalAmount} for ${checkInDate.toLocaleDateString('en-GB')} Room No: ${bookingData.roomNumber}`,
            amount: bookingData.totalAmount || 0,
            user: 'system'
        };
        
        console.log('Initial transaction:', initialTransaction);
        booking.transactions.push(initialTransaction);
        
        // Add advance payment transaction if advance is paid
        if (bookingData.advancePaid && bookingData.advancePaid > 0) {
            const advancePaymentTransaction = {
                type: 'payment',
                day: new Date().toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    weekday: 'short'
                }),
                particulars: 'Advance Payment',
                description: 'Advance payment received at booking',
                amount: -Math.abs(bookingData.advancePaid),
                user: 'system'
            };
            console.log('Advance payment transaction:', advancePaymentTransaction);
            booking.transactions.push(advancePaymentTransaction);
        }
        
        console.log('Booking before save - transactions:', booking.transactions);
        await booking.save();
        console.log('Booking saved - transactions:', booking.transactions);

        // Update room status based on booking status
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: bookingData.roomNumber });
        
        if (room) {
            // Set room status based on booking status
            if (bookingData.status === 'Checked-in') {
                room.status = 'Occupied';
            } else if (bookingData.status === 'Upcoming') {
                room.status = 'Booked';
            }
            await room.save();
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
};

// Update booking
exports.updateBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const oldStatus = booking.status;
        const oldRoomNumber = booking.roomNumber;

        // Update only provided fields
        Object.assign(booking, req.body);
        await booking.save();

        // Update room status if booking status changed
        const Room = require('../models/roomModel');
        
        // If room number changed, update old room to Available
        if (req.body.roomNumber && req.body.roomNumber !== oldRoomNumber) {
            const oldRoom = await Room.findOne({ roomNumber: oldRoomNumber });
            if (oldRoom) {
                oldRoom.status = 'Available';
                await oldRoom.save();
            }
        }
        
        // Update current room status based on booking status
        const currentRoomNumber = req.body.roomNumber || oldRoomNumber;
        const room = await Room.findOne({ roomNumber: currentRoomNumber });
        
        if (room) {
            if (booking.status === 'Checked-in') {
                room.status = 'Occupied';
            } else if (booking.status === 'Upcoming') {
                room.status = 'Booked';
            } else if (booking.status === 'Checked-out' || booking.status === 'Cancelled') {
                room.status = 'Available';
            }
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating booking',
            error: error.message
        });
    }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const roomNumber = booking.roomNumber;
        await Booking.findByIdAndDelete(req.params.id);

        // Update room status to Available when booking is deleted
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: roomNumber });
        
        if (room) {
            room.status = 'Available';
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting booking',
            error: error.message
        });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Upcoming', 'Checked-in', 'Checked-out', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating booking status',
            error: error.message
        });
    }
};

// Get bookings by room number
exports.getBookingsByRoom = async (req, res) => {
    try {
        const { roomNumber } = req.params;
        const bookings = await Booking.find({ roomNumber }).sort({ checkInDate: -1 });

        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// Get bookings by date range
exports.getBookingsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate are required'
            });
        }

        const bookings = await Booking.find({
            checkInDate: { $gte: new Date(startDate) },
            checkOutDate: { $lte: new Date(endDate) }
        }).sort({ checkInDate: -1 });

        res.status(200).json({
            success: true,
            data: bookings,
            count: bookings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// Add transaction (charge or payment) to a booking
exports.addTransaction = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const transactionData = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.transactions.push(transactionData);
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Transaction added successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding transaction',
            error: error.message
        });
    }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
    try {
        const { bookingId, transactionId } = req.params;
        const updatedData = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const transaction = booking.transactions.id(transactionId);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        Object.assign(transaction, updatedData);
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating transaction',
            error: error.message
        });
    }
};

// Delete transaction (void)
exports.deleteTransaction = async (req, res) => {
    try {
        const { bookingId, transactionId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.transactions.pull(transactionId);
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting transaction',
            error: error.message
        });
    }
};

// ========================================
// DRAWER ACTION ENDPOINTS
// ========================================

// Check-In Guest
exports.checkInGuest = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const { arrivalDate, checkInTime, idProofType, idNumber, adults, children, vehicleNumber, securityDeposit, remarks } = req.body;

        // Update booking with check-in details
        booking.status = 'Checked-in';
        booking.checkInDate = arrivalDate || booking.checkInDate;
        booking.actualCheckInTime = checkInTime;
        booking.idProof = { type: idProofType, number: idNumber };
        booking.numberOfGuests = adults + children;
        booking.vehicleNumber = vehicleNumber;
        booking.securityDeposit = securityDeposit || 0;
        booking.checkInRemarks = remarks;
        booking.updatedAt = Date.now();

        // Add audit trail
        if (!booking.auditTrail) booking.auditTrail = [];
        booking.auditTrail.push({
            action: 'CHECK_IN',
            timestamp: new Date(),
            user: 'admin',
            details: `Guest checked in - Room ${booking.roomNumber}`
        });

        // Add security deposit transaction if applicable
        if (securityDeposit && securityDeposit > 0) {
            booking.transactions.push({
                type: 'payment',
                day: new Date().toLocaleDateString('en-GB'),
                particulars: 'Security Deposit',
                description: `Security deposit received: ₹${securityDeposit}`,
                amount: -Math.abs(securityDeposit),
                user: 'admin'
            });
        }

        await booking.save();

        // Update room status to Occupied
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: booking.roomNumber });
        if (room) {
            room.status = 'Occupied';
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Guest checked in successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking in guest',
            error: error.message
        });
    }
};

// Add Payment
exports.addPayment = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const { paymentDate, paymentMethod, amount, referenceId, comment } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment amount'
            });
        }

        // Add payment transaction
        const paymentTransaction = {
            type: 'payment',
            day: new Date(paymentDate).toLocaleDateString('en-GB'),
            particulars: `Payment - ${paymentMethod}`,
            description: `${comment || 'Payment received'} ${referenceId ? `(Ref: ${referenceId})` : ''}`,
            amount: -Math.abs(amount),
            user: 'admin',
            paymentMethod,
            referenceId: referenceId || null
        };

        booking.transactions.push(paymentTransaction);
        booking.advancePaid = (booking.advancePaid || 0) + amount;
        booking.remainingAmount = Math.max(0, (booking.totalAmount || 0) - booking.advancePaid);
        booking.updatedAt = Date.now();

        // Add audit trail
        if (!booking.auditTrail) booking.auditTrail = [];
        booking.auditTrail.push({
            action: 'PAYMENT_ADDED',
            timestamp: new Date(),
            user: 'admin',
            amount: amount
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Payment added successfully',
            data: booking,
            newBalance: booking.remainingAmount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding payment',
            error: error.message
        });
    }
};

// Amend Stay
exports.amendStay = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const { newArrivalDate, newDepartureDate, reason, rateChange, newRate } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason for amendment is required'
            });
        }

        // Calculate new nights
        const arrival = new Date(newArrivalDate);
        const departure = new Date(newDepartureDate);
        const nights = Math.max(1, Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24)));

        // Store old values
        const oldCheckIn = booking.checkInDate;
        const oldCheckOut = booking.checkOutDate;
        const oldTotal = booking.totalAmount;

        // Update booking
        booking.checkInDate = newArrivalDate;
        booking.checkOutDate = newDepartureDate;
        booking.numberOfNights = nights;

        if (rateChange && newRate) {
            booking.pricePerNight = newRate;
        }

        // Recalculate total
        booking.totalAmount = nights * booking.pricePerNight;
        booking.remainingAmount = Math.max(0, booking.totalAmount - (booking.advancePaid || 0));
        booking.updatedAt = Date.now();

        // Add audit trail
        if (!booking.auditTrail) booking.auditTrail = [];
        booking.auditTrail.push({
            action: 'AMEND_STAY',
            timestamp: new Date(),
            user: 'admin',
            details: reason,
            changes: {
                oldCheckIn,
                newCheckIn: newArrivalDate,
                oldCheckOut,
                newCheckOut: newDepartureDate,
                oldTotal,
                newTotal: booking.totalAmount
            }
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Stay amended successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error amending stay',
            error: error.message
        });
    }
};

// Room Move
exports.roomMove = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const { newRoom, reason } = req.body;

        if (!newRoom || !reason) {
            return res.status(400).json({
                success: false,
                message: 'New room and reason are required'
            });
        }

        const Room = require('../models/roomModel');

        // Check if new room is available
        const targetRoom = await Room.findOne({ roomNumber: newRoom });
        if (!targetRoom || targetRoom.status !== 'Available') {
            return res.status(400).json({
                success: false,
                message: 'Target room is not available'
            });
        }

        const oldRoom = booking.roomNumber;

        // Update old room to Available
        const oldRoomDoc = await Room.findOne({ roomNumber: oldRoom });
        if (oldRoomDoc) {
            oldRoomDoc.status = 'Available';
            await oldRoomDoc.save();
        }

        // Update new room to Occupied
        targetRoom.status = 'Occupied';
        await targetRoom.save();

        // Update booking
        booking.roomNumber = newRoom;
        booking.updatedAt = Date.now();

        // Add audit trail
        if (!booking.auditTrail) booking.auditTrail = [];
        booking.auditTrail.push({
            action: 'ROOM_MOVE',
            timestamp: new Date(),
            user: 'admin',
            from: oldRoom,
            to: newRoom,
            reason: reason
        });

        await booking.save();

        res.status(200).json({
            success: true,
            message: `Guest moved from Room ${oldRoom} to Room ${newRoom}`,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error moving room',
            error: error.message
        });
    }
};

// Exchange Rooms
exports.exchangeRooms = async (req, res) => {
    try {
        const booking1 = await Booking.findById(req.params.id);
        if (!booking1) {
            return res.status(404).json({
                success: false,
                message: 'First booking not found'
            });
        }

        const { targetReservationId, reason } = req.body;

        if (!targetReservationId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Target reservation and reason are required'
            });
        }

        const booking2 = await Booking.findById(targetReservationId);
        if (!booking2) {
            return res.status(404).json({
                success: false,
                message: 'Target booking not found'
            });
        }

        // Swap room numbers
        const room1 = booking1.roomNumber;
        const room2 = booking2.roomNumber;

        booking1.roomNumber = room2;
        booking2.roomNumber = room1;

        booking1.updatedAt = Date.now();
        booking2.updatedAt = Date.now();

        // Add audit trails
        if (!booking1.auditTrail) booking1.auditTrail = [];
        if (!booking2.auditTrail) booking2.auditTrail = [];

        const auditEntry = {
            action: 'ROOM_EXCHANGE',
            timestamp: new Date(),
            user: 'admin',
            details: `Rooms exchanged with ${booking2.guestName}`,
            reason: reason
        };

        booking1.auditTrail.push({ ...auditEntry, from: room1, to: room2 });
        booking2.auditTrail.push({ ...auditEntry, from: room2, to: room1 });

        await booking1.save();
        await booking2.save();

        res.status(200).json({
            success: true,
            message: 'Rooms exchanged successfully',
            data: { booking1, booking2 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error exchanging rooms',
            error: error.message
        });
    }
};

// Mark No-Show
exports.markNoShow = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const { reason, charges, refundAmount } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason for no-show is required'
            });
        }

        // Update booking status
        booking.status = 'Cancelled'; // Using Cancelled for no-show
        booking.noShowReason = reason;
        booking.noShowCharges = charges || 0;
        booking.refundAmount = refundAmount || 0;
        booking.updatedAt = Date.now();

        // Add audit trail
        if (!booking.auditTrail) booking.auditTrail = [];
        booking.auditTrail.push({
            action: 'NO_SHOW',
            timestamp: new Date(),
            user: 'admin',
            reason: reason
        });

        await booking.save();

        // Update room status to Available
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: booking.roomNumber });
        if (room) {
            room.status = 'Available';
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Booking marked as no-show',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking no-show',
            error: error.message
        });
    }
};

// Void Reservation
exports.voidReservation = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const { reason, adminPassword } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason for void is required'
            });
        }

        // Simple password check (in production, use proper authentication)
        if (adminPassword !== 'admin123') {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin password'
            });
        }

        // Mark as voided
        booking.status = 'Cancelled'; // Using Cancelled status
        booking.isVoided = true;
        booking.voidReason = reason;
        booking.voidedAt = new Date();
        booking.updatedAt = Date.now();

        // Add audit trail
        if (!booking.auditTrail) booking.auditTrail = [];
        booking.auditTrail.push({
            action: 'VOID',
            timestamp: new Date(),
            user: 'admin',
            reason: reason
        });

        await booking.save();

        // Update room status to Available
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: booking.roomNumber });
        if (room) {
            room.status = 'Available';
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Reservation voided successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error voiding reservation',
            error: error.message
        });
    }
};

// Cancel Reservation
exports.cancelReservation = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const { reason, cancellationCharges, refundAmount, refundMode } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Cancellation reason is required'
            });
        }

        // Update booking
        booking.status = 'Cancelled';
        booking.cancellationReason = reason;
        booking.cancellationCharges = cancellationCharges || 0;
        booking.refundAmount = refundAmount || 0;
        booking.refundMode = refundMode;
        booking.cancelledAt = new Date();
        booking.updatedAt = Date.now();

        // Add audit trail
        if (!booking.auditTrail) booking.auditTrail = [];
        booking.auditTrail.push({
            action: 'CANCEL',
            timestamp: new Date(),
            user: 'admin',
            reason: reason,
            refundAmount: refundAmount
        });

        // Add refund transaction if applicable
        if (refundAmount && refundAmount > 0) {
            booking.transactions.push({
                type: 'refund',
                day: new Date().toLocaleDateString('en-GB'),
                particulars: 'Cancellation Refund',
                description: `Refund via ${refundMode} - ${reason}`,
                amount: Math.abs(refundAmount),
                user: 'admin'
            });
        }

        await booking.save();

        // Update room status to Available
        const Room = require('../models/roomModel');
        const room = await Room.findOne({ roomNumber: booking.roomNumber });
        if (room) {
            room.status = 'Available';
            await room.save();
        }

        res.status(200).json({
            success: true,
            message: 'Reservation cancelled successfully',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling reservation',
            error: error.message
        });
    }
};
