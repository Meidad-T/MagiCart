
import React, { useEffect, useState } from 'react';

interface ConfettiTextProps {
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}

const ConfettiText = ({ children, trigger, className = '' }: ConfettiTextProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    velocityX: number;
    velocityY: number;
  }>>([]);

  const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0099ff', '#6600ff', '#ff00ff'];

  useEffect(() => {
    if (!trigger) return;

    // Create confetti particles
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50, // Random position around center
      y: Math.random() * 100 - 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: (Math.random() - 0.5) * 4
    }));

    setParticles(newParticles);

    // Remove particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, 2000);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className={`relative ${className}`}>
      {children}
      {particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 animate-ping"
              style={{
                left: `calc(50% + ${particle.x}px)`,
                top: `calc(50% + ${particle.y}px)`,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
                animation: `confetti-fall 2s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100px) rotate(720deg) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfettiText;
