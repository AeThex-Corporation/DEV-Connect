// Ensure `process` exists in browser to avoid packages that reference process at module-eval time
declare global {
  interface Window { process?: any }
  var process: any;
}

if (typeof globalThis.process === "undefined") {
  (globalThis as any).process = { env: {} };
} else if (!globalThis.process.env) {
  globalThis.process.env = {};
}

export {};
