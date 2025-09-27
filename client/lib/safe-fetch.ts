export async function safeFetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response | null> {
  if (typeof window === "undefined") return null;

  const globalFetch: any = (window as any).fetch || (globalThis as any).fetch;
  if (typeof globalFetch !== "function") {
    // fetch is not available
    // eslint-disable-next-line no-console
    console.warn("fetch is not available on window/globalThis");
    return null;
  }

  // Be extremely defensive: some analytics wrappers may throw when called or return
  // non-standard thenables that behave strangely. Ensure we never let an exception
  // escape this helper.
  try {
    let p: any;
    try {
      p = globalFetch.call(window, input, init);
    } catch (callErr) {
      // Synchronous wrapper throw
      // eslint-disable-next-line no-console
      console.warn("safeFetch: fetch call threw synchronously", callErr);
      return null;
    }

    // Coerce to a promise safely
    let resolved: any;
    try {
      resolved = await Promise.resolve(p).catch((err) => {
        // Fetch promise rejected (network error, CORS, etc.)
        // eslint-disable-next-line no-console
        console.warn("safeFetch: fetch promise rejected", err);
        return null;
      });
    } catch (coerceErr) {
      // Accessing then or other unexpected behavior
      // eslint-disable-next-line no-console
      console.warn("safeFetch: error awaiting fetch", coerceErr);
      return null;
    }

    if (!resolved) return null;
    return resolved as Response;
  } catch (err) {
    // Catch-all guard
    // eslint-disable-next-line no-console
    console.warn("safeFetch unexpected error", err);
    return null;
  }
}
