/** Frame-rate-independent, bounded springs for the interactive sculpture. */
export type Spring = { position: number; velocity: number };
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function stepSpring(spring: Spring, delta: number, stiffness = 34, damping = 6.8, limit = 2.2) {
  let remaining = clamp(delta, 0, 0.1);
  while (remaining > 0) {
    const dt = Math.min(remaining, 1 / 120);
    spring.velocity += (-stiffness * spring.position - damping * spring.velocity) * dt;
    spring.position += spring.velocity * dt;
    if (Math.abs(spring.position) > limit) {
      spring.position = Math.sign(spring.position) * limit;
      spring.velocity *= 0.25;
    }
    remaining -= dt;
  }
  if (Math.abs(spring.position) < 0.00005 && Math.abs(spring.velocity) < 0.00005) {
    spring.position = 0;
    spring.velocity = 0;
  }
}

export function gustStrength(distance: number, elapsed: number) {
  if (!Number.isFinite(distance) || !Number.isFinite(elapsed) || elapsed <= 0 || elapsed > 0.18) return 0;
  const speed = distance / Math.max(elapsed, 0.008);
  return clamp(Math.pow(speed / 2200, 1.15), 0, 2.6);
}

export function influenceAt(pieceX: number, pieceY: number, cursorX: number, cursorY: number) {
  const distanceSquared = (pieceX - cursorX) ** 2 + (pieceY - cursorY) ** 2;
  return Math.exp(-distanceSquared / 3.2);
}

export function kick(spring: Spring, impulse: number) {
  spring.velocity = clamp(spring.velocity + impulse, -18, 18);
}
