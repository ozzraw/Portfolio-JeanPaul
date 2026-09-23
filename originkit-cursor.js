// Vector Wordmark — Originkit. Cursor-only adaptation of the supplied component.
// Original source: originkit/VectorWordmark.original.tsx.
// React mounting replaced with DOM mounting; text atlas and background omitted.
(() => {
"use strict";
const MAX_DPR = 2
const REF_WIDTH = 1200
const MAX_TEX = 4096

const HANDLES = 3
const CELL_ASPECT = 0.6
const DRIFT_X = 0.08
const DRIFT_Y = 0.04
const DRIFT_RATE = 1.3
const DRIFT_RATE_Y = 1.3 * 1.3
const SWEEP_RATE = 0.5

const SWEEP_BAND = 0.28
const RESNAP = 0.2
const DAMP_REF = 20
const SPEED_REF = 50
const LABEL_MAX = 0.6
const DOT_DIAMETER = 4 / 440
const DOT_PITCH = 12 / 440

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x)
const fract = (x) => x - Math.floor(x)

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision highp float;

uniform sampler2D uMap;
uniform vec2 uRes;
uniform vec2 uAtlas;
uniform vec2 uPtr;
uniform float uReach;
uniform vec3 uText;
uniform vec3 uShade;
uniform vec4 uAccent;
uniform vec2 uV0;
uniform vec2 uV1;
uniform vec2 uV2;
uniform float uHalf;

varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 blurRG(vec2 uv, float e) {
    vec4 sum = vec4(0.0);
    for (int i = 0; i < 6; i++) {
        float fi = float(i);
        float th = radians(fi / 6.0 * 360.0);
        vec2 dir = vec2(cos(th), sin(th));
        vec2 off = dir * (hash(vec2(fi, uv.x + uv.y)) + e);
        sum += texture2D(uMap, uv + off * e);
    }
    return (sum / 6.0).rg;
}

vec2 segment(vec2 p, vec2 a, vec2 b) {
    vec2 ab = b - a;
    vec2 ap = p - a;
    float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
    return vec2(length(ap - ab * t), t);
}

float stroke(float d, float lw, float px) {
    return 1.0 - smoothstep(lw, lw + px, d);
}

float dashedLine(vec2 p, vec2 a, vec2 b, float lw, float px) {
    vec2 s = segment(p, a, b);
    float dash = step(0.5, fract(s.y * length(b - a) * 100.0));
    return stroke(s.x, lw, px) * dash;
}

float boxEdge(vec2 p, vec2 c, float h, float lw, float px) {
    vec2 q = abs(p - c) - vec2(h);
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
    return stroke(abs(d), lw, px);
}

void main() {
    float aspect = uRes.x / uRes.y;

    vec2 P = vec2(vUv.x * aspect, vUv.y);
    float px = 1.0 / uRes.y;
    float lw = px * 0.2;
    float lines = max(
        max(dashedLine(P, uV0, uV1, lw, px), dashedLine(P, uV1, uV2, lw, px)),
        dashedLine(P, uV2, uV0, lw, px)
    );
    float boxes = max(
        max(boxEdge(P, uV0, uHalf, lw, px), boxEdge(P, uV1, uHalf, lw, px)),
        boxEdge(P, uV2, uHalf, lw, px)
    );
    float A = max(lines, boxes) * uAccent.a * (1.0 - vUv.y);

    gl_FragColor = vec4(uAccent.rgb * A, A);
}`
function compile(gl, vs, fs) {
    const make = (type, src) => {
        const sh = gl.createShader(type)
        gl.shaderSource(sh, src)
        gl.compileShader(sh)
        return sh
    }
    const p = gl.createProgram()
    gl.attachShader(p, make(gl.VERTEX_SHADER, vs))
    gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs))
    gl.bindAttribLocation(p, 0, "aPos")
    gl.linkProgram(p)
    return p
}


const host = document.createElement("div")
host.className = "originkit-cursor"
host.setAttribute("aria-hidden", "true")
host.hidden = true
const canvas = document.createElement("canvas")
host.append(canvas)
const labelRefs = { current: Array.from({ length: HANDLES }, () => {
    const label = document.createElement("div")
    label.className = "originkit-cursor-label"
    host.append(label)
    return label
}) }
document.body.append(host)
const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true })
if (!gl) { host.remove(); return }
const prog = compile(gl, VERT, FRAG)
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { host.remove(); return }
const U = Object.fromEntries(["res", "accent", "v0", "v1", "v2", "half"].map(key => [key, gl.getUniformLocation(prog, "u" + key[0].toUpperCase() + key.slice(1))]))
        const quad = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, quad)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW
        )
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.disable(gl.BLEND)


const live = { current: { speed: 21, damping: 26, hg: { size: 25, spread: 13, labels: true } } }
let boxW = innerWidth, boxH = innerHeight
function resize() {
    boxW = innerWidth; boxH = innerHeight
    const dpr = Math.min(MAX_DPR, devicePixelRatio || 1)
    canvas.width = Math.round(boxW * dpr)
    canvas.height = Math.round(boxH * dpr)
}
resize()
const finePointer = matchMedia("(any-pointer: fine)")
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)")
let raf = 0, last = 0, running = false
        const target = { x: -0.5, y: 0.5 }
        const eased = { x: -0.5, y: 0.5 }
        const cells = []
        const verts = []
        for (let i = 0; i < HANDLES; i += 1) {
            cells.push({ x: -0.5, y: 0.5 })
            verts.push({ x: -0.5, y: 0.5 })
        }
        let hasPointer = false
        let sweepClock = 0
        let driftT = 0

        function snap(x, y, cw, ch) {
            const cx = Math.floor(x / cw)
            const cy = Math.floor(y / ch)
            const found = []
            for (let i = -1; i <= 1; i += 1) {
                for (let j = -1; j <= 1; j += 1) {
                    const px = (cx + i + 0.5) * cw
                    const py = (cy + j + 0.5) * ch
                    found.push({ x: px, y: py, d: Math.hypot(px - x, py - y) })
                }
            }
            found.sort((a, b) => a.d - b.d)
            for (let i = 0; i < HANDLES; i += 1) {
                cells[i].x = found[i + 1].x
                cells[i].y = found[i + 1].y
            }
        }

        const onMove = (e) => {
            if (e.pointerType === "touch" || !finePointer.matches || reducedMotion.matches) return
            hasPointer = true
            host.hidden = false
            running = true
            gate()

            const r = host.getBoundingClientRect()
            if (r.width <= 0 || r.height <= 0) return
            target.x = (e.clientX - r.left) / r.width
            target.y = 1 - (e.clientY - r.top) / r.height
        }
        window.addEventListener("pointermove", onMove)

        function step(dt) {
            const L = live.current
            const rate = Math.max(0, L.speed) / SPEED_REF
            const cw = Math.max(0.01, L.hg.spread / 100)
            const ch = cw * CELL_ASPECT
            const aspect = boxW / boxH

            snap(target.x * aspect, target.y, cw, ch)

            const damp = clamp((L.damping / 100) * DAMP_REF * dt, 0, 1)
            eased.x += (target.x - eased.x) * damp
            eased.y += (target.y - eased.y) * damp

            driftT += dt * rate
            for (let i = 0; i < HANDLES; i += 1) {
                const c = cells[i]
                const sx = Math.round(c.x / cw - 0.5)
                const sy = Math.round(c.y / ch - 0.5)
                const h1 = fract(Math.sin(sx * 127.1 + sy * 311.7) * 43758.5453)
                const h2 = fract(Math.sin(sx * 269.5 + sy * 183.3) * 43758.5453)
                verts[i].x =
                    c.x +
                    DRIFT_X * cw * Math.sin(driftT * DRIFT_RATE + h1 * Math.PI * 2)
                verts[i].y =
                    c.y +
                    DRIFT_Y *
                        ch *
                        Math.sin(driftT * DRIFT_RATE_Y + h2 * Math.PI * 2)
            }
        }

        function writeLabels() {
            const L = live.current
            const aspect = boxW / boxH
            const half = L.hg.size / 2
            for (let i = 0; i < HANDLES; i += 1) {
                const el = labelRefs.current[i]
                if (!el) continue
                const bx = verts[i].x / aspect
                const by = verts[i].y
                const gx = Math.round(clamp(bx * 100, 0, 100))
                const gy = Math.round(clamp(by * 100, 0, 100))
                el.style.transform = `translate(${bx * boxW - half}px, ${
                    (1 - by) * boxH - half
                }px)`
                el.style.opacity = String(LABEL_MAX)
                el.textContent = `${gx}, ${gy}`
            }
        }


function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(prog)
    gl.uniform2f(U.res, boxW, boxH)
    gl.uniform4f(U.accent, 1, 1, 1, 1)
    gl.uniform2f(U.v0, verts[0].x, verts[0].y)
    gl.uniform2f(U.v1, verts[1].x, verts[1].y)
    gl.uniform2f(U.v2, verts[2].x, verts[2].y)
    gl.uniform1f(U.half, live.current.hg.size / 2 / boxH)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
function frame(now) {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
    last = now
    step(dt)
    writeLabels()
    draw()
    raf = requestAnimationFrame(frame)
}
function gate() {
    if (running && !document.hidden && finePointer.matches && !reducedMotion.matches) {
        if (!raf) { last = 0; raf = requestAnimationFrame(frame) }
    } else {
        cancelAnimationFrame(raf); raf = 0; host.hidden = true
    }
}
function stop() { running = false; gate() }
window.addEventListener("resize", resize)
window.addEventListener("blur", stop)
document.documentElement.addEventListener("pointerleave", stop)
document.addEventListener("visibilitychange", () => { if (document.hidden) stop() })
finePointer.addEventListener("change", stop)
reducedMotion.addEventListener("change", stop)
canvas.addEventListener("webglcontextlost", stop)
})()
