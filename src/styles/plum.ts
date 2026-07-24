import { CONFIG } from "site.config"

/**
 * 시그니처 컬러 팔레트 시스템
 * - 각 팔레트는 라이트/다크를 별도로 설계 (다크는 라이트 반전이 아님)
 * - plumOf()가 현재 선택된 팔레트를 읽으므로 호출부는 팔레트를 몰라도 됨
 *   (팔레트 변경 시 ThemeProvider가 새 테마 객체를 만들어 전체 리렌더를 보장)
 */

export type PlumPalette = {
  accent: string
  accentDeep: string
  violet: string // 보조 색 (그라데이션 파트너)
  tint: string
  tagOnBg: string
  tagOnInk: string
  paper: string
  card: string
  line: string
}

type PaletteSet = { light: PlumPalette; dark: PlumPalette }

export const palettes = {
  plum: {
    light: {
      accent: "#a3538c", accentDeep: "#8c4377", violet: "#75619f",
      tint: "#f5edf4", tagOnBg: "#a3538c", tagOnInk: "#ffffff",
      paper: "#faf8fb", card: "#ffffff", line: "#ece6f0",
    },
    dark: {
      accent: "#d68fc1", accentDeep: "#e3a8d0", violet: "#a08fd0",
      tint: "#241f29", tagOnBg: "#4d2c41", tagOnInk: "#efc3de",
      paper: "#121014", card: "#19161d", line: "#262129",
    },
  },
  ocean: {
    light: {
      accent: "#4a7fa7", accentDeep: "#38648a", violet: "#4a9a94",
      tint: "#ecf3f7", tagOnBg: "#4a7fa7", tagOnInk: "#ffffff",
      paper: "#f8fafb", card: "#ffffff", line: "#e2eaef",
    },
    dark: {
      accent: "#7fb3d5", accentDeep: "#a3c9e3", violet: "#6fbdb6",
      tint: "#1c242b", tagOnBg: "#2b4257", tagOnInk: "#cfe4f2",
      paper: "#0f1317", card: "#161b21", line: "#222a31",
    },
  },
  forest: {
    light: {
      accent: "#55835a", accentDeep: "#446b48", violet: "#7a8a4f",
      tint: "#eef3ec", tagOnBg: "#55835a", tagOnInk: "#ffffff",
      paper: "#f9faf8", card: "#ffffff", line: "#e4ebe1",
    },
    dark: {
      accent: "#8fc094", accentDeep: "#abd3af", violet: "#b0bd7e",
      tint: "#1d241b", tagOnBg: "#2c4030", tagOnInk: "#cfe8d2",
      paper: "#0f130f", card: "#161b15", line: "#232a21",
    },
  },
  sunset: {
    light: {
      accent: "#c26a4a", accentDeep: "#a55538", violet: "#b95f74",
      tint: "#f9efe9", tagOnBg: "#c26a4a", tagOnInk: "#ffffff",
      paper: "#fbf8f6", card: "#ffffff", line: "#f0e6dd",
    },
    dark: {
      accent: "#e39a7c", accentDeep: "#edb49c", violet: "#d98a9c",
      tint: "#251e1a", tagOnBg: "#4d3226", tagOnInk: "#f2cdb9",
      paper: "#141110", card: "#1c1715", line: "#2a2320",
    },
  },
  mono: {
    light: {
      accent: "#3a3a3f", accentDeep: "#232327", violet: "#7a7a82",
      tint: "#f0f0f2", tagOnBg: "#2e2e33", tagOnInk: "#ffffff",
      paper: "#fafafa", card: "#ffffff", line: "#e8e8ea",
    },
    dark: {
      accent: "#c9c9cf", accentDeep: "#e2e2e6", violet: "#9a9aa2",
      tint: "#222225", tagOnBg: "#3a3a40", tagOnInk: "#ebebee",
      paper: "#101012", card: "#171719", line: "#242427",
    },
  },
} satisfies Record<string, PaletteSet>

export type PaletteId = keyof typeof palettes

export const PALETTE_IDS: PaletteId[] = [
  "plum",
  "ocean",
  "forest",
  "sunset",
  "mono",
]

export const PALETTE_LABELS: Record<PaletteId, string> = {
  plum: "플럼",
  ocean: "오션",
  forest: "포레스트",
  sunset: "선셋",
  mono: "모노",
}

// 기존 코드 호환용 (기본 팔레트)
export const plum = palettes.plum

/** 사이트 기본 팔레트 — site.config.js의 defaultPalette로 주인장이 지정 */
export const DEFAULT_PALETTE: PaletteId = PALETTE_IDS.includes(
  (CONFIG as { defaultPalette?: PaletteId }).defaultPalette as PaletteId
)
  ? ((CONFIG as { defaultPalette?: PaletteId }).defaultPalette as PaletteId)
  : "plum"

/** 현재 선택된 팔레트 (ThemeProvider가 렌더 시 동기화) */
let currentPaletteId: PaletteId = DEFAULT_PALETTE

export const setCurrentPaletteId = (id: PaletteId) => {
  currentPaletteId = id
}

export const getCurrentPaletteId = (): PaletteId => currentPaletteId

export const plumOf = (scheme?: string): PlumPalette =>
  palettes[currentPaletteId][scheme === "dark" ? "dark" : "light"]

/**
 * 기본 썸네일 그라데이션 (색은 현재 팔레트에서 color-mix로 파생 →
 * 팔레트를 바꾸면 자동으로 따라옴)
 */
export const thumbGradientCss = (index: number, scheme?: string): string => {
  const p = plumOf(scheme)
  const a = `color-mix(in srgb, ${p.accent} 24%, ${p.card})`
  const b = `color-mix(in srgb, ${p.violet} 16%, ${p.card})`
  const c = `color-mix(in srgb, ${p.accent} 9%, ${p.card})`
  const shapes = [
    `radial-gradient(110% 140% at 12% 12%, ${a} 0%, transparent 55%), linear-gradient(150deg, ${b}, ${c})`,
    `radial-gradient(110% 140% at 88% 14%, ${a} 0%, transparent 55%), linear-gradient(210deg, ${c}, ${b})`,
    `radial-gradient(120% 130% at 18% 85%, ${a} 0%, transparent 58%), linear-gradient(120deg, ${b}, ${c})`,
    `radial-gradient(100% 130% at 85% 80%, ${a} 0%, transparent 55%), linear-gradient(170deg, ${c}, ${b})`,
  ]
  return shapes[index % shapes.length]
}
