import axios from "axios";

export const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse`;

  const { data } = await axios.get(url, {
    params: {
      lat,
      lon: lng,
      format: "json",
      zoom: 18,
      addressdetails: 1,
    },
    headers: {
      "User-Agent": "CityHelp-App",
    },
  });

  const address = data.address || {};

  return {
    city:
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      null,

    district:
      address.county ||
      address.district ||
      null,

    state: address.state || null,

    // MOST IMPORTANT
    municipal:
      address.municipality ||
      address.city ||
      address.town ||
      address.county ||
      null,
  };
};
