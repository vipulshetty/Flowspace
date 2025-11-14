import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

export interface FeatureCardData {
  icon: React.ReactNode;
  title: string;
  description: string;
  label: string;
  color?: string;
}

export interface MagicBentoProps {
  features: FeatureCardData[];
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
}

const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';

const MagicBento: React.FC<MagicBentoProps> = ({
  features,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = 12,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gridRef.current || !enableSpotlight) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current;
      const rect = section.getBoundingClientRect();
      const mouseInside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll('.magic-bento-card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        cards.forEach(card => {
          (card as HTMLElement).style.setProperty('--glow-intensity', '0');
        });
        return;
      }

      const proximity = spotlightRadius * 0.5;
      const fadeDistance = spotlightRadius * 0.75;

      cards.forEach(card => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        const relativeX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
        const relativeY = ((e.clientY - cardRect.top) / cardRect.height) * 100;

        cardElement.style.setProperty('--glow-x', `${relativeX}%`);
        cardElement.style.setProperty('--glow-y', `${relativeY}%`);
        cardElement.style.setProperty('--glow-intensity', glowIntensity.toString());
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        opacity: 0.8,
        duration: 0.1,
        ease: 'power2.out'
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [enableSpotlight, spotlightRadius, glowColor]);

  const createParticles = (cardElement: HTMLElement, count: number) => {
    const particles: HTMLDivElement[] = [];
    const rect = cardElement.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: rgba(${glowColor}, 1);
        box-shadow: 0 0 6px rgba(${glowColor}, 0.6);
        pointer-events: none;
        z-index: 100;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      cardElement.appendChild(particle);
      particles.push(particle);

      gsap.fromTo(particle, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

      gsap.to(particle, {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        rotation: Math.random() * 360,
        duration: 2 + Math.random() * 2,
        ease: 'none',
        repeat: -1,
        yoyo: true
      });

      gsap.to(particle, {
        opacity: 0.3,
        duration: 1.5,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true
      });
    }

    return particles;
  };

  const clearParticles = (particles: HTMLDivElement[]) => {
    particles.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => particle.remove()
      });
    });
  };

  return (
    <div className="card-grid bento-section" ref={gridRef}>
      {features.map((feature, index) => (
        <div
          key={index}
          className={`magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''} particle-container`}
          style={{
            backgroundColor: feature.color || '#060010',
            '--glow-color': glowColor
          } as React.CSSProperties}
          ref={(el) => {
            if (!el) return;

            let particles: HTMLDivElement[] = [];

            const handleMouseEnter = () => {
              if (enableStars) {
                particles = createParticles(el, particleCount);
              }
              if (enableTilt) {
                gsap.to(el, {
                  rotateX: 5,
                  rotateY: 5,
                  duration: 0.3,
                  ease: 'power2.out',
                  transformPerspective: 1000
                });
              }
            };

            const handleMouseLeave = () => {
              if (enableStars) {
                clearParticles(particles);
                particles = [];
              }
              if (enableTilt) {
                gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
              }
              if (enableMagnetism) {
                gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
              }
            };

            const handleMouseMove = (e: MouseEvent) => {
              const rect = el.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;

              if (enableTilt) {
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                gsap.to(el, {
                  rotateX,
                  rotateY,
                  duration: 0.1,
                  ease: 'power2.out',
                  transformPerspective: 1000
                });
              }

              if (enableMagnetism) {
                const magnetX = (x - centerX) * 0.05;
                const magnetY = (y - centerY) * 0.05;
                gsap.to(el, { x: magnetX, y: magnetY, duration: 0.3, ease: 'power2.out' });
              }
            };

            const handleClick = (e: MouseEvent) => {
              if (!clickEffect) return;

              const rect = el.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;

              const maxDistance = Math.max(
                Math.hypot(x, y),
                Math.hypot(x - rect.width, y),
                Math.hypot(x, y - rect.height),
                Math.hypot(x - rect.width, y - rect.height)
              );

              const ripple = document.createElement('div');
              ripple.style.cssText = `
                position: absolute;
                width: ${maxDistance * 2}px;
                height: ${maxDistance * 2}px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                left: ${x - maxDistance}px;
                top: ${y - maxDistance}px;
                pointer-events: none;
                z-index: 1000;
              `;

              el.appendChild(ripple);

              gsap.fromTo(
                ripple,
                { scale: 0, opacity: 1 },
                {
                  scale: 1,
                  opacity: 0,
                  duration: 0.8,
                  ease: 'power2.out',
                  onComplete: () => ripple.remove()
                }
              );
            };

            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);
            el.addEventListener('mousemove', handleMouseMove);
            el.addEventListener('click', handleClick);
          }}
        >
          <div className="magic-bento-card__header">
            <div className="magic-bento-card__label">{feature.label}</div>
            {feature.icon}
          </div>
          <div className="magic-bento-card__content">
            <h2 className="magic-bento-card__title">{feature.title}</h2>
            <p className="magic-bento-card__description">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MagicBento;
