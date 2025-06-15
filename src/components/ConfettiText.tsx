
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

    // Create confetti particles positioned to span the full width of the container
    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * containerWidth, // Spread across full container width
      y: 0, // Start at the very top of the container
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 3,
      velocityY: Math.random() * 2 + 1,
      size: Math.random() * 4 + 3
    }));

    setParticles(newParticles);

    // Remove particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className={`relative overflow-visible ${className}`} ref={textRef}>
      {children}
      {particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 9999 }}>
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
                animation: `confetti-fall 3s ease-out forwards`,
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
          100% {
            transform: translateY(150px) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfettiText;
