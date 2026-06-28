/**
 * SurfaceQ Risk Score Component
 * <sq-risk-score> custom element with Shadow DOM
 * Attributes: score (0-100), size (default 180)
 * Features: animated SVG circular gauge, gradient stroke, color coding
 */
class SQRiskScore extends HTMLElement {
  static get observedAttributes() {
    return ['score', 'size'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._animationFrame = null;
    this._currentAnimatedScore = 0;
  }

  connectedCallback() {
    this.render();
    this._animateIn();
  }

  disconnectedCallback() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.shadowRoot.innerHTML) {
      if (name === 'size') {
        this.render();
        this._animateIn();
      } else if (name === 'score') {
        this._animateScoreChange(parseFloat(oldVal) || 0, this.score);
      }
    }
  }

  get score() {
    const val = parseFloat(this.getAttribute('score'));
    return isNaN(val) ? 0 : Math.max(0, Math.min(100, val));
  }

  get size() {
    const val = parseInt(this.getAttribute('size'));
    return isNaN(val) ? 180 : Math.max(80, val);
  }

  /**
   * Returns color config based on score value
   */
  _getColorConfig(score) {
    if (score <= 25) {
      return {
        primary: '#00e676',
        secondary: '#69f0ae',
        glow: 'rgba(0, 230, 118, 0.3)',
        label: 'Low Risk',
        gradientId: 'grad-green'
      };
    } else if (score <= 50) {
      return {
        primary: '#ffea00',
        secondary: '#fff176',
        glow: 'rgba(255, 234, 0, 0.3)',
        label: 'Medium Risk',
        gradientId: 'grad-yellow'
      };
    } else if (score <= 75) {
      return {
        primary: '#ff9100',
        secondary: '#ffab40',
        glow: 'rgba(255, 145, 0, 0.3)',
        label: 'High Risk',
        gradientId: 'grad-orange'
      };
    } else {
      return {
        primary: '#ff1744',
        secondary: '#ff5252',
        glow: 'rgba(255, 23, 68, 0.3)',
        label: 'Critical Risk',
        gradientId: 'grad-red'
      };
    }
  }

  /**
   * Animate the stroke and score number on initial render
   */
  _animateIn() {
    const targetScore = this.score;
    const startTime = performance.now();
    const duration = 1500; // 1.5 seconds
    const scoreEl = this.shadowRoot.querySelector('.score-value');
    const progressCircle = this.shadowRoot.querySelector('.progress-circle');

    if (!progressCircle || !scoreEl) return;

    const size = this.size;
    const strokeWidth = Math.max(8, size * 0.06);
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;

    // Start fully hidden
    progressCircle.style.strokeDasharray = `${circumference}`;
    progressCircle.style.strokeDashoffset = `${circumference}`;
    progressCircle.style.transition = 'none';

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentScore = Math.round(eased * targetScore);
      const strokeProgress = (eased * targetScore / 100) * circumference;
      const offset = circumference - strokeProgress;

      scoreEl.textContent = currentScore;
      progressCircle.style.strokeDashoffset = `${offset}`;

      // Update color dynamically during animation
      this._updateGradient(currentScore);

      if (progress < 1) {
        this._animationFrame = requestAnimationFrame(animate);
      } else {
        this._currentAnimatedScore = targetScore;
      }
    };

    // Force reflow before animating
    requestAnimationFrame(() => {
      this._animationFrame = requestAnimationFrame(animate);
    });
  }

  /**
   * Animate score change when attribute updates
   */
  _animateScoreChange(fromScore, toScore) {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }

    const startTime = performance.now();
    const duration = 800;
    const scoreEl = this.shadowRoot.querySelector('.score-value');
    const progressCircle = this.shadowRoot.querySelector('.progress-circle');

    if (!progressCircle || !scoreEl) return;

    const size = this.size;
    const strokeWidth = Math.max(8, size * 0.06);
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentScore = Math.round(fromScore + (toScore - fromScore) * eased);
      const strokeProgress = (currentScore / 100) * circumference;
      const offset = circumference - strokeProgress;

      scoreEl.textContent = currentScore;
      progressCircle.style.strokeDashoffset = `${offset}`;

      this._updateGradient(currentScore);

      if (progress < 1) {
        this._animationFrame = requestAnimationFrame(animate);
      } else {
        this._currentAnimatedScore = toScore;
      }
    };

    this._animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Update gradient stops based on current score
   */
  _updateGradient(score) {
    const config = this._getColorConfig(score);
    const stop1 = this.shadowRoot.querySelector('#score-grad-stop1');
    const stop2 = this.shadowRoot.querySelector('#score-grad-stop2');
    const glowCircle = this.shadowRoot.querySelector('.glow-circle');

    if (stop1) stop1.setAttribute('stop-color', config.primary);
    if (stop2) stop2.setAttribute('stop-color', config.secondary);
    if (glowCircle) {
      glowCircle.style.filter = `drop-shadow(0 0 8px ${config.glow})`;
    }
  }

  render() {
    const score = this.score;
    const size = this.size;
    const config = this._getColorConfig(score);

    const strokeWidth = Math.max(8, size * 0.06);
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    // Font sizes relative to component size
    const scoreFontSize = Math.round(size * 0.28);
    const labelFontSize = Math.round(size * 0.075);
    const riskLabelFontSize = Math.round(size * 0.065);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .risk-score-container {
          position: relative;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gauge-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .track-circle {
          fill: none;
          stroke: rgba(255, 255, 255, 0.06);
          stroke-width: ${strokeWidth};
        }

        .track-circle-inner {
          fill: none;
          stroke: rgba(255, 255, 255, 0.02);
          stroke-width: ${strokeWidth - 2};
        }

        .progress-circle {
          fill: none;
          stroke: url(#score-gradient);
          stroke-width: ${strokeWidth};
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${circumference};
          filter: drop-shadow(0 0 8px ${config.glow});
          transition: stroke-dashoffset 0s;
        }

        .glow-circle {
          fill: none;
          stroke: url(#score-gradient);
          stroke-width: ${strokeWidth + 4};
          stroke-linecap: round;
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${circumference};
          opacity: 0.15;
          filter: blur(4px);
        }

        .score-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .score-value {
          font-size: ${scoreFontSize}px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .score-label {
          font-size: ${labelFontSize}px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: ${Math.round(size * 0.03)}px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 500;
        }

        .risk-level {
          font-size: ${riskLabelFontSize}px;
          color: ${config.primary};
          margin-top: ${Math.round(size * 0.02)}px;
          font-weight: 600;
          letter-spacing: 0.5px;
          opacity: 0.9;
        }

        /* Background decorative ring */
        .bg-ring {
          position: absolute;
          top: ${strokeWidth + 6}px;
          left: ${strokeWidth + 6}px;
          right: ${strokeWidth + 6}px;
          bottom: ${strokeWidth + 6}px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .bg-ring-inner {
          position: absolute;
          top: ${strokeWidth + 12}px;
          left: ${strokeWidth + 12}px;
          right: ${strokeWidth + 12}px;
          bottom: ${strokeWidth + 12}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%);
        }

        /* Tick marks */
        .tick-marks {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .tick-mark {
          fill: none;
          stroke: rgba(255, 255, 255, 0.08);
          stroke-width: 1;
        }

        .tick-mark-major {
          stroke: rgba(255, 255, 255, 0.12);
          stroke-width: 1.5;
        }
      </style>

      <div class="risk-score-container">
        <!-- SVG Gauge -->
        <svg class="gauge-svg" viewBox="0 0 ${size} ${size}">
          <defs>
            <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop id="score-grad-stop1" offset="0%" stop-color="${config.primary}"/>
              <stop id="score-grad-stop2" offset="100%" stop-color="${config.secondary}"/>
            </linearGradient>
          </defs>

          <!-- Tick marks for visual depth -->
          ${this._generateTickMarks(center, radius, strokeWidth)}

          <!-- Background track -->
          <circle class="track-circle"
                  cx="${center}" cy="${center}" r="${radius}"/>
          <circle class="track-circle-inner"
                  cx="${center}" cy="${center}" r="${radius}"/>

          <!-- Glow layer (behind progress) -->
          <circle class="glow-circle"
                  cx="${center}" cy="${center}" r="${radius}"/>

          <!-- Progress arc -->
          <circle class="progress-circle"
                  cx="${center}" cy="${center}" r="${radius}"/>
        </svg>

        <!-- Decorative rings -->
        <div class="bg-ring"></div>
        <div class="bg-ring-inner"></div>

        <!-- Score text overlay -->
        <div class="score-overlay">
          <span class="score-value">0</span>
          <span class="score-label">Risk Score</span>
          <span class="risk-level">${config.label}</span>
        </div>
      </div>
    `;

    // Sync glow circle dasharray with progress
    const glowCircle = this.shadowRoot.querySelector('.glow-circle');
    const progressCircle = this.shadowRoot.querySelector('.progress-circle');

    if (glowCircle && progressCircle) {
      const syncGlow = () => {
        const offset = progressCircle.style.strokeDashoffset;
        glowCircle.style.strokeDasharray = `${circumference}`;
        glowCircle.style.strokeDashoffset = offset;
        requestAnimationFrame(syncGlow);
      };
      // Start syncing after initial render
      requestAnimationFrame(() => {
        const observer = new MutationObserver(() => {
          glowCircle.style.strokeDashoffset = progressCircle.style.strokeDashoffset;
        });
        observer.observe(progressCircle, {
          attributes: true,
          attributeFilter: ['style']
        });
      });
    }
  }

  /**
   * Generate decorative tick marks around the gauge
   */
  _generateTickMarks(center, radius, strokeWidth) {
    const ticks = [];
    const outerR = radius + strokeWidth / 2 + 2;
    const tickLength = 4;
    const majorTickLength = 6;
    const totalTicks = 40;

    for (let i = 0; i < totalTicks; i++) {
      const angle = (i / totalTicks) * 360;
      const radian = (angle * Math.PI) / 180;
      const isMajor = i % 10 === 0;
      const len = isMajor ? majorTickLength : tickLength;

      const x1 = center + (outerR) * Math.cos(radian);
      const y1 = center + (outerR) * Math.sin(radian);
      const x2 = center + (outerR + len) * Math.cos(radian);
      const y2 = center + (outerR + len) * Math.sin(radian);

      ticks.push(`<line class="${isMajor ? 'tick-mark-major' : 'tick-mark'}"
                        x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}"
                        x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`);
    }

    return ticks.join('\n');
  }
}

customElements.define('sq-risk-score', SQRiskScore);
