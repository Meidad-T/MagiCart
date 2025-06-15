
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

    // Get the actual position of the text element
    const rect = textRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create more confetti particles with bigger spread
    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: centerX + (Math.random() * 200 - 100), // Wider spread around text center
      y: centerY - 50 - Math.random() * 50, // Start above the text
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 6, // More horizontal movement
      velocityY: Math.random() * 3 + 2, // Faster downward movement
      size: Math.random() * 6 + 4 // Bigger particles (4-10px)
    }));

    setParticles(newParticles);

    // Remove particles after longer animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className={`relative ${className}`} ref={textRef}>
      {children}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
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
                animationDelay: `${Math.random() * 0.5}s`,
                borderRadius: '2px',
                willChange: 'transform, opacity' // Optimize for animations
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
            transform: translateY(100vh) rotate(720deg) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfettiText;
