import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import "../styles/Cancellation.css";

// --- Input formatters ---
const formatCardNumber = (value) => {
  return value
    .replace(/\D/g, "")        // digits only
    .replace(/(.{4})/g, "$1 ") // space every 4 digits
    .trim();
};

const formatExpiry = (value) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 0) return "";
  if (cleaned.length <= 2) return cleaned;
  return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
};

export default function CancelReservation({ reservations, setReservations, currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [reservation, setReservation] = useState(null);
  const [agree, setAgree] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  // Payment form states
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});

  // Refs for auto focus jump
  const expiryRef = useRef(null);
  const cvvRef = useRef(null);

  useEffect(() => {
    const res = reservations.find(r => r.id == id);
    if (res) {
      setReservation({
        id: res.id,
        vehicleName: `${res.vehicle?.make || ''} ${res.vehicle?.model || ''}`.trim(),
        pickupAt: res.pickupDate ? new Date(res.pickupDate).toISOString() : (res.rentalDate ? new Date(res.rentalDate).toISOString() : new Date().toISOString()),
        totalAmount: res.totalPrice || 0,
        currency: "FJD",
      });
    }
  }, [id, reservations]);

  // --- Fee logic ---
  const feePreview = useMemo(() => {
    if (!reservation) return null;
    const pickup = new Date(reservation.pickupAt);
    const hoursToPickup = (pickup - new Date()) / 36e5; // hours
    const total = Number(reservation.totalAmount || 0);

    let feePct = 0;
    if (hoursToPickup < 24) feePct = 0.3;
    else if (hoursToPickup < 72) feePct = 0.1;

    const cancellationFee = round2(total * feePct);
    const refundAmount = 0; // Non-refundable

    return {
      cancellationFee,
      refundAmount,
      currency: reservation.currency || "FJD",
      hoursToPickup,
    };
  }, [reservation]);

  // --- Validation ---
  const validatePayment = () => {
    const newErrors = {};
    const cardDigits = cardNumber.replace(/\s+/g, "");

    if (!/^\d{16}$/.test(cardDigits)) newErrors.cardNumber = "Card number must be 16 digits.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Invalid expiry format (MM/YY).";
    } else {
      const [mm, yy] = expiry.split("/").map(Number);
      const expiryDate = new Date(2000 + yy, mm);
      if (expiryDate <= new Date()) newErrors.expiry = "Card has expired.";
    }
    if (!/^\d{3}$/.test(cvv)) newErrors.cvv = "CVV must be 3 digits.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancelClick = () => setShowPayment(true);

  const handleCancel = async () => {
    if (feePreview?.cancellationFee > 0 && !validatePayment()) return;

    setPaymentLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/reservations/${id}/cancel`, {}, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      setReservations(prev => prev.map(r => r.id == id ? {...r, status: 'Cancelled'} : r));
      setPaymentLoading(false);
      setShowPayment(false);
      navigate("/reservations", { state: { successMessage: "Your reservation has been successfully cancelled. A confirmation email has been sent to you." } });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Failed to cancel reservation. Please try again.');
      setPaymentLoading(false);
    }
  };

  // --- Auto formatting + navigation ---
  const handleCardChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    const digits = formatted.replace(/\s/g, "");
    if (digits.length === 16 && expiryRef.current) {
      expiryRef.current.focus();
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
    if (formatted.length === 5 && cvvRef.current) {
      cvvRef.current.focus();
    }
  };

  // --- Loading ---
  if (!reservation)
    return (
      <div className="cancel-page container">
        <div className="card center">
          <div className="spinner" />
          <p>Loading reservation...</p>
        </div>
      </div>
    );

  // --- Main Page ---
  return (
    <div className="cancel-page container">
      <h2 className="title">Cancel Reservation</h2>

      <div className="grid">
        <div className="card">
          <h3>Booking Summary</h3>
          <p><strong>Reservation ID:</strong> {reservation.id}</p>
          <p><strong>Vehicle:</strong> {reservation.vehicleName}</p>
          <p><strong>Pickup:</strong> {fmtDateTime(reservation.pickupAt)}</p>
          <p><strong>Total Paid:</strong> {money(reservation.totalAmount, reservation.currency)}</p>
          {feePreview && (
            <>
              <div className="divider" />
              <p><strong>Estimated cancellation fee:</strong> {money(feePreview.cancellationFee, feePreview.currency)}</p>
              <p><strong>Estimated refund:</strong> {money(0, feePreview.currency)} <span className="muted">(Non-refundable)</span></p>
            </>
          )}
        </div>

        <div className="card">
          <h3>Cancellation Policy</h3>
          <ul className="policy-list">
            <li><strong>No refunds:</strong> All bookings are fully paid during reservation and are non-refundable.</li>
            <li><strong>No cancellation fee</strong> if you cancel <strong>3–5 days (72–120 hours)</strong> before pickup.</li>
            <li><strong>10% fee</strong> if you cancel within <strong>24–72 hours</strong> of pickup.</li>
            <li><strong>30% fee</strong> if you cancel within <strong>24 hours</strong> of pickup.</li>
          </ul>

          <label className="confirm">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            I have read and agree to the cancellation policy.
          </label>

          <div className="actions">
            <button className="btn-danger" disabled={!agree} onClick={handleCancelClick}>
              Proceed to Cancel
            </button>
            <button className="btn-ghost" onClick={() => navigate("/reservations")}>
              Keep my booking
            </button>
          </div>
        </div>
      </div>

      {/* --- Mock Payment Modal --- */}
      {showPayment && (
        <div className="payment-overlay">
          <div className="payment-modal">
            <h3>Mock Payment Gateway</h3>

            {feePreview?.cancellationFee > 0 ? (
              <>
                <p>Pay your cancellation fee to complete the process.</p>

                <div className="card-field">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardNumber}
                    onChange={handleCardChange}
                  />
                  {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                </div>

                <div className="row">
                  <div className="card-field">
                    <label>Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      ref={expiryRef}
                      value={expiry}
                      onChange={handleExpiryChange}
                    />
                    {errors.expiry && <span className="error-text">{errors.expiry}</span>}
                  </div>
                  <div className="card-field">
                    <label>CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={3}
                      ref={cvvRef}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    />
                    {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                  </div>
                </div>

                <div className="divider" />
                <p><strong>Cancellation Fee:</strong> {money(feePreview.cancellationFee, feePreview.currency)}</p>

                <div className="actions">
                  <button className="btn-primary" disabled={paymentLoading} onClick={handleCancel}>
                    {paymentLoading ? "Processing..." : "Pay & Confirm"}
                  </button>
                  <button className="btn-ghost" onClick={() => setShowPayment(false)} disabled={paymentLoading}>
                    Back
                  </button>
                </div>
              </>
            ) : (
              <>
                <p><strong>No payment required.</strong> There is no cancellation fee for this booking window.</p>
                <div className="divider" />
                <div className="actions">
                  <button className="btn-primary" disabled={paymentLoading} onClick={handleCancel}>
                    {paymentLoading ? "Confirming..." : "Confirm Cancellation"}
                  </button>
                  <button className="btn-ghost" onClick={() => setShowPayment(false)} disabled={paymentLoading}>
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helpers ---
function money(n, ccy = "FJD") {
  return `${ccy} ${n.toFixed(2)}`;
}
function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}
