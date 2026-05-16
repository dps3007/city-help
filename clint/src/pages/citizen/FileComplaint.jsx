import { useMemo, useState } from "react";
import { createComplaint } from "../../services/complaint.service";
import api from "../../services/api";
import { toast } from "react-toastify";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { CheckCircle2, CloudUpload, MapPin, Route, ShieldCheck, Sparkles } from "lucide-react";

import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import SectionHeader from "../../components/ui/SectionHeader";
import Badge from "../../components/common/Badge";

const CATEGORIES = [
  { value: "GARBAGE", label: "Garbage" },
  { value: "ROADS", label: "Road" },
  { value: "WATER", label: "Water" },
  { value: "STREETLIGHT", label: "Streetlight" },
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "OTHER", label: "Other" },
];

function FileComplaint() {
  const [step, setStep] = useState(1);
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
  const [imagePreview, setImagePreview] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.[0]) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, image: file }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const parseCoordinates = (value) => {
    if (typeof value !== "string") return null;

    const parts = value.split(",").map((part) => part.trim());
    if (parts.length !== 2) return null;

    const lat = Number(parts[0]);
    const lng = Number(parts[1]);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return { lat, lng };
  };


  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
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
          location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        }));
        toast.success("Location detected and reverse-geocoded");
      },
      () => toast.error("Location permission denied")
    );
  };

  const progress = useMemo(() => (step / 3) * 100, [step]);

  const nextStep = () => {
    if (step === 1 && (!form.category || !form.description)) {
      setError("Please provide a category and description before continuing");
      return;
    }

    if (step === 2 && (!form.location || !form.coordinates || !form.city || !form.district || !form.state)) {
      setError("Add valid location details before continuing");
      return;
    }

    setError("");
    setStep((current) => Math.min(current + 1, 3));
  };

  const previousStep = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.coordinates) {
      setError("Valid coordinates are required (lat, lng)");
      return;
    }

    if (!form.city || !form.district || !form.state) {
      toast.error("City, District and State are required");
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
        setSuccess("Complaint already exists. You have been linked to it.");
        toast.info("You were attached to an existing complaint");
      } else {
        setSuccess("Complaint submitted successfully");
        toast.success("Complaint submitted successfully");
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
      setImagePreview("");
      setStep(1);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to submit complaint";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SectionHeader
        eyebrow="Citizen action"
        title="File a complaint"
        description="Submit a structured report with location, image evidence, and rich metadata for faster routing."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Submission progress</p>
              <p className="text-xs text-slate-400">Step {step} of 3</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-cyan-300" /> Secure and traceable
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [1, "Issue details"],
                [2, "Location"],
                [3, "Attachments"],
              ].map(([number, label]) => (
                <button key={label} type="button" onClick={() => setStep(number)} className={`rounded-2xl border px-4 py-3 text-left transition ${step === number ? "border-cyan-400/30 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/8"}`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">0{number}</p>
                  <p className="mt-2 text-sm font-semibold">{label}</p>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <Motion.div key="step-1" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} className="grid gap-5 lg:grid-cols-2">
                  <Select name="category" value={form.category} onChange={handleChange} label="Category">
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </Select>
                  <Textarea name="description" value={form.description} onChange={handleChange} label="Description" rows={6} placeholder="Describe the issue, impact, and urgency..." className="lg:col-span-2" />
                </Motion.div>
              )}

              {step === 2 && (
                <Motion.div key="step-2" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} className="space-y-5">
                  <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <Input
                      name="location"
                      value={form.location}
                      onChange={(e) => {
                        const value = e.target.value;
                        const coords = parseCoordinates(value);
                        setForm((prev) => ({ ...prev, location: value, coordinates: coords }));
                      }}
                      label="Coordinates"
                      placeholder="lat, lng"
                      hint="Enter GPS coordinates or use automatic detection"
                    />
                    <div className="flex items-end">
                      <Button type="button" onClick={detectLocation} className="w-full" leadingIcon={<MapPin size={16} />}>
                        Detect my location
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <Input name="localAddress" value={form.localAddress} onChange={handleChange} label="Local address" placeholder="Landmark or street" />
                    <Input name="city" value={form.city} onChange={handleChange} label="City" placeholder="City" />
                    <Input name="district" value={form.district} onChange={handleChange} label="District" placeholder="District" />
                    <Input name="state" value={form.state} onChange={handleChange} label="State" placeholder="State" />
                    <Input name="pincode" value={form.pincode} onChange={handleChange} label="Pincode" placeholder="Pincode" />
                  </div>
                </Motion.div>
              )}

              {step === 3 && (
                <Motion.div key="step-3" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6">
                      <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 text-center">
                        <input type="file" name="image" accept="image/*" onChange={handleChange} className="hidden" />
                        <div className="rounded-2xl bg-cyan-400/10 p-4 text-cyan-200"><CloudUpload size={22} /></div>
                        <div>
                          <p className="text-sm font-semibold text-white">Upload evidence</p>
                          <p className="mt-1 text-sm text-slate-400">Drag and drop or click to select a clear issue photo</p>
                        </div>
                      </label>
                    </div>

                    {imagePreview && (
                      <div className="overflow-hidden rounded-3xl border border-white/10">
                        <img src={imagePreview} alt="Complaint preview" className="h-64 w-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Review</p>
                      <div className="mt-4 space-y-3 text-sm text-slate-300">
                        <DetailRow label="Category" value={form.category || "Not selected"} />
                        <DetailRow label="Location" value={form.location || "Not detected"} />
                        <DetailRow label="City" value={form.city || "—"} />
                        <DetailRow label="District" value={form.district || "—"} />
                        <DetailRow label="State" value={form.state || "—"} />
                      </div>
                    </div>

                    <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/10 p-5 text-sm text-cyan-100">
                      <div className="flex items-center gap-2 font-semibold"><Sparkles size={16} /> Submission tips</div>
                      <p className="mt-2 leading-6 text-cyan-50/90">A clear image, precise coordinates, and a concise description help the right department respond faster.</p>
                    </div>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>

            {error && <p className="rounded-2xl border border-rose-500/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>}
            {success && <p className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</p>}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="secondary" onClick={previousStep} disabled={step === 1}>
                Previous
              </Button>

              {step < 3 ? (
                <Button type="button" onClick={nextStep} className="sm:ml-auto">
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="sm:ml-auto">
                  {loading ? "Submitting..." : "Submit complaint"}
                </Button>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

export default FileComplaint;
