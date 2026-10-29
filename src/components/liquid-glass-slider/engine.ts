// Liquid glass slider renderer: three.js WebGPU (WebGL2 fallback) + TSL.
// Pass 1 renders the background (gradient, track, fill, glass shadow) into a
// mipmapped target; pass 2 refracts that target through the glass thumb.
import * as THREE from 'three/webgpu'
import {
  Fn,
  abs,
  clamp,
  exp,
  float,
  fwidth,
  length,
  max,
  min,
  mix,
  normalize,
  oneMinus,
  pow,
  select,
  smoothstep,
  sqrt,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'

import type { DebugView, LiquidGlassParams, LiquidGlassTheme } from './params'

// Design space: everything is laid out in a 750×532 frame centered on (375, 270).
const DESIGN_W = 750
const DESIGN_H = 532
const CENTER_Y = 270
// How far the glass slides left of the value while pressed.
const PRESS_LEAD = 22

// Frosted resting-state glass: [center, edge] colors per theme.
const FROST_COLORS: Record<LiquidGlassTheme, [string, string]> = {
  light: ['#f9fafc', '#e2e4e9'],
  dark: ['#2a2c31', '#1c1d21'],
}

// Strength of the cool center tint in the background; it reads far stronger on dark.
const BOW_TINT: Record<LiquidGlassTheme, number> = { light: 1, dark: 0.15 }

const DEBUG_VIEWS: Record<DebugView, number> = {
  off: 0,
  sdf: 1,
  height: 2,
  normal: 3,
  uv: 4,
  edge: 5,
}

export type LiquidGlassInstance = {
  setParams: (params: LiquidGlassParams) => void
  setValue: (value: number) => void
  getValue: () => number
  dispose: () => void
}

export async function createLiquidGlass(
  container: HTMLElement,
  initialParams: LiquidGlassParams,
  onValue: (value: number) => void,
): Promise<LiquidGlassInstance> {
  let hasWebGPU = false
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu
  if (gpu) {
    try {
      hasWebGPU = (await gpu.requestAdapter()) !== null
    } catch {
      hasWebGPU = false
    }
  }

  const renderer = new THREE.WebGPURenderer({ antialias: false, forceWebGL: !hasWebGPU })
  await renderer.init()
  const canvas: HTMLCanvasElement = renderer.domElement
  canvas.style.position = 'absolute'
  canvas.style.inset = '0'
  canvas.style.touchAction = 'none'
  canvas.style.cursor = 'grab'
  container.appendChild(canvas)

  const bgTarget = new THREE.RenderTarget(2, 2, { depthBuffer: false, type: THREE.HalfFloatType })
  bgTarget.texture.generateMipmaps = true
  bgTarget.texture.minFilter = THREE.LinearMipmapLinearFilter
  bgTarget.texture.magFilter = THREE.LinearFilter

  const params: LiquidGlassParams = { ...initialParams }
  const count = Math.min(6, Math.max(1, Math.round(params.sliderCount) || 1))
  const rowY = (i: number) => CENTER_Y + (i - (count - 1) / 2) * params.sliderGap

  const uResolution = uniform(new THREE.Vector2(1, 1))
  const uOrigin = uniform(new THREE.Vector2(0, 0))
  const uScale = uniform(1)
  const uDevicePx = uniform(1)
  const uCenterFlatness = uniform(params.centerFlatness)
  const uNormalStrength = uniform(params.normalStrength)
  const uEdgeDistortion = uniform(params.edgeDistortion)
  const uFresnelPower = uniform(params.fresnelPower)
  const uRimWidth = uniform(params.rimWidth)
  const uGlassTint = uniform(new THREE.Color(params.glassTint))
  const uTintStrength = uniform(params.tintStrength)
  const uTrackHeight = uniform(params.trackHeight)
  const uTrackHalf = uniform(params.trackLength / 2)
  const uActive = uniform(new THREE.Color(params.activeColor))
  const uActiveDeep = uniform(new THREE.Color(params.activeColorDeep))
  const uInactive = uniform(new THREE.Color(params.inactiveColor))
  const uBgLeft = uniform(new THREE.Color(params.bgLeft))
  const uBgRight = uniform(new THREE.Color(params.bgRight))
  const uFrostCenter = uniform(new THREE.Color(FROST_COLORS[params.theme][0]))
  const uFrostEdge = uniform(new THREE.Color(FROST_COLORS[params.theme][1]))
  const uBowTint = uniform(BOW_TINT[params.theme] ?? 1)
  const uDebug = uniform(0)
  // Theme colors ease toward these targets instead of snapping.
  const themedColors = [uInactive, uBgLeft, uBgRight, uFrostCenter, uFrostEdge].map((u) => ({
    uniform: u,
    target: u.value.clone(),
  }))
  const [inactiveTarget, bgLeftTarget, bgRightTarget, frostCenterTarget, frostEdgeTarget] = themedColors.map(
    (c) => c.target,
  )
  let bowTintTarget = uBowTint.value
  let snapColors = true

  const sliders = Array.from({ length: count }, (_, i) => ({
    rowY: rowY(i),
    uRowY: uniform(rowY(i)),
    uGlassCenter: uniform(new THREE.Vector2(DESIGN_W / 2 - PRESS_LEAD, rowY(i))),
    uFillEnd: uniform(DESIGN_W / 2),
    uStretch: uniform(new THREE.Vector2(1, 1)),
    uMotionShift: uniform(new THREE.Vector2(0, 0)),
    uHalf: uniform(new THREE.Vector2(params.restWidth / 2, params.restHeight / 2)),
    uRadius: uniform(params.restHeight / 2),
    uBevel: uniform(params.restHeight * 0.42),
    uMag: uniform(0),
    uRefract: uniform(params.restRefraction),
    uDisp: uniform(params.dispersion),
    uBlurC: uniform(params.blurCenter),
    uBlurE: uniform(params.blurEdge),
    uFrost: uniform(0),
    uRim: uniform(params.rimIntensity),
    uCaustic: uniform(params.causticStrength),
    uInner: uniform(params.innerShading),
    uTopRefl: uniform(params.topReflection),
    uShOp: uniform(params.shadowOpacity),
    uShSoft: uniform(params.shadowSoftness),
    uShOff: uniform(params.shadowOffset),
    value: 0,
    target: 0,
    velocity: 0,
    stretchX: 0,
    press: 0,
    pressVel: 0,
  }))
  type Slider = (typeof sliders)[number]

  const designCenter = vec2(DESIGN_W / 2, CENTER_Y)

  const sdRoundRect = Fn(([p, half, r]: any[]) => {
    const q = abs(p).sub(half).add(r)
    return length(max(q, 0)).add(min(max(q.x, q.y), 0)).sub(r)
  })
  const uvToPixel = Fn(([st]: any[]) => vec2(st.x, oneMinus(st.y)).mul(uResolution))
  const pixelToDesign = Fn(([px]: any[]) => px.sub(uOrigin).div(uScale).add(designCenter))
  const designToUv = Fn(([d]: any[]) => {
    const px = d.sub(designCenter).mul(uScale).add(uOrigin)
    return clamp(vec2(px.x.div(uResolution.x), px.y.div(uResolution.y)), vec2(0.001), vec2(0.999))
  })
  // Glass surface height: a quarter-circle bevel profile, flattened toward the center.
  const glassHeight = (s: Slider, p: any) => {
    const d = sdRoundRect(p, s.uHalf, s.uRadius)
    const t = pow(clamp(d.negate().div(s.uBevel), 0, 1), float(1).div(uCenterFlatness))
    return sqrt(oneMinus(pow(oneMinus(t), 2)))
  }

  const backgroundNode = Fn(() => {
    const px = uvToPixel(uv())
    const n = px.div(uResolution)
    const p = pixelToDesign(px)
    const gx = smoothstep(-0.08, 0.9, n.x).toVar()
    const col = mix(uBgLeft, uBgRight, gx).toVar()
    const bow = n.x.mul(oneMinus(n.x)).mul(4)
    col.addAssign(vec3(-0.004, 0, 0.012).mul(bow).mul(uBowTint))
    col.mulAssign(n.y.sub(0.5).mul(0.02).add(1))
    const shade = mix(0.84, 1.1, gx)
    const halfH = uTrackHeight.mul(0.5)
    const trackStart = float(DESIGN_W / 2).sub(uTrackHalf)
    const trackEnd = float(DESIGN_W / 2).add(uTrackHalf)
    for (const s of sliders) {
      // Track
      const tx = clamp(p.x, trackStart.add(halfH), trackEnd.sub(halfH))
      const dTrack = length(vec2(p.x.sub(tx), p.y.sub(s.uRowY))).sub(halfH)
      col.assign(mix(uInactive.mul(shade), col, smoothstep(0, max(fwidth(dTrack), 1e-4), dTrack)))
      // Fill
      const fx = clamp(p.x, trackStart.add(halfH), max(s.uFillEnd.sub(halfH), trackStart.add(halfH)))
      const dFill = length(vec2(p.x.sub(fx), p.y.sub(s.uRowY))).sub(halfH)
      const fillGrad = smoothstep(s.uFillEnd.sub(240), s.uFillEnd.sub(15), p.x)
      const fillCol = mix(uActiveDeep, uActive, fillGrad).mul(shade)
      col.assign(mix(fillCol, col, smoothstep(0, max(fwidth(dFill), 1e-4), dFill)))
      // Glass drop shadow (tight + ambient)
      const local = p.sub(s.uGlassCenter).div(s.uStretch)
      const vFade = smoothstep(-0.1, 0.9, local.y.div(s.uHalf.y)).mul(0.92).add(0.08)
      const outside = smoothstep(-4, 14, sdRoundRect(local, s.uHalf, s.uRadius))
      const dNear = sdRoundRect(local.sub(vec2(0, s.uShOff)), s.uHalf, s.uRadius)
      const dFar = sdRoundRect(local.sub(vec2(0, s.uShOff.mul(1.6))), s.uHalf, s.uRadius)
      const near = oneMinus(smoothstep(-6, s.uShSoft, dNear))
      const far = oneMinus(smoothstep(-10, s.uShSoft.mul(1.5), dFar))
      const shadow = clamp(near.mul(s.uShOp).add(far.mul(s.uShOp)).mul(vFade).mul(outside), 0, 0.85)
      col.mulAssign(oneMinus(shadow))
    }
    return vec4(col, 1)
  })

  const glassNode = Fn(() => {
    const st = uv()
    const p = pixelToDesign(uvToPixel(st))
    const col = texture(bgTarget.texture, vec2(st.x, oneMinus(st.y)), float(0)).rgb.toVar()
    const rowDist = sliders.map((s) => abs(p.y.sub(s.uRowY)).toVar())
    const dbgMask = float(0).toVar()
    const dbgHeight = float(0).toVar()
    const dbgNormal = vec3(0).toVar()
    const dbgUv = vec3(0).toVar()
    const dbgEdge = float(0).toVar()

    sliders.forEach((s, idx) => {
      // 1 for pixels whose nearest row is this slider (debug views only)
      const owner = rowDist.reduce(
        (acc, d, j) => (j === idx ? acc : acc.mul(select(rowDist[idx].lessThanEqual(d), float(1), float(0)))),
        float(1),
      )
      const local = p.sub(s.uGlassCenter).div(s.uStretch).toVar()
      const dist = sdRoundRect(local, s.uHalf, s.uRadius).toVar()
      const eps = float(1.25)
      const h = glassHeight(s, local).toVar()
      const hGrad = vec2(
        glassHeight(s, local.add(vec2(eps, 0))).sub(h),
        glassHeight(s, local.add(vec2(0, eps))).sub(h),
      ).div(eps)
      const normal = normalize(vec3(hGrad.mul(uNormalStrength).negate(), 1)).toVar()
      const depth = clamp(oneMinus(h), 0, 1).toVar()
      const edge = smoothstep(s.uBevel.mul(0.35), 0, dist.negate()).toVar()
      const edgeShaped = pow(edge, uEdgeDistortion).toVar()
      const sdfDir = normalize(
        vec2(
          sdRoundRect(local.add(vec2(eps, 0)), s.uHalf, s.uRadius).sub(dist),
          sdRoundRect(local.add(vec2(0, eps)), s.uHalf, s.uRadius).sub(dist),
        ),
      ).toVar()

      // Refraction with chromatic dispersion
      const magnified = local.mul(float(1).div(s.uMag.mul(h).add(1)))
      const refract = sdfDir.mul(s.uRefract).mul(pow(edge, uEdgeDistortion)).negate().toVar()
      const disp = s.uDisp.mul(0.35)
      const base = s.uGlassCenter.add(s.uMotionShift)
      const uvG = designToUv(base.add(magnified).add(refract)).toVar()
      const uvR = designToUv(base.add(magnified).add(refract.mul(disp.add(1))))
      const uvB = designToUv(base.add(magnified).add(refract.mul(oneMinus(disp))))
      const blur = mix(s.uBlurC, s.uBlurE, pow(edge, 1.3))
      const glass = vec3(
        texture(bgTarget.texture, uvR, blur).r,
        texture(bgTarget.texture, uvG, blur).g,
        texture(bgTarget.texture, uvB, blur).b,
      ).toVar()
      glass.mulAssign(mix(vec3(1), uGlassTint, uTintStrength))

      // Top reflection
      const ny = local.y.div(s.uHalf.y)
      const nx = local.x.div(s.uHalf.x)
      const topRefl = smoothstep(0.75, -0.05, ny).mul(nx.mul(-0.12).add(1)).mul(s.uTopRefl).mul(0.6).add(0.02)
      glass.mulAssign(oneMinus(vec3(1, 1, 0.72).mul(topRefl)))

      // Frosted resting state
      const frostCol = mix(uFrostCenter, uFrostEdge, pow(depth, 1.6))
      glass.assign(mix(glass, frostCol, s.uFrost))

      // Inner shading
      const up = clamp(sdfDir.y.negate(), 0, 1)
      const right = clamp(sdfDir.x, 0, 1)
      const left = clamp(sdfDir.x.negate(), 0, 1)
      const down = clamp(sdfDir.y, 0, 1)
      const innerBand = smoothstep(s.uBevel.mul(-0.19), s.uBevel.mul(-0.024), dist)
      const innerDir = up.add(left.mul(0.6)).add(right.mul(0.3)).add(down.mul(0.15))
      glass.mulAssign(oneMinus(innerBand.mul(innerDir).mul(s.uInner).mul(2.2)))
      const deepBand = smoothstep(s.uBevel.mul(-0.73), s.uBevel.mul(-0.13), dist)
      glass.mulAssign(oneMinus(deepBand.mul(left).mul(s.uInner).mul(2)))
      const ring = exp(dist.add(s.uBevel.mul(0.45)).div(s.uBevel.mul(0.26)).pow(2).negate())
      const ringDir = right.mul(0.9).add(up.mul(0.5)).add(left.mul(0.4)).add(down.mul(0.3))
      glass.mulAssign(oneMinus(ring.mul(ringDir).mul(s.uInner).mul(1.5)))

      // Rim light + fresnel
      const fresnel = pow(clamp(oneMinus(normal.z), 0, 1), uFresnelPower).toVar()
      const rimW = max(uRimWidth.mul(uDevicePx), 1)
      const rim = smoothstep(rimW.mul(1.6), 0, abs(dist.add(rimW.mul(1.8)))).toVar()
      const rimFalloff = exp(pow(local.y.div(30), 2).negate())
      const staticRim = pow(right, 2).mul(rimFalloff).mul(0.9).add(pow(down, 2).mul(0.2)).add(pow(left, 2).mul(0.55))
      // Fixed studio lighting; only buttons follow the cursor.
      const rimDir = staticRim
      const rimFront = right
      const rimBack = left
      const warmCool = mix(vec3(0.82, 0.9, 1.08), vec3(1.2, 0.95, 0.78), smoothstep(0.1, -0.5, nx))
      const rimCol = mix(vec3(1), warmCool, down.mul(0.6)).toVar()
      rimCol.assign(mix(rimCol, vec3(0.12, 0.6, 1.2), rimBack.mul(0.85)))
      glass.addAssign(rimCol.mul(rim.mul(rimDir).mul(s.uRim).add(fresnel.mul(rimFront).mul(0.02))))


      // Caustic
      const caustic = smoothstep(0.72, 0.98, depth).mul(down).mul(s.uCaustic)
      glass.addAssign(vec3(1, 0.92, 0.86).mul(caustic))

      const aa = max(fwidth(dist), 1e-4)
      const mask = smoothstep(aa, aa.negate(), dist).toVar()
      col.assign(mix(col, glass, mask))

      dbgMask.addAssign(mask.mul(owner))
      dbgHeight.addAssign(h.mul(owner))
      dbgNormal.addAssign(normal.mul(0.5).add(0.5).mul(owner))
      dbgUv.addAssign(vec3(uvG, 0).mul(mask).mul(owner))
      dbgEdge.addAssign(edgeShaped.mul(owner))
    })

    const isView = (n: number) => uDebug.sub(n).abs().lessThan(0.5)
    col.assign(select(isView(1), vec3(dbgMask), col))
    col.assign(select(isView(2), vec3(dbgHeight), col))
    col.assign(select(isView(3), dbgNormal, col))
    col.assign(select(isView(4), dbgUv, col))
    col.assign(select(isView(5), vec3(dbgEdge), col))
    return vec4(col, 1)
  })

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  camera.position.z = 1
  const quad = new THREE.PlaneGeometry(2, 2)

  const bgMaterial = new THREE.MeshBasicNodeMaterial()
  bgMaterial.colorNode = backgroundNode()
  const bgScene = new THREE.Scene()
  const bgMesh = new THREE.Mesh(quad, bgMaterial)
  bgMesh.frustumCulled = false
  bgScene.add(bgMesh)

  const glassMaterial = new THREE.MeshBasicNodeMaterial()
  glassMaterial.colorNode = glassNode()
  const glassScene = new THREE.Scene()
  const glassMesh = new THREE.Mesh(quad, glassMaterial)
  glassMesh.frustumCulled = false
  glassScene.add(glassMesh)

  let width = 1
  let height = 1
  let scale = 1
  let dpr = 1
  function resize() {
    width = Math.max(container.clientWidth, 2)
    height = Math.max(container.clientHeight, 2)
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    scale = Math.min(width / DESIGN_W, height / DESIGN_H) * Math.max(params.overallScale, 0.05)
    uResolution.value.set(width, height)
    uOrigin.value.set(width / 2, (CENTER_Y / DESIGN_H) * height)
    uScale.value = scale
    uDevicePx.value = 1 / (scale * dpr)
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height)
    bgTarget.setSize(Math.round(width * dpr), Math.round(height * dpr))
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  resize()

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  for (const s of sliders) {
    s.value = clampValue(params.value)
    s.target = s.value
  }

  let active = -1
  let lastActive = 0
  let lastTime = performance.now()
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const saturate = (v: number) => Math.max(0, Math.min(1, v))

  // Morph the thumb between its small resting pill and the big pressed lens.
  function applyPress(s: Slider) {
    const p = Math.max(-0.12, Math.min(1.15, s.press))
    const pc = saturate(s.press)
    const hx = lerp(params.restWidth / 2, params.glassWidth / 2, p)
    const hy = lerp(params.restHeight / 2, params.glassHeight / 2, p)
    s.uHalf.value.set(hx, hy)
    s.uRadius.value = Math.min(lerp(params.restHeight / 2, params.cornerRadius, pc), Math.min(hx, hy) - 1)
    s.uBevel.value = Math.max(lerp(params.restHeight * 0.42, params.bevelWidth, pc), 2)
    const frost = params.frostOpacity * (1 - pc)
    const clear = 1 - frost
    s.uMag.value = params.magnification * pc
    s.uRefract.value = lerp(params.restRefraction, params.refractionStrength, pc) * lerp(0.06, 1, clear)
    s.uDisp.value = params.dispersion * clear
    s.uBlurC.value = lerp(params.blurCenter, params.frostBlur, frost)
    s.uBlurE.value = lerp(params.blurEdge, params.frostBlur, frost)
    s.uFrost.value = frost
    s.uRim.value = params.rimIntensity * lerp(0.04, 1, clear)
    s.uCaustic.value = params.causticStrength * clear
    s.uInner.value = params.innerShading * lerp(0.5, 1, clear)
    s.uTopRefl.value = params.topReflection * lerp(0.5, 1, clear)
    s.uShOp.value = params.shadowOpacity * lerp(0.55, 1, pc) * clear
    s.uShSoft.value = params.shadowSoftness * lerp(0.6, 1, pc)
    s.uShOff.value = params.shadowOffset * lerp(0.5, 1, pc)
  }

  function clampValue(v: number) {
    return Math.min(100, Math.max(0, v))
  }

  function valueToX(v: number) {
    return DESIGN_W / 2 - params.trackLength / 2 + (v / 100) * params.trackLength
  }

  function glassX(s: Slider) {
    const pc = saturate(s.press)
    const inset = s.uHalf.value.x * (1 - 0.44 * pc)
    return Math.min(
      DESIGN_W / 2 + params.trackLength / 2 - inset,
      Math.max(DESIGN_W / 2 - params.trackLength / 2 + inset, valueToX(s.value) - PRESS_LEAD * pc),
    )
  }

  function step(now: number) {
    const dt = Math.min((now - lastTime) / 1000, 1 / 30)
    lastTime = now
    const colorT = snapColors || reducedMotion.matches ? 1 : Math.min(1, dt * 9)
    for (const c of themedColors) c.uniform.value.lerp(c.target, colorT)
    uBowTint.value += (bowTintTarget - uBowTint.value) * colorT
    snapColors = false
    sliders.forEach((s, i) => {
      const pressTarget = i === active ? 1 : 0
      if (reducedMotion.matches) {
        s.value = s.target
        s.velocity = 0
        s.stretchX = 0
        s.press = pressTarget
        s.pressVel = 0
      } else {
        // Critically damped spring toward the target value
        const k = Math.max(params.motionSmoothing, 0.01)
        const dx = s.value - s.target
        const a = s.velocity + k * dx
        const decay = Math.exp(-k * dt)
        s.value = s.target + (dx + a * dt) * decay
        s.velocity = (s.velocity - k * a * dt) * decay
        if (Math.abs(s.target - s.value) < 0.001 && Math.abs(s.velocity) < 0.01) {
          s.value = s.target
          s.velocity = 0
        }

        // Velocity-driven squash & stretch
        const speed = (s.velocity / 100) * params.trackLength
        const stretch = Math.max(-0.04, Math.min(0.04, speed * 3e-5 * params.motionStretch))
        s.stretchX += (stretch - s.stretchX) * Math.min(1, dt * 18)

        // Press spring (critically damped or underdamped for bounce)
        const zeta = Math.min(1, Math.max(0.05, 1 - params.pressBounce))
        const omega = Math.max(params.pressSpeed, 0.01)
        const d = s.press - pressTarget
        if (zeta > 0.9995) {
          const b = s.pressVel + omega * d
          const e = Math.exp(-omega * dt)
          s.press = pressTarget + (d + b * dt) * e
          s.pressVel = (s.pressVel - omega * b * dt) * e
        } else {
          const wd = omega * Math.sqrt(1 - zeta * zeta)
          const b = (s.pressVel + zeta * omega * d) / wd
          const e = Math.exp(-zeta * omega * dt)
          const cos = Math.cos(wd * dt)
          const sin = Math.sin(wd * dt)
          const x = (d * cos + b * sin) * e
          s.press = pressTarget + x
          s.pressVel = e * wd * (b * cos - d * sin) - zeta * omega * x
        }
        if (Math.abs(s.press - pressTarget) < 5e-4 && Math.abs(s.pressVel) < 0.005) {
          s.press = pressTarget
          s.pressVel = 0
        }
      }
      applyPress(s)
      s.value = clampValue(s.value)
      s.uFillEnd.value = valueToX(s.value)
      s.uGlassCenter.value.set(glassX(s), s.rowY)
      s.uStretch.value.set(1 + Math.abs(s.stretchX), 1 - Math.abs(s.stretchX) * 0.45)
      s.uMotionShift.value.set(s.stretchX * -60, 0)
    })
  }

  function toDesign(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return {
      x: (x - width / 2) / scale + DESIGN_W / 2,
      y: (y - (CENTER_Y / DESIGN_H) * height) / scale + CENTER_Y,
    }
  }

  function nearestSlider(y: number) {
    let best = 0
    let bestDist = Infinity
    sliders.forEach((s, i) => {
      const d = Math.abs(y - s.rowY)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    return best
  }

  function glassSdf(s: Slider, x: number, y: number) {
    const hx = s.uHalf.value.x
    const hy = s.uHalf.value.y
    const r = Math.min(s.uRadius.value, Math.min(hx, hy) - 1)
    const qx = Math.abs(x - s.uGlassCenter.value.x) - hx + r
    const qy = Math.abs(y - s.uGlassCenter.value.y) - hy + r
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
  }

  let dragStartValue = 0
  let dragStartX = 0
  function onPointerDown(e: PointerEvent) {
    const p = toDesign(e)
    canvas.setPointerCapture(e.pointerId)
    active = nearestSlider(p.y)
    lastActive = active
    const s = sliders[active]
    canvas.style.cursor = 'grabbing'
    onValue(Math.round(s.value))
    if (glassSdf(s, p.x, p.y) > 8) {
      // Clicked the track: jump there, then drag relative to it
      const start = DESIGN_W / 2 - params.trackLength / 2
      s.target = clampValue(((p.x - start) / params.trackLength) * 100)
    }
    dragStartValue = s.target
    dragStartX = p.x
    e.preventDefault()
  }

  function onPointerMove(e: PointerEvent) {
    if (active < 0) return
    const s = sliders[active]
    const p = toDesign(e)
    s.target = clampValue(dragStartValue + ((p.x - dragStartX) / params.trackLength) * 100)
    onValue(Math.round(s.target))
  }

  function onPointerUp(e: PointerEvent) {
    if (active < 0) return
    const s = sliders[active]
    active = -1
    canvas.style.cursor = 'grab'
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    onValue(Math.round(s.target))
  }

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)

  const frame = (now: number) => {
    step(now)
    renderer.setRenderTarget(bgTarget)
    renderer.render(bgScene, camera)
    renderer.setRenderTarget(null)
    renderer.render(glassScene, camera)
  }

  // Pause rendering while offscreen or in a background tab
  let inView = true
  let running = false
  function updateLoop() {
    const shouldRun = inView && !document.hidden
    if (shouldRun === running) return
    running = shouldRun
    if (shouldRun) lastTime = performance.now()
    renderer.setAnimationLoop(shouldRun ? frame : null)
  }
  const intersectionObserver = new IntersectionObserver((entries) => {
    inView = entries[0]?.isIntersecting ?? true
    updateLoop()
  })
  intersectionObserver.observe(container)
  document.addEventListener('visibilitychange', updateLoop)
  running = true
  renderer.setAnimationLoop(frame)

  function setParams(next: LiquidGlassParams) {
    const scaleChanged = next.overallScale !== params.overallScale
    Object.assign(params, next)
    if (scaleChanged) resize()
    uTrackHalf.value = params.trackLength / 2
    uCenterFlatness.value = params.centerFlatness
    uNormalStrength.value = params.normalStrength
    uEdgeDistortion.value = params.edgeDistortion
    uFresnelPower.value = params.fresnelPower
    uRimWidth.value = params.rimWidth
    uGlassTint.value.set(params.glassTint)
    uTintStrength.value = params.tintStrength
    uTrackHeight.value = params.trackHeight
    uActive.value.set(params.activeColor)
    uActiveDeep.value.set(params.activeColorDeep)
    inactiveTarget.set(params.inactiveColor)
    bgLeftTarget.set(params.bgLeft)
    bgRightTarget.set(params.bgRight)
    const [frostCenter, frostEdge] = FROST_COLORS[params.theme] ?? FROST_COLORS.light
    frostCenterTarget.set(frostCenter)
    frostEdgeTarget.set(frostEdge)
    bowTintTarget = BOW_TINT[params.theme] ?? 1
    uDebug.value = DEBUG_VIEWS[params.debugView] ?? 0
    sliders.forEach((s, i) => {
      s.rowY = rowY(i)
      s.uRowY.value = s.rowY
    })
  }

  setParams(params)

  return {
    setParams,
    setValue(v) {
      for (const s of sliders) s.target = clampValue(v)
    },
    getValue: () => Math.round(sliders[lastActive].target),
    dispose() {
      renderer.setAnimationLoop(null)
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', updateLoop)
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      bgTarget.dispose()
      quad.dispose()
      bgMaterial.dispose()
      glassMaterial.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
