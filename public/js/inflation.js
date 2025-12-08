document.addEventListener('DOMContentLoaded', () => {
  const annualSpan = document.getElementById('annualInflationValue');
  const monthlySpan = document.getElementById('monthlyInflationValue');
  renderInflationSparkline();

  if (!annualSpan || !monthlySpan) {
    console.warn('Inflation spans not found in DOM');
    return;
  }

  fetch('/api/enflasyon-tuik')
    .then(response => {
      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      if (typeof data.annual === 'number') {
        annualSpan.textContent = data.annual.toFixed(2) + ' %';
      }

      if (typeof data.monthly === 'number') {
        monthlySpan.textContent = data.monthly.toFixed(2) + ' %';
      }
    })
    .catch(err => {
      console.error('Enflasyon verisi alınamadı:', err);
      // On error we simply keep "- %" as default text
    });
});

/**
 * Render a compact sparkline showing the last 12 months trend.
 * Uses simple sample data to visually balance the TÜİK card.
 */
function renderInflationSparkline() {
  const canvas = document.getElementById('inflationSparkline');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  const sparklineData = [2.4, 2.7, 3.0, 3.2, 3.5, 3.9, 4.1, 4.4, 4.7, 5.0, 5.3, 5.6];
  const monthLabels = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [{
        data: sparklineData,
        borderColor: 'rgba(10, 37, 64, 0.8)',
        backgroundColor: 'rgba(10, 37, 64, 0.08)',
        tension: 0.35,
        pointRadius: 0,
        pointHitRadius: 8,
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          displayColors: false,
          callbacks: {
            title: (items) => items[0]?.label || '',
            label: (item) => `${item.parsed.y.toFixed(1)} %`
          },
          backgroundColor: 'rgba(10, 37, 64, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          padding: 8,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          display: false,
          grid: { display: false }
        },
        y: {
          display: false,
          grid: { display: false }
        }
      },
      layout: {
        padding: 0
      },
      elements: {
        line: {
          capBezierPoints: true
        }
      }
    }
  });
}

