// modelView.js
import { zoomLevel, rotationX, rotationY, autoRotate, autoRotateSpeed } from './cameraControls.js';

export function updateModelViewMatrix() {
  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -zoomLevel]);
  mat4.rotateX(modelViewMatrix, modelViewMatrix, rotationX);
  mat4.rotateY(modelViewMatrix, modelViewMatrix, rotationY + (autoRotate ? performance.now() * autoRotateSpeed : 0));
  return modelViewMatrix;
}
