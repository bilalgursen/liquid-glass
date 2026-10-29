export type DebugView = 'off' | 'sdf' | 'height' | 'normal' | 'uv' | 'edge'

export type LiquidGlassTheme = 'light' | 'dark'

export type LiquidGlassParams = {
  theme: LiquidGlassTheme
  value: number
  overallScale: number
  sliderCount: number
  sliderGap: number
  trackLength: number
  glassWidth: number
  glassHeight: number
  cornerRadius: number
  bevelWidth: number
  centerFlatness: number
  normalStrength: number
  magnification: number
  refractionStrength: number
  edgeDistortion: number
  blurCenter: number
  blurEdge: number
  dispersion: number
  fresnelPower: number
  rimIntensity: number
  rimWidth: number
  topReflection: number
  innerShading: number
  causticStrength: number
  glassTint: string
  tintStrength: number
  shadowOpacity: number
  shadowSoftness: number
  shadowOffset: number
  motionStretch: number
  motionSmoothing: number
  restWidth: number
  restHeight: number
  restRefraction: number
  frostBlur: number
  frostOpacity: number
  pressSpeed: number
  pressBounce: number
  trackHeight: number
  activeColor: string
  activeColorDeep: string
  inactiveColor: string
  bgLeft: string
  bgRight: string
  debugView: DebugView
}

export const defaultLiquidGlassParams: LiquidGlassParams = {
  theme: 'light',
  value: 50,
  overallScale: 0.67,
  sliderCount: 1,
  sliderGap: 220,
  trackLength: 800,
  glassWidth: 245,
  glassHeight: 120,
  cornerRadius: 126,
  bevelWidth: 62,
  centerFlatness: 1.4,
  normalStrength: 42,
  magnification: 0,
  refractionStrength: 37,
  edgeDistortion: 1.6,
  blurCenter: 0.35,
  blurEdge: 2.2,
  dispersion: 0.12,
  fresnelPower: 6,
  rimIntensity: 0.55,
  rimWidth: 1.1,
  topReflection: 0.3,
  innerShading: 0.1,
  causticStrength: 0.08,
  glassTint: '#ffffff',
  tintStrength: 0,
  shadowOpacity: 0.12,
  shadowSoftness: 34,
  shadowOffset: 22,
  motionStretch: 3,
  motionSmoothing: 30,
  restWidth: 132,
  restHeight: 68,
  restRefraction: 6,
  frostBlur: 4,
  frostOpacity: 0,
  pressSpeed: 16,
  pressBounce: 0.4,
  trackHeight: 32,
  activeColor: '#3291FF',
  activeColorDeep: '#02458f',
  inactiveColor: '#c6c5c9',
  bgLeft: '#dcdde0',
  bgRight: '#e1e0e4',
  debugView: 'off',
}

type ThemePalette = Pick<LiquidGlassParams, 'bgLeft' | 'bgRight' | 'inactiveColor'>

// Theme-driven surroundings; explicit props still override these.
export const themePalettes: Record<LiquidGlassTheme, ThemePalette> = {
  light: {
    bgLeft: '#dcdde0',
    bgRight: '#e1e0e4',
    inactiveColor: '#c6c5c9',
  },
  dark: {
    bgLeft: '#141518',
    bgRight: '#1b1c20',
    inactiveColor: '#34353b',
  },
}
