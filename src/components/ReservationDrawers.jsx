import { useState, useEffect } from 'react';
import './ReservationDrawers.css';

// ========================================
// BASE DRAWER COMPONENT
// ========================================
const DrawerPanel = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="drawer-overlay" onClick={onClose}>
            <div className="drawer-panel match-card-height" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-header">
                    <h3 className="drawer-title">{title}</h3>
                    <button className="drawer-close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="drawer-content">
                    {children}
                </div>
                {footer && (
                    <div className="drawer-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// ========================================
// 1. CHECK-IN DRAWER
// ========================================
export const CheckInDrawer = ({ isOpen, onClose, reservation, onSubmit }) => {
    const [formData, setFormData] = useState({
        arrivalDate: '',
        checkInTime: '',
        idProofType: 'Aadhar',
        idNumber: '',
        adults: 1,
        children: 0,
        vehicleNumber: '',
        securityDeposit: 0,
        remarks: ''
    });

    useEffect(() => {
        if (reservation && isOpen) {
            const now = new Date();
            setFormData({
                arrivalDate: reservation.checkInDate || new Date().toISOString().split('T')[0],
                checkInTime: now.toTimeString().slice(0, 5),
                idProofType: 'Aadhar',
                idNumber: '',
                adults: reservation.rooms?.[0]?.adultsCount || 1,
                children: reservation.rooms?.[0]?.childrenCount || 0,
                vehicleNumber: '',
                securityDeposit: 0,
                remarks: ''
            });
        }
    }, [reservation, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.idNumber.trim()) {
            alert('Please enter ID proof number');
            return;
        }

        const checkInData = {
            ...formData,
            status: 'IN_HOUSE',
            roomStatus: 'OCCUPIED',
            auditEntry: {
                action: 'CHECK_IN',
                timestamp: new Date().toISOString(),
                user: 'admin',
                details: `Guest checked in - Room ${reservation.rooms?.[0]?.roomNumber}`
            }
        };

        onSubmit(checkInData);
        onClose();
    };

    const footer = (
        <>
            <button className="drawer-btn drawer-btn-secondary" onClick={onClose}>
                Cancel
            </button>
            <button className="drawer-btn drawer-btn-primary" onClick={handleSubmit}>
                ✓ Complete Check-In
            </button>
        </>
    );

    return (
        <DrawerPanel isOpen={isOpen} onClose={onClose} title="🔑 Check-In Guest" footer={footer}>
            <div className="drawer-info-box">
                <p className="drawer-info-text">
                    <strong>Guest:</strong> {reservation?.guestName}<br />
                    <strong>Room:</strong> {reservation?.rooms?.[0]?.roomNumber} | {reservation?.rooms?.[0]?.categoryId}
                </p>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Arrival Date</label>
                <input
                    type="date"
                    className="drawer-form-input"
                    value={formData.arrivalDate}
                    onChange={(e) => handleChange('arrivalDate', e.target.value)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Check-In Time</label>
                <input
                    type="time"
                    className="drawer-form-input"
                    value={formData.checkInTime}
                    onChange={(e) => handleChange('checkInTime', e.target.value)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Guest ID Proof Type</label>
                <select
                    className="drawer-form-select"
                    value={formData.idProofType}
                    onChange={(e) => handleChange('idProofType', e.target.value)}
                >
                    <option value="Aadhar">Aadhar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                </select>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">ID Number</label>
                <input
                    type="text"
                    className="drawer-form-input"
                    placeholder="Enter ID number"
                    value={formData.idNumber}
                    onChange={(e) => handleChange('idNumber', e.target.value)}
                />
            </div>

            <div className="drawer-form-row">
                <div className="drawer-form-group">
                    <label className="drawer-form-label required">Adults</label>
                    <input
                        type="number"
                        min="1"
                        className="drawer-form-input"
                        value={formData.adults}
                        onChange={(e) => handleChange('adults', parseInt(e.target.value))}
                    />
                </div>
                <div className="drawer-form-group">
                    <label className="drawer-form-label">Children</label>
                    <input
                        type="number"
                        min="0"
                        className="drawer-form-input"
                        value={formData.children}
                        onChange={(e) => handleChange('children', parseInt(e.target.value))}
                    />
                </div>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label">Vehicle Number</label>
                <input
                    type="text"
                    className="drawer-form-input"
                    placeholder="Optional"
                    value={formData.vehicleNumber}
                    onChange={(e) => handleChange('vehicleNumber', e.target.value.toUpperCase())}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label">Security Deposit (₹)</label>
                <input
                    type="number"
                    min="0"
                    className="drawer-form-input"
                    placeholder="0"
                    value={formData.securityDeposit}
                    onChange={(e) => handleChange('securityDeposit', parseFloat(e.target.value) || 0)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label">Remarks</label>
                <textarea
                    className="drawer-form-textarea"
                    placeholder="Optional notes"
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                />
            </div>
        </DrawerPanel>
    );
};

// ========================================
// 2. ADD PAYMENT DRAWER
// ========================================
export const AddPaymentDrawer = ({ isOpen, onClose, reservation, onSubmit }) => {
    const [formData, setFormData] = useState({
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        amount: '',
        referenceId: '',
        comment: ''
    });

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (['Card', 'UPI', 'Bank'].includes(formData.paymentMethod) && !formData.referenceId.trim()) {
            alert('Reference ID is mandatory for ' + formData.paymentMethod);
            return;
        }

        const paymentData = {
            ...formData,
            amount: parseFloat(formData.amount),
            timestamp: new Date().toISOString(),
            auditEntry: {
                action: 'PAYMENT_ADDED',
                timestamp: new Date().toISOString(),
                user: 'admin',
                amount: parseFloat(formData.amount)
            }
        };

        onSubmit(paymentData);
        setFormData({
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Cash',
            amount: '',
            referenceId: '',
            comment: ''
        });
        onClose();
    };

    const newBalance = (reservation?.balanceDue || 0) - (parseFloat(formData.amount) || 0);

    const footer = (
        <>
            <button className="drawer-btn drawer-btn-secondary" onClick={onClose}>
                Cancel
            </button>
            <button className="drawer-btn drawer-btn-success" onClick={handleSubmit}>
                💳 Add Payment
            </button>
        </>
    );

    return (
        <DrawerPanel isOpen={isOpen} onClose={onClose} title="💰 Add Payment" footer={footer}>
            <div className="drawer-info-box warning">
                <p className="drawer-info-text">
                    <strong>Current Balance:</strong> ₹{(reservation?.balanceDue || 0).toLocaleString('en-IN')}<br />
                    <strong>Total Amount:</strong> ₹{(reservation?.totalAmount || 0).toLocaleString('en-IN')}
                </p>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Payment Date</label>
                <input
                    type="date"
                    className="drawer-form-input"
                    value={formData.paymentDate}
                    onChange={(e) => handleChange('paymentDate', e.target.value)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Payment Method</label>
                <select
                    className="drawer-form-select"
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card (Debit/Credit)</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank">Bank Transfer</option>
                </select>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Amount (₹)</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="drawer-form-input"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                />
            </div>

            {['Card', 'UPI', 'Bank'].includes(formData.paymentMethod) && (
                <div className="drawer-form-group">
                    <label className="drawer-form-label required">Reference ID / Transaction ID</label>
                    <input
                        type="text"
                        className="drawer-form-input"
                        placeholder="Enter transaction reference"
                        value={formData.referenceId}
                        onChange={(e) => handleChange('referenceId', e.target.value)}
                    />
                </div>
            )}

            <div className="drawer-form-group">
                <label className="drawer-form-label">Comment</label>
                <textarea
                    className="drawer-form-textarea"
                    placeholder="Optional payment notes"
                    value={formData.comment}
                    onChange={(e) => handleChange('comment', e.target.value)}
                />
            </div>

            {formData.amount && (
                <div className="drawer-summary">
                    <div className="drawer-summary-title">Payment Summary</div>
                    <div className="drawer-summary-row">
                        <span className="drawer-summary-label">Current Balance</span>
                        <span className="drawer-summary-value">₹{(reservation?.balanceDue || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="drawer-summary-row">
                        <span className="drawer-summary-label">Payment Amount</span>
                        <span className="drawer-summary-value">₹{parseFloat(formData.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="drawer-summary-row">
                        <span className="drawer-summary-label">New Balance</span>
                        <span className={`drawer-summary-value ${newBalance <= 0 ? 'success' : 'highlight'}`}>
                            ₹{Math.max(0, newBalance).toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            )}
        </DrawerPanel>
    );
};

// ========================================
// 3. AMEND STAY DRAWER (Enhanced Version)
// ========================================
export const AmendStayDrawer = ({ isOpen, onClose, reservation, onSubmit }) => {
    const [formData, setFormData] = useState({
        newArrivalDate: '',
        newDepartureDate: '',
        reason: '',
        rateChange: false,
        newRate: 0
    });

    useEffect(() => {
        if (reservation && isOpen) {
            setFormData({
                newArrivalDate: reservation.checkInDate || '',
                newDepartureDate: reservation.checkOutDate || '',
                reason: '',
                rateChange: false,
                newRate: reservation.rooms?.[0]?.ratePerNight || 0
            });
        }
    }, [reservation, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const calculateNights = () => {
        if (!formData.newArrivalDate || !formData.newDepartureDate) return 0;
        const arrival = new Date(formData.newArrivalDate);
        const departure = new Date(formData.newDepartureDate);
        return Math.max(1, Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24)));
    };

    const handleSubmit = () => {
        if (!formData.reason.trim()) {
            alert('Please provide a reason for amendment');
            return;
        }

        if (new Date(formData.newDepartureDate) <= new Date(formData.newArrivalDate)) {
            alert('Departure date must be after arrival date');
            return;
        }

        const nights = calculateNights();
        const rate = formData.rateChange ? formData.newRate : (reservation.rooms?.[0]?.ratePerNight || 0);
        const newRoomCharges = nights * rate;
        const tax = Math.round(newRoomCharges * 0.12);
        const newTotal = newRoomCharges + tax;

        const amendData = {
            ...formData,
            nights,
            newRoomCharges,
            newTax: tax,
            newTotal,
            auditEntry: {
                action: 'AMEND_STAY',
                timestamp: new Date().toISOString(),
                user: 'admin',
                details: formData.reason
            }
        };

        onSubmit(amendData);
        onClose();
    };

    const nights = calculateNights();
    const oldNights = reservation?.nights || 0;
    const rate = formData.rateChange ? formData.newRate : (reservation?.rooms?.[0]?.ratePerNight || 0);

    const footer = (
        <>
            <button className="drawer-btn drawer-btn-secondary" onClick={onClose}>
                Cancel
            </button>
            <button className="drawer-btn drawer-btn-primary" onClick={handleSubmit}>
                📝 Update Stay
            </button>
        </>
    );

    return (
        <DrawerPanel isOpen={isOpen} onClose={onClose} title="📅 Amend Stay" footer={footer}>
            <div className="drawer-info-box">
                <p className="drawer-info-text">
                    <strong>Current Stay:</strong> {reservation?.checkInDate} to {reservation?.checkOutDate} ({oldNights} nights)
                </p>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">New Arrival Date</label>
                <input
                    type="date"
                    className="drawer-form-input"
                    value={formData.newArrivalDate}
                    onChange={(e) => handleChange('newArrivalDate', e.target.value)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">New Departure Date</label>
                <input
                    type="date"
                    className="drawer-form-input"
                    value={formData.newDepartureDate}
                    onChange={(e) => handleChange('newDepartureDate', e.target.value)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Reason for Amendment</label>
                <textarea
                    className="drawer-form-textarea"
                    placeholder="Why is this stay being amended?"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                />
            </div>

            <div className="drawer-checkbox-group">
                <input
                    type="checkbox"
                    className="drawer-checkbox"
                    checked={formData.rateChange}
                    onChange={(e) => handleChange('rateChange', e.target.checked)}
                />
                <label className="drawer-checkbox-label">Change room rate?</label>
            </div>

            {formData.rateChange && (
                <div className="drawer-form-group">
                    <label className="drawer-form-label required">New Rate per Night (₹)</label>
                    <input
                        type="number"
                        min="0"
                        className="drawer-form-input"
                        value={formData.newRate}
                        onChange={(e) => handleChange('newRate', parseFloat(e.target.value) || 0)}
                    />
                </div>
            )}

            {formData.newArrivalDate && formData.newDepartureDate && (
                <div className="drawer-summary">
                    <div className="drawer-summary-title">Before vs After</div>
                    <div className="drawer-summary-row">
                        <span className="drawer-summary-label">Old Nights</span>
                        <span className="drawer-summary-value">{oldNights}</span>
                    </div>
                    <div className="drawer-summary-row">
                        <span className="drawer-summary-label">New Nights</span>
                        <span className="drawer-summary-value highlight">{nights}</span>
                    </div>
                    <div className="drawer-summary-row">
                        <span className="drawer-summary-label">Rate per Night</span>
                        <span className="drawer-summary-value">₹{rate.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="drawer-summary-row">
                        <span className="drawer-summary-label">New Total</span>
                        <span className="drawer-summary-value highlight">₹{(nights * rate * 1.12).toFixed(0).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            )}
        </DrawerPanel>
    );
};

// ========================================
// 4. ROOM MOVE DRAWER
// ========================================
export const RoomMoveDrawer = ({ isOpen, onClose, reservation, availableRooms = [], onSubmit }) => {
    const [formData, setFormData] = useState({
        newRoom: '',
        moveDateTime: new Date().toISOString().slice(0, 16),
        reason: ''
    });

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.newRoom) {
            alert('Please select a new room');
            return;
        }

        if (!formData.reason.trim()) {
            alert('Please provide a reason for room move');
            return;
        }

        const moveData = {
            ...formData,
            oldRoom: reservation.rooms?.[0]?.roomNumber,
            auditEntry: {
                action: 'ROOM_MOVE',
                timestamp: new Date().toISOString(),
                user: 'admin',
                from: reservation.rooms?.[0]?.roomNumber,
                to: formData.newRoom,
                reason: formData.reason
            }
        };

        onSubmit(moveData);
        onClose();
    };

    const footer = (
        <>
            <button className="drawer-btn drawer-btn-secondary" onClick={onClose}>
                Cancel
            </button>
            <button className="drawer-btn drawer-btn-primary" onClick={handleSubmit}>
                🔄 Move Room
            </button>
        </>
    );

    return (
        <DrawerPanel isOpen={isOpen} onClose={onClose} title="🔄 Room Move" footer={footer}>
            <div className="drawer-info-box warning">
                <p className="drawer-info-text">
                    <strong>Current Room:</strong> {reservation?.rooms?.[0]?.roomNumber}<br />
                    <strong>Guest:</strong> {reservation?.guestName}
                </p>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label">Current Room</label>
                <input
                    type="text"
                    className="drawer-form-input"
                    value={reservation?.rooms?.[0]?.roomNumber || 'N/A'}
                    disabled
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">New Room</label>
                <select
                    className="drawer-form-select"
                    value={formData.newRoom}
                    onChange={(e) => handleChange('newRoom', e.target.value)}
                >
                    <option value="">-- Select Available Room --</option>
                    {Array.isArray(availableRooms) && availableRooms.map(room => (
                        <option key={room.number} value={room.number}>
                            {room.number} - {room.type} ({room.category})
                        </option>
                    ))}
                </select>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Move Date & Time</label>
                <input
                    type="datetime-local"
                    className="drawer-form-input"
                    value={formData.moveDateTime}
                    onChange={(e) => handleChange('moveDateTime', e.target.value)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Reason for Move</label>
                <textarea
                    className="drawer-form-textarea"
                    placeholder="Why is room being moved?"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                />
            </div>

            {(!availableRooms || availableRooms.length === 0) && (
                <div className="drawer-info-box warning">
                    <p className="drawer-info-text">⚠️ No available rooms found. All rooms are currently occupied.</p>
                </div>
            )}
        </DrawerPanel>
    );
};

// ========================================
// 5. EXCHANGE ROOM DRAWER
// ========================================
export const ExchangeRoomDrawer = ({ isOpen, onClose, reservation, occupiedReservations = [], onSubmit }) => {
    const [formData, setFormData] = useState({
        targetReservation: '',
        reason: '',
        confirmed: false
    });

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.targetReservation) {
            alert('Please select a reservation to exchange with');
            return;
        }

        if (!formData.reason.trim()) {
            alert('Please provide a reason for room exchange');
            return;
        }

        if (!formData.confirmed) {
            alert('Please confirm the room exchange');
            return;
        }

        const targetRes = Array.isArray(occupiedReservations) ? 
            occupiedReservations.find(r => r.id === formData.targetReservation) : null;

        const exchangeData = {
            ...formData,
            currentRoom: reservation?.rooms?.[0]?.roomNumber,
            targetRoom: targetRes?.rooms?.[0]?.roomNumber,
            targetGuestName: targetRes?.guestName,
            auditEntry: {
                action: 'ROOM_EXCHANGE',
                timestamp: new Date().toISOString(),
                user: 'admin',
                details: `${reservation?.guestName} (${reservation?.rooms?.[0]?.roomNumber}) ↔ ${targetRes?.guestName} (${targetRes?.rooms?.[0]?.roomNumber})`
            }
        };

        onSubmit(exchangeData);
        onClose();
    };

    const targetRes = Array.isArray(occupiedReservations) ? 
        occupiedReservations.find(r => r.id === formData.targetReservation) : null;
    
    const safeOccupiedReservations = Array.isArray(occupiedReservations) ? occupiedReservations : [];
    const filteredReservations = safeOccupiedReservations.filter(r => r?.id !== reservation?.id);

    const footer = (
        <>
            <button className="drawer-btn drawer-btn-secondary" onClick={onClose}>
                Cancel
            </button>
            <button className="drawer-btn drawer-btn-warning" onClick={handleSubmit}>
                🔃 Exchange Rooms
            </button>
        </>
    );

    return (
        <DrawerPanel isOpen={isOpen} onClose={onClose} title="🔃 Exchange Room" footer={footer}>
            <div className="drawer-info-box">
                <p className="drawer-info-text">
                    <strong>Current Guest:</strong> {reservation?.guestName}<br />
                    <strong>Current Room:</strong> {reservation?.rooms?.[0]?.roomNumber}
                </p>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Select Reservation to Exchange With</label>
                <select
                    className="drawer-form-select"
                    value={formData.targetReservation}
                    onChange={(e) => handleChange('targetReservation', e.target.value)}
                >
                    <option value="">-- Select Occupied Room --</option>
                    {filteredReservations.map(res => (
                        <option key={res.id} value={res.id}>
                            {res.guestName} - Room {res.rooms?.[0]?.roomNumber} ({res.rooms?.[0]?.categoryId})
                        </option>
                    ))}
                </select>
            </div>

            {targetRes && (
                <div className="drawer-info-box success">
                    <p className="drawer-info-text">
                        <strong>Exchange Preview:</strong><br />
                        → {reservation?.guestName} will move to Room {targetRes.rooms?.[0]?.roomNumber}<br />
                        → {targetRes.guestName} will move to Room {reservation?.rooms?.[0]?.roomNumber}
                    </p>
                </div>
            )}

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Exchange Reason</label>
                <textarea
                    className="drawer-form-textarea"
                    placeholder="Why are these rooms being exchanged?"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                />
            </div>

            <div className="drawer-checkbox-group">
                <input
                    type="checkbox"
                    className="drawer-checkbox"
                    checked={formData.confirmed}
                    onChange={(e) => handleChange('confirmed', e.target.checked)}
                />
                <label className="drawer-checkbox-label">I confirm this room exchange</label>
            </div>
        </DrawerPanel>
    );
};

// ========================================
// 6. ADD/SHOW VISITOR DRAWER
// ========================================
export const VisitorDrawer = ({ isOpen, onClose, reservation, visitors = [], onSubmit }) => {
    const [mode, setMode] = useState('list'); // 'list' or 'add'
    const [formData, setFormData] = useState({
        visitorName: '',
        mobile: '',
        idProofType: 'Aadhar',
        idNumber: '',
        purpose: '',
        inTime: new Date().toISOString().slice(0, 16),
        outTime: ''
    });

    if (!isOpen) return null;

    const safeVisitors = Array.isArray(visitors) ? visitors : [];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.visitorName.trim() || !formData.mobile.trim() || !formData.idNumber.trim()) {
            alert('Please fill all required fields');
            return;
        }

        const visitorData = {
            ...formData,
            reservationId: reservation.id,
            status: 'active',
            timestamp: new Date().toISOString()
        };

        onSubmit(visitorData);
        
        // Reset form
        setFormData({
            visitorName: '',
            mobile: '',
            idProofType: 'Aadhar',
            idNumber: '',
            purpose: '',
            inTime: new Date().toISOString().slice(0, 16),
            outTime: ''
        });
        setMode('list');
    };

    const footer = mode === 'add' ? (
        <>
            <button className="drawer-btn drawer-btn-secondary" onClick={() => setMode('list')}>
                Back
            </button>
            <button className="drawer-btn drawer-btn-success" onClick={handleSubmit}>
                ✓ Add Visitor
            </button>
        </>
    ) : (
        <button className="drawer-btn drawer-btn-primary" onClick={() => setMode('add')}>
            + Add New Visitor
        </button>
    );

    return (
        <DrawerPanel isOpen={isOpen} onClose={onClose} title="👥 Visitors" footer={footer}>
            {mode === 'list' ? (
                <>
                    <div className="drawer-info-box">
                        <p className="drawer-info-text">
                            <strong>Guest:</strong> {reservation?.guestName}<br />
                            <strong>Room:</strong> {reservation?.rooms?.[0]?.roomNumber}
                        </p>
                    </div>

                    <div className="visitor-list">
                        {safeVisitors.length > 0 ? (
                            safeVisitors.map((visitor, index) => (
                                <div key={index} className="visitor-item">
                                    <div className="visitor-header">
                                        <span className="visitor-name">{visitor.visitorName}</span>
                                        <span className={`visitor-status ${visitor.status}`}>
                                            {visitor.status === 'active' ? 'In Room' : 'Checked Out'}
                                        </span>
                                    </div>
                                    <div className="visitor-details">
                                        📱 {visitor.mobile}<br />
                                        🆔 {visitor.idProofType}: {visitor.idNumber}<br />
                                        📝 {visitor.purpose}<br />
                                        🕒 In: {new Date(visitor.inTime).toLocaleString('en-IN')}<br />
                                        {visitor.outTime && `🕓 Out: ${new Date(visitor.outTime).toLocaleString('en-IN')}`}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="drawer-info-box">
                                <p className="drawer-info-text">No visitors recorded yet</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="drawer-form-group">
                        <label className="drawer-form-label required">Visitor Name</label>
                        <input
                            type="text"
                            className="drawer-form-input"
                            placeholder="Full name"
                            value={formData.visitorName}
                            onChange={(e) => handleChange('visitorName', e.target.value)}
                        />
                    </div>

                    <div className="drawer-form-group">
                        <label className="drawer-form-label required">Mobile Number</label>
                        <input
                            type="tel"
                            className="drawer-form-input"
                            placeholder="10-digit mobile"
                            value={formData.mobile}
                            onChange={(e) => handleChange('mobile', e.target.value)}
                        />
                    </div>

                    <div className="drawer-form-row">
                        <div className="drawer-form-group">
                            <label className="drawer-form-label required">ID Proof Type</label>
                            <select
                                className="drawer-form-select"
                                value={formData.idProofType}
                                onChange={(e) => handleChange('idProofType', e.target.value)}
                            >
                                <option value="Aadhar">Aadhar</option>
                                <option value="Passport">Passport</option>
                                <option value="Driving License">Driving License</option>
                                <option value="Voter ID">Voter ID</option>
                            </select>
                        </div>
                        <div className="drawer-form-group">
                            <label className="drawer-form-label required">ID Number</label>
                            <input
                                type="text"
                                className="drawer-form-input"
                                placeholder="ID number"
                                value={formData.idNumber}
                                onChange={(e) => handleChange('idNumber', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="drawer-form-group">
                        <label className="drawer-form-label required">Visit Purpose</label>
                        <input
                            type="text"
                            className="drawer-form-input"
                            placeholder="Purpose of visit"
                            value={formData.purpose}
                            onChange={(e) => handleChange('purpose', e.target.value)}
                        />
                    </div>

                    <div className="drawer-form-group">
                        <label className="drawer-form-label required">In Time</label>
                        <input
                            type="datetime-local"
                            className="drawer-form-input"
                            value={formData.inTime}
                            onChange={(e) => handleChange('inTime', e.target.value)}
                        />
                    </div>

                    <div className="drawer-form-group">
                        <label className="drawer-form-label">Out Time (Optional)</label>
                        <input
                            type="datetime-local"
                            className="drawer-form-input"
                            value={formData.outTime}
                            onChange={(e) => handleChange('outTime', e.target.value)}
                        />
                    </div>
                </>
            )}
        </DrawerPanel>
    );
};

// ========================================
// 7. NO-SHOW DRAWER
// ========================================
export const NoShowDrawer = ({ isOpen, onClose, reservation, onSubmit }) => {
    const [formData, setFormData] = useState({
        reason: '',
        charges: 0,
        refundAmount: 0
    });

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.reason.trim()) {
            alert('Please provide a reason for no-show');
            return;
        }

        const noShowData = {
            ...formData,
            status: 'NO_SHOW',
            roomStatus: 'AVAILABLE',
            auditEntry: {
                action: 'NO_SHOW',
                timestamp: new Date().toISOString(),
                user: 'admin',
                reason: formData.reason
            }
        };

        onSubmit(noShowData);
        onClose();
    };

    const footer = (
        <>
            <button className="drawer-btn drawer-btn-secondary" onClick={onClose}>
                Cancel
            </button>
            <button className="drawer-btn drawer-btn-warning" onClick={handleSubmit}>
                ⚠️ Mark as No-Show
            </button>
        </>
    );

    return (
        <DrawerPanel isOpen={isOpen} onClose={onClose} title="⚠️ No-Show Reservation" footer={footer}>
            <div className="drawer-info-box warning">
                <p className="drawer-info-text">
                    <strong>Guest:</strong> {reservation?.guestName}<br />
                    <strong>Room:</strong> {reservation?.rooms?.[0]?.roomNumber}<br />
                    <strong>Expected Arrival:</strong> {reservation?.checkInDate}
                </p>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">No-Show Reason</label>
                <textarea
                    className="drawer-form-textarea"
                    placeholder="Why did the guest not show up?"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label">No-Show Charges (₹)</label>
                <input
                    type="number"
                    min="0"
                    className="drawer-form-input"
                    placeholder="Optional charges"
                    value={formData.charges}
                    onChange={(e) => handleChange('charges', parseFloat(e.target.value) || 0)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label">Refund Amount (₹)</label>
                <input
                    type="number"
                    min="0"
                    max={reservation?.paidAmount || 0}
                    className="drawer-form-input"
                    placeholder="Amount to refund"
                    value={formData.refundAmount}
                    onChange={(e) => handleChange('refundAmount', parseFloat(e.target.value) || 0)}
                />
            </div>

            <div className="drawer-info-box">
                <p className="drawer-info-text">
                    ℹ️ Marking as no-show will make the room available and close this reservation.
                </p>
            </div>
        </DrawerPanel>
    );
};

// ========================================
// 8. VOID RESERVATION DRAWER
// ========================================
export const VoidDrawer = ({ isOpen, onClose, reservation, onSubmit }) => {
    const [formData, setFormData] = useState({
        reason: '',
        adminPassword: ''
    });

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.reason.trim()) {
            alert('Please provide a reason for voiding');
            return;
        }

        if (!formData.adminPassword.trim()) {
            alert('Admin password is required');
            return;
        }

        // Simple password check (in production, verify against backend)
        if (formData.adminPassword !== 'admin123') {
            alert('Invalid admin password');
            return;
        }

        if (!confirm('⚠️ WARNING: This action cannot be undone. Are you sure you want to void this reservation?')) {
            return;
        }

        const voidData = {
            ...formData,
            status: 'VOID',
            voidedAt: new Date().toISOString(),
            auditEntry: {
                action: 'VOID',
                timestamp: new Date().toISOString(),
                user: 'admin',
                reason: formData.reason
            }
        };

        onSubmit(voidData);
        onClose();
    };

    const footer = (
        <>
            <button className="drawer-btn drawer-btn-secondary" onClick={onClose}>
                Cancel
            </button>
            <button className="drawer-btn drawer-btn-danger" onClick={handleSubmit}>
                🗑️ Void Reservation
            </button>
        </>
    );

    return (
        <DrawerPanel isOpen={isOpen} onClose={onClose} title="🗑️ Void Reservation" footer={footer}>
            <div className="drawer-info-box warning">
                <p className="drawer-info-text">
                    ⚠️ <strong>WARNING:</strong> Voiding a reservation will permanently archive it. This action cannot be undone.
                </p>
            </div>

            <div className="drawer-info-box">
                <p className="drawer-info-text">
                    <strong>Reservation:</strong> {reservation?.id}<br />
                    <strong>Guest:</strong> {reservation?.guestName}<br />
                    <strong>Amount:</strong> ₹{(reservation?.totalAmount || 0).toLocaleString('en-IN')}
                </p>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Void Reason</label>
                <textarea
                    className="drawer-form-textarea"
                    placeholder="Why is this reservation being voided?"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Admin Password</label>
                <input
                    type="password"
                    className="drawer-form-input"
                    placeholder="Enter admin password"
                    value={formData.adminPassword}
                    onChange={(e) => handleChange('adminPassword', e.target.value)}
                />
            </div>
        </DrawerPanel>
    );
};

// ========================================
// 9. CANCEL RESERVATION DRAWER
// ========================================
export const CancelDrawer = ({ isOpen, onClose, reservation, onSubmit }) => {
    const [formData, setFormData] = useState({
        reason: '',
        refundMode: 'Cash',
        refundAmount: 0,
        cancellationCharges: 0
    });

    useEffect(() => {
        if (reservation && isOpen) {
            // Auto-calculate default refund
            const defaultRefund = Math.max(0, (reservation.paidAmount || 0) - (formData.cancellationCharges || 0));
            setFormData(prev => ({ 
                ...prev, 
                refundAmount: defaultRefund 
            }));
        }
    }, [reservation, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            
            // Recalculate refund when cancellation charges change
            if (field === 'cancellationCharges') {
                updated.refundAmount = Math.max(0, (reservation?.paidAmount || 0) - parseFloat(value || 0));
            }
            
            return updated;
        });
    };

    const handleSubmit = () => {
        if (!formData.reason.trim()) {
            alert('Please provide a cancellation reason');
            return;
        }

        const cancelData = {
            ...formData,
            status: 'CANCELLED',
            roomStatus: 'AVAILABLE',
            cancelledAt: new Date().toISOString(),
            auditEntry: {
                action: 'CANCEL',
                timestamp: new Date().toISOString(),
                user: 'admin',
                reason: formData.reason,
                refundAmount: formData.refundAmount
            }
        };

        onSubmit(cancelData);
        onClose();
    };

    const footer = (
        <>
            <button className="drawer-btn drawer-btn-secondary" onClick={onClose}>
                Close
            </button>
            <button className="drawer-btn drawer-btn-danger" onClick={handleSubmit}>
                ❌ Cancel Reservation
            </button>
        </>
    );

    return (
        <DrawerPanel isOpen={isOpen} onClose={onClose} title="❌ Cancel Reservation" footer={footer}>
            <div className="drawer-info-box">
                <p className="drawer-info-text">
                    <strong>Guest:</strong> {reservation?.guestName}<br />
                    <strong>Total Paid:</strong> ₹{(reservation?.paidAmount || 0).toLocaleString('en-IN')}<br />
                    <strong>Balance Due:</strong> ₹{(reservation?.balanceDue || 0).toLocaleString('en-IN')}
                </p>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label required">Cancellation Reason</label>
                <textarea
                    className="drawer-form-textarea"
                    placeholder="Why is this reservation being cancelled?"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label">Cancellation Charges (₹)</label>
                <input
                    type="number"
                    min="0"
                    max={reservation?.paidAmount || 0}
                    className="drawer-form-input"
                    placeholder="0"
                    value={formData.cancellationCharges}
                    onChange={(e) => handleChange('cancellationCharges', parseFloat(e.target.value) || 0)}
                />
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label">Refund Mode</label>
                <select
                    className="drawer-form-select"
                    value={formData.refundMode}
                    onChange={(e) => handleChange('refundMode', e.target.value)}
                >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card Refund</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                </select>
            </div>

            <div className="drawer-form-group">
                <label className="drawer-form-label">Refund Amount (₹)</label>
                <input
                    type="number"
                    min="0"
                    max={reservation?.paidAmount || 0}
                    className="drawer-form-input"
                    value={formData.refundAmount}
                    onChange={(e) => handleChange('refundAmount', parseFloat(e.target.value) || 0)}
                />
            </div>

            <div className="drawer-summary">
                <div className="drawer-summary-title">Refund Summary</div>
                <div className="drawer-summary-row">
                    <span className="drawer-summary-label">Amount Paid</span>
                    <span className="drawer-summary-value">₹{(reservation?.paidAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="drawer-summary-row">
                    <span className="drawer-summary-label">Cancellation Charges</span>
                    <span className="drawer-summary-value">₹{(formData.cancellationCharges || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="drawer-summary-row">
                    <span className="drawer-summary-label">Refund Amount</span>
                    <span className="drawer-summary-value highlight">₹{(formData.refundAmount || 0).toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div className="drawer-info-box success">
                <p className="drawer-info-text">
                    ℹ️ SMS/WhatsApp notification will be sent to the guest after cancellation.
                </p>
            </div>
        </DrawerPanel>
    );
};

export default {
    CheckInDrawer,
    AddPaymentDrawer,
    AmendStayDrawer,
    RoomMoveDrawer,
    ExchangeRoomDrawer,
    VisitorDrawer,
    NoShowDrawer,
    VoidDrawer,
    CancelDrawer
};
