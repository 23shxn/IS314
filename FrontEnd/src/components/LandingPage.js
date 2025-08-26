import React from 'react';
import { Car, Search, Calendar, Users } from 'lucide-react';
import '../styles/LandingPage.css';
import { useNavigate } from 'react-router-dom';


const LandingPage = ({ currentUser, setCurrentView }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Ronaldo's Ravishing Rentals!</h1>
          <p>Book your perfect ride today with ease and flexibility!</p>
          <div className="hero-buttons">
            <button
              onClick={() => navigate('/search')}
              className="btn-primary btn-full"
            >
              <Search className="btn-icon" /> Get Started
            </button>
            {!currentUser && (
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary btn-full"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="feature-grid">
          <div className="card feature-card">
            <Car className="feature-icon" />
            <h3>Wide Selection</h3>
            <p>Choose from a variety of cars to suit your needs.</p>
          </div>
          <div className="card feature-card">
            <Calendar className="feature-icon" />
            <h3>Flexible Dates</h3>
            <p>Book for any duration with easy scheduling.</p>
          </div>
          <div className="card feature-card">
            <Users className="feature-icon" />
            <h3>Customer Support</h3>
            <p>24/7 support to assist you anytime.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="card cta-card">
          <h2>Ready to Rent?</h2>
          <p>Explore our fleet and find the best deal for your trip. Today is {currentDate} at {currentTime}.</p>
          <button
            onClick={() => setCurrentView('search')}
            className="btn-primary"
          >
            <Search className="btn-icon" /> Search Cars Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;