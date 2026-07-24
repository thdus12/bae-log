/**
 * 시그니처 플럼 팔레트
 * 다크는 라이트를 뒤집은 게 아니라 별도로 설계한 값 (주얼톤)
 */
export const plum = {
  light: {
    accent: "#a3538c", // 뮤트된 플럼
    accentDeep: "#8c4377",
    violet: "#75619f",
    tint: "#f5edf4", // 연한 라벤더 배경
    tagOnBg: "#a3538c",
    tagOnInk: "#ffffff",
    paper: "#faf8fb", // 라일락 기 도는 오프화이트
    card: "#ffffff",
    line: "#ece6f0",
  },
  dark: {
    accent: "#d68fc1", // 오키드
    accentDeep: "#e3a8d0",
    violet: "#a08fd0",
    tint: "#241f29",
    tagOnBg: "#4d2c41", // 와인 필
    tagOnInk: "#efc3de",
    paper: "#121014", // 거의 무채색 차콜
    card: "#19161d",
    line: "#262129",
  },
}

export type PlumPalette = typeof plum.light

export const plumOf = (scheme?: string): PlumPalette =>
  scheme === "dark" ? plum.dark : plum.light

/** 기본 썸네일용 그라데이션 4종 (글 제목 해시로 선택) */
export const thumbGradients = {
  light: [
    `radial-gradient(110% 140% at 12% 12%, #dcc9e8 0%, transparent 55%),
     linear-gradient(150deg, #ece2f2, #f6e6ef)`,
    `radial-gradient(110% 140% at 88% 14%, #e9c9dd 0%, transparent 55%),
     linear-gradient(210deg, #f1e6f3, #e6def0)`,
    `radial-gradient(120% 130% at 18% 85%, #cfc5e8 0%, transparent 58%),
     linear-gradient(120deg, #f3e7ee, #e9e0f1)`,
    `radial-gradient(100% 130% at 85% 80%, #e3c6d6 0%, transparent 55%),
     linear-gradient(170deg, #eee3f2, #f5e9ec)`,
  ],
  dark: [
    `radial-gradient(110% 140% at 12% 12%, #453054 0%, transparent 55%),
     linear-gradient(150deg, #2a2231, #33243a)`,
    `radial-gradient(110% 140% at 88% 14%, #4e2d42 0%, transparent 55%),
     linear-gradient(210deg, #2c2334, #262030)`,
    `radial-gradient(120% 130% at 18% 85%, #383052 0%, transparent 58%),
     linear-gradient(120deg, #2e2436, #282133)`,
    `radial-gradient(100% 130% at 85% 80%, #472b3c 0%, transparent 55%),
     linear-gradient(170deg, #2b2233, #322338)`,
  ],
}

export const thumbGradientOf = (seed: string, scheme?: string): string => {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997
  const set = scheme === "dark" ? thumbGradients.dark : thumbGradients.light
  return set[h % set.length]
}
