const express = require('express');
const router = express.Router();
const {
    getBookings,
    getBookingById,
    addBooking,
    updateBooking,
    deleteBooking,
    updateBookingStatus,
    getBookingsByRoom,
    getBookingsByDateRange,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    checkInGuest,
    addPayment,
    amendStay,
    roomMove,
    exchangeRooms,
    markNoShow,
    voidReservation,
    cancelReservation
} = require('../controllers/bookingController');

// Main routes
router.get('/list', getBookings);
router.get('/date-range', getBookingsByDateRange);
router.post('/add', addBooking);

// ID-based routes
router.get('/:id', getBookingById);
router.put('/update/:id', updateBooking);
router.delete('/delete/:id', deleteBooking);
router.patch('/status/:id', updateBookingStatus);

// Room-based routes
router.get('/room/:roomNumber', getBookingsByRoom);

// Transaction routes
router.post('/:bookingId/transactions', addTransaction);
router.put('/:bookingId/transactions/:transactionId', updateTransaction);
router.delete('/:bookingId/transactions/:transactionId', deleteTransaction);

// ========================================
// DRAWER ACTION ROUTES
// ========================================
router.post('/:id/check-in', checkInGuest);
router.post('/:id/add-payment', addPayment);
router.post('/:id/amend-stay', amendStay);
router.post('/:id/room-move', roomMove);
router.post('/:id/exchange-rooms', exchangeRooms);
router.post('/:id/no-show', markNoShow);
router.post('/:id/void', voidReservation);
router.post('/:id/cancel', cancelReservation);

module.exports = router;
