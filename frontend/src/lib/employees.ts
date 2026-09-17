export function createEmployeeId(): string {
  return `emp-${crypto.randomUUID()}`;
}
