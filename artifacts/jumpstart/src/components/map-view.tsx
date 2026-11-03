import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { Minus, Plus, LocateFixed, Crosshair, Loader2 } from "lucide-react";
import type { DemoUser } from "@workspace/api-client-react";

export type Pin = { user: DemoUser; selected?: boolean; dim?: boolean };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function helperIcon(p: Pin) {
  return L.divIcon({
    className: "js-icon",
    iconSize: [0, 0],
    html: `<div class="js-pin ${p.selected ? "sel" : ""} ${p.dim ? "off" : ""}"><span class="av" style="background:${esc(p.user.color)}">${esc(p.user.initials)}</span>AED ${p.user.price}</div>`,
  });
}
const meIcon = L.divIcon({ className: "js-icon", iconSize: [0, 0], html: `<div class="js-me"><b></b><i></i></div>` });

function Bridge({ center, onMap, onPick }: { center: [number, number]; onMap: (m: L.Map) => void; onPick?: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => onMap(map), [map, onMap]);
  useEffect(() => {
    if (!map.getBounds().pad(-0.2).contains(center)) map.flyTo(center, Math.max(map.getZoom(), 13), { duration: 0.8 });
  }, [center[0], center[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  useMapEvents({ click: (e) => onPick?.(e.latlng.lat, e.latlng.lng) });
  return null;
}

export function MapView({
  center,
  pins = [],
  onSelect,
  onPick,
  onLocate,
  locating,
  className = "",
}: {
  center: [number, number];
  pins?: Pin[];
  onSelect?: (id: string) => void;
  onPick?: (lat: number, lng: number) => void;
  onLocate?: () => void;
  locating?: boolean;
  className?: string;
}) {
  const [map, setMap] = useState<L.Map | null>(null);
  const btn = "grid h-10 w-10 place-items-center bg-card text-foreground transition hover:bg-muted active:scale-95";
  return (
    <div className={`relative isolate ${className}`}>
      <MapContainer center={center} zoom={14} zoomControl={false} className="h-full w-full" attributionControl>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <Bridge center={center} onMap={setMap} onPick={onPick} />
        <Marker position={center} icon={meIcon} interactive={false} />
        {pins.map((p) => (
          <Marker
            key={p.user.id + (p.selected ? "s" : "")}
            position={[p.user.lat, p.user.lng]}
            icon={helperIcon(p)}
            zIndexOffset={p.selected ? 1000 : 0}
            eventHandlers={{ click: () => onSelect?.(p.user.id) }}
          />
        ))}
      </MapContainer>
      <div className="absolute bottom-8 right-3 z-[500] flex flex-col gap-2">
        {onLocate && (
          <button data-testid="button-map-gps" title="Use my GPS location" onClick={onLocate} className={`${btn} rounded-full shadow-float`}>
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4 text-[hsl(188_62%_30%)]" />}
          </button>
        )}
        <button data-testid="button-map-recenter" title="Recenter" onClick={() => map?.flyTo(center, 14, { duration: 0.6 })} className={`${btn} rounded-full shadow-float`}>
          <Crosshair className="h-4 w-4" />
        </button>
        <div className="overflow-hidden rounded-full shadow-float">
          <button data-testid="button-zoom-in" title="Zoom in" onClick={() => map?.zoomIn()} className={btn}><Plus className="h-4 w-4" /></button>
          <div className="h-px bg-border" />
          <button data-testid="button-zoom-out" title="Zoom out" onClick={() => map?.zoomOut()} className={btn}><Minus className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
