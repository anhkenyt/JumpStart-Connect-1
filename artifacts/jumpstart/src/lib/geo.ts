import { useState } from "react";

export function useGps(onFix: (lat: number, lng: number) => void) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locate = () => {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("This browser can't share location. We kept the labelled Dubai demo location; you can also tap the map.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocating(false); onFix(p.coords.latitude, p.coords.longitude); },
      (e) => {
        setLocating(false);
        setError(
          e.code === e.PERMISSION_DENIED
            ? "Location permission was denied. We kept the labelled Dubai demo location; tap the map to place your car instead."
            : "Couldn't get a GPS fix right now. We kept the Dubai demo location; tap the map to adjust.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };
  return { locate, locating, error, clearError: () => setError(null) };
}
