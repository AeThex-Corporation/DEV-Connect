export async function safeFetch(input: RequestInfo, init?: RequestInit): Promise<Response | null> {
  if (typeof window === "undefined") return null;
  const f: any = (window as any).fetch;
  if (typeof f !== "function") {
    // fetch is not available
    // eslint-disable-next-line no-console
    console.warn("fetch is not available on window");
    return null;
  }
  try {
    // Some wrappers may throw synchronously when called; guard against that
    const p = f.call(window, input, init);
    if (!p || typeof p.then !== "function") {
      // Not a promise
      return null;
    }
    const res = await p;
    return res as Response;
  } catch (err) {
    // Network error or wrapper threw
    // eslint-disable-next-line no-console
    console.warn("safeFetch error", err);
    return null;
  }
}
