
import React, { useEffect, useState, useRef } from 'react';

interface ConfettiTextProps {
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}

const ConfettiText = ({ children, trigger, className = '' }: ConfettiTextProps) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    velocityX: number;
    velocityY: number;
    size: number;
  }>>([]);

  const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0099ff', '#6600ff', '#ff00ff'];

  useEffect(() => {
    if (!trigger || !textRef.current) return;

    // Get the container dimensions for relative positioning
    const rect = textRef.current.getBoundingClientRect();
    const containerWidth = rect.width * 2; // Double the width for spreading
    const containerHeight = rect.height;

    // Create confetti particles positioned to span twice the container width
    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: (Math.random() * containerWidth) - (containerWidth * 0.25), // Spread from -25% to 175% of container width
      y: 0, // Start at the very top of the container
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 3,
      velocityY: Math.random() * 2 + 1,
      size: Math.random() * 12 + 8 // Increased from 8 + 6 to 12 + 8
    }));

    setParticles(newParticles);

    // Remove particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, 4000); // Slightly longer duration

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className={`relative overflow-visible ${className}`} ref={textRef}>
      {children}
      {particles.length > 0 && (
        <div className="absolute pointer-events-none overflow-visible" 
             style={{ 
               top: 0, 
               left: '-50%', 
               width: '200%', 
               height: '200%',
               zIndex: 9999 
             }}>
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
                animation: `confetti-fall 4s ease-out forwards`,
                animationDelay: `${Math.random() * 0.3}s`,
                borderRadius: '2px',
                willChange: 'transform, opacity'
              }}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(220px) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfettiText;
