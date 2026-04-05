/**
 * HAVEN - Story-Driven Demo Simulation (demo2)
 *
 * Three-phase sequential experience:
 *   Phase 1: "The Alert" — show the payoff first
 *   Phase 2: "The Network" — how federated learning works
 *   Phase 3: "Try It Yourself" — interactive risk assessment
 */

// ============================================
// Configuration (mirrors simulation.js)
// ============================================

const DEMO2_CONFIG = {
    propertyNames: [
        'Grand Hotel', 'City Suites', 'Harbor Inn', 'Metro Lodge',
        'Plaza Hotel', 'Urban Stay', 'Riverside Inn', 'Central Hotel',
        'Park Suites', 'Downtown Inn', 'Coast Hotel', 'Valley Lodge'
    ],
    propertyIcons: [
        '🏨', '🏢', '🏖️', '🏠', '🏬', '🏙️',
        '🌊', '🏛️', '🌳', '🌆', '⛱️', '🏔️'
    ],
    patterns: [
        'Short lead time booking',
        'Prepaid card payment',
        'Third-party booker',
        'Extended stay with few amenities',
        'Local address with out-of-state ID',
        'Multiple room keys requested',
        'Cash payment on arrival',
        'Declined housekeeping service',
        'High visitor traffic pattern',
        'Weekend-only bookings'
    ],
    accuracyPerRound: [68, 82, 92],
    autoAdvanceDelay: 8000,
    // Per-hotel pattern assignments (2-3 each, with realistic overlap)
    hotelPatterns: [
        ['Cash payment', 'Short stays'],                        // Grand Hotel
        ['Booking < 4 hrs', 'Declined housekeeping'],           // City Suites
        ['Third-party booker', 'Prepaid card'],                 // Harbor Inn
        ['Cash payment', 'Weekend-only bookings'],              // Metro Lodge
        ['Third-party booker', 'Local address / out-of-state ID'], // Plaza Hotel
        ['Prepaid card', 'Same-day booking'],                   // Urban Stay
        ['Short lead time', 'Prepaid card'],                    // Riverside Inn
        ['Declined housekeeping', 'Short stays'],               // Central Hotel
        ['Weekend-only bookings', 'Multiple room keys'],        // Park Suites
        ['High visitor traffic', 'Cash payment'],               // Downtown Inn
        ['Booking < 4 hrs', 'Multiple room keys'],              // Coast Hotel
        ['Walk-in booking', 'Third-party booker'],              // Valley Lodge
    ],
    // Which hotels reveal patterns in each round (indices)
    revealPerRound: [
        [0, 1, 2, 3],    // Round 1: first 4 hotels
        [4, 5, 6, 7],    // Round 2: next 4
        [8, 9, 10, 11],  // Round 3: last 4
    ],
};

// ============================================
// Risk Scorer (same logic as simulation.js)
// ============================================

class Demo2RiskScorer {
    constructor() {
        this.weights = {
            leadTime: { 168: 0, 48: 0.2, 6: 0.5, 2: 0.8 },
            paymentMethod: { credit: 0, debit: 0.1, prepaid: 0.6, cash: 0.4 },
            stayDuration: { 3: 0, 1: 0.3, 0.5: 0.7 },
            bookingSource: { direct: 0, ota: 0.1, walkin: 0.4, thirdparty: 0.7 }
        };
    }

    score(booking) {
        let riskScore = 0;
        const factors = [];

        const leadTimeScore = this.weights.leadTime[booking.leadTime] || 0;
        riskScore += leadTimeScore * 0.3;
        if (leadTimeScore > 0.3) {
            factors.push({ text: 'Booked very last-minute', impact: leadTimeScore > 0.5 ? 'high' : 'medium' });
        }

        const paymentScore = this.weights.paymentMethod[booking.paymentMethod] || 0;
        riskScore += paymentScore * 0.3;
        if (paymentScore > 0.3) {
            factors.push({ text: 'Paying with prepaid card or cash', impact: paymentScore > 0.5 ? 'high' : 'medium' });
        }

        const durationScore = this.weights.stayDuration[booking.stayDuration] || 0;
        riskScore += durationScore * 0.2;
        if (durationScore > 0.3) {
            factors.push({ text: 'Unusually short stay (just hours)', impact: durationScore > 0.5 ? 'high' : 'medium' });
        }

        const sourceScore = this.weights.bookingSource[booking.bookingSource] || 0;
        riskScore += sourceScore * 0.2;
        if (sourceScore > 0.3) {
            factors.push({ text: 'Someone else booked the room for them', impact: sourceScore > 0.5 ? 'high' : 'medium' });
        }

        // Network insight
        factors.push({
            text: 'Similar pattern seen across 8 hotels in the network',
            impact: 'network'
        });

        let level, recommendation;
        if (riskScore < 0.3) {
            level = 'low';
            recommendation = 'Normal booking. No action needed.';
        } else if (riskScore < 0.5) {
            level = 'moderate';
            recommendation = 'Some signals. Staff should be aware at check-in.';
        } else if (riskScore < 0.7) {
            level = 'elevated';
            recommendation = 'Multiple warning signs. Duty manager notified.';
        } else {
            level = 'high';
            recommendation = 'Matches known trafficking patterns. Senior staff review recommended.';
        }

        return { score: riskScore, level, factors, recommendation };
    }
}

const demo2Scorer = new Demo2RiskScorer();

// ============================================
// State
// ============================================

let currentPhase = 0; // 0 = not started, 1, 2, 3
let autoAdvanceTimer = null;
let networkAnimating = false;

// ============================================
// Phase Navigation
// ============================================

function goToPhase(phase) {
    if (phase < 1 || phase > 3) return;
    clearAutoAdvance();
    currentPhase = phase;

    // Update progress indicator
    document.querySelectorAll('.progress-step').forEach((el, i) => {
        el.classList.toggle('active', i + 1 === phase);
        el.classList.toggle('completed', i + 1 < phase);
    });

    // Transition panels
    document.querySelectorAll('.phase-panel').forEach(el => {
        el.classList.remove('phase-active');
    });

    const target = document.getElementById('phase' + phase);
    if (target) {
        target.classList.add('phase-active');
    }

    // Trigger phase-specific init
    if (phase === 1) initPhase1();
    if (phase === 2) initPhase2();
    if (phase === 3) initPhase3();
}

function clearAutoAdvance() {
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
}

// ============================================
// Phase 1: The Alert
// ============================================

function initPhase1() {
    const tags = document.querySelectorAll('#phase1 .alert-tag');
    const gauge = document.getElementById('alertGauge');
    const gaugeValue = document.getElementById('alertGaugeValue');
    const verdict = document.getElementById('alertVerdict');

    // Reset
    tags.forEach(t => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; });
    if (gauge) { gauge.style.width = '0%'; }
    if (gaugeValue) gaugeValue.textContent = '0%';
    if (verdict) verdict.style.opacity = '0';

    // Stagger tags
    tags.forEach((tag, i) => {
        setTimeout(() => {
            tag.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, 600 + i * 700);
    });

    // After all tags, animate gauge
    const gaugeDelay = 600 + tags.length * 700 + 400;
    setTimeout(() => {
        if (gauge) {
            gauge.style.transition = 'width 1.2s ease-out';
            gauge.style.width = '64%';
        }
        animateCounter(gaugeValue, 0, 64, 1200);
    }, gaugeDelay);

    // Show verdict
    setTimeout(() => {
        if (verdict) {
            verdict.style.transition = 'opacity 0.5s ease';
            verdict.style.opacity = '1';
        }
    }, gaugeDelay + 1400);
}

// ============================================
// Phase 2: The Network
// ============================================

function initPhase2() {
    if (networkAnimating) return;
    networkAnimating = true;

    // Fade in intro text
    const intro = document.getElementById('phase2Intro');
    if (intro) {
        intro.style.opacity = '0';
        setTimeout(() => { intro.style.opacity = '1'; }, 100);
    }

    const detectionEl = document.getElementById('networkDetectionRate');
    const nodes = document.querySelectorAll('.network-hotel-node');
    const center = document.getElementById('networkCenter');
    const summary = document.getElementById('networkSummary');

    // Reset
    if (detectionEl) detectionEl.textContent = '45%';
    nodes.forEach(n => { n.classList.remove('active', 'sending', 'contributed'); });
    if (center) center.classList.remove('pulsing');
    if (summary) summary.style.opacity = '0';
    // Remove any lingering anim cards
    document.querySelectorAll('.anim-card').forEach(c => c.remove());

    runNetworkRounds(0);
}

async function runNetworkRounds(round) {
    if (round >= 3) {
        networkAnimating = false;
        // Show summary
        const summary = document.getElementById('networkSummary');
        if (summary) summary.style.opacity = '1';
        return;
    }

    const nodes = document.querySelectorAll('.network-hotel-node');
    const center = document.getElementById('networkCenter');
    const detectionEl = document.getElementById('networkDetectionRate');
    const ring = document.getElementById('networkRing');

    const warnSvg = '<svg class="warn-icon" viewBox="0 0 24 24" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

    // Step 1: Hotels light up
    const shuffled = Array.from(nodes).sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i++) {
        await sleep(80);
        shuffled[i].classList.add('active');
    }
    await sleep(200);

    // Step 2: Show pattern cards briefly for this round's hotels (1-2 at a time)
    const revealIndices = DEMO2_CONFIG.revealPerRound[round] || [];
    for (const idx of revealIndices) {
        const node = document.querySelector(`.network-hotel-node[data-hotel-index="${idx}"]`);
        if (!node || !ring) continue;

        const x = parseFloat(node.style.left);
        const y = parseFloat(node.style.top);
        const isRight = x > 50;
        const patterns = DEMO2_CONFIG.hotelPatterns[idx] || [];
        const name = DEMO2_CONFIG.propertyNames[idx];

        // Create brief anim card
        const card = document.createElement('div');
        card.className = 'anim-card';
        card.style.left = (isRight ? x + 8 : x - 8) + '%';
        card.style.top = y + '%';
        card.style.transform = isRight ? 'translateY(-50%)' : 'translateY(-50%) translateX(-100%)';
        card.innerHTML = `<span class="tooltip-name">${name}</span>` +
            patterns.map(p => `<span class="tooltip-pattern">${warnSvg}${p}</span>`).join('');
        ring.appendChild(card);

        // Show
        await sleep(50);
        card.classList.add('show');
        await sleep(1500);

        // Hide and add checkmark
        card.classList.remove('show');
        node.classList.add('contributed');
        await sleep(300);
        card.remove();
    }

    // Step 3: Sending to center
    nodes.forEach(n => { n.classList.remove('active'); n.classList.add('sending'); });
    await sleep(600);

    // Step 4: Center pulses
    if (center) center.classList.add('pulsing');
    await sleep(500);

    // Step 5: Update detection rate
    const targetAccuracy = DEMO2_CONFIG.accuracyPerRound[round];
    const prevAccuracy = round === 0 ? 45 : DEMO2_CONFIG.accuracyPerRound[round - 1];
    animateCounter(detectionEl, prevAccuracy, targetAccuracy, 800);
    await sleep(800);

    // Step 6: Radiate back
    if (center) center.classList.remove('pulsing');
    nodes.forEach(n => { n.classList.remove('sending'); });
    await sleep(400);

    runNetworkRounds(round + 1);
}

// ============================================
// Phase 3: Try It Yourself
// ============================================

function initPhase3() {
    // Attach reactive listeners if not already done
    updateRiskAssessment();
}

function updateRiskAssessment() {
    const leadTime = parseFloat(document.getElementById('d2LeadTime')?.value || 168);
    const paymentMethod = document.getElementById('d2Payment')?.value || 'credit';
    const stayDuration = parseFloat(document.getElementById('d2Duration')?.value || 3);
    const bookingSource = document.getElementById('d2Source')?.value || 'direct';

    const result = demo2Scorer.score({ leadTime, paymentMethod, stayDuration, bookingSource });

    // Update gauge
    const gaugeEl = document.getElementById('d2GaugeFill');
    const valueEl = document.getElementById('d2RiskValue');
    const labelEl = document.getElementById('d2RiskLabel');
    const factorsEl = document.getElementById('d2RiskFactors');
    const recEl = document.getElementById('d2Recommendation');

    const pct = (result.score * 100).toFixed(0);

    if (gaugeEl) {
        gaugeEl.style.width = pct + '%';
        gaugeEl.className = 'gauge-fill-bar risk-' + result.level;
    }
    if (valueEl) {
        valueEl.textContent = pct + '%';
        valueEl.className = 'risk-pct risk-' + result.level;
    }
    if (labelEl) {
        labelEl.textContent = result.level.charAt(0).toUpperCase() + result.level.slice(1) + ' Risk';
        labelEl.className = 'risk-level-label risk-' + result.level;
    }

    if (factorsEl) {
        const iconMap = {
            high: '<svg class="icon-inline" viewBox="0 0 24 24" stroke="#ef4444"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            medium: '<svg class="icon-inline" viewBox="0 0 24 24" stroke="#f59e0b"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
            network: '<svg class="icon-inline" viewBox="0 0 24 24" stroke="#3b82f6"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/><line x1="5" y1="19" x2="19" y2="19"/></svg>',
        };
        const relevantFactors = result.factors.filter(f => f.impact !== 'network' || result.score >= 0.3);
        factorsEl.innerHTML = relevantFactors.map(f => `
            <div class="d2-factor ${f.impact}">
                ${iconMap[f.impact] || ''}
                <span>${f.text}</span>
            </div>
        `).join('');
    }

    if (recEl) {
        recEl.textContent = result.recommendation;
        recEl.className = 'rec-text rec-' + result.level;
    }
}

// ============================================
// Utilities
// ============================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function animateCounter(el, from, to, duration) {
    if (!el) return;
    const start = performance.now();
    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const val = Math.round(from + (to - from) * progress);
        el.textContent = val + '%';
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ============================================
// Watch Full Demo (auto-play all phases)
// ============================================

function watchFullDemo() {
    goToPhase(1);
    // Auto-play: Phase 1 (8s) → Phase 2 → wait for animation → Phase 3
    setTimeout(() => {
        goToPhase(2);
        const checkDone = setInterval(() => {
            if (!networkAnimating) {
                clearInterval(checkDone);
                setTimeout(() => goToPhase(3), 2000);
            }
        }, 500);
    }, DEMO2_CONFIG.autoAdvanceDelay);
}

// ============================================
// Initialization
// ============================================

function initDemo2() {
    // Build hotel network nodes for Phase 2
    const ring = document.getElementById('networkRing');
    const warnSvg = '<svg class="warn-icon" viewBox="0 0 24 24" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

    // Create a single shared tooltip element
    let tooltip = null;
    if (ring) {
        tooltip = document.createElement('div');
        tooltip.className = 'hotel-tooltip';
        ring.appendChild(tooltip);

        DEMO2_CONFIG.propertyNames.forEach((name, i) => {
            const node = document.createElement('div');
            node.className = 'network-hotel-node';
            node.dataset.hotelIndex = i;
            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const radius = 36;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            node.style.left = x + '%';
            node.style.top = y + '%';
            node.innerHTML = `<span class="node-icon">${DEMO2_CONFIG.propertyIcons[i]}</span>` +
                '<span class="node-check"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>';
            node.title = name;
            ring.appendChild(node);

            // Hover tooltip
            node.addEventListener('mouseenter', () => {
                if (!node.classList.contains('contributed')) return;
                const patterns = DEMO2_CONFIG.hotelPatterns[i] || [];
                const isRight = x > 50;
                tooltip.innerHTML = `<span class="tooltip-name">${name}</span>` +
                    patterns.map(p => `<span class="tooltip-pattern">${warnSvg}${p}</span>`).join('');
                tooltip.style.left = (isRight ? x + 8 : x - 8) + '%';
                tooltip.style.top = y + '%';
                tooltip.style.transform = isRight ? 'translateY(-50%)' : 'translateY(-50%) translateX(-100%)';
                tooltip.classList.add('show');
            });
            node.addEventListener('mouseleave', () => {
                tooltip.classList.remove('show');
            });
        });
    }

    // Draw connector lines from each node to center
    const linesG = document.getElementById('connectorLines');
    if (linesG && ring) {
        DEMO2_CONFIG.propertyNames.forEach((_, i) => {
            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const radius = 0.32;
            const x = 200 + radius * 200 * Math.cos(angle);
            const y = 200 + radius * 200 * Math.sin(angle);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 200);
            line.setAttribute('y1', 200);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            linesG.appendChild(line);
        });
    }

    // Progress step clicks
    document.querySelectorAll('.progress-step').forEach(el => {
        el.addEventListener('click', () => {
            const phase = parseInt(el.dataset.phase);
            if (phase) goToPhase(phase);
        });
    });

    // Phase 1 button
    const seeHowBtn = document.getElementById('seeHowBtn');
    if (seeHowBtn) seeHowBtn.addEventListener('click', () => goToPhase(2));

    // Phase 2 button
    const tryBtn = document.getElementById('tryYourselfBtn');
    if (tryBtn) tryBtn.addEventListener('click', () => goToPhase(3));

    // Watch full demo
    const watchBtn = document.getElementById('watchFullBtn');
    if (watchBtn) watchBtn.addEventListener('click', watchFullDemo);

    // Start over
    const startOverBtn = document.getElementById('startOverBtn');
    if (startOverBtn) startOverBtn.addEventListener('click', () => {
        networkAnimating = false;
        goToPhase(1);
    });

    // Phase 3 reactive controls
    ['d2LeadTime', 'd2Payment', 'd2Duration', 'd2Source'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateRiskAssessment);
    });

    // Start at Phase 1
    goToPhase(1);
}

document.addEventListener('DOMContentLoaded', initDemo2);
