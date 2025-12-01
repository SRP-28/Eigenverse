const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const sliders = {
  a11: document.getElementById('a11'),
  a12: document.getElementById('a12'),
  a21: document.getElementById('a21'),
  a22: document.getElementById('a22')
};

// Original vector v:
const v = [1, 1];

// Draw coordinate axes
function drawAxes() {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 1;

  // X axis
  ctx.beginPath();
  ctx.moveTo(0, height/2);
  ctx.lineTo(width, height/2);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(width/2, 0);
  ctx.lineTo(width/2, height);
  ctx.stroke();
}

// Draw vector from center
function drawVector(vec, color) {
  ctx.beginPath();
  ctx.moveTo(width/2, height/2);
  // Scale vector for better visibility
  const scale = 70;
  ctx.lineTo(width/2 + vec[0]*scale, height/2 - vec[1]*scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw arrowhead
  const endX = width/2 + vec[0]*scale;
  const endY = height/2 - vec[1]*scale;

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - 8, endY + 12);
  ctx.lineTo(endX + 8, endY + 12);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// Multiply matrix A with vector v
function multiplyMatrixVector(A, vec) {
  return [
    A[0][0]*vec[0] + A[0][1]*vec[1],
    A[1][0]*vec[0] + A[1][1]*vec[1]
  ];
}

function update() {
  drawAxes();

  // Read matrix from sliders
  let A = [
    [parseFloat(sliders.a11.value), parseFloat(sliders.a12.value)],
    [parseFloat(sliders.a21.value), parseFloat(sliders.a22.value)]
  ];

  drawVector(v, 'blue'); // original vector in blue

  // Multiply A*v
  const Av = multiplyMatrixVector(A, v);
  drawVector(Av, 'red'); // transformed vector in red
}

// Attach listeners to sliders
for (let key in sliders) {
  sliders[key].addEventListener('input', update);
}

// Initial draw
update();
