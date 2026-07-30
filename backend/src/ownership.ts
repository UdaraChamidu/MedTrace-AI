export function assertPatientOwnership(
  requestedPatientId: string,
  ownedPatientIds: readonly string[]
): void {
  if (!ownedPatientIds.includes(requestedPatientId)) {
    throw new Error("Patient not found or access denied.");
  }
}
