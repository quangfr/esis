import { NavLink, Outlet, useLocation } from "react-router";
import {
  Activity,
  ChevronDown,
  FileText,
  LogOut,
  Mail,
  Settings,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import { useAppState, type UserRole } from "../app-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Users;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  manager: [
    { to: "/patients", label: "Patients", icon: Users },
    { to: "/screening", label: "Dépistage", icon: Activity },
    { to: "/messaging", label: "Messagerie", icon: Mail },
    { to: "/reports", label: "Rapports", icon: FileText },
    { to: "/settings", label: "Paramètres", icon: Settings },
  ],
  patient: [
    { to: "/patients", label: "Mon dossier", icon: Users },
    { to: "/screening", label: "Mon parcours", icon: Activity },
    { to: "/messaging", label: "Messagerie", icon: Mail },
    { to: "/reports", label: "Documents", icon: FileText },
    { to: "/settings", label: "Préférences", icon: Settings },
  ],
  practitioner: [
    { to: "/patients", label: "Mes patients", icon: Users },
    { to: "/screening", label: "Suivi clinique", icon: Activity },
    { to: "/messaging", label: "Messagerie", icon: Mail },
    { to: "/reports", label: "Indicateurs", icon: FileText },
    { to: "/settings", label: "Configuration", icon: Settings },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  manager: "Vue gestionnaire",
  patient: "Vue patient",
  practitioner: "Vue praticien",
};

export function Dashboard() {
  const { pathname } = useLocation();
  const { role, setRole, activeProfile } = useAppState();
  const navItems = NAV_ITEMS[role];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-lg">e-SIS</h1>
              <p className="text-xs text-gray-500">EPICONCEPT</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
            <p className="text-xs font-medium text-blue-700">{ROLE_LABELS[role]}</p>
            <p className="text-xs text-blue-600 mt-1">
              Navigation adaptée au profil actif
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive || (pathname === "/" && item.to === "/patients")
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">{activeProfile.initiales}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{activeProfile.nom}</p>
              <p className="text-xs text-gray-500 truncate">{activeProfile.structure}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2">
                  <UserRound className="w-4 h-4" />
                  {activeProfile.fonction}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Changer de vue</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRole("manager")}>
                  Gestionnaire régional
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole("patient")}>
                  Patiente suivie
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole("practitioner")}>
                  Praticienne référente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sortie
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
