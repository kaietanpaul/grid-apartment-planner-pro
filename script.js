const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const controls = document.getElementById('controls');
const nameInput = document.getElementById('nameInput');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const colorInput = document.getElementById('colorInput');
const objectsList = document.getElementById('objectsList');
const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');
const exportBtn = document.getElementById('exportBtn');

let objects = [];
let isDrawing = false;
let startX = 0;
let startY = 0;
let preview = null;

function resizeCanvas() {
  canvas.width = window.innerWidth - controls.offsetWidth;
  canvas.height = window.innerHeight;
  drawGrid();
  drawObjects();
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const step = 10; // 10px per grid line (10mm)
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawObjects() {
  objects.forEach(obj => {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
  });
  if (preview) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = preview.color;
    ctx.fillRect(preview.x, preview.y, preview.w, preview.h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#00d1ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(preview.x, preview.y, preview.w, preview.h);
  }
}

canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  startX = Math.floor(e.clientX - rect.left);
  startY = Math.floor(e.clientY - rect.top);
  isDrawing = true;
});

canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);
  preview = {
    x: startX,
    y: startY,
    w: x - startX,
    h: y - startY,
    color: colorInput.value
  };
  drawGrid();
  drawObjects();
});

canvas.addEventListener('mouseup', e => {
  if (!isDrawing) return;
  if (preview) {
    let obj = {
      x: preview.x,
      y: preview.y,
      w: preview.w,
      h: preview.h,
      color: colorInput.value,
      name: nameInput.value || 'Object'
    };
    if (obj.w < 0) {
      obj.x += obj.w;
      obj.w = Math.abs(obj.w);
    }
    if (obj.h < 0) {
      obj.y += obj.h;
      obj.h = Math.abs(obj.h);
    }
    obj.w = Math.max(1, obj.w);
    obj.h = Math.max(1, obj.h);
    objects.push(obj);
    updateObjectsList();
  }
  preview = null;
  isDrawing = false;
  drawGrid();
  drawObjects();
});

function updateObjectsList() {
  objectsList.innerHTML = '';
  objects.forEach((obj, i) => {
    const div = document.createElement('div');
    div.textContent = `${obj.name}: ${obj.w}×${obj.h} mm`;
    objectsList.appendChild(div);
  });
}

exportBtn.addEventListener('click', () => {
  const data = { objects: objects };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'layout.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => {
  importInput.click();
});

importInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      objects = data.objects || [];
      updateObjectsList();
      drawGrid();
      drawObjects();
    } catch (err) {
      alert('Invalid JSON');
    }
  };
  reader.readAsText(file);
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
