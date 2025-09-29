// Utilities
export function isNumeric(value: string | null): boolean {
  // Check if the value is empty
  if (value === undefined || value === null || value.trim() === '')
    return false;

  // Attempt to parse the value as a float
  const number = parseFloat(value);

  // Check if parsing resulted in NaN or the value has extraneous characters
  return !Number.isNaN(number) && Number.isFinite(number) && String(number) === value;
}
