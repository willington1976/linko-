// src/infrastructure/dtos/DTOValidationError.ts

export class DTOValidationError extends Error {
  constructor(
    public readonly docId: string,
    public readonly field: string,
    public readonly reason: string,
  ) {
    super(`[DTOValidationError] doc=${docId} field=${field}: ${reason}`);
    this.name = 'DTOValidationError';
  }
}