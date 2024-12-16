// Enhanced camera controls
export let isDragging = false;
export let lastMouseX = 0;
export let lastMouseY = 0;
export let rotationX = 0;
export let rotationY = 0;  
export let zoomLevel = 5;
export let autoRotate = true;
export let autoRotateSpeed = 0.001;

export function setupMouseControls(canvas) {
  canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    autoRotate = false;
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  canvas.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;

    const rotationSpeed = 0.005;
    rotationY += deltaX * rotationSpeed;
    rotationX += deltaY * rotationSpeed;

    // Limit vertical rotation to avoid gimbal lock
    rotationX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationX));

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  });

  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const zoomSpeed = 0.001;
    zoomLevel += event.deltaY * zoomSpeed;
    zoomLevel = Math.max(2, Math.min(20, zoomLevel));
  });

  // Double click to reset view
  canvas.addEventListener('dblclick', () => {
    rotationX = 0;
    rotationY = 0;
    zoomLevel = 5;
    autoRotate = true;
  });
}