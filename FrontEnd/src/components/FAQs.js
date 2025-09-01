import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import "../styles/FAQs.css";

const FAQ_ITEM_DATA = [
  { q: "Do you provide insurance?", a: "Yes. Third-party liability cover is included. An optional Collision Damage Waiver (CDW) can be added at pickup for reduced excess." },
  { q: "Is petrol included in the car rental rate?", a: "No. Vehicles are supplied with a full tank and must be returned full. Refuelling fees apply if the tank is not full on return." },
  { q: "Are there any restrictions to hiring cars?", a: "Drivers must be 21+ with a valid license held for 2+ years. Off-road driving and beach driving are not permitted." },
  { q: "Can I hire any vehicle I want?", a: "Bookings are confirmed for a vehicle category (or similar). Specific models are subject to availability." },
  { q: "Can I extend my hire term?", a: "Absolutely—subject to availability. Please contact us at least 24 hours before the original return time." },
  { q: "Is there any other payment other than the rental fee?", a: "Security bond and optional add-ons (CDW, child seats, GPS) may apply. Roadside assistance is included." },
  { q: "What happens if I decide to cancel my booking?", a: "Free cancellation up to 48 hours prior to pickup. Inside 48 hours a one-day charge may apply." },
  { q: "What is Fiji’s speed limit?", a: "Urban 50 km/h unless signed; open road 80 km/h unless otherwise signposted. Always follow posted limits." },
  { q: "When do I pay for rental?", a: "A deposit holds your booking. The balance is due at pickup." },
  { q: "Can I return my rental dirty?", a: "Light dirt is fine. Excessive sand/mud or interior spills may incur a cleaning fee." },
];

const DropOffTable = () => (
  <div className="dropoff">
    <h3>Drop-off: Delivery / Collection Charges</h3>
    <div className="table">
      <div className="row head">
        <div>Location</div><div>Fee (FJD)</div>
      </div>
      <div className="row"><div>Nadi Airport → Coral Coast</div><div>$65.00</div></div>
      <div className="row"><div>Nadi Airport → Suva</div><div>$100.00</div></div>
      <div className="row"><div>Suva → Nausori Airport</div><div>$45.00</div></div>
      <div className="row"><div>Suva → Coral Coast</div><div>$65.00</div></div>
    </div>
    <p className="muted">Note: Out-of-hours pickups (8:00pm–7:00am) attract an additional $30.00 per hour driver fee.</p>
  </div>
);

const InfoBlock = ({ title, children }) => (
  <section className="info-block">
    <h3><Info size={18} /> {title}</h3>
    {children}
  </section>
);

const AccordionItem = ({ item, isOpen, onToggle }) => (
  <div className={`faq-item ${isOpen ? "open" : ""}`}>
    <button className="faq-question" onClick={onToggle} aria-expanded={isOpen}>
      <span className="plus">+</span>
      <span>{item.q}</span>
      {isOpen ? <ChevronUp className="chev" /> : <ChevronDown className="chev" />}
    </button>
    <div className="faq-answer" role="region">
      <p>{item.a}</p>
    </div>
  </div>
);

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <main className="faqs">
      <div className="faqs-hero">
        <div className="hero-copy">
          <h1>FAQs</h1>
          <p>Quick answers to common questions. For more details, please refer to our <a href="/terms">Terms &amp; Conditions</a>.</p>
        </div>
        <div className="hero-art">
         
          <img src="/images/faqs.png" alt="FAQ book with question mark" />
        </div>
      </div>

      <section className="faq-list">
        {FAQ_ITEM_DATA.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
        <p className="note small">Outside town: 80 km/h unless a different speed limit sign is displayed.</p>
      </section>

      <InfoBlock title="All rates & charges are quoted in FJD">
        <p>Due to demand and prior bookings, your booking is to be regarded as for one of the available vehicles within a specific group, rather than a specific vehicle.</p>
        <ul>
          <li>One-day rentals have first 200 km free. There is a surcharge after this. Multiple-day hires have unlimited mileage.</li>
          <li>Chauffeur driver on request: $70.00 per day 08:00–17:00 (rental charge not included). Extra time $30.00 per hour.</li>
        </ul>
      </InfoBlock>

      <InfoBlock title="Fuel">
        <ul>
          <li>Vehicles are supplied with a full tank and must be returned full.</li>
          <li>Missing fuel will be refuelled at pump price + $20.00 service fee.</li>
        </ul>
      </InfoBlock>

      <InfoBlock title="Extras">
        <ul>
          <li>Child safety seats available at $8.00/day per seat.</li>
          <li>GPS and phone mounts available on request.</li>
        </ul>
      </InfoBlock>

      <InfoBlock title="Drivers">
        <ul>
          <li>Chauffeur drivers can be made available with 48 hours’ notice. $70.00/day (08:00–17:00). Outside these times, $30.00 per hour.</li>
          <li>All drivers must provide a current, original local or overseas full driving license.</li>
        </ul>
      </InfoBlock>

      <DropOffTable />

      <InfoBlock title="Other">
        <ul>
          <li>Extensions are possible based on availability. Extensions must be requested (phone/email) and acknowledged by us.</li>
          <li>Extra cleaning may be charged for excessive sand/mud or spills.</li>
        </ul>
      </InfoBlock>
    </main>
  );
};

export default FAQs;
