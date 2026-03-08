import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  demoDataBundle,
  type MessageThread,
  type Patient,
  type Practitioner,
  type RoleProfile,
  type UserRole,
} from "./data/demo-data";
import {
  createMessageInFakeFirestore,
  createPatientInFakeFirestore,
  updateMessageInFakeFirestore,
  updatePatientInFakeFirestore,
} from "./lib/fake-firestore";
import { loadAppData } from "./lib/remote-data";

export type {
  MessageThread,
  Patient,
  Practitioner,
  RoleProfile,
  ScreeningProgram,
  UserRole,
} from "./data/demo-data";

interface AppStateContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  patients: Patient[];
  practitioners: Practitioner[];
  messages: MessageThread[];
  activeProfile: RoleProfile;
  activePatient: Patient;
  activePractitioner: Practitioner;
  createPatient: (patient: Patient) => Promise<void>;
  updatePatient: (patient: Patient) => Promise<void>;
  createMessage: (message: MessageThread) => Promise<void>;
  updateMessage: (message: MessageThread) => Promise<void>;
  reloadFromStorage: () => Promise<void>;
  isLoading: boolean;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(demoDataBundle.defaultRole);
  const [patients, setPatients] = useState(demoDataBundle.patients);
  const [practitioners, setPractitioners] = useState(demoDataBundle.practitioners);
  const [messages, setMessages] = useState(demoDataBundle.messages);
  const [roleProfiles, setRoleProfiles] = useState(demoDataBundle.roleProfiles);
  const [activePatientId, setActivePatientId] = useState(demoDataBundle.activePatientId);
  const [activePractitionerId, setActivePractitionerId] = useState(demoDataBundle.activePractitionerId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      await reloadFromStorage();
      if (!isCancelled) {
        setIsLoading(false);
      }
    }

    bootstrap().catch((error) => {
      console.error("Bootstrap loading failed", error);
      if (!isCancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  async function reloadFromStorage() {
    const bundle = await loadAppData();
    setRole(bundle.defaultRole);
    setPatients(bundle.patients);
    setPractitioners(bundle.practitioners);
    setMessages(bundle.messages);
    setRoleProfiles(bundle.roleProfiles);
    setActivePatientId(bundle.activePatientId);
    setActivePractitionerId(bundle.activePractitionerId);
  }

  const activePatient =
    patients.find((patient) => patient.id === activePatientId) ?? patients[0] ?? demoDataBundle.patients[0];
  const activePractitioner =
    practitioners.find((practitioner) => practitioner.id === activePractitionerId) ??
    practitioners[0] ??
    demoDataBundle.practitioners[0];

  async function createPatient(patient: Patient) {
    await createPatientInFakeFirestore(patient);
    setPatients((current) => [patient, ...current]);
    setActivePatientId(patient.id);
  }

  async function updatePatient(patient: Patient) {
    await updatePatientInFakeFirestore(patient);
    setPatients((current) => current.map((entry) => (entry.id === patient.id ? patient : entry)));
    setActivePatientId(patient.id);
  }

  async function createMessage(message: MessageThread) {
    await createMessageInFakeFirestore(message);
    setMessages((current) => [message, ...current]);
  }

  async function updateMessage(message: MessageThread) {
    await updateMessageInFakeFirestore(message);
    setMessages((current) => current.map((entry) => (entry.id === message.id ? message : entry)));
  }

  const value = useMemo<AppStateContextValue>(
    () => ({
      role,
      setRole,
      patients,
      practitioners,
      messages,
      activeProfile: roleProfiles[role],
      activePatient,
      activePractitioner,
      createPatient,
      updatePatient,
      createMessage,
      updateMessage,
      reloadFromStorage,
      isLoading,
    }),
    [activePatient, activePractitioner, isLoading, messages, patients, practitioners, role, roleProfiles],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState doit être utilisé dans AppStateProvider");
  }
  return context;
}
