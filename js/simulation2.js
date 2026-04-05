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
    // "Live feed" items shown per round in Phase 2
    liveFeed: [
        [
            { text: 'Cash payment at check-in', sources: 'Grand Hotel + Metro Lodge' },
            { text: 'Booking under 4 hours', sources: 'City Suites + Harbor Inn + Coast Hotel' },
        ],
        [
            { text: 'Third-party booker with local address', sources: 'Plaza Hotel' },
            { text: 'Prepaid card + same-day booking', sources: 'Urban Stay + Riverside Inn' },
            { text: 'Declined housekeeping for short stay', sources: 'Central Hotel + Valley Lodge' },
        ],
        [
            { text: 'Weekend-only repeat bookings', sources: 'Park Suites + Downtown Inn' },
            { text: 'Multiple room keys with cash payment', sources: 'Coast Hotel + Grand Hotel' },
            { text: 'Walk-in with third-party payment', sources: 'Metro Lodge + Plaza Hotel + Urban Stay' },
        ]
    ],
    accuracyPerRound: [68, 82, 92],
    autoAdvanceDelay: 8000,
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
    const insight = document.getElementById('alertInsight');

    // Reset
    tags.forEach(t => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; });
    if (gauge) { gauge.style.width = '0%'; }
    if (gaugeValue) gaugeValue.textContent = '0%';
    if (verdict) verdict.style.opacity = '0';
    if (insight) insight.style.opacity = '0';

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

    // Show insight
    setTimeout(() => {
        if (insight) {
            insight.style.transition = 'opacity 0.5s ease';
            insight.style.opacity = '1';
        }
    }, gaugeDelay + 2000);

    // Auto-advance
    autoAdvanceTimer = setTimeout(() => goToPhase(2), DEMO2_CONFIG.autoAdvanceDelay);
}

// ============================================
// Phase 2: The Network
// ============================================

function initPhase2() {
    if (networkAnimating) return;
    networkAnimating = true;

    const detectionEl = document.getElementById('networkDetectionRate');
    const feedEl = document.getElementById('networkLiveFeed');
    const nodes = document.querySelectorAll('.network-hotel-node');
    const center = document.getElementById('networkCenter');

    // Reset
    if (detectionEl) detectionEl.textContent = '45%';
    if (feedEl) feedEl.innerHTML = '';
    nodes.forEach(n => n.classList.remove('active', 'sending'));
    if (center) center.classList.remove('pulsing');

    runNetworkRounds(0);
}

async function runNetworkRounds(round) {
    if (round >= 3) {
        networkAnimating = false;
        return;
    }

    const nodes = document.querySelectorAll('.network-hotel-node');
    const center = document.getElementById('networkCenter');
    const detectionEl = document.getElementById('networkDetectionRate');
    const feedEl = document.getElementById('networkLiveFeed');

    // Step 1: Hotels light up (analyzing)
    const shuffled = Array.from(nodes).sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i++) {
        await sleep(80);
        shuffled[i].classList.add('active');
    }
    await sleep(400);

    // Step 2: Patterns fly to center (sending)
    nodes.forEach(n => { n.classList.remove('active'); n.classList.add('sending'); });
    await sleep(800);

    // Step 3: Center pulses
    if (center) center.classList.add('pulsing');
    await sleep(600);

    // Step 4: Update detection rate
    const targetAccuracy = DEMO2_CONFIG.accuracyPerRound[round];
    const prevAccuracy = round === 0 ? 45 : DEMO2_CONFIG.accuracyPerRound[round - 1];
    animateCounter(detectionEl, prevAccuracy, targetAccuracy, 800);
    await sleep(800);

    // Step 5: Radiate back
    if (center) center.classList.remove('pulsing');
    nodes.forEach(n => { n.classList.remove('sending'); n.classList.add('active'); });
    await sleep(500);
    nodes.forEach(n => n.classList.remove('active'));

    // Step 6: Show live feed items for this round
    const feedItems = DEMO2_CONFIG.liveFeed[round] || [];
    for (const item of feedItems) {
        const div = document.createElement('div');
        div.className = 'feed-item';
        div.innerHTML = `<span class="feed-pattern">${item.text}</span><span class="feed-source">learned from ${item.sources}</span>`;
        div.style.opacity = '0';
        div.style.transform = 'translateY(8px)';
        if (feedEl) feedEl.appendChild(div);
        await sleep(50);
        div.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
        await sleep(300);
    }

    await sleep(600);
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
        const relevantFactors = result.factors.filter(f => f.impact !== 'network' || result.score >= 0.3);
        factorsEl.innerHTML = relevantFactors.map(f => `
            <div class="d2-factor ${f.impact}">
                <span class="factor-dot ${f.impact}"></span>
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
    // Phase 1 auto-advances after 8s, Phase 2 runs ~12s, then Phase 3
    // Set a timer for Phase 2 → 3 transition after Phase 2 completes
    setTimeout(() => {
        if (currentPhase === 2) {
            const checkDone = setInterval(() => {
                if (!networkAnimating) {
                    clearInterval(checkDone);
                    setTimeout(() => goToPhase(3), 2000);
                }
            }, 500);
        }
    }, DEMO2_CONFIG.autoAdvanceDelay + 500);
}

// ============================================
// Initialization
// ============================================

function initDemo2() {
    // Build hotel network nodes for Phase 2
    const ring = document.getElementById('networkRing');
    if (ring) {
        DEMO2_CONFIG.propertyNames.forEach((name, i) => {
            const node = document.createElement('div');
            node.className = 'network-hotel-node';
            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const radius = 42; // % from center
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            node.style.left = x + '%';
            node.style.top = y + '%';
            node.innerHTML = `<span class="node-icon">${DEMO2_CONFIG.propertyIcons[i]}</span>`;
            node.title = name;
            ring.appendChild(node);
        });
    }

    // Draw connector lines from each node to center
    const linesG = document.getElementById('connectorLines');
    if (linesG && ring) {
        DEMO2_CONFIG.propertyNames.forEach((_, i) => {
            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const radius = 0.42;
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
