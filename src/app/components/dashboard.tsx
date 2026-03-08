import { NavLink, Outlet, useLocation } from "react-router";
import {
  Activity,
  ChevronDown,
  Database,
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
import { toTestId } from "../lib/test-ids";

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
    { to: "/data", label: "Data", icon: Database },
    { to: "/settings", label: "Paramètres", icon: Settings },
  ],
  patient: [
    { to: "/patients", label: "Mon dossier", icon: Users },
    { to: "/screening", label: "Mon parcours", icon: Activity },
    { to: "/messaging", label: "Messagerie", icon: Mail },
    { to: "/reports", label: "Documents", icon: FileText },
    { to: "/data", label: "Data", icon: Database },
    { to: "/settings", label: "Préférences", icon: Settings },
  ],
  practitioner: [
    { to: "/patients", label: "Mes patients", icon: Users },
    { to: "/screening", label: "Suivi clinique", icon: Activity },
    { to: "/messaging", label: "Messagerie", icon: Mail },
    { to: "/reports", label: "Indicateurs", icon: FileText },
    { to: "/data", label: "Data", icon: Database },
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
      <aside className="group/sidebar w-[75px] hover:w-64 bg-white border-r border-gray-200 flex flex-col transition-[width] duration-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-center gap-3 group-hover/sidebar:justify-start">
            <Shield className="h-10 w-10 text-blue-600 group-hover/sidebar:h-8 group-hover/sidebar:w-8" />
            <div className="min-w-0 opacity-0 -translate-x-2 transition-all duration-200 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100">
              <h1 className="font-bold text-lg">e-SIS</h1>
              <p className="text-xs text-gray-500">EPICONCEPT</p>
            </div>
          </div>
          <div className="mt-2 hidden rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 opacity-0 transition-opacity duration-150 group-hover/sidebar:block group-hover/sidebar:opacity-100">
            <p className="text-xs font-medium text-blue-700">{ROLE_LABELS[role]}</p>
            <p className="text-xs text-blue-600 mt-1">
              Navigation adaptée au profil actif
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                id={toTestId("nav", item.label)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive || (pathname === "/" && item.to === "/patients")
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                title={item.label}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap opacity-0 -translate-x-2 transition-all duration-200 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 space-y-3">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-medium">{activeProfile.initiales}</span>
            </div>
            <div className="flex-1 min-w-0 opacity-0 -translate-x-2 transition-all duration-200 group-hover/sidebar:translate-x-0 group-hover/sidebar:opacity-100">
              <p className="font-medium truncate">{activeProfile.nom}</p>
              <p className="text-xs text-gray-500 truncate">{activeProfile.structure}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 group-hover/sidebar:flex-row">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id="dashboard-role-switcher-button"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                  title={activeProfile.fonction}
                >
                  <UserRound className="w-4 h-4" />
                  <span className="hidden group-hover/sidebar:inline truncate">{activeProfile.fonction}</span>
                  <ChevronDown className="hidden w-4 h-4 group-hover/sidebar:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Changer de vue</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem id="dashboard-role-option-manager" onClick={() => setRole("manager")}>
                  Gestionnaire
                </DropdownMenuItem>
                <DropdownMenuItem id="dashboard-role-option-patient" onClick={() => setRole("patient")}>
                  Patiente suivie
                </DropdownMenuItem>
                <DropdownMenuItem id="dashboard-role-option-practitioner" onClick={() => setRole("practitioner")}>
                  Praticienne référente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              id="dashboard-logout-button"
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
              title="Sortie"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden group-hover/sidebar:inline">Sortie</span>
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
