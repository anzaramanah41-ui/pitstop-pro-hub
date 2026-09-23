/**
 * AppBenk — Bengkel Map Component (OpenStreetMap + Leaflet.js)
 *
 * Menampilkan lokasi bengkel di peta interaktif menggunakan OpenStreetMap
 * (gratis, tanpa API key). Dilengkapi fitur:
 * - Marker posisi bengkel dengan popup info
 * - Tombol petunjuk arah (Google Maps / Waze)
 * - Deteksi lokasi pengguna (Geolocation API)
 * - Estimasi jarak ke bengkel
 */
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, ExternalLink, Locate, Phone, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type BengkelLocation = {
  nama: string;
  alamat: string;
  telepon?: string | undefined;
  jamOperasional?: string | undefined;
  lat: number;
  lng: number;
};

type Props = {
  bengkel: BengkelLocation;
  /** Tinggi peta (default 300px) */
  height?: number;
  /** Tampilkan info card di bawah peta */
  showInfo?: boolean;
  className?: string;
  /** Opsional: Google Maps API Key */
  apiKey?: string;
};

/** Hitung jarak antara 2 koordinat (Haversine formula) dalam km */
function hitungJarak(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function BengkelMap({
  bengkel,
  height = 300,
  showInfo = true,
  className = "",
  apiKey,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [jarak, setJarak] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Inisialisasi peta Leaflet
  useEffect(() => {
    let map: any = null;

    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        // Inject Leaflet CSS jika belum ada
        if (!document.querySelector("#leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        // Import Leaflet
        const L = await import("leaflet");

        // Fix default marker icon
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        // Inisialisasi map
        map = L.map(mapRef.current, {
          center: [bengkel.lat, bengkel.lng],
          zoom: 16,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Tile layer: Google Maps jika API Key tersedia, fallback ke OpenStreetMap
        const gMapsKey = apiKey || ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || "";
        if (gMapsKey) {
          L.tileLayer(`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${gMapsKey}`, {
            attribution: '© <a href="https://maps.google.com">Google Maps</a>',
            maxZoom: 20,
          }).addTo(map);
        } else {
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(map);
        }

        // Custom marker icon untuk bengkel
        const bengkelIcon = L.divIcon({
          className: "",
          html: `
            <div style="
              width: 40px; height: 40px;
              background: linear-gradient(135deg, #2563eb, #7c3aed);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(37,99,235,0.4);
              display: flex; align-items: center; justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                font-size: 18px;
                display: block;
                margin-top: 2px;
              ">🔧</span>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -45],
        });

        // Marker bengkel
        const marker = L.marker([bengkel.lat, bengkel.lng], { icon: bengkelIcon }).addTo(map);

        // Popup info bengkel
        const popupContent = `
          <div style="min-width: 200px; font-family: system-ui, sans-serif;">
            <div style="font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 4px;">
              🏪 ${bengkel.nama}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
              📍 ${bengkel.alamat}
            </div>
            ${bengkel.telepon ? `<div style="font-size: 12px; color: #64748b;">📞 ${bengkel.telepon}</div>` : ""}
            ${bengkel.jamOperasional ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">🕐 ${bengkel.jamOperasional}</div>` : ""}
          </div>
        `;
        marker.bindPopup(popupContent, { maxWidth: 250 }).openPopup();

        mapInstanceRef.current = { map, L };
        setMapReady(true);
      } catch (err) {
        console.error("Failed to init map:", err);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [bengkel.lat, bengkel.lng]);

  // Tampilkan lokasi user di peta
  const deteksiLokasi = () => {
    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung Geolocation.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });

        const dist = hitungJarak(userLat, userLng, bengkel.lat, bengkel.lng);
        setJarak(dist);

        if (mapInstanceRef.current) {
          const { map, L } = mapInstanceRef.current;

          // Marker lokasi user
          const userIcon = L.divIcon({
            className: "",
            html: `
              <div style="
                width: 20px; height: 20px;
                background: #22c55e;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 0 4px rgba(34,197,94,0.3);
                animation: pulse 2s infinite;
              "></div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          L.marker([userLat, userLng], { icon: userIcon })
            .addTo(map)
            .bindPopup("📍 Lokasi Anda")
            .openPopup();

          // Gambar garis rute
          L.polyline([[userLat, userLng], [bengkel.lat, bengkel.lng]], {
            color: "#3b82f6",
            weight: 3,
            dashArray: "8,6",
            opacity: 0.7,
          }).addTo(map);

          // Fit bounds agar keduanya terlihat
          map.fitBounds([[userLat, userLng], [bengkel.lat, bengkel.lng]], {
            padding: [40, 40],
          });
        }

        setLocating(false);
        toast.success(`Jarak ke ${bengkel.nama}: ±${dist.toFixed(1)} km`);
      },
      (err) => {
        setLocating(false);
        toast.error("Tidak dapat mendeteksi lokasi. Pastikan izin lokasi diaktifkan.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const bukaGoogleMaps = () => {
    const dest = `${bengkel.lat},${bengkel.lng}`;
    const url = userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${dest}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bengkel.nama + " " + bengkel.alamat)}`;
    window.open(url, "_blank");
  };

  const bukaWaze = () => {
    window.open(
      `https://waze.com/ul?ll=${bengkel.lat},${bengkel.lng}&navigate=yes`,
      "_blank",
    );
  };

  return (
    <div className={`rounded-xl overflow-hidden border border-border shadow-sm ${className}`}>
      {/* Map container */}
      <div className="relative" style={{ height }}>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />

        {/* Loading overlay */}
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat peta...
            </div>
          </div>
        )}

        {/* Floating controls */}
        {mapReady && (
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="shadow-lg gap-1.5 bg-white/95 hover:bg-white text-foreground"
              onClick={deteksiLokasi}
              disabled={locating}
            >
              {locating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Locate className="h-3.5 w-3.5 text-blue-600" />
              )}
              <span className="text-xs">Lokasi Saya</span>
            </Button>
          </div>
        )}
      </div>

      {/* Info card */}
      {showInfo && (
        <div className="bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                {bengkel.nama}
              </h3>
              <p className="text-xs text-muted-foreground ml-5.5">{bengkel.alamat}</p>
              {bengkel.telepon && (
                <p className="text-xs text-muted-foreground ml-5.5 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {bengkel.telepon}
                </p>
              )}
              {bengkel.jamOperasional && (
                <p className="text-xs text-muted-foreground ml-5.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {bengkel.jamOperasional}
                </p>
              )}
            </div>
            {jarak && (
              <Badge variant="secondary" className="shrink-0 text-blue-700 bg-blue-50">
                ±{jarak.toFixed(1)} km
              </Badge>
            )}
          </div>

          {/* Tombol navigasi */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={bukaGoogleMaps}
            >
              <Navigation className="h-3.5 w-3.5" />
              Google Maps
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 border-cyan-300 text-cyan-700 hover:bg-cyan-50"
              onClick={bukaWaze}
            >
              🗺️ Waze
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Default koordinat bengkel demo (Yogyakarta)
 * Ganti dengan koordinat bengkel yang sebenarnya
 */
export const DEMO_BENGKEL_LOCATION: BengkelLocation = {
  nama: "AppBenk — Demo Bengkel",
  alamat: "Jl. Magelang No. 123, Sinduadi, Mlati, Sleman, Yogyakarta 55284",
  telepon: "0274-123456",
  jamOperasional: "Senin–Sabtu: 08.00–17.00 WIB",
  lat: -7.7516,
  lng: 110.3761,
};
