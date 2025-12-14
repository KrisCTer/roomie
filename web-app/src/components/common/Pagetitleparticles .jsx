import React, { useEffect, useState, useRef } from "react";
import { ChevronRight, Home, Sparkles } from "lucide-react";
import "./bubble-animation.css";

/**
 * PageTitle with Particle Canvas Effect
 * Impressive floating particle system with interactive cursor effects
 */
const PageTitleParticles = ({ title, subtitle }) => {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    // Canvas particle animation
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(33, 150, 243, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(33, 150, 243, ${
              0.15 * (1 - distance / 100)
            })`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });

        p1.update();
        p1.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative overflow-hidden px-8 py-6 border-b shadow-lg bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="wave-animation"></div>
      </div>

      {/* Content */}
      <div
        className={`relative z-10 transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <div className="absolute inset-0 bg-blue-400 blur-md opacity-50 animate-pulse"></div>
          </div>
          <span className="text-xs uppercase text-gray-600 tracking-widest font-medium">
            ROOMIE
          </span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-xs uppercase text-blue-700 tracking-widest font-semibold">
            {title.toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <ChevronRight className="w-5 h-5 text-blue-700 animate-bounce-subtle" />
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-30"></div>
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-blue-600 to-cyan-600 animate-gradient-x">
            {subtitle}
          </h1>
          <Sparkles className="w-4 h-4 text-yellow-500 animate-spin-slow" />
        </div>

        {/* Progress Line */}
        <div className="mt-3 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-transparent rounded-full animate-expand-width"></div>
      </div>
    </div>
  );
};

export default PageTitleParticles;
