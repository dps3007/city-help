import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  Award,
  UserCircle2,
  Newspaper,
  Trophy,
  ShieldCheck,
  Users,
  Building2,
  X,
  MapPinned,
} from "lucide-react";
import { useRole } from "../../hooks/useRole";
import { ADMIN_MENU } from "../../config/adminMenu";

const ICONS = {
  Dashboard: LayoutDashboard,
  "File Complaint": FilePlus2,
  "My Complaints": ListChecks,
  Rewards: Award,
  Profile: UserCircle2,
  "District Feed": Newspaper,
  Leaderboard: Trophy,
  Complaints: ShieldCheck,
  Users: Users,
  Admins: Building2,
};

function Sidebar({ open = false, onClose }) {
  const { role } = useRole();

  const adminMenu = ADMIN_MENU.filter((item) => item.roles.includes(role));

  const desktop = (
    <aside className="hidden h-screen border-r border-white/10 bg-slate-950/85 px-4 py-5 lg:sticky lg:top-0 lg:flex lg:flex-col">
      <Brand onClose={onClose} />
      <SidebarContent role={role} adminMenu={adminMenu} onNavigate={onClose} />
    </aside>
  );

  const mobile = (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-[86vw] max-w-sm border-r border-white/10 bg-slate-950/95 px-4 py-5 backdrop-blur-xl transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <Brand onClose={onClose} mobile />
      <SidebarContent role={role} adminMenu={adminMenu} onNavigate={onClose} mobile />
    </aside>
  );

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
}

function Brand({ onClose, mobile = false }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-indigo-500/10 p-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300/80">CityHelp</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Civic Operations</h1>
        <p className="mt-1 text-xs text-slate-300">Government-grade issue management</p>
      </div>

      {mobile && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

function SidebarContent({ role, adminMenu, onNavigate }) {
  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : "text-slate-300 hover:bg-white/6 hover:text-white"}`;

  const iconClass = "shrink-0 text-slate-400 transition group-hover:text-cyan-300";

  const primaryLinks = role === "CITIZEN"
    ? [
        { to: "/", label: "Dashboard" },
        { to: "/complaints/new", label: "File Complaint" },
        { to: "/complaints", label: "My Complaints" },
        { to: "/rewards", label: "Rewards" },
      ]
    : adminMenu.map((item) => ({
        ...item,
        to: item.to ?? item.path,
      }));

  const commonLinks = [
    { to: "/feed", label: "District Feed" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
      <Section title="Workspace" />

      <div className="space-y-1">
        {primaryLinks.map((item) => {
          const Icon = ICONS[item.label] || MapPinned;
          const linkTo = item.to ?? item.path;

          return (
            <NavLink
              key={linkTo || item.label}
              to={linkTo}
              end={linkTo === "/"}
              onClick={onNavigate}
              className={linkClass}
            >
              <Icon size={17} className={iconClass} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <Section title="Common" />

      <div className="space-y-1">
        {commonLinks.map((item) => {
          const Icon = ICONS[item.label] || MapPinned;
          const linkTo = item.to ?? item.path;

          return (
            <NavLink
              key={linkTo || item.label}
              to={linkTo}
              onClick={onNavigate}
              className={linkClass}
            >
              <Icon size={17} className={iconClass} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-4 rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Status</p>
        <p className="mt-2 text-sm text-slate-200">Role-aware routing and complaint ops are active.</p>
      </div>
    </nav>
  );
}

function Section({ title }) {
  return <p className="px-4 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">{title}</p>;
}

export default Sidebar;
