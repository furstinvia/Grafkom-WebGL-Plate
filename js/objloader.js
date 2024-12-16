export async function loadMTL(url) {
    const response = await fetch(url);
    const mtlText = await response.text();
    const materials = {};
  
    let currentMaterial = null;
    mtlText.split('\n').forEach(line => {
      const parts = line.trim().split(/\s+/);
      switch (parts[0]) {
        case 'newmtl':
          currentMaterial = parts[1];
          materials[currentMaterial] = {
            ambient: [1, 1, 1],
            diffuse: [0.8, 0.8, 0.8],
            specular: [0.5, 0.5, 0.5],
            shininess: 32,
            opacity: 0.9,
            refractionIndex: 1.5
          };
          break;
        case 'Ka':
          materials[currentMaterial].ambient = parts.slice(1).map(parseFloat);
          break;
        case 'Kd':
          materials[currentMaterial].diffuse = parts.slice(1).map(parseFloat);
          break;
        case 'Ks':
          materials[currentMaterial].specular = parts.slice(1).map(parseFloat);
          break;
        case 'Ns':
          materials[currentMaterial].shininess = parseFloat(parts[1]);
          break;
        case 'Ni':
          materials[currentMaterial].refractionIndex = parseFloat(parts[1]);
          break;
        case 'd':
          materials[currentMaterial].opacity = parseFloat(parts[1]);
          break;
      }
    });
  
    return materials;
  }
  
 export async function loadOBJ(objUrl, mtlUrl) {
    const [objResponse, mtlResponse] = await Promise.all([
      fetch(objUrl),
      mtlUrl ? loadMTL(mtlUrl) : Promise.resolve(null)
    ]);
  
    const objText = await objResponse.text();
  
    const positions = [];
    const normals = [];
    const indices = [];
    const materialIndices = [];
    const materialGroups = {};
    const tempNormals = new Map();
  
    let currentMaterial = null;
  
    const lines = objText.split("\n");
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      switch (parts[0]) {
        case "v":
          positions.push(...parts.slice(1).map(parseFloat));
          break;
        case "usemtl":
          currentMaterial = parts[1];
          if (!materialGroups[currentMaterial]) {
            materialGroups[currentMaterial] = {
              startIndex: indices.length,
              indexCount: 0
            };
          }
          break;
        case "f":
          const faceVertices = parts.slice(1).map(v => parseInt(v.split("/")[0]) - 1);
  
          // Calculate face normal using Newell's method
          let nx = 0, ny = 0, nz = 0;
          for (let i = 0; i < faceVertices.length; i++) {
            const v1 = faceVertices[i];
            const v2 = faceVertices[(i + 1) % faceVertices.length];
  
            const x1 = positions[v1 * 3];
            const y1 = positions[v1 * 3 + 1];
            const z1 = positions[v1 * 3 + 2];
            const x2 = positions[v2 * 3];
            const y2 = positions[v2 * 3 + 1];
            const z2 = positions[v2 * 3 + 2];
  
            nx += (y1 - y2) * (z1 + z2);
            ny += (z1 - z2) * (x1 + x2);
            nz += (x1 - x2) * (y1 + y2);
          }
  
          const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
          if (length > 0) {
            nx /= length;
            ny /= length;
            nz /= length;
          }
  
          for (const vertex of faceVertices) {
            if (!tempNormals.has(vertex)) {
              tempNormals.set(vertex, [0, 0, 0]);
            }
            const n = tempNormals.get(vertex);
            n[0] += nx;
            n[1] += ny;
            n[2] += nz;
          }
  
          // Triangulate face
          for (let i = 1; i < faceVertices.length - 1; i++) {
            indices.push(faceVertices[0], faceVertices[i], faceVertices[i + 1]);
            materialIndices.push(currentMaterial, currentMaterial, currentMaterial);
  
            if (materialGroups[currentMaterial]) {
              materialGroups[currentMaterial].indexCount += 3;
            }
          }
          break;
      }
    }
  
    // Normalize accumulated vertex normals
    const normalArray = [];
    for (let i = 0; i < positions.length / 3; i++) {
      const normal = tempNormals.get(i) || [0, 0, 1];
      const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
      if (length > 0) {
        normal[0] /= length;
        normal[1] /= length;
        normal[2] /= length;
      }
      normalArray.push(...normal);
    }
  
    // Center and scale model
    let [minX, minY, minZ] = [Infinity, Infinity, Infinity];
    let [maxX, maxY, maxZ] = [-Infinity, -Infinity, -Infinity];
  
    for (let i = 0; i < positions.length; i += 3) {
      minX = Math.min(minX, positions[i]);
      minY = Math.min(minY, positions[i + 1]);
      minZ = Math.min(minZ, positions[i + 2]);
      maxX = Math.max(maxX, positions[i]);
      maxY = Math.max(maxY, positions[i + 1]);
      maxZ = Math.max(maxZ, positions[i + 2]);
    }
  
    const center = [
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    ];
  
    const scale = 2 / Math.max(maxX - minX, maxY - minY, maxZ - minZ);
  
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (positions[i] - center[0]) * scale;
      positions[i + 1] = (positions[i + 1] - center[1]) * scale;
      positions[i + 2] = (positions[i + 2] - center[2]) * scale;
    }
  
    return {
      positions,
      normals: normalArray,
      indices,
      materialIndices,
      materialGroups,
      materials: mtlResponse || {}
    };
  }