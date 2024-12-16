export const vertexShaderSource = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uNormalMatrix;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;
  
  void main() {
    vec4 position = uModelViewMatrix * vec4(aPosition, 1.0);
    gl_Position = uProjectionMatrix * position;
    vNormal = (uNormalMatrix * vec4(aNormal, 0.0)).xyz;
    vPosition = position.xyz;
    vViewPosition = -position.xyz;
  }
`;

// Enhanced fragment shader with glass surface and shadow effect
export const fragmentShaderSource = `
 precision highp float;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;

  uniform vec3 uLightPosition;
  uniform vec3 uAmbientColor;
  uniform vec3 uDiffuseColor;
  uniform vec3 uSpecularColor;
  uniform float uShininess;
  uniform float uOpacity;
  uniform float uRefractionIndex;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(uLightPosition - vPosition);
    
    // Fresnel effect for glass-like transparency
    float fresnelFactor = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
    
    // Specular (Blinn-Phong) with enhanced glass-like highlight
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), uShininess);
    vec3 specular = spec * uSpecularColor;
    
    // Shadow and glass surface effect
    float shadowIntensity = 0.3; // Soft shadow intensity
    vec3 shadowColor = vec3(0.1, 0.1, 0.1); // Dark gray shadow
    
    // Add subtle shadow underneath
    float shadowFactor = 1.0 - smoothstep(0.0, -0.2, vPosition.y) * shadowIntensity;
    
    // Glass surface effect with refraction simulation
    vec3 glassColor = vec3(0.76, 0.60, 0.42); 
    float glassShadowFactor = 0.5; // Opacity of glass surface shadow
    
    // Combine lighting, shadow, and glass effects
    vec3 result = (uAmbientColor + specular) * shadowFactor;
    result = mix(result, glassColor * result, fresnelFactor);
    
    // Final color with shadow and glass effect
    gl_FragColor = vec4(result, uOpacity);
}
`;