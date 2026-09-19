/**
 * SepCare Clinical Time-Series Chart Component
 * Powered by Chart.js (Compatible with React / Next.js via react-chartjs-2).
 * 
 * Features:
 * - Strict 5-minute sampling intervals (e.g., 10:00, 10:05, 10:10, 10:15...)
 * - Evenly spaced points without timestamp stretching
 * - Smooth continuous curve using Monotone Cubic Spline (zero overshoot)
 * - Safe physiological corridor band (e.g., 110–160 bpm for pulse, 36.5–37.5°C for temp)
 * - Minimal clinical aesthetic adhering strictly to the SepCare 70/20/10 palette
 */

/**
 * Generate synthetic continuous neonatal physiological telemetry at exact 5-minute intervals
 * @param {number} pointCount - Number of 5-minute points to generate (e.g., 24 for 2 hours, 48 for 4 hours)
 * @param {number} baseValue - Baseline metric value (e.g., 135 for HR, 36.8 for Temp)
 * @param {number} variance - Max variance around baseline
 * @param {Date} startTime - Starting timestamp
 */
function generate5MinTelemetryData(pointCount = 24, baseValue = 135, variance = 6, startTime = null) {
  const start = startTime ? new Date(startTime) : new Date(Date.now() - pointCount * 5 * 60 * 1000);
  const labels = [];
  const data = [];

  for (let i = 0; i <= pointCount; i++) {
    const pointTime = new Date(start.getTime() + i * 5 * 60 * 1000);
    const hours = String(pointTime.getHours()).padStart(2, '0');
    const mins = String(pointTime.getMinutes()).padStart(2, '0');
    labels.push(`${hours}:${mins}`);

    // Gentle continuous physiologic wave + slight stochastic noise
    const wave = Math.sin(i / 3.5) * variance * 0.7;
    const microJitter = (Math.sin(i * 1.8) * 0.3) * variance;
    const value = Number((baseValue + wave + microJitter).toFixed(1));
    data.push(value);
  }

  return { labels, data };
}

/**
 * Create or update a SepCare Continuous Time-Series Chart
 * @param {HTMLCanvasElement|string} canvasElement - Canvas element or ID
 * @param {Object} config - Configuration options
 * @returns {Chart} Chart.js instance
 */
function createSepCareTimeSeriesChart(canvasElement, config = {}) {
  const canvas = typeof canvasElement === 'string' ? document.getElementById(canvasElement) : canvasElement;
  if (!canvas || typeof Chart === 'undefined') return null;

  const ctx = canvas.getContext('2d');

  // Default parameters
  const {
    points = 24, // 24 points x 5 min = 2 hours
    baseValue = 136,
    unit = 'bpm',
    label = 'Heart Rate',
    minTarget = 110,
    maxTarget = 160,
    lineColor = '#6F9FD5',
    areaColor = 'rgba(111, 159, 213, 0.12)',
    safeZoneColor = 'rgba(79, 175, 120, 0.08)',
    yMin = 90,
    yMax = 180
  } = config;

  const telemetry = generate5MinTelemetryData(points, baseValue, 7);

  // Gradient area fill
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 200);
  gradient.addColorStop(0, areaColor);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  // Custom plugin to draw the Target Safe Range Corridor behind the line
  const safeCorridorPlugin = {
    id: 'scSafeCorridor',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!scales.y || !chartArea) return;

      const topY = scales.y.getPixelForValue(maxTarget);
      const bottomY = scales.y.getPixelForValue(minTarget);

      ctx.save();
      ctx.fillStyle = safeZoneColor;
      ctx.fillRect(chartArea.left, topY, chartArea.width, bottomY - topY);

      // Subtle dashed corridor boundaries
      ctx.strokeStyle = 'rgba(79, 175, 120, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(chartArea.left, topY);
      ctx.lineTo(chartArea.right, topY);
      ctx.moveTo(chartArea.left, bottomY);
      ctx.lineTo(chartArea.right, bottomY);
      ctx.stroke();
      ctx.restore();
    }
  };

  const chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: telemetry.labels,
      datasets: [{
        label: label,
        data: telemetry.data,
        borderColor: lineColor,
        borderWidth: 2.2,
        backgroundColor: gradient,
        fill: true,
        // Monotone cubic interpolation: smooth curve without artificial overshoot
        tension: 0.38,
        cubicInterpolationMode: 'monotone',
        pointRadius: 0, // Clean continuous curve by default
        pointHoverRadius: 5,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#182235',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          titleFont: { family: 'Inter', size: 12, weight: '600' },
          bodyFont: { family: 'Inter', size: 13, weight: '700' },
          padding: { top: 8, bottom: 8, left: 12, right: 12 },
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            title: (items) => `Time: ${items[0].label} (5m interval)`,
            label: (item) => `${item.dataset.label}: ${item.formattedValue} ${unit}`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: '#8D97A5',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7 // Evenly spaced visible time markers
          }
        },
        y: {
          min: yMin,
          max: yMax,
          grid: {
            color: '#EDF1F7',
            drawBorder: false,
            lineWidth: 1
          },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: '#8D97A5',
            stepSize: 20
          }
        }
      }
    },
    plugins: [safeCorridorPlugin]
  });

  return chartInstance;
}

if (typeof window !== 'undefined') {
  window.createSepCareTimeSeriesChart = createSepCareTimeSeriesChart;
  window.generate5MinTelemetryData = generate5MinTelemetryData;
}
