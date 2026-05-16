import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";

import { getMyComplaints } from "../../services/complaint.service";
import SectionHeader from "../../components/ui/SectionHeader";
import Card, { CardBody } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import Button from "../../components/common/Button";

const PAGE_SIZE = 8;

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await getMyComplaints();
        setComplaints(data || []);
      } catch (error) {
        console.error("Failed to fetch complaints", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    if (!search.trim()) return complaints;
    const q = search.toLowerCase();
    return complaints.filter((c) => c._id.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q) || c.status?.toLowerCase().includes(q));
  }, [complaints, search]);

  const totalPages = Math.ceil(filteredComplaints.length / PAGE_SIZE);
  const paginatedComplaints = filteredComplaints.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Complaint archive"
        title="My complaints"
        description="Review your complaint history, current progress, assignment state, and resolution dates."
        action={<div className="w-full sm:w-80"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, category, or status" /></div>}
      />

      <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"><Search size={14} /> Searchable archive</div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"><Filter size={14} /> Status-aware filtering</div>
      </div>

      {paginatedComplaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="Try a different search or file a new complaint to populate your archive."
          action={<Link to="/complaints/new" className="inline-flex items-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white">File a complaint</Link>}
        />
      ) : (
        <div className="grid gap-4">
          {paginatedComplaints.map((complaint) => (
            <Card key={complaint._id} interactive>
              <CardBody>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    {complaint.attachments?.[0]?.url ? (
                      <img src={complaint.attachments[0].url} alt="Complaint" className="h-20 w-20 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold text-slate-400">No image</div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge status={complaint.status} />
                        <span className="text-xs uppercase tracking-[0.24em] text-slate-500">#{complaint._id.slice(-6)}</span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-white">{complaint.category}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{complaint.description}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                        <span>{dayjs(complaint.createdAt).format("DD MMM YYYY")}</span>
                        <span>•</span>
                        <span>{complaint.assignedTo?.name || "Unassigned"}</span>
                        <span>•</span>
                        <span>{complaint.upvoteCount || 0} upvotes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                    <Link to={`/complaints/${complaint._id}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                      View details
                    </Link>
                    <p className="text-xs text-slate-400">Resolved: {complaint.resolvedAt ? dayjs(complaint.resolvedAt).format("DD MMM YYYY") : "—"}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <span className="text-sm text-slate-300">Page {page} of {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default MyComplaints;
