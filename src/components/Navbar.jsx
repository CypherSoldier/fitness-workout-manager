import { Menu } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
function Navbar({ onOpenMenu }) {
  const { user } = useAuth();
  const displayName =
    user?.displayName || user?.display_name || user?.name || user?.email;
  const initials = (displayName || "FM")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#353d42] bg-[#1b2023] px-5 sm:px-8 lg:h-[84px] lg:px-12">
      <div className="flex items-center gap-3">
        <button
          className="p-1 text-[#aab5bb] lg:hidden"
          onClick={onOpenMenu}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-[#7890a2]">
            {date}
          </p>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            Good morning, {displayName?.split(" ")[0] || "Fitness member"}
          </h1>
        </div>
      </div>
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt={`${displayName || "User"} profile`}
          referrerPolicy="no-referrer"
          className="size-9 rounded-full object-cover"
        />
      ) : (
        <span className="grid size-9 place-items-center rounded-full bg-[#2f6af2] text-[10px] font-bold text-white">
          {initials}
        </span>
      )}
    </header>
  );
}
export default Navbar;
