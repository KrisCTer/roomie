let googleMapsPromise;
let googleMapsLoadError;

const DEFAULT_LIBRARIES = [];
const MAPS_READY_TIMEOUT_MS = 8000;
const MAPS_READY_POLL_MS = 50;

function hasMapConstructor() {
  return typeof window.google?.maps?.Map === "function";
}

function waitForMapConstructor(timeoutMs = MAPS_READY_TIMEOUT_MS) {
  if (hasMapConstructor()) {
    return Promise.resolve(window.google.maps);
  }

  return new Promise((resolve, reject) => {
    const start = Date.now();
    let importRequested = false;

    const tick = () => {
      if (hasMapConstructor()) {
        resolve(window.google.maps);
        return;
      }

      if (!importRequested && typeof window.google?.maps?.importLibrary === "function") {
        importRequested = true;
        window.google.maps
          .importLibrary("maps")
          .catch(() => {
            // Ignore here; timeout path will surface a single normalized error.
          })
          .finally(() => {
            setTimeout(tick, MAPS_READY_POLL_MS);
          });
        return;
      }

      if (Date.now() - start >= timeoutMs) {
        reject(
          new Error(
            "Google Maps API loaded but Map constructor is unavailable. Check API restrictions, billing, and enabled APIs.",
          ),
        );
        return;
      }

      setTimeout(tick, MAPS_READY_POLL_MS);
    };

    tick();
  });
}

function normalizeMapsError(error) {
  const message = error?.message || "Google Maps failed to load";
  return new Error(message);
}

function getKeyFingerprint(apiKey) {
  if (!apiKey) return "missing";
  const trimmed = apiKey.trim();
  if (trimmed.length <= 10) return `${trimmed} (len=${trimmed.length})`;
  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)} (len=${trimmed.length})`;
}

export function loadGoogleMaps(libraries = DEFAULT_LIBRARIES) {
  if (googleMapsLoadError) {
    return Promise.reject(googleMapsLoadError);
  }

  if (hasMapConstructor()) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY?.trim();
  if (!apiKey) {
    return Promise.reject(new Error("Missing VITE_GOOGLE_MAPS_KEY"));
  }

  const origin = window.location?.origin || "unknown-origin";
  const keyFingerprint = getKeyFingerprint(apiKey);

  googleMapsPromise = new Promise((resolve, reject) => {
    let settled = false;
    const rejectOnce = (reason) => {
      if (settled) return;
      settled = true;
      reject(normalizeMapsError(reason));
    };

    const resolveOnce = () => {
      if (settled) return;
      waitForMapConstructor()
        .then((maps) => {
          if (settled) return;
          settled = true;
          resolve(maps);
        })
        .catch((error) => {
          rejectOnce(error);
        });
    };

    // Google invokes this global callback when API key auth fails.
    const previousAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      googleMapsLoadError = new Error(
        `Google Maps authentication failed. origin=${origin}; key=${keyFingerprint}. Check API key validity, billing, and allowed HTTP referrers.`,
      );
      rejectOnce(googleMapsLoadError);
      if (typeof previousAuthFailure === "function") {
        previousAuthFailure();
      }
    };

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      const handleExistingScriptLoad = () => {
        existingScript.setAttribute("data-loaded", "true");
        resolveOnce();
      };

      // Script may already be loaded by another component before this call.
      if (existingScript.getAttribute("data-loaded") === "true") {
        resolveOnce();
        return;
      }

      existingScript.addEventListener("load", handleExistingScriptLoad, {
        once: true,
      });
      existingScript.addEventListener("error", () => rejectOnce(new Error("Google Maps failed to load")), {
        once: true,
      });

      // Fallback for cases where script finished loading before listeners were attached.
      setTimeout(() => {
        if (!settled) {
          resolveOnce();
        }
      }, 0);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";

    const libraryParam = libraries.length
      ? `&libraries=${encodeURIComponent(libraries.join(","))}`
      : "";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}${libraryParam}&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      if (window.google?.maps) {
        resolveOnce();
      } else {
        rejectOnce(new Error("Google Maps loaded but maps object is unavailable"));
      }
    };
    script.onerror = () => rejectOnce(new Error("Google Maps failed to load"));

    document.head.appendChild(script);
  }).catch((error) => {
    googleMapsLoadError = normalizeMapsError(error);
    googleMapsPromise = undefined;
    throw googleMapsLoadError;
  });

  return googleMapsPromise;
}
