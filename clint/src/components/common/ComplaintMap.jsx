import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapEffects({ lat, lng, focus }) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  useEffect(() => {
    if (focus && lat && lng) {
      map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [focus, lat, lng, map]);

  return null;
}

export default function ComplaintMap({ lat, lng, focus }) {
  const position =
    lat && lng ? [lat, lng] : [20.5937, 78.9629];

  return (
    <div className="w-full h-[300px]">
      <MapContainer
        center={position}
        zoom={13}
        className="h-full w-full rounded-xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {lat && lng && (
          <Marker position={position} icon={markerIcon}>
            <Popup>Complaint Location</Popup>
          </Marker>
        )}

        <MapEffects lat={lat} lng={lng} focus={focus} />
      </MapContainer>
    </div>
  );
}
