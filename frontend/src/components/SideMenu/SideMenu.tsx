import React, { useState, useEffect } from 'react';
import './SideMenu.scss';

const SideMenu: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      number: 1,
      title: "Click on the picture",
      description: "Click on the canvas to create polygon points"
    },
    {
      number: 2,
      title: "Name your polygon",
      description: "Enter a name for your polygon in the input field"
    },
    {
      number: 3,
      title: "Hit save polygon",
      description: "Click the save button to store your polygon"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000); // Change step every 3 seconds

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="side-menu">
      <div className="menu-header">
        <h3>How to use the app</h3>
      </div>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div 
            key={step.number}
            className={`step ${index === currentStep ? 'active' : ''}`}
          >
            <div className="step-number">{step.number}</div>
            <div className="step-content">
              <h4 className="step-title">{step.title}</h4>
              <p className="step-description">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideMenu; 