import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import { getMyComplaints } from "../../services/complaint.service";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Skeleton from "../../components/common/Skeleton";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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

  /* ---------------- SEARCH ---------------- */

  const filteredComplaints = useMemo(() => {
    if (!search.trim()) return complaints;

    const q = search.toLowerCase();

    return complaints.filter((c) =>
      c._id.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  }, [complaints, search]);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredComplaints.length / PAGE_SIZE);

  const paginatedComplaints = filteredComplaints.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton count={5} className="h-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Complaints</h1>
          <p className="text-muted-foreground mt-1">Track and manage all your complaints</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by ID, Category, or Status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="text-sm text-muted-foreground py-2 px-3 bg-muted rounded-lg">
            {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-foreground">ID</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Category</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-center font-semibold text-foreground">Upvotes</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Assigned To</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Created</th>
                <th className="px-6 py-3 text-left font-semibold text-foreground">Resolved</th>
                <th className="px-6 py-3 text-center font-semibold text-foreground">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedComplaints.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center">
                    <p className="text-muted-foreground font-medium">No complaints found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search criteria</p>
                  </td>
                </tr>
              )}

              {paginatedComplaints.map((c) => (
                <tr key={c._id} className="border-t border-border hover:bg-muted transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">#{c._id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{c.category}</td>
                  <td className="px-6 py-4">
                    <Badge status={c.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent-100 text-accent-700 text-xs font-semibold">
                      👍 {c.upvoteCount || 0}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-medium ${!c.assignedTo ? "text-red-600" : "text-foreground"}`}>
                    {c.assignedTo?.name || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {dayjs(c.createdAt).format("DD MMM YYYY")}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {c.resolvedAt ? dayjs(c.resolvedAt).format("DD MMM YYYY") : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/complaints/${c._id}`}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <Button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  pageNum === page
                    ? "bg-primary-600 text-white"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

export default MyComplaints;
