// main.js
import { canvas, gl, resizeCanvas } from './canvas.js';
import { setupWebGLState } from './webglState.js';
import { vertexShaderSource, fragmentShaderSource } from './shaders.js';
import { setupMouseControls, rotationX, rotationY, zoomLevel, autoRotate } from './cameraControls.js';
import { updateModelViewMatrix } from './modelView.js';
import { loadOBJ } from './objloader.js';

// Move the createShaderProgram function definition here
function createShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Shader program linking failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      `Shader compile error in ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`,
      gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createBuffers(gl, obj) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.positions), gl.STATIC_DRAW);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);

  return { positionBuffer, normalBuffer, indexBuffer };
}

// Now define the main function after createShaderProgram
async function main() {
  const obj = await loadOBJ("piring.obj", "piring.mtl");
  const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  const attribLocations = {
    position: gl.getAttribLocation(program, 'aPosition'),
    normal: gl.getAttribLocation(program, 'aNormal')
  };

  setupMouseControls(canvas);
  const buffers = createBuffers(gl, obj);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
  gl.enableVertexAttribArray(attribLocations.position);
  gl.vertexAttribPointer(attribLocations.position, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
  gl.enableVertexAttribArray(attribLocations.normal);
  gl.vertexAttribPointer(attribLocations.normal, 3, gl.FLOAT, false, 0, 0);

  const uniforms = {
    uModelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
    uProjectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
    uNormalMatrix: gl.getUniformLocation(program, "uNormalMatrix"),
    uLightPosition: gl.getUniformLocation(program, "uLightPosition"),
    uAmbientColor: gl.getUniformLocation(program, "uAmbientColor"),
    uDiffuseColor: gl.getUniformLocation(program, "uDiffuseColor"),
    uSpecularColor: gl.getUniformLocation(program, "uSpecularColor"),
    uShininess: gl.getUniformLocation(program, "uShininess"),
    uRimLightIntensity: gl.getUniformLocation(program, "uRimLightIntensity"),
    uRimLightColor: gl.getUniformLocation(program, "uRimLightColor"),
    uOpacity: gl.getUniformLocation(program, "uOpacity"),
    uRefractionIndex: gl.getUniformLocation(program, "uRefractionIndex")
  };

  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);
  gl.uniformMatrix4fv(uniforms.uProjectionMatrix, false, projectionMatrix);

  
  // Render function with multi-material support
  function render() {
    gl.clearColor(0.0, 0.0, 0.0, 0.0); // Transparent background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const modelViewMatrix = updateModelViewMatrix();
    gl.uniformMatrix4fv(uniforms.uModelViewMatrix, false, modelViewMatrix);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix4fv(uniforms.uNormalMatrix, false, normalMatrix);

    // Adjust light position for better shadow effect
    gl.uniform3f(uniforms.uLightPosition, 2.0, 3.0, 5.0);

    // Render each material group separately
    for (const [materialName, group] of Object.entries(obj.materialGroups)) {
      const material = obj.materials[materialName] || {
        ambient: [0.2, 0.2, 0.2],
        diffuse: [0.8, 0.8, 0.8],
        specular: [0.5, 0.5, 0.5],
        shininess: 32,
        opacity: 0.9 // Slightly reduced opacity for glass-like effect
      };

      // Update material uniforms
      gl.uniform3fv(uniforms.uAmbientColor, material.ambient);
      gl.uniform3fv(uniforms.uDiffuseColor, material.diffuse);
      gl.uniform3fv(uniforms.uSpecularColor, material.specular);
      gl.uniform1f(uniforms.uShininess, material.shininess);
      gl.uniform1f(uniforms.uOpacity, material.opacity);
      gl.uniform1f(uniforms.uRefractionIndex, material.refractionIndex || 1.5);

      // Enable blending for translucency
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      
      // Draw the specific material group
      gl.drawElements(
        gl.TRIANGLES,
        group.indexCount,
        gl.UNSIGNED_SHORT,
        group.startIndex * 2  // 2 bytes per index
      );
    }

    requestAnimationFrame(render);
  }

  render();
}

main();
