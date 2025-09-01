import React from 'react';
import {
  Car,
  Search,
  Calendar,
  Users,
  CalendarCheck,
  BadgePercent,
  Key,
  Headphones,
  Star
} from 'lucide-react';
import '../styles/LandingPage.css';
import { useNavigate } from 'react-router-dom';
import HeroSlideshow from "./HeroSlideshow";


const LandingPage = ({ currentUser, setCurrentView }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  const navigate = useNavigate();
  const heroImages = [
    "/images/carpic1.jpg",
    "/images/carpic2.jpg",
    "/images/carpic3.jpg",
  ];

  const HOW_IT_WORKS = [
  {
    title: '1. Search',
    text: 'Find the right car for your trip.',
    icon: <Search className="feature-icon" />,
    img: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: '2. Book',
    text: 'Reserve instantly with transparent pricing.',
    icon: <CalendarCheck className="feature-icon" />,
    img: 'https://images.unsplash.com/photo-1556742043-953d8f0fd1d2?q=80&w=1200&auto=format&fit=crop'
  },
  {
    title: '3. Drive',
    text: 'Pick up your keys and enjoy the journey.',
    icon: <Car className="feature-icon" />,
    img: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?q=80&w=1200&auto=format&fit=crop'
  }
  ];


  const OFFERS = [
    {
      title: 'Special Discount',
      text: 'Get 5% off on your very first trip with Ronaldos Rentals',
      img: "/images/5off.jpg"
    },
    {
      title: 'Weekend Saver',
      text: 'Enjoy 10% off all weekend rentals. Perfect for quick getaways.',
      img: "/images/weekend.jpg"
    },
    {
      title: 'Family Bundle',
      text: 'Book a 7-seater SUV and get a free child seat included',
      img: "/images/familybundle.jpg"
    }
  ];

  const TESTIMONIALS = [
    { quote: 'Best rental experience ever! Smooth booking and clean cars.', name: 'Marie T.', stars: 4},
    { quote: 'Affordable prices and excellent support team. Highly recommend!', name: 'James R.', stars: 5 },
    { quote: 'Pickup was on time and the car was spotless.', name: 'Ane P.', stars: 4.5 },
  ];

  return (
    <div className="landing-container">
      <HeroSlideshow
        images={heroImages}
        heading="Travel Smart, Stay Ravishing!"
        subheading="Vacation and Business Rentals Made Easy."
        ctaText="Book Now"
        onCtaClick={() => navigate('/search')}
      />
      <section className="how-it-works">
        <h2>3 Steps to Your Ride</h2>
        <p className="how-subtitle">
          Booking with Ronaldo's Ravishing Rentals is simple, fast, and hassle-free.
        </p>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-icon">
              <Search size={40} />
            </div>
            <h3>Search</h3>
            <p>Find the perfect car that matches your trip.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">
              <Calendar size={40} />
            </div>
            <h3>Book</h3>
            <p>Reserve instantly with transparent pricing.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">
              <Car size={40} />
            </div>
            <h3>Drive</h3>
            <p>Pick up your keys and enjoy the journey.</p>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Special Offers</h2>
        <div className="feature-grid">
          {OFFERS.map((item) => (
            <div key={item.title} className="card feature-card feature-with-photo">
              <div className="card-media">
                <img src={item.img} alt={item.title} />
                <div className="media-gradient" />
              </div>
              <div className="card-body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonials">
        <h2>What Our Customers Say</h2>
        <div className="feature-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card testimonial-card">
              <div className="card-body">
                <div className="stars">
                  {Array.from({ length: Math.floor(t.stars) }).map((_, s) => (
                    <Star key={s} size={20} fill="#6b21a8" />
                  ))}
                  {t.stars % 1 !== 0 && (
                    <Star size={20} fill="none" stroke="#6b21a8" />
                  )}
                </div>
                <p className="quote">"{t.quote}"</p>
                <p className="name">— {t.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="card cta-card cta-flex">
          <div className="cta-text">
            <h2>Ready to Rent?</h2>
            <p>
              Explore our fleet and find the best deal for your trip.
            </p>
            <button onClick={() => navigate('/search')} className="btn-primary">
              <Search className="btn-icon" /> Search Cars Now
            </button>
          </div>
          <div className="cta-image">
            <img
              src="/images/smilinglady.jpg"
              alt="Smiling woman pointing at search button"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;