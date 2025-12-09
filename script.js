// Smooth scroll for "Enter the Matrix" button
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// ===== BASICS SECTION: canvas + sliders =====
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const w = canvas.width;
const h = canvas.height;

// Sliders from BASICS section (s- prefix)
const sliders = {
  a11: document.getElementById('s-a11'),
  a12: document.getElementById('s-a12'),
  a21: document.getElementById('s-a21'),
  a22: document.getElementById('s-a22')
};

const baseVector = [1, 1];

function drawAxes() {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1;

  // x-axis
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // y-axis
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

  // arrowhead
  const angle = Math.atan2(y0 - y1, x1 - x0);
  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(
    x1 - headLen * Math.cos(angle - 0.4),
    y1 + headLen * Math.sin(angle - 0.4)
  );
  ctx.lineTo(
    x1 - headLen * Math.cos(angle + 0.4),
    y1 + headLen * Math.sin(angle + 0.4)
  );
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

// Simple power iteration to approximate dominant eigenvector
function approximateEigenvector(A, iterations = 12) {
  let v = [1, 0.3];
  for (let i = 0; i < iterations; i++) {
    v = multiply(A, v);
    const norm = Math.hypot(v[0], v[1]) || 1;
    v = [v[0] / norm, v[1] / norm];
  }
  return v;
}

function updateCanvasBasics() {
  const A = [
    [parseFloat(sliders.a11.value), parseFloat(sliders.a12.value)],
    [parseFloat(sliders.a21.value), parseFloat(sliders.a22.value)]
  ];

  drawAxes();
  drawVector(baseVector, '#38bdf8'); // blue original
  const Av = multiply(A, baseVector);
  drawVector(Av, '#fb7185');        // red transformed

  const eigVec = approximateEigenvector(A);
  drawVector(eigVec, '#22c55e');    // green approx eigenvector

  const readout = document.getElementById('matrixReadout');
  readout.textContent =
    'A ≈ [[' +
    A[0][0].toFixed(1) + ', ' + A[0][1].toFixed(1) + '], ' +
    '[' + A[1][0].toFixed(1) + ', ' + A[1][1].toFixed(1) + ']]';
}

Object.values(sliders).forEach(sl => sl.addEventListener('input', updateCanvasBasics));
updateCanvasBasics();

// ===== PLAYGROUND: analytic eigenvalues + canvas animation + table =====

// reuse computeEigen2x2 from analytic formula
function computeEigen2x2(a, b, c, d) {
  const tr = a + d;
  const det = a * d - b * c;
  const disc = tr * tr - 4 * det;

  if (disc < 0) {
    return { complex: true };
  }

  const sqrtDisc = Math.sqrt(disc);
  const lambda1 = (tr + sqrtDisc) / 2;
  const lambda2 = (tr - sqrtDisc) / 2;

  function eigenvector(lambda) {
    const m11 = a - lambda;
    const m12 = b;
    const m21 = c;
    const m22 = d - lambda;

    let v1, v2;

    if (Math.abs(m11) + Math.abs(m12) > Math.abs(m21) + Math.abs(m22)) {
      if (Math.abs(m11) > Math.abs(m12)) {
        v2 = 1;
        v1 = -m12 / (m11 || 1e-9);
      } else {
        v1 = 1;
        v2 = -m11 / (m12 || 1e-9);
      }
    } else {
      if (Math.abs(m21) > Math.abs(m22)) {
        v2 = 1;
        v1 = -m22 / (m21 || 1e-9);
      } else {
        v1 = 1;
        v2 = -m21 / (m22 || 1e-9);
      }
    }

    const len = Math.hypot(v1, v2) || 1;
    return [v1 / len, v2 / len];
  }

  const v1 = eigenvector(lambda1);
  const v2 = eigenvector(lambda2);

  return { complex: false, lambda1, lambda2, v1, v2 };
}

// re-use canvas but with interpolation (for playground button)
function drawScenePlayground(A, eig, t) {
  ctx.clearRect(0, 0, w, h);

  const [a, b, c, d] = A;

  // axes
  drawAxes();

  // Original basis
  drawVector([1, 0], '#4b5563');
  drawVector([0, 1], '#4b5563');

  // Transformed basis
  const e1 = [1, 0];
  const e2 = [0, 1];
  const Ae1 = [a * e1[0] + b * e1[1], c * e1[0] + d * e1[1]];
  const Ae2 = [a * e2[0] + b * e2[1], c * e2[0] + d * e2[1]];

  const iAe1 = [e1[0] + t * (Ae1[0] - e1[0]), e1[1] + t * (Ae1[1] - e1[1])];
  const iAe2 = [e2[0] + t * (Ae2[0] - e2[0]), e2[1] + t * (Ae2[1] - e2[1])];

  drawVector(iAe1, '#22d3ee');
  drawVector(iAe2, '#38bdf8');

  // Eigenvectors
  if (!eig.complex) {
    drawVector(eig.v1, '#a855f7');
    drawVector(eig.v2, '#fb37ff');
  }
}

function animateMatrixPlayground(A, eig) {
  const duration = 800;
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    drawScenePlayground(A, eig, t);
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// Button + table
document.getElementById('compute-btn').addEventListener('click', () => {
  const a = parseFloat(document.getElementById('p-a11').value || 0);
  const b = parseFloat(document.getElementById('p-a12').value || 0);
  const c = parseFloat(document.getElementById('p-a21').value || 0);
  const d = parseFloat(document.getElementById('p-a22').value || 0);

  const res = computeEigen2x2(a, b, c, d);
  const resultBox = document.getElementById('eigen-result');
  const tableBody = document.getElementById('eigen-table');

  if (res.complex) {
    resultBox.textContent = 'This matrix has complex eigenvalues (not drawn on canvas).';
    tableBody.innerHTML = `
      <tr><td>Eigenvalues</td><td>Complex pair</td></tr>
      <tr><td>Eigenvectors</td><td>Not displayed</td></tr>
      <tr><td></td><td></td></tr>
      <tr><td></td><td></td></tr>
    `;
    animateMatrixPlayground([a, b, c, d], res);
    return;
  }

  resultBox.textContent =
    'Real eigenvalues detected. Basis and eigenvectors are animated on the canvas.';

  tableBody.innerHTML = `
    <tr>
      <td>Eigenvalue λ₁</td>
      <td>${res.lambda1.toFixed(3)}</td>
    </tr>
    <tr>
      <td>Eigenvector v₁</td>
      <td>[${res.v1[0].toFixed(3)}, ${res.v1[1].toFixed(3)}]</td>
    </tr>
    <tr>
      <td>Eigenvalue λ₂</td>
      <td>${res.lambda2.toFixed(3)}</td>
    </tr>
    <tr>
      <td>Eigenvector v₂</td>
      <td>[${res.v2[0].toFixed(3)}, ${res.v2[1].toFixed(3)}]</td>
    </tr>
  `;

  animateMatrixPlayground([a, b, c, d], res);
});
