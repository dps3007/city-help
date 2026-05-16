import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { Filter, Search, SlidersHorizontal, UserRoundPlus } from "lucide-react";
import { toast } from "react-toastify";

import { getAllAdminComplaints, verifyComplaint, assignComplaint, startWork, resolveComplaint, closeComplaint } from "../../services/complaint.service";
import { useRole } from "../../hooks/useRole";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";
import SectionHeader from "../../components/ui/SectionHeader";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";

const STATUS_OPTIONS = ["SUBMITTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PAGE_SIZE = 10;

const normalize = (value) => (typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, " ") : "unknown");

function ManageComplaints() {
  const { role } = useRole();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [officers, setOfficers] = useState([]);
  const [assigningComplaint, setAssigningComplaint] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAllAdminComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error("Failed to load complaints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);
  useEffect(() => { setPage(1); }, [search]);

  const fetchOfficers = async (category) => {
    const res = await api.get(`/users/officers?department=${category}`);
    setOfficers(res.data.data);
  };

  const handleStatusChange = async (complaint, nextStatus) => {
    try {
      setUpdatingId(complaint._id);
      if (complaint.status === "CLOSED") return;

      switch (nextStatus) {
        case "VERIFIED":
          if (complaint.status !== "SUBMITTED") return;
          await verifyComplaint(complaint._id);
          toast.success("Complaint verified");
          break;
        case "ASSIGNED":
          if (complaint.status !== "VERIFIED") return;
          setAssigningComplaint(complaint);
          await fetchOfficers(complaint.category);
          return;
        case "IN_PROGRESS":
          if (complaint.status !== "ASSIGNED") return;
          await startWork(complaint._id);
          toast.success("Work started");
          break;
        case "RESOLVED":
          if (complaint.status !== "IN_PROGRESS") return;
          await resolveComplaint(complaint._id);
          toast.success("Complaint resolved");
          break;
        case "CLOSED":
          if (complaint.status !== "RESOLVED") return;
          await closeComplaint(complaint._id);
          toast.success("Complaint closed");
          break;
        default:
          return;
      }

      await fetchComplaints();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action not allowed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const userState = normalize(user?.location?.state);
      const userDistrict = normalize(user?.location?.district);
      const userDepartment = normalize(user?.department);
      const complaintState = normalize(complaint?.location?.state);
      const complaintDistrict = normalize(complaint?.location?.district);
      const complaintCategory = normalize(complaint?.category);

      let roleAllowed = false;
      if (["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role)) roleAllowed = true;
      if (role === "STATE_ADMIN") roleAllowed = complaintState === userState;
      if (role === "DISTRICT_ADMIN") roleAllowed = complaintState === userState && complaintDistrict === userDistrict;
      if (role === "DEPT_HEAD") roleAllowed = complaintDistrict === userDistrict && complaintCategory === userDepartment;
      if (role === "OFFICER") roleAllowed = complaintCategory === userDepartment && (complaint.assignedTo?._id === user._id || complaint.resolvedBy === user._id);
      if (role === "WORKER") roleAllowed = complaintCategory === userDepartment && (complaint.assignedWorker?._id === user._id || complaint.resolvedBy === user._id);

      if (!roleAllowed) return false;
      if (!search.trim()) return true;

      const q = normalize(search);
      return complaint._id.toLowerCase().includes(q) || complaintCategory.includes(q) || normalize(complaint.status).includes(q);
    });
  }, [complaints, role, search, user]);

  const totalPages = Math.ceil(filteredComplaints.length / PAGE_SIZE);
  const paginatedComplaints = filteredComplaints.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Moderation"
        title="Complaints management"
        description="Search, verify, assign, and resolve complaints from an enterprise-grade operations table."
        action={<div className="w-full sm:w-96"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search complaints by ID, category, or status" /></div>}
      />

      <div className="flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"><Filter size={14} /> Role-aware filtering</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"><SlidersHorizontal size={14} /> Status actions</span>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white">Moderation table</h3>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          {paginatedComplaints.length === 0 ? (
            <EmptyState title="No complaints found" description="Try a different search or update the filters available to your role." />
          ) : (
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-left text-slate-300">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Upvotes</th>
                  <th className="px-5 py-4">Created By</th>
                  <th className="px-5 py-4">Assigned</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Resolved</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedComplaints.map((complaint) => (
                  <tr key={complaint._id} className="transition hover:bg-white/5">
                    <td className="px-5 py-4 font-medium text-white">#{complaint._id.slice(-6)}</td>
                    <td className="px-5 py-4 text-slate-300">{complaint.category}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <select
                          value={complaint.status}
                          disabled={updatingId === complaint._id || assigningComplaint}
                          onChange={(e) => handleStatusChange(complaint, e.target.value)}
                          className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-white outline-none"
                        >
                          {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <Badge status={complaint.status} />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{complaint.upvoteCount}</td>
                    <td className="px-5 py-4 text-slate-300">{complaint.citizen?.name}</td>
                    <td className="px-5 py-4 text-slate-300">{complaint.assignedTo?.name || "Unassigned"}</td>
                    <td className="px-5 py-4 text-slate-400">{dayjs(complaint.createdAt).format("DD MMM YYYY")}</td>
                    <td className="px-5 py-4 text-slate-400">{complaint.resolvedAt ? dayjs(complaint.resolvedAt).format("DD MMM YYYY") : "—"}</td>
                    <td className="px-5 py-4">
                      <Link to={`/complaints/${complaint._id}`} className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
          <span className="text-sm text-slate-300">Page {page} of {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
        </div>
      )}

      <Modal
        open={Boolean(assigningComplaint)}
        onClose={() => setAssigningComplaint(null)}
        title={`Assign officer for ${assigningComplaint?.category || "complaint"}`}
        description="Select an officer from the matched department list."
      >
        <div className="space-y-4">
          {officers.length === 0 ? (
            <EmptyState title="No officers available" description="No officers were found for this department." />
          ) : (
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {officers.map((officer) => (
                <button
                  key={officer._id}
                  type="button"
                  onClick={async () => {
                    try {
                      setUpdatingId(assigningComplaint._id);
                      await assignComplaint(assigningComplaint._id, { officerId: officer._id });
                      toast.success("Officer assigned");
                      setAssigningComplaint(null);
                      await fetchComplaints();
                    } catch {
                      toast.error("Assignment failed");
                    } finally {
                      setUpdatingId(null);
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/10"
                >
                  <div>
                    <p className="font-semibold text-white">{officer.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{officer.email}</p>
                  </div>
                  <UserRoundPlus size={16} className="text-cyan-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default ManageComplaints;
