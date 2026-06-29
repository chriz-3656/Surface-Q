/**
 * SurfaceQ — Landing Page Interactivity & Canvas Cinematic Visualizer
 * Powered by GSAP & ScrollTrigger
 */

function initAll() {
  // Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Initialize Hero Frame Scrubbing
  initHeroFrameScrub();

  // Initialize Canvas Visualizer
  const canvas = document.getElementById('cinematic-canvas');
  if (canvas) {
    initVisualizer(canvas);
  }

  // Initialize CTA Particles
  const ctaCanvas = document.getElementById('cta-particle-canvas');
  if (ctaCanvas) {
    initCtaParticles(ctaCanvas);
  }

  // --- Features Section Animations ---
  gsap.fromTo("#features .feature-card",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#features",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    }
  );

  // --- How It Works Step Animations ---
  gsap.fromTo("#how-it-works .how-step",
    { opacity: 0, y: 35 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.12,
      duration: 0.65,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#how-it-works",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    }
  );

  // --- Privacy Scope Slide-up Animations ---
  gsap.fromTo("#privacy .privacy-card",
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#privacy",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    }
  );

  // --- Tech Stack Badge Scale Animations ---
  gsap.fromTo("#tech-stack .tech-badge-inline",
    { opacity: 0, scale: 0.92 },
    {
      opacity: 1,
      scale: 1,
      stagger: 0.05,
      duration: 0.45,
      ease: "back.out(1.5)",
      scrollTrigger: {
        trigger: "#tech-stack",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    }
  );

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    
    // Close menu when links are clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Smooth hide/show navbar on scroll
  let lastScroll = 0;
  const navbar = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll <= 100) {
      navbar.style.transform = 'translateY(0)';
      navbar.style.background = 'rgba(3, 3, 3, 0.7)';
      return;
    }
    
    if (currentScroll > lastScroll) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
      navbar.style.background = 'rgba(3, 3, 3, 0.85)';
    }
    lastScroll = currentScroll;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

/**
 * Apple-Style Hero WebP Sequence Scroll Scrubbing
 */
function initHeroFrameScrub() {
  const heroCanvas = document.getElementById('hero-frame-canvas');
  const heroContent = document.getElementById('hero-content');
  const heroContainer = document.getElementById('hero-pin-container');
  
  if (!heroCanvas || !heroContent || !heroContainer) return;

  const ctx = heroCanvas.getContext('2d');
  let canvasW = heroCanvas.width = window.innerWidth;
  let canvasH = heroCanvas.height = window.innerHeight;

  const TOTAL_FRAMES = 202;
  const frames = new Array(TOTAL_FRAMES);
  const scrollState = { progress: 0 };
  let currentProgress = 0;
  let scrollTriggerInitialized = false;

  // Handle resizing
  window.addEventListener('resize', () => {
    canvasW = heroCanvas.width = window.innerWidth;
    canvasH = heroCanvas.height = window.innerHeight;
    drawCurrentFrame();
  });

  // Zero-padded 3-digit path builder
  function getFramePath(index) {
    const padded = String(index).padStart(3, '0');
    return `assets/hero-final_000/hero-final_${padded}.webp`;
  }

  // Draw aspect-ratio cover helper
  function drawCoverImage(img) {
    if (!img) return;
    ctx.clearRect(0, 0, canvasW, canvasH);
    
    const imgW = img.naturalWidth || img.width || 1280;
    const imgH = img.naturalHeight || img.height || 720;
    
    const imgRatio = imgW / imgH;
    const canvasRatio = canvasW / canvasH;
    
    let drawW, drawH, drawX, drawY;
    
    if (canvasRatio > imgRatio) {
      drawW = canvasW;
      drawH = canvasW / imgRatio;
      drawX = 0;
      drawY = (canvasH - drawH) / 2;
    } else {
      drawW = canvasH * imgRatio;
      drawH = canvasH;
      drawX = (canvasW - drawW) / 2;
      drawY = 0;
    }
    
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // Draw frame matching the current scroll state progress
  function drawCurrentFrame() {
    const clampedP = Math.max(0, Math.min(1, currentProgress));
    const targetIdx = Math.floor(clampedP * (TOTAL_FRAMES - 1));
    
    // Find closest loaded frame (progressive fallback)
    let frameToDraw = frames[targetIdx];
    if (!frameToDraw) {
      // Look backwards
      for (let i = targetIdx - 1; i >= 0; i--) {
        if (frames[i]) {
          frameToDraw = frames[i];
          break;
        }
      }
    }
    if (!frameToDraw) {
      // Look forwards
      for (let i = targetIdx + 1; i < TOTAL_FRAMES; i++) {
        if (frames[i]) {
          frameToDraw = frames[i];
          break;
        }
      }
    }
    
    if (frameToDraw) {
      drawCoverImage(frameToDraw);
    }
  }

  console.log("Hero initialized");
  console.log("Loading", getFramePath(0));

  // 1. Load frame 0 immediately to show first image
  const firstFrame = new Image();
  firstFrame.src = getFramePath(0);
  firstFrame.onload = () => {
    frames[0] = firstFrame;
    drawCoverImage(firstFrame);
    
    // Initialize ScrollTrigger right after frame 0 loads to allow immediate scrolling
    initScrollTrigger();
    
    // 2. Progressively preload the rest of the 201 frames
    preloadRestOfFrames();
  };
  firstFrame.onerror = () => {
    console.error("Frame failed:", getFramePath(0));
  };

  // Preloads remaining frames in parallel
  function preloadRestOfFrames() {
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const path = getFramePath(i);
      const img = new Image();
      img.src = path;
      img.onload = () => {
        frames[i] = img;
      };
      img.onerror = () => {
        console.error("Frame failed:", path);
      };
    }
  }

  function initScrollTrigger() {
    if (scrollTriggerInitialized) return;
    scrollTriggerInitialized = true;

    // GSAP ScrollTrigger to capture smooth pin progress with scrub: 1
    gsap.to(scrollState, {
      progress: 1,
      ease: "none",
      scrollTrigger: {
        trigger: heroContainer,
        start: "top top",
        end: "+=100%", // Pin for exactly one viewport height (matches image sequence play length)
        scrub: 1, // Smooth scrub easing
        pin: true,
        invalidateOnRefresh: true
      }
    });

    // Render loop using requestAnimationFrame
    function renderLoop() {
      // Lerp progress values for smooth deceleration curves
      currentProgress += (scrollState.progress - currentProgress) * 0.15;
      
      drawCurrentFrame();

      // Sync content overlay translation and opacity
      const fadeP = Math.min(scrollState.progress / 0.85, 1);
      heroContent.style.opacity = 1 - fadeP;
      heroContent.style.transform = `translateY(${-fadeP * 60}px)`;

      requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
  }
}

/**
 * High-Performance Generative Canvas Engine (Section 4 Map Visualizer)
 */
function initVisualizer(canvas) {
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const state = { progress: 0 };

  // GSAP ScrollTrigger updates network highlight progress
  gsap.to(state, {
    progress: 1,
    ease: "none",
    scrollTrigger: {
      trigger: "#section-intelligence",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });

  const PARTICLE_COUNT = 80;
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    const cp = state.progress;

    // Draw connecting lines with alpha based on distance and scroll progress
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p1 = particles[i];
      p1.x += p1.vx;
      p1.y += p1.vy;

      if (p1.x < 0 || p1.x > width) p1.vx *= -1;
      if (p1.y < 0 || p1.y > height) p1.vy *= -1;

      ctx.fillStyle = `rgba(0, 240, 255, ${0.3 + cp * 0.5})`;
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const alpha = (1 - dist / 120) * (0.12 + cp * 0.48);
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/**
 * Section 7: Background Ambient Particles Engine
 */
function initCtaParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const PARTICLE_COUNT = 40;
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      radius: Math.random() * 1.2 + 0.6
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
