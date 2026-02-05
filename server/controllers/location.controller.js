import axios from "axios";

export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const mapboxToken = process.env.MAPBOX_TOKEN;
    if (!mapboxToken) {
      return res.status(500).json({
        message: "Mapbox token not configured",
      });
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;

    const { data } = await axios.get(url, {
      params: {
        access_token: mapboxToken,
        limit: 1,
      },
    });

    const feature = data.features?.[0];
    const context = feature?.context || [];

    const pick = (key) =>
      context.find((c) => c.id.includes(key))?.text || "";

    return res.json({
      city: pick("place"),
      district: pick("district"),
      state: pick("region"),
      pincode: pick("postcode") || "", // postcode = pincode
      localAddress: feature?.place_name || "",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to reverse geocode location",
    });
  }
};
