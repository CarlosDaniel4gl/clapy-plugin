export const appConfig = {};

export const flags = {
  measurePerf: false,
  loadLibsTypings: false, // Slower ~1 second
  runDiagnostics: false, // Slower ~1.5 second
  formatCode: true, // Slower ~0.5 second
  // TODO if changed to true, should add the global CSS rule (not implemented yet).
  useCssBorderBox: false,
};