import React from "react";
import "../../css/PopularServices/Explore.css";

function Explore () {
  return (
    <div className="service-page">
      <div className="service-hero">
        <h1>Electrician Services</h1>
        <p>Professional wiring, repairs & installations</p>
      </div>

      <div className="service-content">
        <h2>What we offer</h2>
        <ul>
          <li>House wiring & rewiring</li>
          <li>Switch & socket installation</li>
          <li>Fan, light & inverter fitting</li>
          <li>Short circuit repair</li>
          <li>24x7 emergency support</li>
        </ul>

        <button className="service-book-btn">
          Book Electrician
        </button>
      </div>
    </div>
  );
}

export default Explore;
