import type { Post } from '../data/posts.data'
import { RANDOM_SCENES } from './dither'

/* Enquanto o post não tem banner, ele ganha sempre a mesma cena pontilhada, escolhida pelo número. */
export function sceneFor(p: Post): { scene: string; seed: number } {
  const n = parseInt(p.n, 10) || 0
  return { scene: RANDOM_SCENES[n % RANDOM_SCENES.length], seed: n * 131 + 7 }
}
