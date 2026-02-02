import { useState } from "react";
import { createComplaint } from "../../services/complaint.service";
import api from "../../services/api";

const CATEGORIES = [
  { value: "GARBAGE", label: "Garbage" },
  { value: "ROADS", label: "Road" },
  { value: "WATER", label: "Water" },
  { value: "STREETLIGHT", label: "Streetlight" },
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "OTHER", label: "Other" },
];

function FileComplaint() {
  const [form, setForm] = useState({
    category: "",
    description: "",
    image: null,
    location: "",
    coordinates: null,
    city: "",
    district: "",
    state: "",
    localAddress: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const res = await api.get(
          `/location/reverse?lat=${lat}&lng=${lng}`
        );

        const data = res.data;

        setForm((prev) => ({
          ...prev,
          city: data.city,
          district: data.district,
          state: data.state,
          pincode: data.pincode || prev.pincode,
          localAddress:
            prev.localAddress ||
            data.suburb ||
            data.neighbourhood ||
            "",
          coordinates: { lat, lng },
          location: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        }));
      },
      () => alert("Location permission denied")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.city || !form.district || !form.state) {
      alert("City, District and State are required");
      return;
    }

    setError("");
    setSuccess("");

    if (!form.category || !form.description) {
      setError("Category and description are required");
      return;
    }

    const formData = new FormData();
    formData.append("category", form.category);
    formData.append("description", form.description);
    if (form.image) formData.append("image", form.image);

    if (form.coordinates) {
      const locationObj = {
        address: form.location,
        city: form.city || "Unknown",
        district: form.district || "Unknown",
        state: form.state || "Unknown",
        localAddress: form.localAddress || "Unknown",
        pincode: form.pincode,
        coordinates: form.coordinates,
      };
      formData.append("location", JSON.stringify(locationObj));
    }

    try {
      setLoading(true);
      await createComplaint(formData);
      setSuccess("Complaint submitted successfully");

      setForm({
        category: "",
        description: "",
        image: null,
        location: "",
        coordinates: null,
        city: "",
        district: "",
        state: "",
        localAddress: "",
        pincode: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6
                    bg-gradient-to-br from-blue-50 via-white to-purple-50
                    p-6 rounded-xl">

      <h2 className="text-xl font-semibold text-gray-800">
        File a Complaint
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur rounded-xl shadow-md p-6 space-y-5"
      >
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm
                       focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the issue..."
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Image
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="mt-1 text-sm"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location Details
          </label>

          <div className="mt-2 space-y-3">
            <div className="flex gap-2">
<input
        type="text"
        name="location"
        value={form.location}
        onChange={(e) =>
          setForm({ ...form, location: e.target.value })
        }
        className="flex-1 rounded-lg border px-3 py-2 text-sm"
        placeholder="Enter coordinates (lat, lng)"
      />
              <button
                type="button"
                onClick={detectLocation}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600
                           px-4 py-2 text-sm text-white hover:opacity-90"
              >
                📍 Detect My Location
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <input
                type="text"
                name="localAddress"
                value={form.localAddress}
                onChange={handleChange}
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Local address / landmark (optional)"
              />
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="City"
              />
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="District"
              />
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="State"
              />
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Pincode"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
            {success}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600
                     px-6 py-2 text-sm text-white font-medium
                     hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
}

export default FileComplaint;
