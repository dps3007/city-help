import axios from "axios";

export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "CityHelp-App (boatop777@gmail.com)", // Replace with your contact info
        },
      }
    );

    const a = response.data?.address || {};

    return res.json({
      city:
        a.city ||
        a.town ||
        a.village ||
        a.hamlet ||
        "",
      district:
        a.state_district ||
        a.county ||
        "",
      state: a.state || "",
      pincode: a.postcode || "",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to reverse geocode location",
    });
  }
};
