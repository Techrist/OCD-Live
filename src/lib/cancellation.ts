const HOUR = 3_600_000;

export type CancellationPolicy = { hoursLeft: number; canReschedule: boolean; refundable: boolean };

/**
 * Politique de report et d'annulation (RES-13) : report gratuit et remboursement jusqu'à `freeHours`
 * (48 h par défaut) avant le live ; en dessous, report refusé et aucune remboursement.
 */
export function cancellationPolicy(startsAt: Date, now: Date, freeHours: number): CancellationPolicy {
  const hoursLeft = (startsAt.getTime() - now.getTime()) / HOUR;
  const ok = hoursLeft >= freeHours;
  return { hoursLeft, canReschedule: ok, refundable: ok };
}

/** Un créneau ne doit pas chevaucher le suivant : écart ≥ durée + battement de préparation de la régie (RES-08). */
export function slotSpacingProblem(startHours: number[], durationMinutes: number, bufferMinutes: number): string | null {
  const sorted = [...startHours].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if ((sorted[i] - sorted[i - 1]) * 60 < durationMinutes + bufferMinutes) {
      return `Créneaux ${sorted[i - 1]}h et ${sorted[i]}h trop proches : il faut ${durationMinutes + bufferMinutes} min entre deux départs.`;
    }
  }
  return null;
}
