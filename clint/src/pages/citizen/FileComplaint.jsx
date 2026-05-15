import { useState } from "react";
import { createComplaint } from "../../services/complaint.service";
import api from "../../services/api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Alert from "../../components/common/Alert";
import { MapPin, Upload, FileText } from "lucide-react";

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

  const parseCoordinates = (value) => {
  const parts = value.split(",").map(p => p.trim());
  if (parts.length !== 2) return null;

  const lat = Number(parts[0]);
  const lng = Number(parts[1]);

  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
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

        setForm(prev => ({
          ...prev,
          city: data.city || "",
          district: data.district || "",
          state: data.state || "",
          pincode: data.pincode || "",
          localAddress:
            prev.localAddress ||
            data.suburb ||
            data.neighbourhood ||
            "",
          coordinates: { lat, lng },
          location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }));
      },
      () => alert("Location permission denied")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.coordinates) {
    setError("Valid coordinates are required (lat, lng)");
    return;
  }


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
        city: form.city,
        district: form.district,
        state: form.state,
        localAddress: form.localAddress,
        pincode: form.pincode,
        coordinates: {
          lat: form.coordinates.lat,
          lng: form.coordinates.lng,
        },
      };
      formData.append("location", JSON.stringify(locationObj));
    }

    try {
      setLoading(true);
      const res = await createComplaint(formData);

    if (res.data.duplicate) {
      setSuccess("⚠️ Complaint already exists. You have been linked to it.");
      return;

    } else {
      setSuccess("✅ Complaint submitted successfully");

    }
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
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">File a Complaint</h1>
        <p className="text-muted-foreground">Help us improve your city by reporting issues</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alerts */}
        {error && <Alert type="error" message={error} dismissible onClose={() => setError("")} />}
        {success && <Alert type="success" message={success} dismissible onClose={() => setSuccess("")} />}

        {/* Category & Description */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-foreground">Issue Details</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>
        </Card>

        {/* Image Upload */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-foreground">Media</h2>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <p className="text-sm font-medium text-foreground">
                {form.image ? form.image.name : "Click to upload image"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
            </label>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-foreground">Location</h2>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                name="location"
                value={form.location}
                onChange={(e) => {
                  const value = e.target.value;
                  const coords = parseCoordinates(value);
                  setForm(prev => ({
                    ...prev,
                    location: value,
                    coordinates: coords,
                  }));
                }}
                placeholder="Coordinates (lat, lng)"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={detectLocation}
                variant="accent"
                size="md"
              >
                Detect Location
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Input
                type="text"
                name="localAddress"
                value={form.localAddress}
                onChange={handleChange}
                placeholder="Landmark (optional)"
              />
              <Input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City *"
              />
              <Input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="District *"
              />
              <Input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State *"
              />
              <Input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Pincode"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          fullWidth
          size="lg"
          variant="primary"
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </Button>
      </form>
    </div>
  );
}

export default FileComplaint;
