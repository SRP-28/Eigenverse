// smooth scroll
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// canvas visualization
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const w = canvas.width;
const h = canvas.height;

const sliders = {
  a11: document.getElementById('a11'),
  a12: document.getElementById('a12'),
  a21: document.getElementById('a21'),
  a22: document.getElementById('a22')
};

const baseVector = [1, 1];

function drawAxes() {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
}

function drawVector(vec, color) {
  const scale = 70;
  const x0 = w / 2;
  const y0 = h / 2;
  const x1 = x0 + vec[0] * scale;
  const y1 = y0 - vec[1] * scale;

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  const angle = Math.atan2(y0 - y1, x1 - x0);
  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - headLen * Math.cos(angle - 0.4), y1 + headLen * Math.sin(angle - 0.4));
  ctx.lineTo(x1 - headLen * Math.cos(angle + 0.4), y1 + headLen * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function multiply(A, v) {
  return [
    A[0][0] * v[0] + A[0][1] * v[1],
    A[1][0] * v[0] + A[1][1] * v[1]
  ];
}

// quick approximate eigenvector: power iteration
function approximateEigenvector(A, iterations = 12) {
  let v = [1, 0.3];
  for (let i = 0; i < iterations; i++) {
    v = multiply(A, v);
    const norm = Math.hypot(v[0], v[1]) || 1;
    v = [v[0] / norm, v[1] / norm];
  }
  return v;
}

function updateCanvas() {
  const A = [
    [parseFloat(sliders.a11.value), parseFloat(sliders.a12.value)],
    [parseFloat(sliders.a21.value), parseFloat(sliders.a22.value)]
  ];

  drawAxes();
  drawVector(baseVector, '#38bdf8'); // blue
  const Av = multiply(A, baseVector);
  drawVector(Av, '#fb7185'); // red

  // approximate dominant eigenvector in green
  const eigVec = approximateEigenvector(A);
  drawVector(eigVec, '#22c55e');

  // update matrix readout
  const readout = document.getElementById('matrixReadout');
  readout.textContent =
    `A ≈ [[${A[0][0].toFixed(1)}, ${A[0][1].toFixed(1)}], ` +
    `[${A[1][0].toFixed(1)}, ${A[1][1].toFixed(1)}]]`;
}

Object.values(sliders).forEach(sl => sl.addEventListener('input', updateCanvas));
updateCanvas();

// eigenvalue playground: analytic 2x2 solution
function computeEigen() {
  const m11 = parseFloat(document.getElementById('m11').value);
  const m12 = parseFloat(document.getElementById('m12').value);
  const m21 = parseFloat(document.getElementById('m21').value);
  const m22 = parseFloat(document.getElementById('m22').value);

  const trace = m11 + m22;
  const det = m11 * m22 - m12 * m21;
  const disc = trace * trace - 4 * det;

  let text;
  if (disc >= 0) {
    const sqrtD = Math.sqrt(disc);
    const lambda1 = (trace + sqrtD) / 2;
    const lambda2 = (trace - sqrtD) / 2;
    text = `Eigenvalues: λ₁ ≈ ${lambda1.toFixed(3)}, λ₂ ≈ ${lambda2.toFixed(3)}`;
  } else {
    const sqrtD = Math.sqrt(-disc);
    const real = trace / 2;
    const imag = sqrtD / 2;
    text = `Complex eigenvalues: λ ≈ ${real.toFixed(3)} ± ${imag.toFixed(3)} i`;
  }

  document.getElementById('eigenResult').textContent = text;
}
