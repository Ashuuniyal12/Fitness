"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Clock, ExternalLink, Navigation, Star, MapPin, Plus, Minus, Crosshair } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

export function LocationMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(true);

  // Maximus Gym, Dehradun coordinates: [Lng, Lat]
  const coordinates: [number, number] = [78.0264, 30.2858];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let mapInstance: any;

    // Load MapLibre GL dynamically to prevent SSR errors
    import("maplibre-gl").then((maplibregl) => {
      if (!mapContainerRef.current) return;

      mapInstance = new maplibregl.Map({
        container: mapContainerRef.current,
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: coordinates,
        zoom: 15.5,
        pitch: 45,
        bearing: -15,
        attributionControl: false,
      });

      // Create a custom element for the marker to match yellow branding
      const markerEl = document.createElement("div");
      markerEl.className = "relative cursor-pointer group";
      markerEl.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-yellow-400/20 animate-ping"></div>
          <div class="relative w-5 h-5 rounded-full border-2 border-white bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dumbbell"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
          </div>
        </div>
      `;

      new maplibregl.Marker({ element: markerEl })
        .setLngLat(coordinates)
        .addTo(mapInstance);

      // On marker click, toggle popup
      markerEl.addEventListener("click", () => {
        setShowPopup((prev) => !prev);
      });

      setMap(mapInstance);
    });

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  const handleDirections = () => {
    window.open("https://share.google/2HqhByvhkbdBRcZQM", "_blank");
  };

  const zoomIn = () => {
    if (map) map.zoomIn();
  };

  const zoomOut = () => {
    if (map) map.zoomOut();
  };

  const resetZoom = () => {
    if (map) {
      map.flyTo({
        center: coordinates,
        zoom: 15.5,
        pitch: 45,
        bearing: -15,
        essential: true,
      });
    }
  };

  return (
    <section id="location" className="py-24 bg-black border-t border-zinc-950 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center space-y-3 mb-12 relative z-10">
        <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Find the Basezone</span>
        <h2 className="grindy-brush text-[40px] md:text-[56px] leading-tight tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-200 to-white uppercase pb-1">
          Our Location
        </h2>
        <p className="text-[14px] md:text-[16px] text-zinc-400 max-w-2xl mx-auto">
          Visit Maximus Unisex Gym. Train in a high-octane fitness arena equipped with world-class utilities.
        </p>
      </div>

      {/* Map Container - occupies full screen width */}
      <div className="relative h-[550px] w-full border-y border-zinc-900 bg-neutral-950 shadow-2xl z-10">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Glassy Marker Popup Overlay */}
        {showPopup && (
          <div className="absolute top-6 left-6 md:left-12 z-20 w-80 backdrop-blur-[14px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl shadow-2xl p-5 backdrop-brightness-[0.91] transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-yellow-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Gym Headquarters</span>
                </div>
                <h3 className="grindy-brush text-lg uppercase tracking-wide text-white mt-1">
                  MAXIMUS Unisex Gym
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  1st Floor, Shree Ram Plaza, Kargi Rd, Banjarawala, Kargi Chowk, Dehradun, Uttarakhand 248001
                </p>
              </div>

              <div className="w-full h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.09)_20%,rgba(255,255,255,0.22)_50%,rgba(255,255,255,0.09)_80%,transparent)]" />

              <div className="flex items-center justify-between text-xs text-zinc-300">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">4.9</span>
                  <span className="text-zinc-500">(1,245 Reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>5 AM - 10 PM</span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleDirections}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-yellow-400 px-3 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-yellow-400/10 hover:bg-yellow-300 transition"
                >
                  <Navigation className="w-4 h-4 fill-black" />
                  Directions
                </button>
                <button
                  onClick={handleDirections}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Custom Controls */}
        <div className="absolute bottom-6 right-6 md:right-12 z-20 flex flex-col gap-2">
          <button
            onClick={zoomIn}
            className="w-10 h-10 rounded-lg backdrop-blur-[14px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition shadow-xl"
            title="Zoom In"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={zoomOut}
            className="w-10 h-10 rounded-lg backdrop-blur-[14px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition shadow-xl"
            title="Zoom Out"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={resetZoom}
            className="w-10 h-10 rounded-lg backdrop-blur-[14px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-yellow-400 flex items-center justify-center hover:bg-white/10 hover:border-yellow-400/20 transition shadow-xl"
            title="Recenter Gym Location"
          >
            <Crosshair className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
