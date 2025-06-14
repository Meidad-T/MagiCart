
import { useEffect, useState } from 'react';

interface AIThinkingAnimationProps {
  isThinking: boolean;
  steps: string[];
  currentStep: number;
}

export const AIThinkingAnimation = ({ isThinking, steps, currentStep }: AIThinkingAnimationProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isThinking) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 200); // Faster dots animation

    return () => clearInterval(interval);
  }, [isThinking]);

  if (!isThinking) return null;

  return (
    <div className="space-y-2">
      {steps.slice(0, currentStep + 1).map((step, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {index < currentStep ? (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            ) : index === currentStep ? (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            )}
          </div>
          <div className="flex-1">
            <div 
              className={`text-sm transition-all duration-200 ${
                index <= currentStep ? 'text-gray-800' : 'text-gray-400'
              }`}
            >
              {step}
              {index === currentStep && (
                <span className="text-blue-500 ml-1">{dots}</span>
              )}
            </div>
            {index === currentStep && (
              <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 w-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
