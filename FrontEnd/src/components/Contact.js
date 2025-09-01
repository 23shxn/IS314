// src/components/Contact.js
import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import '../styles/Contact.css';

const INITIAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const Contact = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Please enter your full name.';
    if (!form.email.trim()) {
      e.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address.';
    }
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.message.trim() || form.message.trim().length < 10) {
      e.message = 'Message should be at least 10 characters.';
    }
    return e;
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setStatus({ type: '', message: '' });

    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Hook up to your backend/email service:
      // const res = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form),
      // });
      // if (!res.ok) throw new Error('Failed to send');
      await new Promise((r) => setTimeout(r, 800)); // demo delay

      setStatus({ type: 'success', message: 'Thanks! Your message has been sent.' });
      setForm(INITIAL_FORM);
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again or email us directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero / Header */}
      <section className="contact-hero">
        <div className="container">
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">
            Questions, bookings, or special requests? We’re here to help.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="container contact-grid">
        {/* Left: Contact Info */}
        <aside className="contact-card">
          <h2 className="card-title">Get in touch</h2>
          <p className="card-text">
            Reach us by phone or email, or visit our office during business hours.
          </p>

          <div className="info-list">
            <div className="info-item">
              <Phone className="info-icon" aria-hidden />
              <div>
                <div className="info-label">Phone</div>
                <a href="tel:+679-555-0199" className="info-link">
                  +679 555 0199
                </a>
              </div>
            </div>

            <div className="info-item">
              <Mail className="info-icon" aria-hidden />
              <div>
                <div className="info-label">Email</div>
                <a href="mailto:hello@abcrentals.fj" className="info-link">
                  services@rrentals.com.fj
                </a>
              </div>
            </div>

            <div className="info-item">
              <MapPin className="info-icon" aria-hidden />
              <div>
                <div className="info-label">Address</div>
                <div className="info-value">
                  Lot 12 Queens Rd, Nadi, Fiji
                </div>
              </div>
            </div>

            <div className="info-item">
              <Clock className="info-icon" aria-hidden />
              <div>
                <div className="info-label">Hours</div>
                <div className="info-value">
                  Mon–Sat: 8:00–18:00 • Sun: 9:00–16:00
                </div>
              </div>
            </div>
          </div>

          {/* Map Embed (replace with your location) */}
          <div className="map-embed" aria-label="Map showing our location">
            
            <iframe
              title="Ronaldo Rentals Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3643.2234387148496!2d178.4418740750038!3d-18.149076982873908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6e1bddce0861e327%3A0x58550f51daa0dc31!2sUSP%20Library!5e1!3m2!1sen!2sfj!4v1756700773052!5m2!1sen!2sfj"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>

        {/* Right: Form */}
        <div className="contact-card">
          <h2 className="card-title">Send us a message</h2>

          {status.type === 'success' && (
            <div className="banner banner-success" role="status">
              <CheckCircle2 className="banner-icon" aria-hidden />
              <span>{status.message}</span>
            </div>
          )}
          {status.type === 'error' && (
            <div className="banner banner-error" role="alert">
              <AlertCircle className="banner-icon" aria-hidden />
              <span>{status.message}</span>
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  placeholder="e.g., Josephine Naivalu"
                />
                {errors.fullName && (
                  <p id="fullName-error" className="field-error">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p id="email-error" className="field-error">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="phone">Phone (optional)</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+679 555 0199"
                />
              </div>

              <div className="form-field">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  aria-invalid={!!errors.subject}
                  aria-describedby={errors.subject ? 'subject-error' : undefined}
                  placeholder="Booking inquiry, pricing, etc."
                />
                {errors.subject && (
                  <p id="subject-error" className="field-error">
                    {errors.subject}
                  </p>
                )}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={form.message}
                onChange={handleChange}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'message-error' : undefined}
                placeholder="Tell us about your trip dates, car type, pickup location..."
              />
              {errors.message && (
                <p id="message-error" className="field-error">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Send className="btn-icon" aria-hidden />
              {isSubmitting ? 'Sending…' : 'Send message'}
            </button>

            {/* Direct email fallback */}
            <p className="form-hint">
              Prefer email? Write to{' '}
              <a href="mailto:hello@abcrentals.fj">services@rrentals.com.fj</a>
            </p>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Contact;
