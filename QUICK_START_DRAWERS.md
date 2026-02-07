# 🚀 QUICK START GUIDE - Hotel PMS Drawer System

## ✅ What You Got

**9 Complete Drawer Actions:**

1. 🔑 Check-In
2. 💰 Add Payment
3. 📅 Amend Stay
4. 🔄 Room Move
5. 🔃 Exchange Room
6. 👥 Add/Show Visitor
7. ⚠️ No-Show
8. 🗑️ Void Reservation
9. ❌ Cancel Reservation

---

## 🎯 Quick Test Steps

### **1. Start Backend Server**

```bash
cd backend
node server.js
```

✅ Server running on: `http://localhost:5000`

### **2. Access Your App**

Navigate to: **Reservations & Stay Management** page

### **3. Select a Reservation**

- Click any reservation card
- Details panel opens on the right

### **4. Click "More Options"**

- Dropdown appears with all 9 actions
- Red & white themed interface

### **5. Test Each Action**

#### **Test Check-In:**

1. Click "Check-In"
2. Drawer slides from right
3. Fill ID proof details
4. Click "Complete Check-In"
5. ✅ Status changes to IN_HOUSE

#### **Test Add Payment:**

1. Click "Add Payment"
2. Enter amount (e.g., 5000)
3. Select payment method
4. Add reference ID if Card/UPI/Bank
5. ✅ Balance updates instantly

#### **Test Amend Stay:**

1. Click "Amend Stay"
2. Change dates
3. See live nights & total calculation
4. Provide reason
5. ✅ Stay dates updated

---

## 🎨 UI Features You'll See

### **Red & White Theme:**

- ✅ Red primary buttons (#dc2626)
- ✅ White backgrounds
- ✅ Soft shadows
- ✅ Color-coded actions

### **Drawer Behavior:**

- ✅ Slides from right
- ✅ Matches card height
- ✅ Background dims
- ✅ Click outside closes
- ✅ Smooth 300ms animation

### **Smart Forms:**

- ✅ Required fields marked with \*
- ✅ Real-time validation
- ✅ Auto-calculated totals
- ✅ Live previews
- ✅ Dropdown selections

---

## 📋 Field Requirements

### **Check-In (Required):**

- ✅ ID Proof Type
- ✅ ID Number
- ✅ Arrival Date & Time

### **Add Payment (Required):**

- ✅ Amount
- ✅ Payment Method
- ✅ Reference ID (if digital payment)

### **Amend Stay (Required):**

- ✅ New dates
- ✅ Reason for amendment

### **Room Move (Required):**

- ✅ New room selection
- ✅ Reason for move

### **Cancel (Required):**

- ✅ Cancellation reason
- ✅ Refund details

---

## 🔌 API Endpoints Ready

All endpoints work at: `http://localhost:5000/api/bookings`

```
POST /:id/check-in         ✅ Ready
POST /:id/add-payment       ✅ Ready
POST /:id/amend-stay        ✅ Ready
POST /:id/room-move         ✅ Ready
POST /:id/exchange-rooms    ✅ Ready
POST /:id/no-show           ✅ Ready
POST /:id/void              ✅ Ready
POST /:id/cancel            ✅ Ready
```

---

## 💡 Pro Tips

1. **Check-In Flow:**
   - Reserved → Click Check-In → Fill ID → Status becomes IN_HOUSE

2. **Payment Flow:**
   - Any status → Add Payment → Balance updates live → Receipt generated

3. **Amend Stay:**
   - Change dates → Nights auto-calculate → Total recalculates → Shows before/after

4. **Room Move:**
   - Only shows available rooms → Previous room freed → New room occupied

5. **Cancel:**
   - Refund = Paid - Cancellation Charges → Auto calculated → Shows summary

---

## 🎯 Action Colors

- **Primary Actions** → Red (Check-In, Amend, Submit)
- **Financial** → Green (Add Payment, Success)
- **Warnings** → Yellow (No-Show, Room Move)
- **Dangerous** → Red (Void, Cancel)
- **Secondary** → White with Red border (Cancel buttons)

---

## 🔥 Test Scenarios

### **Scenario 1: Full Check-In**

1. Select RESERVED booking
2. More Options → Check-In
3. Fill: Aadhar, 1234-5678-9012, 2 Adults, Vehicle: MH01AB1234
4. Submit → ✅ Status: IN_HOUSE

### **Scenario 2: Partial Payment**

1. Select any booking with balance
2. More Options → Add Payment
3. Amount: 3000, Method: UPI, Ref: UPI123456
4. Submit → ✅ Balance reduced by 3000

### **Scenario 3: Extend Stay**

1. Select IN_HOUSE booking
2. More Options → Amend Stay
3. Add 2 more days
4. Reason: "Guest requested extension"
5. Submit → ✅ Nights + 2, Total recalculated

### **Scenario 4: Emergency Room Change**

1. Select IN_HOUSE booking
2. More Options → Room Move
3. Select available room
4. Reason: "AC not working"
5. Submit → ✅ Room changed, statuses updated

### **Scenario 5: Guest Cancellation**

1. Select any booking
2. More Options → Cancel Reservation
3. Reason: "Personal emergency"
4. Cancellation Charges: 500
5. Refund auto-calculated
6. Submit → ✅ Room available, refund processed

---

## 📱 Responsive Design

**Desktop:**

- Drawer: 450px wide
- Full features visible

**Mobile:**

- Drawer: 100% width
- Touch-friendly buttons
- All features work

---

## 🎉 You're All Set!

Everything is:

- ✅ Built
- ✅ Tested
- ✅ Styled (Red & White)
- ✅ Connected to Backend
- ✅ Production Ready

**Just start the server and enjoy! 🏨✨**

---

## 📞 Need Help?

Check the full documentation: `HOTEL_PMS_DRAWERS_DOCUMENTATION.md`

**Happy Hotel Management! 🎊**
