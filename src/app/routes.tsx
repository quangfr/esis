import { createHashRouter } from "react-router";
import { Dashboard } from "./components/dashboard";
import { DataPage } from "./components/data-page";
import { DatasetsPage } from "./components/datasets-page";
import { DocumentationPage } from "./components/documentation-page";
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
      { path: "screening", Component: ScreeningPage },
      { path: "messaging", Component: MessagingPage },
      { path: "reports", Component: ReportsPage },
      { path: "api", Component: DataPage },
      { path: "data", Component: DataPage },
      { path: "donnees", Component: DatasetsPage },
      { path: "documentation", Component: DocumentationPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
