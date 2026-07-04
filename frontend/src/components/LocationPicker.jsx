import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Center of India
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const libraries = ['places'];

const LocationPicker = ({ location, setLocation, collegeName }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY, 
    libraries
  });

  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  
  // Initial load or external update
  useEffect(() => {
    if (location && location.coordinates && location.coordinates.lat !== 0) {
        setMarkerPosition({ lat: location.coordinates.lat, lng: location.coordinates.lng });
    } else if (!markerPosition && isLoaded) { 
         if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition((position) => {
                 const pos = {
                     lat: position.coords.latitude,
                     lng: position.coords.longitude,
                 };
                 setMarkerPosition(pos);
                 
                 // Reverse Geocoding for Initial Position
                 if(setLocation) {
                    if (window.google && window.google.maps) {
                        const geocoder = new window.google.maps.Geocoder();
                        geocoder.geocode({ location: pos }, (results, status) => {
                            if (status === "OK" && results[0]) {
                                setLocation((prev) => ({
                                    ...prev,
                                    address: results[0].formatted_address,
                                    coordinates: pos
                                }));
                            } else {
                                setLocation((prev) => ({
                                    ...prev,
                                    coordinates: pos
                                }));
                            }
                        });
                    }
                 }
             });
         }
    }
  }, [location?.coordinates?.lat, location?.coordinates?.lng, isLoaded, markerPosition]);

const COLLEGE_COORDINATES = {
  "delhi": { lat: 28.545, lng: 77.272 },
  "bombay": { lat: 19.1334, lng: 72.9133 },
  "iitb": { lat: 19.1334, lng: 72.9133 },
  "kharagpur": { lat: 22.3149, lng: 87.3105 },
  "iitkgp": { lat: 22.3149, lng: 87.3105 },
  "madras": { lat: 12.9915, lng: 80.2336 },
  "iitm": { lat: 12.9915, lng: 80.2336 },
  "kanpur": { lat: 26.5123, lng: 80.2329 },
  "iitk": { lat: 26.5123, lng: 80.2329 },
  "dtu": { lat: 28.7501, lng: 77.1177 },
  "nsut": { lat: 28.6083, lng: 77.0373 },
  "pilani": { lat: 28.3639, lng: 75.5870 },
  "bits": { lat: 28.3639, lng: 75.5870 },
  "vit": { lat: 12.9692, lng: 79.1559 },
  "vellore": { lat: 12.9692, lng: 79.1559 },
  "srm": { lat: 12.8235, lng: 80.0424 },
  "mit": { lat: 42.3601, lng: -71.0942 },
  "stanford": { lat: 37.4275, lng: -122.1697 },
  "jamshedpur": { lat: 22.7744, lng: 86.1414 },
  "nit jamshedpur": { lat: 22.7744, lng: 86.1414 }
};

const getLocalCollegeCoords = (name) => {
  if (!name) return null;
  const normalized = name.toLowerCase();
  for (const [key, coords] of Object.entries(COLLEGE_COORDINATES)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }
  return null;
};

// LocationPicker component body...
  // Geocode college name when it changes to center the map on the campus
  useEffect(() => {
    if (collegeName) {
      const localCoords = getLocalCollegeCoords(collegeName);
      if (localCoords) {
        setMarkerPosition(localCoords);
        if (map) {
          map.panTo(localCoords);
        }
        if (setLocation) {
          setLocation((prev) => ({
            ...prev,
            coordinates: localCoords
          }));
        }
        return; // Skip geocoder if we found a local match
      }
    }

    const runGeocode = () => {
      if (isLoaded && collegeName && window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: collegeName }, (results, status) => {
          if (status === "OK" && results[0]) {
            const pos = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            };
            setMarkerPosition(pos);
            if (map) map.panTo(pos);
            if (setLocation) {
              setLocation((prev) => ({
                ...prev,
                address: results[0].formatted_address,
                coordinates: pos
              }));
            }
          } else {
            fallbackToNominatim();
          }
        });
      } else if (collegeName) {
        fallbackToNominatim();
      }
    };

    const fallbackToNominatim = () => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(collegeName)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0]) {
            const pos = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon)
            };
            setMarkerPosition(pos);
            if (map) map.panTo(pos);
            if (setLocation) {
              setLocation((prev) => ({
                ...prev,
                address: data[0].display_name,
                coordinates: pos
              }));
            }
          }
        })
        .catch(err => console.error("LocationPicker Nominatim failed:", err));
    };

    const delayDebounceFn = setTimeout(() => {
      runGeocode();
    }, 1000); // 1s debounce to avoid API spam while typing

    return () => clearTimeout(delayDebounceFn);
  }, [collegeName, isLoaded, map]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onMapClick = useCallback((e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const newPos = { lat, lng };
      
      setMarkerPosition(newPos);
      
      if(setLocation) {
            // Reverse Geocoding to get address
            if (window.google && window.google.maps) {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: newPos }, (results, status) => {
                    if (status === "OK" && results[0]) {
                         setLocation((prev) => ({
                            ...prev,
                            address: results[0].formatted_address,
                            coordinates: newPos
                        }));
                    } else {
                         setLocation((prev) => ({
                            ...prev,
                            coordinates: newPos
                        }));
                    }
                });
            } else {
                setLocation((prev) => ({
                    ...prev,
                    coordinates: newPos
                }));
            }
        }
  }, [setLocation]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPosition(pos);
          if (map) map.panTo(pos);
          
          if (setLocation) {
            if (window.google && window.google.maps) {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: pos }, (results, status) => {
                if (status === "OK" && results[0]) {
                  setLocation((prev) => ({
                    ...prev,
                    address: results[0].formatted_address,
                    coordinates: pos
                  }));
                } else {
                  setLocation((prev) => ({
                    ...prev,
                    coordinates: pos
                  }));
                }
              });
            } else {
              setLocation((prev) => ({
                ...prev,
                coordinates: pos
              }));
            }
          }
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Could not access your location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (!isLoaded) {
    return <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-xl border border-gray-300">Loading Map...</div>;
  }

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-300 relative z-0">
      <button 
        type="button" 
        onClick={handleUseCurrentLocation}
        className="absolute bottom-4 left-4 z-10 bg-white dark:bg-zinc-900 text-[#8b6d48] dark:text-[#ecd8b1] font-bold text-xs px-3.5 py-2 rounded-full shadow-md border border-gray-200 dark:border-zinc-800 hover:bg-[#fdfaf2] dark:hover:bg-zinc-800 transition flex items-center gap-1.5"
      >
        📍 Use Current Location
      </button>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || defaultCenter}
        zoom={markerPosition ? 15 : 5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
        }}
      >
        {markerPosition && (
            <Marker position={markerPosition} />
        )}
      </GoogleMap>
    </div>
  );
};

export default LocationPicker;
 