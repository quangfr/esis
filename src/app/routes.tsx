import { createHashRouter } from "react-router";
import { Dashboard } from "./components/dashboard";
import { PatientsPage } from "./components/patients-page";
import { MessagingPage } from "./components/messaging-page";
import { ScreeningPage } from "./components/screening-page";
import { ReportsPage } from "./components/reports-page";
import { SettingsPage } from "./components/settings-page";

export const router = createHashRouter([
  {
    path: "/",
    Component: Dashboard,
    children: [
      { index: true, Component: PatientsPage },
      { path: "patients", Component: PatientsPage },
      { path: "messaging", Component: MessagingPage },
      { path: "screening", Component: ScreeningPage },
      { path: "reports", Component: ReportsPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
