import React from "react";
import { CheckCircle, Users, Shield, Clock } from "lucide-react";
import "../styles/AboutUs.css";

const AboutUs = () => {
  return (
    <main className="about">

      {/* Story */}
      <section className="about-section container">
        <div className="about-grid">
          <div className="about-card about-card--text">
            <h2>Our Story</h2>
            <p>
              Started with a single family SUV and a big belief: renting a car should be
              simple and stress-free. Today, our growing fleet serves travelers across Fiji
              with clean, reliable vehicles and transparent service.
            </p>
            <ul className="about-list">
              <li><CheckCircle /> Transparent, all-in pricing</li>
              <li><CheckCircle /> Clean, well-maintained vehicles</li>
              <li><CheckCircle /> Friendly support when you need it</li>
            </ul>
          </div>
          <div className="about-card about-card--media">
            <img src="/images/carpic2.jpg" alt="Customer picking up a rental car" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="container stats-grid">
          <div className="stat">
            <h3>98%</h3>
            <p>Customer satisfaction</p>
          </div>
          <div className="stat">
            <h3>24/7</h3>
            <p>Roadside assistance</p>
          </div>
          <div className="stat">
            <h3>+50</h3>
            <p>Vehicles in our fleet</p>
          </div>
          <div className="stat">
            <h3>10 min</h3>
            <p>Average pickup time</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-section container">
        <h2 className="section-title">What We Value</h2>
        <div className="values-grid">
          <div className="value-card">
            <Shield className="value-icon" />
            <h3>Safety First</h3>
            <p>Regular servicing, insured vehicles, and careful inspections before every trip.</p>
          </div>
          <div className="value-card">
            <Clock className="value-icon" />
            <h3>Time Matters</h3>
            <p>Fast booking, quick pickups, and flexible returns that fit your plans.</p>
          </div>
          <div className="value-card">
            <Users className="value-icon" />
            <h3>People Over Everything</h3>
            <p>We treat every trip as if it were our own family on the road.</p>
          </div>
        </div>
      </section>

      
    </main>
  );
};

export default AboutUs;
