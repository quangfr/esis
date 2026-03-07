import { Outlet, NavLink } from "react-router";
import { Users, Mail, Activity, FileText, Settings, Shield } from "lucide-react";

export function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-lg">e-SIS</h1>
              <p className="text-xs text-gray-500">EPICONCEPT</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span>Patients</span>
          </NavLink>

          <NavLink
            to="/screening"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Activity className="w-5 h-5" />
            <span>Dépistage</span>
          </NavLink>

          <NavLink
            to="/messaging"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Mail className="w-5 h-5" />
            <span>Messagerie</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <FileText className="w-5 h-5" />
            <span>Rapports</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span>Paramètres</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">DR</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Dr. Martin Dupont</p>
              <p className="text-xs text-gray-500 truncate">CRDC Île-de-France</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
