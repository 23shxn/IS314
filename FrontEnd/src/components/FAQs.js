import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import "../styles/FAQs.css";

const FAQ_ITEM_DATA = [
  { q: "How do I register an account successfully?", a: "Fill out the registration form correctly and submit your information to create an account. After being submitted, our team will review and approve your request. Within about 30 minutes, you will receive an email notification confirming the approval or rejection of your registration." },
  { q: "What should I do if I forgot my password?", a: "If you have forgotten your password, click on the “Forgot your password?” link on the login page and you will be directed to reset your password." },
  { q: "Where can I find additional information?", a: "Additional information can be viewed on the Terms and Conditions page, User Manual or send us a message through the Contact Us page." },
  { q: "Are there any restrictions to hiring cars?", a: "Drivers must be 21+ with a valid license held for 2+ years. Off-road driving and beach driving are not permitted.", a: "Pets are not permitted in the rentals." },
  { q: "Can I hire any vehicle I want?", a: "Specific models are subject to availability." },
  { q: "Can I extend my hire term?", a: "No, hiring term extensions are not permitted." },
  { q: "What is Fiji’s speed limit?", a: "Urban 50 km/h unless signed; open road 80 km/h unless otherwise signposted. Always follow posted limits." },
  { q: "Can I return my rental dirty?", a: "Light dirt is fine. Excessive sand/mud or interior spills may lead to a partial or full deduction of bond." },
  { q: "What if I lose my keys", a: "If the vehicle keys are lost, the security bond will not be refunded, and additional replacement or service charges may apply depending on the situation." },
  { q: "Do you provide insurance?", a: "Yes. All rentals include third-party liability insurance for basic coverage." },
  { q: "What happens if I decide to cancel my booking?", a: "Free cancellation up to 72 hours prior to pickup. Inside 72 hours a cancellation fee may apply." },
  { q: "Is petrol included in the car rental rate?", a: "No. Vehicles are supplied with a full tank and must be returned full. Refuelling fees apply if the tank is not full on return." },
  { q: "Is there any other payment other than the rental fee?",  a: "Security bond and optional add-ons (child seats, power bank) may apply. Roadside assistance is included." },
  { q: "When do I pay for my rental?", a: "Payment must be completed when making your reservation. The total may include the rental fee and any additional amenities selected." },
  { q: "Do I have to pay a bond", a: "Yes, a security bond of $200 dollars is required for all bookings. Bonds are to be paid in cash upon pickup." },
  
];


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
          <p>Quick answers to common questions. For more details, please refer to our <a href="https://docs.google.com/document/d/1xfsgmta-rCokIccONsX5WGsLaEuYNySCdJrKrN7kAw0/edit?usp=drivesdk">Terms &amp; Conditions</a>.</p>
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

      

      

      
    </main>
  );
};

export default FAQs;
