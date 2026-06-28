"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

export function PricingShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const gl = canvas.getContext("webgl", { alpha: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShaderSrc = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSrc = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      
      mat2 rotate2d(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat2(c, -s, s, c);
      }
      
      float variation(vec2 v1, vec2 v2, float strength, float speed) {
        return sin(dot(normalize(v1), normalize(v2)) * strength + iTime * speed) / 100.0;
      }
      
      vec3 paintCircle(vec2 uv, vec2 center, float rad, float width) {
        vec2 diff = center - uv;
        float len = length(diff);
        len += variation(diff, vec2(0.0, 1.0), 5.0, 2.0);
        len -= variation(diff, vec2(1.0, 0.0), 5.0, 2.0);
        float circle = smoothstep(rad - width, rad, len) - smoothstep(rad, rad + width, len);
        return vec3(circle);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        
        // Correct aspect ratio
        uv.x *= iResolution.x / iResolution.y;
        uv.x -= (iResolution.x / iResolution.y - 1.0) * 0.5; // Center alignment
        
        float mask = 0.0;
        float radius = 0.28;
        vec2 center = vec2(0.5);
        
        // Render concentric procedurally warped rings
        mask += paintCircle(uv, center, radius, 0.025).r;
        mask += paintCircle(uv, center, radius - 0.015, 0.008).r;
        mask += paintCircle(uv, center, radius + 0.015, 0.004).r;
        
        vec2 v = rotate2d(iTime * 0.45) * uv;
        
        // High impact athletic yellow color vector
        vec3 foregroundColor = vec3(0.98, 0.8, 0.08) * (v.x * 0.4 + 0.7);
        
        // Transparent mix background
        vec3 color = mix(vec3(0.0), foregroundColor, mask);
        color = mix(color, vec3(1.0, 0.9, 0.4), paintCircle(uv, center, radius, 0.002).r);
        
        // Output alpha proportional to lighting intensity so background stays dark/transparent
        float alpha = mask;
        gl_FragColor = vec4(color, clamp(alpha * 1.5, 0.0, 0.55));
      }
    `;

    const compileShader = (src: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
    const fs = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "iTime");
    const uResolution = gl.getUniformLocation(program, "iResolution");

    const startTime = performance.now();
    let animationId: number;

    const render = () => {
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      const elapsed = performance.now() - startTime;
      gl.uniform1f(uTime, elapsed / 1000);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
