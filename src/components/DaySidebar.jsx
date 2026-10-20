import {
  Activity,
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const links = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Activity", path: "/CypherSoldier/Analytics", icon: BarChart3 },
  { label: "Generate Workout", path: "/workouts/generate", icon: Sparkles },
];

function DaySidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName =
    user?.displayName || user?.display_name || user?.name || user?.email;
  const initials = (displayName || "FM")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex w-[232px] -translate-x-full flex-col border-r border-[#353d42] bg-[#1e2327] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : ""}`}
    >
      <div className="flex h-[84px] items-center justify-between border-b border-[#353d42] px-6">
        <div className="grid size-10 place-items-center rounded-xl bg-[#2f6af2] text-white shadow-lg shadow-blue-900/30">
          <Activity size={22} strokeWidth={2.5} />
        </div>
        <button
          className="p-2 text-[#aab5bb] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="grid gap-1.5 p-4" aria-label="Primary navigation">
        {links.map(({ label, path, icon: Icon }) => (
          <Link
            key={label}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${location.pathname === path || (path === "/workouts/generate" && location.pathname.startsWith(path)) ? "bg-[#2f6af2] text-white shadow-lg shadow-blue-900/20" : "text-[#a1abb2] hover:bg-white/5 hover:text-white"}`}
          >
            <Icon size={19} />
            <span>{label}</span>
          </Link>
        ))}
        <Link
          to="/CypherSoldier/Profile"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${location.pathname === "/CypherSoldier/Profile" ? "bg-[#2f6af2] text-white" : "text-[#a1abb2] hover:bg-white/5 hover:text-white"}`}
        >
          <UserRound size={19} />
          <span>Profile</span>
        </Link>
      </nav>
      <div className="mt-auto border-t border-[#353d42] p-4">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#a1abb2] hover:bg-white/5 hover:text-white"
        >
          <LogOut size={19} /> Sign out
        </button>
        <Link
          to="/CypherSoldier/Profile"
          className="mt-3 flex items-center gap-3 border-t border-[#353d42] px-2 pt-4"
        >
          <span className="grid size-8 place-items-center rounded-full bg-[#3b4650] text-[10px] font-bold text-white">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-xs text-white">
              {displayName || "Fitness member"}
            </strong>
            <small className="text-[10px] text-[#89949c]">Free member</small>
          </span>
          <ChevronRight size={16} className="text-[#89949c]" />
        </Link>
      </div>
    </aside>
  );
}
export default DaySidebar;
