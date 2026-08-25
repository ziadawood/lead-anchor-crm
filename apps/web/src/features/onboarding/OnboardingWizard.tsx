import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileStep } from './steps/ProfileStep';
import { LocationStep } from './steps/LocationStep';
import { IntegrationStep } from './steps/IntegrationStep';
import { Anchor } from 'lucide-react';

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
    navigate('/pipeline');
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>
      <div className="auth-orb auth-orb-3"></div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            LeadAnchor
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 rounded-full z-0" style={{ background: 'rgba(148,163,184,0.1)' }}></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}
            ></div>
            
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm relative z-10 transition-all duration-300 ${
                  step <= currentStep 
                    ? 'text-white shadow-lg' 
                    : 'text-slate-600'
                }`}
                style={step <= currentStep 
                  ? { background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }
                  : { background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.1)' }
                }
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
        <div className="auth-card">
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
    </div>
  );
};

export default OnboardingWizard;
