import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FlyToLocation({ lat, lng, trigger }) {
  const map = useMap();

  useEffect(() => {
    if (trigger && lat && lng) {
      map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [trigger, lat, lng, map]);

  return null;
}

export default function ComplaintMap({ lat, lng, focus }) {
  const position = lat && lng ? [lat, lng] : [20.5937, 78.9629];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "300px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <Marker position={position} icon={markerIcon}>
        <Popup>Complaint Location</Popup>
      </Marker>

      <FlyToLocation lat={lat} lng={lng} trigger={focus} />
    </MapContainer>
  );
}
