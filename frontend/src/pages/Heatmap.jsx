import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from "@react-google-maps/api";
import api from "../utils/api";
import { FiShield, FiInfo, FiActivity, FiMapPin, FiPlusCircle, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = {
  lat: 28.545,
  lng: 77.272,
};

const libraries = ["places"];

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

// Custom Dark Map Styles for a premium dark mode look
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#0f172a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
];

const Heatmap = () => {
  const { user } = useAuth();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries,
  });

  const [heatmapData, setHeatmapData] = useState({ tradeLocations: [], safeSpots: [] });
  const [crowdsourcedSpots, setCrowdsourcedSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [map, setMap] = useState(null);

  // Form State for reporting a new spot
  const [showForm, setShowForm] = useState(false);
  const [newSpot, setNewSpot] = useState({
    name: "",
    description: "",
    type: "safespot",
    lat: "",
    lng: ""
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Force panning when mapCenter updates
  useEffect(() => {
    if (map && mapCenter) {
      map.panTo(mapCenter);
    }
  }, [map, mapCenter]);

  // Fetch heatmap and crowdsourced spots
  const fetchData = async () => {
    try {
      const collegePrefix = user?.collegeName ? user.collegeName.trim() : "Campus";
      const collegeParam = user?.collegeName ? `?college=${encodeURIComponent(user.collegeName)}` : "";
      
      // 1. Fetch Heatmap
      const heatmapRes = await api.get(`/urgent/heatmap${collegeParam}`);
      if (heatmapRes.data.success) {
        setHeatmapData(heatmapRes.data);
        
        // 1. Center map on user coordinates if registered
        if (user?.location?.coordinates?.lat && user.location.coordinates.lat !== 0) {
          setMapCenter({
            lat: user.location.coordinates.lat,
            lng: user.location.coordinates.lng
          });
        } 
        // 2. Geocode user's college name using Google Geocoder or OSM Nominatim
        else if (user?.collegeName) {
          const runGeocode = () => {
            if (isLoaded && window.google && window.google.maps) {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ address: user.collegeName }, (results, status) => {
                if (status === "OK" && results[0]) {
                  setMapCenter({
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                  });
                } else {
                  fallbackToNominatim();
                }
              });
            } else {
              fallbackToNominatim();
            }
          };

          const fallbackToNominatim = () => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(user.collegeName)}`)
              .then(res => res.json())
              .then(data => {
                if (data && data[0]) {
                  setMapCenter({
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                  });
                } else {
                  fallbackToLocalOrBrowser();
                }
              })
              .catch(() => fallbackToLocalOrBrowser());
          };

          const fallbackToLocalOrBrowser = () => {
            const localCoords = getLocalCollegeCoords(user?.collegeName);
            if (localCoords) {
              setMapCenter(localCoords);
            } else if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              });
            }
          };

          runGeocode();
        }
      }

      // 2. Fetch Crowdsourced Spots
      const spotsRes = await api.get(`/spots/all${collegeParam}`);
      if (spotsRes.data.success) {
        setCrowdsourcedSpots(spotsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, [user, isLoaded]);

  // Handle map click to pre-fill coordinates
  const handleMapClick = (e) => {
    if (showForm) {
      const clickedLat = e.latLng.lat();
      const clickedLng = e.latLng.lng();
      setNewSpot(prev => ({
        ...prev,
        lat: clickedLat.toFixed(6),
        lng: clickedLng.toFixed(6)
      }));
    }
  };

  // Submit crowdsourced spot
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newSpot.name || !newSpot.description || !newSpot.lat || !newSpot.lng) {
      setFormError("Please fill all fields. You can also click on the map to automatically capture coordinates.");
      return;
    }

    try {
      const res = await api.post("/spots/create", {
        ...newSpot,
        college: user?.collegeName || "Campus"
      });
      if (res.data.success) {
        setFormSuccess("Spot reported successfully! Updating map...");
        setNewSpot({ name: "", description: "", type: "safespot", lat: "", lng: "" });
        setTimeout(() => {
          setShowForm(false);
          setFormSuccess("");
        }, 1500);
        fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit spot.");
    }
  };

  const collegePrefix = user?.collegeName ? user.collegeName.trim() : "Campus";

  // Filter trade locations by college name
  const collegeTradeLocations = heatmapData.tradeLocations?.filter(
    (loc) => loc.college?.trim().toLowerCase() === collegePrefix.toLowerCase()
  ) || [];

  // Setup active trading hotspots using actual user trade locations (from active item listings)
  const baseActiveCampusHotspots = collegeTradeLocations.map((loc) => ({
    name: `${loc.title} (${loc.category})`,
    lat: loc.lat,
    lng: loc.lng,
    radius: 40,
    color: loc.category === "Electronics" ? "#14b8a6" :
           loc.category === "Books" ? "#0ea5e9" : "#f59e0b",
    activity: `Listed trade: ${loc.title}. Campus: ${loc.college || 'Local'}`
  }));

  // Append user reported hotspots (CampusSpots)
  const reportedHotspots = crowdsourcedSpots
    .filter(spot => spot.type === "hotspot")
    .map(spot => ({
      name: `${spot.name} (Reported Trade Zone)`,
      lat: spot.lat,
      lng: spot.lng,
      radius: 50,
      color: "#f59e0b", // Yellow/Orange
      activity: spot.description
    }));

  const activeCampusHotspots = [...baseActiveCampusHotspots, ...reportedHotspots];

  // Combine actual safe spots from backend heatmap data with frontend crowdsourced safe spots
  const reportedSafeSpots = crowdsourcedSpots
    .filter(spot => spot.type === "safespot")
    .map(spot => ({
      name: `${spot.name} (User Reported)`,
      description: spot.description,
      lat: spot.lat,
      lng: spot.lng,
      type: "Safe Spot"
    }));

  // deduplicate or combine them safely
  const allSafeSpots = [];
  const seenSpots = new Set();

  const addSpotUnique = (spot) => {
    const key = `${Number(spot.lat).toFixed(5)},${Number(spot.lng).toFixed(5)}`;
    if (!seenSpots.has(key)) {
      seenSpots.add(key);
      allSafeSpots.push(spot);
    }
  };

  (heatmapData.safeSpots || []).forEach(addSpotUnique);
  reportedSafeSpots.forEach(addSpotUnique);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent pt-24 pb-16 px-4 sm:px-8 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Title Banner Block with real university background */}
        <div className="relative rounded-[32px] border border-[var(--border-color)] p-8 mb-10 overflow-hidden shadow-sm bg-[var(--bg-surface)]">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                    src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format" 
                    alt="Campus safe zones" 
                    className="w-full h-full object-cover opacity-25 dark:opacity-15 scale-105 filter blur-[0.5px]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-surface)] via-[var(--bg-surface)]/90 to-transparent"></div>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                  <FiShield className="text-[var(--accent)]" /> 
                  {user?.collegeName ? `${user.collegeName} Map` : "Campus Map & Safe Meetup Spots"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
                  Crowdsourced safe spots and active trade hotspots reported by students at {collegePrefix}.
                </p>
              </div>
              {user && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 cursor-pointer bg-[var(--accent)] hover:opacity-90 text-white px-5 py-3 rounded-full font-bold shadow-lg transition-opacity shrink-0"
                >
                  <FiPlusCircle /> {showForm ? "Close Form" : "Report a Spot"}
                </button>
              )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Hotspots list or Report Spot Form */}
          <div className="lg:col-span-1 space-y-6">
            
            {showForm ? (
              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Report Spot</h3>
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                    <FiX size={18} />
                  </button>
                </div>
                
                <p className="text-[10px] text-slate-400 bg-blue-500/10 text-blue-500 p-2 rounded-xl">
                  💡 Tip: Click anywhere on the map to automatically populate the latitude and longitude inputs!
                </p>

                <form onSubmit={handleFormSubmit} className="space-y-3.5 text-slate-800 dark:text-white">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Spot Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Hostels Food Court"
                      className="input-sassy w-full text-xs"
                      value={newSpot.name}
                      onChange={(e) => setNewSpot(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Description / Details</label>
                    <textarea
                      placeholder="e.g. Highly lit area, CCTV surveillance, busy during evenings."
                      className="input-sassy w-full text-xs min-h-[60px]"
                      value={newSpot.description}
                      onChange={(e) => setNewSpot(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Spot Type</label>
                    <select
                      className="input-sassy w-full text-xs"
                      value={newSpot.type}
                      onChange={(e) => setNewSpot(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="safespot">🟢 Safe Meetup Spot</option>
                      <option value="hotspot">🟡 Active Hotspot Zone</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Latitude</label>
                      <input
                        type="text"
                        placeholder="Click Map"
                        className="input-sassy w-full text-xs"
                        value={newSpot.lat}
                        readOnly
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Longitude</label>
                      <input
                        type="text"
                        placeholder="Click Map"
                        className="input-sassy w-full text-xs"
                        value={newSpot.lng}
                        readOnly
                        required
                      />
                    </div>
                  </div>

                  {formError && <p className="text-xs text-red-500 font-semibold">{formError}</p>}
                  {formSuccess && <p className="text-xs text-emerald-500 font-semibold">{formSuccess}</p>}

                  <button
                    type="submit"
                    className="w-full py-3 bg-[var(--accent)] hover:opacity-95 text-white font-bold rounded-2xl text-xs transition-opacity"
                  >
                    Submit Spot
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                  <FiActivity className="text-[var(--accent)]" /> Active Hotspots
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {activeCampusHotspots.map((spot, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: spot.color }} />
                        <span className="font-bold text-xs text-slate-800 dark:text-white line-clamp-1">{spot.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{spot.activity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                <FiShield className="text-emerald-500" /> Meetup safety rules
              </h3>
              <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                <li>Pick user reported safe spots with green pins.</li>
                <li>Stay close to CCTV security cameras.</li>
                <li>Report suspicious exchange locations.</li>
              </ul>
            </div>
          </div>

          {/* Google Map Section */}
          <div className="lg:col-span-3">
            <div className="rounded-[32px] overflow-hidden border border-[var(--border-color)] shadow-xl relative">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={16}
                onClick={handleMapClick}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  styles: isDarkMode ? darkMapStyle : [],
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {/* Active Trading Circles */}
                {activeCampusHotspots.map((spot, idx) => (
                  <Circle
                    key={`${idx}-${spot.lat}-${spot.lng}`}
                    center={{ lat: Number(spot.lat), lng: Number(spot.lng) }}
                    radius={spot.radius}
                    options={{
                      fillColor: spot.color,
                      fillOpacity: 0.18,
                      strokeColor: spot.color,
                      strokeOpacity: 0.45,
                      strokeWeight: 1,
                    }}
                  />
                ))}

                {/* Safe Meetup Spot Markers */}
                {allSafeSpots.map((spot, idx) => (
                  <Marker
                    key={`safe-${idx}-${spot.lat}-${spot.lng}`}
                    position={{ lat: Number(spot.lat), lng: Number(spot.lng) }}
                    onClick={() => setSelectedSpot(spot)}
                    icon={{
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                      fillColor: "#10b981", // Emerald Green
                      fillOpacity: 1,
                      strokeColor: "#ffffff",
                      strokeWeight: 2,
                      scale: 1.5,
                      anchor: new window.google.maps.Point(12, 21),
                    }}
                  />
                ))}

                {/* Glowing Temporary Marker while adding a new spot */}
                {showForm && newSpot.lat && newSpot.lng && (
                  <Marker
                    position={{ lat: Number(newSpot.lat), lng: Number(newSpot.lng) }}
                    icon={{
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                      fillColor: newSpot.type === "safespot" ? "#10b981" : "#f59e0b",
                      fillOpacity: 0.9,
                      strokeColor: "#ffffff",
                      strokeWeight: 2.5,
                      scale: 1.8,
                      anchor: new window.google.maps.Point(12, 21),
                    }}
                  />
                )}

                {/* Info Window */}
                {selectedSpot && (
                  <InfoWindow
                    position={{ lat: Number(selectedSpot.lat), lng: Number(selectedSpot.lng) }}
                    onCloseClick={() => setSelectedSpot(null)}
                  >
                    <div className="p-2 max-w-[200px] text-slate-800">
                      <h4 className="font-bold text-sm flex items-center gap-1">
                        <FiMapPin className="text-emerald-500" /> {selectedSpot.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">{selectedSpot.description}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        {selectedSpot.type || "Recommended Spot"}
                      </span>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </div>
          </div>
        </div>

        {/* Dynamic Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[20%] left-[-15%] w-[450px] h-[450px] bg-[var(--accent)]/5 rounded-full blur-[110px] animate-blob-1"></div>
             <div className="absolute bottom-[30%] right-[-15%] w-[500px] h-[500px] bg-[var(--accent-secondary)]/5 rounded-full blur-[130px] animate-blob-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
