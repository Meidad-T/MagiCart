
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
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Create confetti particles positioned within the container width
    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * containerWidth, // Spread within container width only
      y: 0, // Start at the very top of the container
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 3,
      velocityY: Math.random() * 2 + 1,
      size: Math.random() * 6 + 4 // Reduced from 12 + 8 to 6 + 4
    }));

    setParticles(newParticles);

    // Remove particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, 2000); // Reduced from 4000 to 2000

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className={`relative overflow-visible ${className}`} ref={textRef}>
      {children}
      {particles.length > 0 && (
        <div className="absolute pointer-events-none overflow-visible" 
             style={{ 
               top: 0, 
               left: 0, 
               width: '100%', 
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
                animation: `confetti-fall 2s ease-out forwards`, // Reduced from 4s to 2s
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
            transform: translateY(110px) rotate(360deg) scale(0.8); /* Reduced from 220px to 110px */
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfettiText;
