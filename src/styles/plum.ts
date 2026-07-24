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
