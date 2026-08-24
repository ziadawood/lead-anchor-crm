import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileStep } from './steps/ProfileStep';
import { LocationStep } from './steps/LocationStep';
import { IntegrationStep } from './steps/IntegrationStep';

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    companyName: '',
    track: 'trades' as 'trades' | 'predictable',
    address: '',
    city: '',
    state: '',
    zip: '',
    hours: '9-5',
    phoneNumber: '',
  });

  const updateData = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleComplete = () => {
    // Navigate to pipeline upon successful onboarding
    navigate('/pipeline');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="max-w-2xl w-full mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>
          
          {[1, 2, 3].map((step) => (
            <div 
              key={step} 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold relative z-10 transition-colors duration-300 ${
                step <= currentStep 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
          <span>Profile</span>
          <span>Location</span>
          <span>Phone Number</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="glass max-w-2xl w-full p-8 rounded-2xl shadow-xl">
        {currentStep === 1 && (
          <ProfileStep 
            data={formData} 
            updateData={updateData} 
            onNext={() => setCurrentStep(2)} 
          />
        )}
        
        {currentStep === 2 && (
          <LocationStep 
            data={formData} 
            updateData={updateData} 
            onNext={() => setCurrentStep(3)} 
            onBack={() => setCurrentStep(1)} 
          />
        )}

        {currentStep === 3 && (
          <IntegrationStep 
            data={formData} 
            fullData={formData}
            updateData={updateData} 
            onComplete={handleComplete} 
            onBack={() => setCurrentStep(2)} 
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
