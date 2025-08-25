import { useState, useEffect } from "react";

interface Coordinates {
  lat: number | null;
  lng: number | null;
}

interface GeolocationState {
  loaded: boolean;
  coords: Coordinates;
  error: string | null;
}

export function useGeolocation(options?: PositionOptions): GeolocationState {
  const [location, setLocation] = useState<GeolocationState>({
    loaded: false,
    coords: { lat: null, lng: null },
    error: null,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocation({
        loaded: true,
        coords: { lat: null, lng: null },
        error: "Geolocation not supported",
      });
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        loaded: true,
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setLocation({
        loaded: true,
        coords: { lat: null, lng: null },
        error: error.message,
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, [options]);

  return location;
}
