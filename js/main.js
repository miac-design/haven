/**
 * HAVEN - Main Application Script
 *
 * Handles navigation, animations, and page interactions
 */

// ============================================
// Navigation
// ============================================

function initNavigation() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const links = document.querySelector('.nav-links');

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile toggle
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80; // Nav height
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });

                // Close mobile menu
                if (links) links.classList.remove('active');
                if (toggle) toggle.classList.remove('active');
            }
        });
    });
}

// ============================================
// Hero Network Visualization
// ============================================

class NetworkVisualization {
    constructor(container) {
        this.container = container;
        this.nodes = [];
        this.connections = [];
        this.animationFrame = null;

        if (container) {
            this.init();
        }
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'width: 100%; height: 100%;';
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Set size
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Create nodes
        this.createNodes();

        // Start animation
        this.animate();
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    }

    createNodes() {
        const numNodes = 12;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Create center node (coordinator)
        this.centerNode = {
            x: centerX,
            y: centerY,
            radius: 30,
            color: 'rgba(70, 143, 127, 0.8)',
            pulsePhase: 0,
            isCenter: true
        };

        // Create outer nodes (hotels)
        for (let i = 0; i < numNodes; i++) {
            const angle = (i / numNodes) * Math.PI * 2 - Math.PI / 2;
            const radius = Math.min(this.width, this.height) * 0.35;

            this.nodes.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                baseX: centerX + Math.cos(angle) * radius,
                baseY: centerY + Math.sin(angle) * radius,
                radius: 12 + Math.random() * 8,
                color: `rgba(70, 143, 127, ${0.4 + Math.random() * 0.4})`,
                pulsePhase: Math.random() * Math.PI * 2,
                sendingData: false,
                sendProgress: 0
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        const time = Date.now() / 1000;

        // Draw connections
        for (const node of this.nodes) {
            // Connection line
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerNode.x, this.centerNode.y);
            this.ctx.lineTo(node.x, node.y);
            this.ctx.strokeStyle = 'rgba(70, 143, 127, 0.15)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Data packets (randomly animate some)
            if (Math.random() < 0.01) {
                node.sendingData = true;
                node.sendProgress = 0;
            }

            if (node.sendingData) {
                node.sendProgress += 0.02;
                if (node.sendProgress >= 1) {
                    node.sendingData = false;
                    node.sendProgress = 0;
                }

                // Draw data packet
                const px = node.x + (this.centerNode.x - node.x) * node.sendProgress;
                const py = node.y + (this.centerNode.y - node.y) * node.sendProgress;

                this.ctx.beginPath();
                this.ctx.arc(px, py, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(70, 143, 127, 0.8)';
                this.ctx.fill();
            }
        }

        // Draw outer nodes
        for (const node of this.nodes) {
            // Gentle floating motion
            const floatX = Math.sin(time + node.pulsePhase) * 3;
            const floatY = Math.cos(time * 0.7 + node.pulsePhase) * 3;
            node.x = node.baseX + floatX;
            node.y = node.baseY + floatY;

            // Pulse effect
            const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.2 + 1;

            // Glow
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * pulse * 2
            );
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, 'rgba(70, 143, 127, 0)');

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * pulse * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Core
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = node.color;
            this.ctx.fill();
        }

        // Draw center node
        const centerPulse = Math.sin(time * 1.5) * 0.1 + 1;

        // Outer glow
        const centerGradient = this.ctx.createRadialGradient(
            this.centerNode.x, this.centerNode.y, 0,
            this.centerNode.x, this.centerNode.y, this.centerNode.radius * 3
        );
        centerGradient.addColorStop(0, 'rgba(70, 143, 127, 0.3)');
        centerGradient.addColorStop(1, 'rgba(70, 143, 127, 0)');

        this.ctx.beginPath();
        this.ctx.arc(this.centerNode.x, this.centerNode.y, this.centerNode.radius * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = centerGradient;
        this.ctx.fill();

        // Core
        this.ctx.beginPath();
        this.ctx.arc(
            this.centerNode.x,
            this.centerNode.y,
            this.centerNode.radius * centerPulse,
            0, Math.PI * 2
        );
        this.ctx.fillStyle = this.centerNode.color;
        this.ctx.fill();

        // Shield icon in center (drawn with canvas, not emoji)
        this.ctx.save();
        this.ctx.translate(this.centerNode.x, this.centerNode.y);
        this.ctx.scale(0.8, 0.8);

        // Shield shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, -18);
        this.ctx.bezierCurveTo(-15, -15, -18, 0, -18, 5);
        this.ctx.bezierCurveTo(-18, 12, -8, 20, 0, 24);
        this.ctx.bezierCurveTo(8, 20, 18, 12, 18, 5);
        this.ctx.bezierCurveTo(18, 0, 15, -15, 0, -18);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fill();

        // Checkmark inside shield
        this.ctx.beginPath();
        this.ctx.moveTo(-7, 2);
        this.ctx.lineTo(-2, 8);
        this.ctx.lineTo(8, -5);
        this.ctx.strokeStyle = 'rgba(70, 143, 127, 1)';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();

        this.ctx.restore();

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// ============================================
// FAQ Accordion
// ============================================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        if (question) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                        otherItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current item
                item.classList.toggle('open');
                question.setAttribute('aria-expanded', !isOpen);
            });
        }
    });
}

// ============================================
// Explainer Carousel
// ============================================

function initExplainerCarousel() {
    const carousel = document.querySelector('.explainer-carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const progressSteps = carousel.querySelectorAll('.progress-step');
    const progressLines = carousel.querySelectorAll('.progress-line');
    const prevBtn = carousel.querySelector('.carousel-nav.prev');
    const nextBtn = carousel.querySelector('.carousel-nav.next');
    const autoplayToggle = document.getElementById('autoplayToggle');

    let currentSlide = 0;
    let autoplayInterval = null;
    let isAutoplay = true;
    const autoplayDelay = 5000; // 5 seconds per slide

    function goToSlide(index) {
        // Wrap around
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Update progress steps
        progressSteps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });

        // Reset progress line fills
        progressLines.forEach((line, i) => {
            const fill = line.querySelector('.progress-fill');
            if (i < index) {
                fill.style.width = '100%';
                fill.style.transition = 'none';
            } else if (i === index && isAutoplay) {
                fill.style.width = '0%';
                fill.style.transition = 'none';
                // Trigger reflow
                fill.offsetHeight;
                fill.style.transition = `width ${autoplayDelay}ms linear`;
                fill.style.width = '100%';
            } else {
                fill.style.width = '0%';
                fill.style.transition = 'none';
            }
        });

        currentSlide = index;
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        isAutoplay = true;
        autoplayInterval = setInterval(nextSlide, autoplayDelay);

        // Start the first progress animation
        const currentLine = progressLines[currentSlide];
        if (currentLine) {
            const fill = currentLine.querySelector('.progress-fill');
            fill.style.width = '0%';
            fill.style.transition = 'none';
            fill.offsetHeight;
            fill.style.transition = `width ${autoplayDelay}ms linear`;
            fill.style.width = '100%';
        }

        // Update toggle button
        if (autoplayToggle) {
            autoplayToggle.querySelector('.playing').style.display = 'inline';
            autoplayToggle.querySelector('.paused').style.display = 'none';
        }
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
        isAutoplay = false;

        // Stop progress animations
        progressLines.forEach(line => {
            const fill = line.querySelector('.progress-fill');
            const currentWidth = getComputedStyle(fill).width;
            fill.style.transition = 'none';
            fill.style.width = currentWidth;
        });

        // Update toggle button
        if (autoplayToggle) {
            autoplayToggle.querySelector('.playing').style.display = 'none';
            autoplayToggle.querySelector('.paused').style.display = 'inline';
        }
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prevSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); nextSlide(); });

    progressSteps.forEach((step, i) => {
        step.addEventListener('click', () => {
            stopAutoplay();
            goToSlide(i);
        });
    });

    if (autoplayToggle) {
        autoplayToggle.addEventListener('click', () => {
            if (isAutoplay) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });
    }

    // Start autoplay
    startAutoplay();
}

// ============================================
// Background Music
// ============================================

function initBackgroundMusic() {
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');

    if (!bgMusic || !musicToggle) return;

    const playingIcon = musicToggle.querySelector('.playing');
    const pausedIcon = musicToggle.querySelector('.paused');

    // Set initial volume
    bgMusic.volume = 0.3;

    function toggleMusic() {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                musicToggle.classList.add('playing');
                playingIcon.style.display = 'inline';
                pausedIcon.style.display = 'none';
            }).catch(err => {
                console.log('Audio playback requires user interaction first');
            });
        } else {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            playingIcon.style.display = 'none';
            pausedIcon.style.display = 'inline';
        }
    }

    musicToggle.addEventListener('click', toggleMusic);
}

// ============================================
// Scroll Animations
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });
}

// ============================================
// Stats Counter Animation
// ============================================

function animateValue(element, start, end, duration, suffix = '') {
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + suffix;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };

    window.requestAnimationFrame(step);
}

function initStatsAnimation() {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statValues = entry.target.querySelectorAll('.stat-value');
                statValues.forEach(stat => {
                    const value = stat.textContent;
                    if (value.includes('%')) {
                        animateValue(stat, 0, parseInt(value), 1500, '%');
                    } else {
                        animateValue(stat, 0, parseInt(value), 1500);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
}

// ============================================
// Add dynamic styles
// ============================================

function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Animation classes */
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .animate-on-scroll.visible {
            opacity: 1;
            transform: translateY(0);
        }

        /* Spinning animation for loading */
        .spinning {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Risk level colors */
        .risk-value.risk-low { color: #22c55e; }
        .risk-value.risk-moderate { color: #f59e0b; }
        .risk-value.risk-elevated { color: #f97316; }
        .risk-value.risk-high { color: #ef4444; }

        /* Mobile nav - Enhanced with smooth animations */
        @media (max-width: 768px) {
            .nav-links {
                position: fixed;
                top: 60px;
                left: 0;
                right: 0;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                flex-direction: column;
                padding: 1.5rem;
                gap: 0.25rem;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                border-bottom: 1px solid rgba(0,0,0,0.05);
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
                display: flex;
                z-index: 999;
            }

            .nav-links.active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }

            .nav-links a {
                padding: 1rem 1.25rem;
                border-radius: 0.75rem;
                font-size: 1rem;
                font-weight: 500;
                transition: background 0.2s ease, color 0.2s ease;
            }

            .nav-links a:hover {
                background: #f0f7f5;
                color: #468f7f;
            }

            .nav-links .nav-cta {
                margin-top: 0.5rem;
                text-align: center;
            }

            /* Hamburger to X animation */
            .nav-toggle span {
                transition: transform 0.3s ease, opacity 0.2s ease;
            }

            .nav-toggle.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            .nav-toggle.active span:nth-child(2) {
                opacity: 0;
                transform: scaleX(0);
            }
            .nav-toggle.active span:nth-child(3) {
                transform: rotate(-45deg) translate(5px, -5px);
            }
        }

        /* Nav scrolled state */
        .nav.scrolled {
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* Carousel slide transitions - Prevent text overlap */
        .carousel-slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            opacity: 0;
            visibility: hidden;
            transform: translateX(20px);
            transition: opacity 0.4s ease, transform 0.4s ease, visibility 0.4s ease;
            pointer-events: none;
        }

        .carousel-slide.active {
            position: relative;
            opacity: 1;
            visibility: visible;
            transform: translateX(0);
            pointer-events: auto;
        }

        .carousel-container {
            position: relative;
            min-height: 350px;
        }

        /* Processing state for demo */
        .booking-form.processing {
            opacity: 0.6;
            pointer-events: none;
        }

        .booking-form.processing::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 32px;
            height: 32px;
            margin: -16px 0 0 -16px;
            border: 3px solid rgba(70, 143, 127, 0.2);
            border-top-color: #468f7f;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        .processing-overlay {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            padding: 2rem;
            text-align: center;
        }

        .processing-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(70, 143, 127, 0.2);
            border-top-color: #468f7f;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        .processing-text {
            color: var(--neutral-400);
            font-size: 0.9375rem;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// Initialize Everything
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Add dynamic styles
    addDynamicStyles();

    // Initialize navigation
    initNavigation();

    // Initialize hero visualization
    const vizContainer = document.getElementById('networkViz');
    if (vizContainer) {
        new NetworkVisualization(vizContainer);
    }

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize simulation
    if (window.HAVENSimulation) {
        window.HAVENSimulation.init();
    }

    // Initialize FAQ accordion
    initFAQ();

    // Initialize explainer carousel
    initExplainerCarousel();

    // Initialize background music
    initBackgroundMusic();

    console.log('🛡️ HAVEN initialized successfully');
});

// ============================================
// Export
// ============================================

window.HAVEN = {
    initNavigation,
    initScrollAnimations
};