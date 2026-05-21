export const safeClone = (value) => {
  try { return structuredClone(value) } catch { try { return JSON.parse(JSON.stringify(value)) } catch { return value } }
}
