import type { Post } from '../data/posts.data'
import { HOME_SCENES } from './scenes'

/* Enquanto o post não tem banner, ele ganha sempre a mesma cena pontilhada, escolhida pelo número. */
export function sceneFor(p: Post): string {
  const n = parseInt(p.n, 10) || 0
  return HOME_SCENES[n % HOME_SCENES.length] ?? 'mar'
}
