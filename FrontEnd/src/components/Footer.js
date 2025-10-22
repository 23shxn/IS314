import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Car Rental</h3>
            <p>Your trusted partner for vehicle rentals. Quality cars, great prices, exceptional service.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/search">Search Cars</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="/faqs">FAQs</a></li>
              <li><a href="/contact">Help Center</a></li>
              <li><a href="/contact">Customer Service</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>📧 support@carrental.com</p>
            <p>📞 +1 (555) 123-4567</p>
            <p>📍 123 Main St, City, State 12345</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Car Rental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
