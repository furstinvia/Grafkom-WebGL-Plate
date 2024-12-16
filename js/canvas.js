// canvas.js
export const canvas = document.getElementById("webglCanvas");
export const gl = canvas.getContext("webgl", {
  antialias: true,
  preserveDrawingBuffer: true
});

// Handle canvas resize
export function resizeCanvas() {
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
