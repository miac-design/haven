/**
 * HAVEN - Federated Learning Simulation Engine
 *
 * This module simulates federated learning across a network of hotels,
 * demonstrating how pattern intelligence can be shared without sharing
 * guest data.
 */

// ============================================
// Configuration
// ============================================

const CONFIG = {
    numProperties: 12,
    trainingRounds: 10,
    roundDuration: 2000, // ms per training round
    initialAccuracy: 45,
    maxAccuracy: 94,
    // Property types as modern SVG icons for visual variety
    propertyIcons: [
        // Hotel - Classic building with H
        `<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="10" width="28" height="26" rx="3" fill="url(#propGrad1)"/><rect x="10" y="14" width="6" height="5" rx="1" fill="white" opacity="0.85"/><rect x="17" y="14" width="6" height="5" rx="1" fill="white" opacity="0.85"/><rect x="24" y="14" width="6" height="5" rx="1" fill="white" opacity="0.85"/><rect x="10" y="21" width="6" height="5" rx="1" fill="white" opacity="0.85"/><rect x="17" y="21" width="6" height="5" rx="1" fill="white" opacity="0.85"/><rect x="24" y="21" width="6" height="5" rx="1" fill="white" opacity="0.85"/><rect x="15" y="28" width="10" height="8" rx="1" fill="#fbbf24"/><defs><linearGradient id="propGrad1" x1="0%"  y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#468f7f"/><stop offset="100%" stop-color="#2d5a50"/></linearGradient></defs></svg>`,
        // Office/Suite - Modern glass building
        `<svg viewBox="0 0 40 40" fill="none"><rect x="8" y="8" width="24" height="28" rx="2" fill="url(#propGrad2)"/><rect x="11" y="11" width="5" height="4" rx="1" fill="white" opacity="0.9"/><rect x="17.5" y="11" width="5" height="4" rx="1" fill="white" opacity="0.9"/><rect x="24" y="11" width="5" height="4" rx="1" fill="white" opacity="0.9"/><rect x="11" y="17" width="5" height="4" rx="1" fill="white" opacity="0.9"/><rect x="17.5" y="17" width="5" height="4" rx="1" fill="white" opacity="0.9"/><rect x="24" y="17" width="5" height="4" rx="1" fill="white" opacity="0.9"/><rect x="11" y="23" width="5" height="4" rx="1" fill="white" opacity="0.9"/><rect x="17.5" y="23" width="5" height="4" rx="1" fill="white" opacity="0.9"/><rect x="24" y="23" width="5" height="4" rx="1" fill="white" opacity="0.9"/><rect x="16" y="29" width="8" height="7" rx="1" fill="#60a5fa"/><defs><linearGradient id="propGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#4338ca"/></linearGradient></defs></svg>`,
        // Resort - Building with palm/waves
        `<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="16" width="28" height="20" rx="3" fill="url(#propGrad3)"/><polygon points="20,6 34,16 6,16" fill="url(#propGrad3)"/><rect x="10" y="20" width="5" height="4" rx="1" fill="white" opacity="0.85"/><rect x="17.5" y="20" width="5" height="4" rx="1" fill="white" opacity="0.85"/><rect x="25" y="20" width="5" height="4" rx="1" fill="white" opacity="0.85"/><rect x="15" y="28" width="10" height="8" rx="1" fill="#f472b6"/><defs><linearGradient id="propGrad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#db2777"/></linearGradient></defs></svg>`,
        // Inn - Cozy building with chimney
        `<svg viewBox="0 0 40 40" fill="none"><rect x="8" y="18" width="24" height="18" rx="2" fill="url(#propGrad4)"/><polygon points="20,8 34,18 6,18" fill="url(#propGrad4)"/><rect x="28" y="10" width="4" height="8" fill="#78716c"/><rect x="12" y="22" width="6" height="5" rx="1" fill="white" opacity="0.85"/><rect x="22" y="22" width="6" height="5" rx="1" fill="white" opacity="0.85"/><rect x="16" y="29" width="8" height="7" rx="1" fill="#fbbf24"/><defs><linearGradient id="propGrad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs></svg>`,
        // Downtown - Tall skyscraper
        `<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="6" width="20" height="30" rx="2" fill="url(#propGrad5)"/><rect x="13" y="9" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="18" y="9" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="23" y="9" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="13" y="14" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="18" y="14" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="23" y="14" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="13" y="19" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="18" y="19" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="23" y="19" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="13" y="24" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="18" y="24" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="23" y="24" width="4" height="3" rx="0.5" fill="white" opacity="0.9"/><rect x="17" y="30" width="6" height="6" rx="1" fill="#a855f7"/><defs><linearGradient id="propGrad5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient></defs></svg>`,
        // Convention center - Wide building
        `<svg viewBox="0 0 40 40" fill="none"><rect x="4" y="16" width="32" height="20" rx="2" fill="url(#propGrad6)"/><rect x="14" y="10" width="12" height="6" rx="1" fill="url(#propGrad6)"/><rect x="8" y="20" width="5" height="4" rx="0.5" fill="white" opacity="0.85"/><rect x="14" y="20" width="5" height="4" rx="0.5" fill="white" opacity="0.85"/><rect x="21" y="20" width="5" height="4" rx="0.5" fill="white" opacity="0.85"/><rect x="27" y="20" width="5" height="4" rx="0.5" fill="white" opacity="0.85"/><rect x="16" y="28" width="8" height="8" rx="1" fill="#22d3d1"/><defs><linearGradient id="propGrad6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#22d3d1"/><stop offset="100%" stop-color="#0d9488"/></linearGradient></defs></svg>`
    ],
    propertyNames: [
        'Grand Hotel', 'City Suites', 'Harbor Inn', 'Metro Lodge',
        'Plaza Hotel', 'Urban Stay', 'Riverside Inn', 'Central Hotel',
        'Park Suites', 'Downtown Inn', 'Coast Hotel', 'Valley Lodge'
    ],

    // Trafficking patterns (synthetic for demo)
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
    ]
};

// ============================================
// State Management
// ============================================

class SimulationState {
    constructor() {
        this.reset();
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.quickMode = false;
        this.currentRound = 0;
        this.modelAccuracy = CONFIG.initialAccuracy;
        this.gradientsReceived = 0;
        this.patternsLearned = 0;
        this.properties = [];
        this.trainedThisRound = new Set();
    }
}

const state = new SimulationState();

// ============================================
// Property (Hotel Agent) Class
// ============================================

class PropertyAgent {
    constructor(id, name, icon) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.status = 'idle'; // idle, training, sending, receiving
        this.localPatterns = this.generateLocalPatterns();
        this.element = null;
    }

    generateLocalPatterns() {
        // Each property has seen some subset of patterns
        const numPatterns = Math.floor(Math.random() * 4) + 2;
        const patterns = [];
        const shuffled = [...CONFIG.patterns].sort(() => Math.random() - 0.5);
        for (let i = 0; i < numPatterns; i++) {
            patterns.push(shuffled[i]);
        }
        return patterns;
    }

    setStatus(status) {
        this.status = status;
        if (this.element) {
            this.element.className = `network-node ${status}`;
        }
    }

    async trainLocal() {
        this.setStatus('training');
        const fast = state.quickMode ? 0.3 : 1;
        await sleep((500 + Math.random() * 500) * fast);
        return {
            propertyId: this.id,
            gradientVector: this.generateGradient(),
            patternCount: this.localPatterns.length
        };
    }

    generateGradient() {
        // Simulate gradient as array of numbers (not real data!)
        return Array(10).fill(0).map(() => Math.random() * 2 - 1);
    }

    async sendGradient() {
        this.setStatus('sending');
        const fast = state.quickMode ? 0.3 : 1;
        await sleep((300 + Math.random() * 200) * fast);
    }

    async receiveModel() {
        this.setStatus('receiving');
        const fast = state.quickMode ? 0.3 : 1;
        await sleep((300 + Math.random() * 200) * fast);
        this.setStatus('idle');
    }
}

// ============================================
// Federated Coordinator
// ============================================

class FederatedCoordinator {
    constructor() {
        this.aggregatedGradients = [];
        this.modelVersion = 0;
    }

    reset() {
        this.aggregatedGradients = [];
        this.modelVersion = 0;
    }

    aggregate(gradients) {
        // FedAvg: Average the gradients from all properties
        if (gradients.length === 0) return null;

        const numDimensions = gradients[0].gradientVector.length;
        const averaged = Array(numDimensions).fill(0);

        for (const g of gradients) {
            for (let i = 0; i < numDimensions; i++) {
                averaged[i] += g.gradientVector[i] / gradients.length;
            }
        }

        this.aggregatedGradients.push(averaged);
        this.modelVersion++;

        return averaged;
    }

    calculateAccuracy(round) {
        // Simulate accuracy improvement over training rounds
        const progress = round / CONFIG.trainingRounds;
        const accuracyRange = CONFIG.maxAccuracy - CONFIG.initialAccuracy;

        // Logarithmic curve for realistic learning
        const improvement = accuracyRange * (1 - Math.exp(-3 * progress));
        return Math.min(CONFIG.maxAccuracy, CONFIG.initialAccuracy + improvement);
    }
}

const coordinator = new FederatedCoordinator();

// ============================================
// Risk Scoring Engine
// ============================================

class RiskScorer {
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

        // Lead time
        const leadTimeScore = this.weights.leadTime[booking.leadTime] || 0;
        riskScore += leadTimeScore * 0.3;
        if (leadTimeScore > 0.3) {
            factors.push({
                text: 'Booked very last-minute',
                impact: leadTimeScore > 0.5 ? 'high' : 'medium'
            });
        }

        // Payment method
        const paymentScore = this.weights.paymentMethod[booking.paymentMethod] || 0;
        riskScore += paymentScore * 0.3;
        if (paymentScore > 0.3) {
            factors.push({
                text: 'Paying with prepaid card or cash',
                impact: paymentScore > 0.5 ? 'high' : 'medium'
            });
        }

        // Stay duration
        const durationScore = this.weights.stayDuration[booking.stayDuration] || 0;
        riskScore += durationScore * 0.2;
        if (durationScore > 0.3) {
            factors.push({
                text: 'Unusually short stay (just hours)',
                impact: durationScore > 0.5 ? 'high' : 'medium'
            });
        }

        // Booking source
        const sourceScore = this.weights.bookingSource[booking.bookingSource] || 0;
        riskScore += sourceScore * 0.2;
        if (sourceScore > 0.3) {
            factors.push({
                text: 'Someone else booked the room for them',
                impact: sourceScore > 0.5 ? 'high' : 'medium'
            });
        }

        // Add network bonus if trained
        if (state.currentRound > 0) {
            factors.unshift({
                text: `Similar pattern seen at ${Math.min(state.patternsLearned, 47)} other hotels in the network`,
                impact: 'network'
            });
        }

        // Determine risk level
        let level, recommendation;
        if (riskScore < 0.3) {
            level = 'low';
            recommendation = 'This looks like a normal booking. No special action needed.';
        } else if (riskScore < 0.5) {
            level = 'moderate';
            recommendation = 'Some signals worth noting. Staff should be aware during check-in.';
        } else if (riskScore < 0.7) {
            level = 'elevated';
            recommendation = 'Multiple warning signs detected. A manager should be quietly notified.';
        } else {
            level = 'high';
            recommendation = 'This booking matches known trafficking patterns. Senior staff should review and consider contacting the National Human Trafficking Hotline.';
        }

        return {
            score: riskScore,
            level,
            factors,
            recommendation,
            networkPatternCount: state.patternsLearned
        };
    }
}

const riskScorer = new RiskScorer();

// ============================================
// UI Rendering
// ============================================

function initializePropertyGrid() {
    const grid = document.getElementById('networkGrid');
    if (!grid) return;

    grid.innerHTML = '';
    state.properties = [];

    for (let i = 0; i < CONFIG.numProperties; i++) {
        const icon = CONFIG.propertyIcons[i % CONFIG.propertyIcons.length];
        const name = CONFIG.propertyNames[i];
        const property = new PropertyAgent(i, name, icon);

        const node = document.createElement('div');
        node.className = 'network-node';
        node.innerHTML = icon;
        node.title = name;
        node.dataset.id = i;

        property.element = node;
        state.properties.push(property);
        grid.appendChild(node);
    }
}

function updateCoordinatorUI() {
    const accuracyEl = document.getElementById('modelAccuracy');
    const roundEl = document.getElementById('roundNumber');
    const gradientEl = document.getElementById('gradientCount');
    const patternsEl = document.getElementById('patternsLearned');
    const ringEl = document.getElementById('modelRing');

    if (accuracyEl) {
        accuracyEl.textContent = `${Math.round(state.modelAccuracy)}%`;
    }
    if (roundEl) {
        roundEl.textContent = state.currentRound;
    }
    if (gradientEl) {
        gradientEl.textContent = state.gradientsReceived;
    }
    if (patternsEl) {
        patternsEl.textContent = state.patternsLearned;
    }
    if (ringEl) {
        const progress = (state.modelAccuracy / 100) * 360;
        ringEl.style.background = `conic-gradient(
            var(--primary-500) ${progress}deg,
            rgba(255, 255, 255, 0.1) ${progress}deg
        )`;
    }
}

function updateNetworkStatus(status) {
    const statusEl = document.getElementById('networkStatus');
    if (statusEl) {
        statusEl.textContent = status;
    }
}

function renderRiskResult(result) {
    const container = document.getElementById('riskResult');
    const valueEl = document.getElementById('riskValue');
    const labelEl = document.getElementById('riskLabel');
    const factorsEl = document.getElementById('riskFactors');
    const recEl = document.getElementById('riskRecommendation');
    const needleEl = document.getElementById('gaugeNeedle');

    if (!container) return;

    // Show result
    container.classList.add('visible');

    // Update score display
    if (valueEl) {
        valueEl.textContent = (result.score * 100).toFixed(0) + '%';
        valueEl.className = `risk-value risk-${result.level}`;
    }

    if (labelEl) {
        labelEl.textContent = result.level.charAt(0).toUpperCase() + result.level.slice(1) + ' Risk';
    }

    // Update gauge needle (0 = -90deg, 1 = 90deg)
    if (needleEl) {
        const rotation = -90 + (result.score * 180);
        needleEl.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    }

    // Render factors
    if (factorsEl) {
        factorsEl.innerHTML = result.factors.map(f => `
            <div class="risk-factor ${f.impact}">
                ${f.impact === 'network' ?
                '<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' :
                f.impact === 'high' ?
                    '<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>' :
                    '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>'
            }
                <span>${f.text}</span>
            </div>
        `).join('');
    }

    // Render recommendation
    if (recEl) {
        recEl.className = `risk-recommendation recommendation-${result.level}`;
        recEl.textContent = result.recommendation;
    }

    // Hide form, show result
    const form = document.getElementById('bookingForm');
    if (form) form.style.display = 'none';
}

function resetRiskPanel() {
    const container = document.getElementById('riskResult');
    const form = document.getElementById('bookingForm');

    if (container) container.classList.remove('visible');
    if (form) form.style.display = 'flex';
}

// ============================================
// Simulation Control
// ============================================

async function runTrainingRound() {
    if (!state.isRunning || state.isPaused) return;

    state.currentRound++;
    updateNetworkStatus(`Step ${state.currentRound} of ${CONFIG.trainingRounds} — hotels sharing lessons`);

    // Select random subset of properties to train this round
    const numTraining = Math.floor(Math.random() * 4) + 5;
    const shuffled = [...state.properties].sort(() => Math.random() - 0.5);
    const trainingSet = shuffled.slice(0, numTraining);

    // Phase 1: Local training
    const gradients = [];
    for (const property of trainingSet) {
        const gradient = await property.trainLocal();
        gradients.push(gradient);
    }

    // Phase 2: Send gradients
    for (const property of trainingSet) {
        await property.sendGradient();
        state.gradientsReceived++;
        updateCoordinatorUI();
    }

    // Phase 3: Aggregate at coordinator
    coordinator.aggregate(gradients);
    state.modelAccuracy = coordinator.calculateAccuracy(state.currentRound);
    state.patternsLearned = Math.min(
        state.patternsLearned + Math.floor(Math.random() * 3) + 1,
        CONFIG.patterns.length
    );
    updateCoordinatorUI();

    // Phase 4: Broadcast updated model
    for (const property of state.properties) {
        await property.receiveModel();
    }

    updateNetworkStatus(`Step ${state.currentRound} done — network improving`);

    // Continue to next round
    if (state.currentRound < CONFIG.trainingRounds && state.isRunning) {
        setTimeout(runTrainingRound, state.quickMode ? 150 : 500);
    } else if (state.currentRound >= CONFIG.trainingRounds) {
        state.isRunning = false;

        // Restore original rounds config if quick mode
        if (state.quickMode && CONFIG._origRounds) {
            CONFIG.trainingRounds = CONFIG._origRounds;
            delete CONFIG._origRounds;
        }

        updateNetworkStatus('Done — Network Ready ✓');
        document.getElementById('startTrainingBtn').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
            Simulation Complete
        `;

        const quickBtn = document.getElementById('quickDemoBtn');
        if (quickBtn) quickBtn.style.display = 'none';
    }
}

function startTraining(quickMode = false) {
    if (state.isRunning) return;

    state.isRunning = true;
    state.quickMode = quickMode;

    if (quickMode) {
        CONFIG._origRounds = CONFIG.trainingRounds;
        CONFIG.trainingRounds = 3;
    }

    document.getElementById('startTrainingBtn').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
        </svg>
        Hotels are learning...
    `;

    const quickBtn = document.getElementById('quickDemoBtn');
    if (quickBtn) quickBtn.style.display = 'none';

    runTrainingRound();
}

function startQuickDemo() {
    startTraining(true);
}

function resetSimulation() {
    // Restore config if quick mode was active
    if (CONFIG._origRounds) {
        CONFIG.trainingRounds = CONFIG._origRounds;
        delete CONFIG._origRounds;
    }

    state.reset();
    coordinator.reset();

    initializePropertyGrid();
    updateCoordinatorUI();
    updateNetworkStatus('Ready');
    resetRiskPanel();

    document.getElementById('startTrainingBtn').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Start the Simulation
    `;

    const quickBtn = document.getElementById('quickDemoBtn');
    if (quickBtn) quickBtn.style.display = '';
}

async function assessBooking() {
    const form = document.getElementById('bookingForm');
    const assessBtn = document.getElementById('assessBtn');

    // Show processing state
    form.classList.add('processing');
    assessBtn.disabled = true;
    assessBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning" style="width: 18px; height: 18px; margin-right: 8px;">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
        </svg>
        Checking booking...
    `;

    // Simulate network/processing delay for UX
    await sleep(1200);

    const booking = {
        leadTime: parseFloat(document.getElementById('leadTime').value),
        paymentMethod: document.getElementById('paymentMethod').value,
        stayDuration: parseFloat(document.getElementById('stayDuration').value),
        bookingSource: document.getElementById('bookingSource').value
    };

    const result = riskScorer.score(booking);

    // Reset button state
    form.classList.remove('processing');
    assessBtn.disabled = false;
    assessBtn.innerHTML = 'Assess Risk';

    renderRiskResult(result);
}

// ============================================
// Utility Functions
// ============================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Initialization
// ============================================

function initSimulation() {
    // Initialize grid
    initializePropertyGrid();
    updateCoordinatorUI();

    // Bind event listeners
    const startBtn = document.getElementById('startTrainingBtn');
    const resetBtn = document.getElementById('resetBtn');
    const assessBtn = document.getElementById('assessBtn');
    const newBookingBtn = document.getElementById('newBookingBtn');

    const quickDemoBtn = document.getElementById('quickDemoBtn');

    if (startBtn) {
        startBtn.addEventListener('click', function() { startTraining(false); });
    }

    if (quickDemoBtn) {
        quickDemoBtn.addEventListener('click', startQuickDemo);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetSimulation);
    }

    if (assessBtn) {
        assessBtn.addEventListener('click', assessBooking);
    }

    if (newBookingBtn) {
        newBookingBtn.addEventListener('click', resetRiskPanel);
    }
}

// Export for use
window.HAVENSimulation = {
    init: initSimulation,
    start: startTraining,
    quickDemo: startQuickDemo,
    reset: resetSimulation,
    assess: assessBooking,
    state,
    coordinator,
    riskScorer
};