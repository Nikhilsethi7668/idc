import React, { useEffect, useRef } from 'react';
import { EventData, EventStatus } from '../types';

declare global {
  interface Window {
    L: any;
  }
}

interface GlobalMapProps {
  events: EventData[];
  onEventClick: (id: string) => void;
}

export const GlobalMap: React.FC<GlobalMapProps> = ({ events, onEventClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize Map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false
      });

      // Use CartoDB Positron for that clean, Enterprise look (Grayscale)
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing layers
    map.eachLayer((layer: any) => {
      if (layer instanceof window.L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Color mapping
    const colorMap = {
      [EventStatus.RED]: 'bg-red-600',
      [EventStatus.AMBER]: 'bg-amber-500',
      [EventStatus.GREEN]: 'bg-emerald-500',
    };
    
    const pulseMap = {
      [EventStatus.RED]: 'bg-red-400',
      [EventStatus.AMBER]: 'bg-amber-300',
      [EventStatus.GREEN]: 'bg-emerald-300',
    };

    // Create Markers
    const markers: any[] = [];
    events.forEach((event) => {
      const { coordinates } = event;
      if (coordinates) {
        // Custom Div Icon
        const icon = window.L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative w-6 h-6">
              <div class="${pulseMap[event.status]} marker-pulse"></div>
              <div class="${colorMap[event.status]} marker-pin"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = window.L.marker(coordinates, { icon })
          .addTo(map)
          .on('click', () => onEventClick(event.id));

        // Create a custom tooltip string
        const tooltipContent = `
          <div class="font-sans p-1">
            <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">${event.region}</div>
            <div class="text-sm font-bold text-idc-deepBlue mb-1">${event.name}</div>
            <div class="flex items-center space-x-2">
              <span class="text-xs ${event.status === EventStatus.RED ? 'text-red-600 font-bold' : 'text-gray-600'}">
                ${event.status}
              </span>
              <span class="text-xs text-gray-400">|</span>
              <span class="text-xs text-gray-600">${event.currentRegistrations} Regs</span>
            </div>
          </div>
        `;

        marker.bindPopup(tooltipContent, {
          closeButton: false,
          className: 'event-popup'
        });

        // Hover effects
        marker.on('mouseover', function(this: any) {
          this.openPopup();
        });
        
        markers.push(marker);
      }
    });

    // Cleanup function
    return () => {
      // We generally keep the map instance alive for performance in single-page apps unless unmounted completely
    };
  }, [events, onEventClick]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
      <div ref={mapRef} className="w-full h-full z-0" style={{ minHeight: '400px' }} />
      
      {/* Map Overlay Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200 text-xs">
        <div className="font-bold text-gray-700 mb-2">Event Status</div>
        <div className="space-y-1.5">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
            <span className="text-gray-600">On Track</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
            <span className="text-gray-600">At Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-600 mr-2 animate-pulse"></div>
            <span className="text-gray-600 font-medium">Critical (10-Day Rule)</span>
          </div>
        </div>
      </div>
    </div>
  );
};