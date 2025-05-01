

import React from 'react';
import "./CSS/home.css";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div id="home" className="home-container">
        <div className="background-image">
          <div className="content">
            
            <h2 style={{ color: "white" }}>The one-stop service for tire condition analysis</h2>
            <button className='button' onClick={() => navigate('/tollplaza')}>Check tire condition</button>
          </div>
        </div>
      </div>

      <div id="info" className="additional-info">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h3>More Information</h3>
              <p>
                Our automatic tire analyzer provides advanced analysis of tire condition using cutting-edge technology. It offers accurate and efficient tire health assessments to enhance vehicle safety and performance.
              </p>
              <p>
                This application is created by <br/>K. Vamshi Krishna <br/> K. Sai Likhith<br/> CH. Sri Ram 
              </p>
            </div>
            <div className="col-md-6">
              <h3>Contact Us</h3>
              <p>
                For inquiries and support, please contact us via email: <a href="mailto:example@gmail.com">kasanivamshikrishna8181@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
