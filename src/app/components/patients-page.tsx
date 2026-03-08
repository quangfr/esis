import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  Filter,
  FolderPlus,
  HeartPulse,
  Heart,
  Droplets,
  MoreHorizontal,
  Plus,
  Pill,
  Search,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
  FileText,
  Microscope,
} from "lucide-react";
import { toast } from "sonner";
import { useAppState, type Patient, type Practitioner } from "../app-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toTestId } from "../lib/test-ids";

type Program = Patient["programs"][number];
type ProgramDocument = Program["documents"][number];
type ProgramForm = Program["formulaires"][number];

type CreationFlow =
  | "patient"
  | "episode"
  | "task"
  | "practitioner"
  | "enrollment"
  | null;

const FLOW_LABELS: Record<Exclude<CreationFlow, null>, string> = {
  patient: "Nouveau patient",
  episode: "Nouvel épisode",
  task: "Nouvelle tâche",
  practitioner: "Nouveau praticien",
  enrollment: "Nouvel enrôlement",
};

const FLOW_STEPS: Record<Exclude<CreationFlow, null>, string[]> = {
  patient: ["Identité", "Contact", "Vérification", "Validation"],
  episode: ["Patient", "Parcours", "Équipe"],
  task: ["Contexte", "Affectation", "Échéance"],
  practitioner: ["Identité", "Exercice", "Accès"],
  enrollment: ["Canal", "Consentement", "Confirmation"],
};

type WorkflowField =
  | {
      kind: "input" | "date";
      label: string;
      placeholder?: string;
      defaultValue?: string;
    }
  | {
      kind: "select";
      label: string;
      defaultValue?: string;
      options: string[];
    }
  | {
      kind: "textarea";
      label: string;
      placeholder?: string;
      defaultValue?: string;
    };

const FLOW_FIELDS: Record<Exclude<CreationFlow, null>, WorkflowField[][]> = {
  patient: [
    [
      { kind: "input", label: "Nom complet", defaultValue: "Marie Dubois" },
      { kind: "input", label: "NIR", defaultValue: "2 68 03 75 123 456 12" },
      { kind: "date", label: "Date de naissance", defaultValue: "1968-03-15" },
      { kind: "select", label: "Programme principal", defaultValue: "Sein", options: ["Sein", "Colorectal", "Col utérus"] },
    ],
    [
      { kind: "input", label: "Téléphone", defaultValue: "06 12 34 56 78" },
      { kind: "input", label: "Email", defaultValue: "marie.dubois@example.fr" },
      { kind: "select", label: "Canal préféré", defaultValue: "SMS", options: ["SMS", "Email", "Courrier"] },
      { kind: "input", label: "Ville", defaultValue: "Paris" },
    ],
    [
      { kind: "select", label: "Centre de rattachement", defaultValue: "CRDC Île-de-France", options: ["CRDC Île-de-France", "Maison de santé Belleville", "Cabinet République", "Clinique Saint-Louis"] },
      { kind: "select", label: "Couverture", defaultValue: "Assurance active", options: ["Assurance active", "Vérification requise"] },
      { kind: "select", label: "Consentement", defaultValue: "Confirmé", options: ["Confirmé", "En attente", "Refus partiel"] },
      { kind: "textarea", label: "Observations de vérification", defaultValue: "Identité rapprochée avec le NIR et le dossier territorial." },
    ],
    [
      { kind: "input", label: "Référence dossier", defaultValue: "DOSS-2026-1842" },
      { kind: "select", label: "Praticien pressenti", defaultValue: "Dr. Martin Dupont", options: ["Dr. Martin Dupont", "Dr. Sophie Leroy", "Dr. Karim Nguyen", "Dr. Claire Moreau"] },
      { kind: "date", label: "Date cible d'ouverture", defaultValue: "2026-03-12" },
      { kind: "textarea", label: "Résumé de validation", defaultValue: "Patient éligible, canal SMS validé, intégration au prochain lot de convocation." },
    ],
  ],
  episode: [
    [
      { kind: "input", label: "Patient concerné", defaultValue: "Marie Dubois" },
      { kind: "input", label: "Référence épisode", defaultValue: "EP-2026-031" },
      { kind: "select", label: "Type de cancer", defaultValue: "Colorectal", options: ["Sein", "Colorectal", "Col utérus"] },
      { kind: "date", label: "Date d'ouverture", defaultValue: "2026-03-12" },
    ],
    [
      { kind: "select", label: "Statut initial", defaultValue: "Kit envoyé", options: ["Invitation envoyée", "Kit envoyé", "Examen planifié", "Résultats disponibles"] },
      { kind: "input", label: "Prochaine étape", defaultValue: "Validation médicale" },
      { kind: "select", label: "Niveau de risque", defaultValue: "Surveillance rapprochée", options: ["Standard", "Surveillance rapprochée", "Avis spécialisé"] },
      { kind: "textarea", label: "Justification clinique", defaultValue: "FIT positif avec nécessité d'orientation accélérée vers coloscopie." },
    ],
    [
      { kind: "select", label: "Référent médical", defaultValue: "Dr. Karim Nguyen", options: ["Dr. Martin Dupont", "Dr. Sophie Leroy", "Dr. Karim Nguyen", "Dr. Claire Moreau"] },
      { kind: "select", label: "Structure", defaultValue: "Clinique Saint-Louis", options: ["CRDC Île-de-France", "Clinique Saint-Louis", "Maison de santé Belleville", "Cabinet République"] },
      { kind: "date", label: "Date de revue équipe", defaultValue: "2026-03-18" },
      { kind: "textarea", label: "Note d'équipe", defaultValue: "Coordination avec gastro-entérologie et secrétariat anesthésie." },
    ],
  ],
  task: [
    [
      { kind: "input", label: "Titre de la tâche", defaultValue: "Relance patient prioritaire" },
      { kind: "select", label: "Contexte", defaultValue: "Suivi examen", options: ["Suivi examen", "Dossier incomplet", "Résultat à valider", "Relance administrative"] },
      { kind: "select", label: "Priorité", defaultValue: "Haute", options: ["Basse", "Normale", "Haute"] },
      { kind: "textarea", label: "Description", defaultValue: "Confirmer la disponibilité du patient pour l'examen complémentaire." },
    ],
    [
      { kind: "select", label: "Assigné à", defaultValue: "Dr. Nora Diallo", options: ["Dr. Martin Dupont", "Dr. Nora Diallo", "Dr. Karim Nguyen", "Cellule support CRDC"] },
      { kind: "select", label: "Canal d'action", defaultValue: "Téléphone", options: ["Téléphone", "SMS sécurisé", "Email", "Portail patient"] },
      { kind: "input", label: "Patient lié", defaultValue: "Marie Dubois" },
      { kind: "input", label: "Structure", defaultValue: "CRDC Île-de-France" },
    ],
    [
      { kind: "date", label: "Échéance", defaultValue: "2026-03-12" },
      { kind: "select", label: "Statut", defaultValue: "À faire", options: ["À faire", "En cours", "Bloquée", "Terminée"] },
      { kind: "date", label: "Point de contrôle", defaultValue: "2026-03-10" },
      { kind: "textarea", label: "Critère de clôture", defaultValue: "Patient joint et rendez-vous confirmé dans le planning régional." },
    ],
  ],
  practitioner: [
    [
      { kind: "input", label: "Nom du praticien", defaultValue: "Dr. Nora Diallo" },
      { kind: "input", label: "Identifiant interne", defaultValue: "PRO-064" },
      { kind: "select", label: "Spécialité", defaultValue: "Coordination territoriale", options: ["Radiologie", "Médecine générale", "Gastro-entérologie", "Gynécologie", "Coordination territoriale"] },
      { kind: "input", label: "Ville", defaultValue: "Bobigny" },
    ],
    [
      { kind: "select", label: "Structure d'exercice", defaultValue: "CRDC Seine-Saint-Denis", options: ["CRDC Île-de-France", "CRDC Seine-Saint-Denis", "Clinique Saint-Louis", "Cabinet République"] },
      { kind: "select", label: "Charge cible", defaultValue: "Maîtrisée", options: ["Faible", "Maîtrisée", "Élevée"] },
      { kind: "input", label: "Disponibilité", defaultValue: "Créneaux jeudi après-midi" },
      { kind: "textarea", label: "Périmètre d'intervention", defaultValue: "Enrôlements complexes, coordination territoriale et arbitrage des priorités." },
    ],
    [
      { kind: "select", label: "Niveau d'accès", defaultValue: "Accès dossiers + messagerie", options: ["Accès dossiers + messagerie", "Lecture seule", "Gestion régionale", "Support administratif"] },
      { kind: "select", label: "Authentification forte", defaultValue: "Obligatoire", options: ["Obligatoire", "Optionnelle", "À configurer"] },
      { kind: "input", label: "Email professionnel", defaultValue: "nora.diallo@crdc-idf.fr" },
      { kind: "textarea", label: "Restrictions / remarques", defaultValue: "Accès limité aux parcours territoriaux et aux dossiers assignés." },
    ],
  ],
  enrollment: [
    [
      { kind: "select", label: "Canal d'enrôlement", defaultValue: "Portail", options: ["Portail", "Téléphone", "Cabinet", "Campagne"] },
      { kind: "input", label: "Référence enrôlement", defaultValue: "ENR-447" },
      { kind: "input", label: "Patient", defaultValue: "Marie Dubois" },
      { kind: "date", label: "Date de saisie", defaultValue: "2026-03-08" },
    ],
    [
      { kind: "select", label: "Consentement RGPD", defaultValue: "Recueilli", options: ["Recueilli", "À valider", "Refus partiel"] },
      { kind: "select", label: "Consentement médical", defaultValue: "Recueilli", options: ["Recueilli", "À compléter", "En attente"] },
      { kind: "select", label: "Signature", defaultValue: "Électronique", options: ["Électronique", "Papier", "Non requise"] },
      { kind: "textarea", label: "Point d'attention", defaultValue: "Le patient souhaite être relancé uniquement par SMS sécurisé." },
    ],
    [
      { kind: "select", label: "Statut final", defaultValue: "Validé", options: ["Validé", "À valider", "Incomplet"] },
      { kind: "select", label: "Centre cible", defaultValue: "CRDC Île-de-France", options: ["CRDC Île-de-France", "Maison de santé Belleville", "Cabinet République"] },
      { kind: "date", label: "Date de confirmation", defaultValue: "2026-03-09" },
      { kind: "textarea", label: "Résumé de confirmation", defaultValue: "Consentements reçus, orientation validée, prochaine étape programmée." },
    ],
  ],
};

function getStatutColor(statut: Patient["statut"]) {
  switch (statut) {
    case "En attente":
      return "bg-yellow-100 text-yellow-800";
    case "Invité":
      return "bg-blue-100 text-blue-800";
    case "Examen réalisé":
      return "bg-purple-100 text-purple-800";
    case "Résultats disponibles":
      return "bg-green-100 text-green-800";
  }
}

function getRiskColor(risque: Patient["risque"]) {
  switch (risque) {
    case "Prioritaire":
      return "bg-red-100 text-red-700";
    case "Modéré":
      return "bg-orange-100 text-orange-700";
    case "Standard":
      return "bg-emerald-100 text-emerald-700";
  }
}

function getProgramIcon(type: Program["type"]) {
  switch (type) {
    case "Sein":
      return HeartPulse;
    case "Colorectal":
      return Microscope;
    case "Col utérus":
      return ShieldCheck;
  }
}

function getProgramAccent(type: Program["type"]) {
  switch (type) {
    case "Sein":
      return {
        soft: "bg-rose-50 border-rose-100 text-rose-700",
        chip: "bg-rose-100 text-rose-700",
        strong: "text-rose-700",
      };
    case "Colorectal":
      return {
        soft: "bg-amber-50 border-amber-100 text-amber-700",
        chip: "bg-amber-100 text-amber-700",
        strong: "text-amber-700",
      };
    case "Col utérus":
      return {
        soft: "bg-teal-50 border-teal-100 text-teal-700",
        chip: "bg-teal-100 text-teal-700",
        strong: "text-teal-700",
      };
  }
}

function getTimelineColors(statut: Program["parcours"][number]["statut"]) {
  switch (statut) {
    case "Précédent":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "En cours":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Suivant":
      return "border-orange-200 bg-orange-50 text-orange-700";
  }
}

function getTimelineIcon(statut: Program["parcours"][number]["statut"]) {
  switch (statut) {
    case "Précédent":
      return CheckCircle2;
    case "En cours":
      return Activity;
    case "Suivant":
      return ArrowRight;
  }
}

function getDocumentVectorPalette(type: ProgramDocument["type"]) {
  switch (type) {
    case "Compte-rendu":
      return ["#dbeafe", "#93c5fd", "#1d4ed8"];
    case "Résultat biologique":
      return ["#fef3c7", "#f59e0b", "#92400e"];
    case "Préparation examen":
      return ["#dcfce7", "#4ade80", "#166534"];
    case "Consentement":
      return ["#ede9fe", "#8b5cf6", "#5b21b6"];
  }
}

function formatIsoDateToDisplay(value: string) {
  if (!value.includes("-")) {
    return value;
  }

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function splitFullName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return {
    prenom: parts[0] || "Nouveau",
    nom: parts.slice(1).join(" ") || "Patient",
  };
}

function buildNewPatientFromFields(fields: Record<string, string>, practitioners: Practitioner[]): Patient {
  const selectedPractitionerName = fields["Praticien pressenti"] || "Dr. Martin Dupont";
  const selectedPractitioner =
    practitioners.find(
      (practitioner) => `Dr. ${practitioner.prenom} ${practitioner.nom}` === selectedPractitionerName,
    ) ?? practitioners[0];
  const { prenom, nom } = splitFullName(fields["Nom complet"] || "");
  const id = `pt-${Date.now()}`;
  const typeDepistage = (fields["Programme principal"] || "Sein") as Patient["typeDepistage"];
  const canalPrefere = (fields["Canal préféré"] || "SMS") as Patient["canalPrefere"];
  const couverture = (fields["Couverture"] || "Assurance active") as Patient["couverture"];
  const centre = fields["Centre de rattachement"] || "CRDC Île-de-France";
  const today = new Date().toISOString().slice(0, 10);

  return {
    id,
    nom,
    prenom,
    dateNaissance: formatIsoDateToDisplay(fields["Date de naissance"] || "1968-03-15"),
    nir: fields.NIR || `2 68 03 75 ${String(Date.now()).slice(-3)} 456 12`,
    typeDepistage,
    statut: "En attente",
    derniereVisite: formatIsoDateToDisplay(today),
    prochainRappel: formatIsoDateToDisplay(fields["Date cible d'ouverture"] || today),
    praticienId: selectedPractitioner?.id || "pr-1",
    centre,
    ville: fields.Ville || "Paris",
    telephone: fields.Téléphone || "06 12 34 56 78",
    email: fields.Email || `${prenom.toLowerCase()}.${nom.toLowerCase().replace(/\s+/g, "-")}@example.fr`,
    risque: "Standard",
    canalPrefere,
    couverture,
    progression: 10,
    medecinTraitant: selectedPractitioner
      ? `Dr. ${selectedPractitioner.prenom} ${selectedPractitioner.nom}`
      : "Dr. Martin Dupont",
    groupeSanguin: "O+",
    allergies: ["Aucune allergie connue"],
    antecedents: [fields["Observations de vérification"] || "Aucun antécédent structurant renseigné"],
    traitements: ["Aucun traitement chronique"],
    constantes: {
      imc: "23.0",
      tension: "12/8",
      frequenceCardiaque: "68 bpm",
      saturation: "98%",
    },
    situationCourante: fields["Résumé de validation"] || "Dossier nouvellement créé dans le parcours de démonstration.",
    episodes: [
      {
        id: `ep-${id}-1`,
        type: typeDepistage,
        statut: "Invitation envoyée",
        dateOuverture: formatIsoDateToDisplay(fields["Date cible d'ouverture"] || today),
        prochaineEtape: "Validation médicale",
      },
    ],
    tasks: [],
    enrollments: [
      {
        id: `enr-${id}-1`,
        canal: "Portail",
        statut: "Validé",
        date: formatIsoDateToDisplay(today),
        consentement: true,
      },
    ],
    programs: [],
  };
}

function CreationWorkflowDialog({
  flow,
  practitioners,
  onCreatePatient,
  onClose,
}: {
  flow: CreationFlow;
  practitioners: Practitioner[];
  onCreatePatient: (patient: Patient) => Promise<void>;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (!flow) {
    return null;
  }

  const steps = FLOW_STEPS[flow];
  const stepFields = FLOW_FIELDS[flow][step];
  const isLast = step === steps.length - 1;
  const resolvedFields = stepFields.map((field) => ({
    ...field,
    value: fieldValues[field.label] ?? field.defaultValue ?? "",
  }));

  async function handleNext() {
    if (!isLast) {
      setStep(step + 1);
      return;
    }

    if (flow !== "patient") {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onCreatePatient(buildNewPatientFromFields(fieldValues, practitioners));
      toast.success("Patient créé", {
        description: "Le nouveau dossier a été enregistré dans IndexedDB.",
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent id={toTestId("patients-flow-dialog", flow)} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle id={toTestId("patients-flow-dialog-title", flow)}>{FLOW_LABELS[flow]}</DialogTitle>
          <DialogDescription id={toTestId("patients-flow-dialog-description", flow)}>
            Parcours guidé en plusieurs étapes pour conserver le même niveau de qualité de saisie.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((label, index) => (
              <div
                key={label}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  index === step
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : index < step
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <div className="text-xs uppercase tracking-wide">Étape {index + 1}</div>
                <div className="mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {resolvedFields.map((field) => (
              <WorkflowFieldInput
                key={`${flow}-${step}-${field.label}`}
                field={field}
                onChange={(value) =>
                  setFieldValues((current) => ({
                    ...current,
                    [field.label]: value,
                  }))
                }
              />
            ))}
          </div>

          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">Contrôles automatiques</p>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Doublons détectés et vérifiés
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Consentement et couverture préparés pour validation
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Affectation proposée selon la charge praticien
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            id={toTestId("patients-flow-back-button", flow, step)}
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
          >
            {step === 0 ? "Annuler" : "Retour"}
          </button>
          <button
            id={toTestId("patients-flow-next-button", flow, step)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => void handleNext()}
            disabled={isSaving}
          >
            {isLast ? (isSaving ? "Création..." : "Créer") : "Continuer"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ManagerWorkspace({
  patients,
  practitioners,
  onUpdatePatient,
  onOpenFlow,
}: {
  patients: Patient[];
  practitioners: Practitioner[];
  onUpdatePatient: (patient: Patient) => Promise<void>;
  onOpenFlow: (flow: Exclude<CreationFlow, null>) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient>(patients[0]);
  const [editStatus, setEditStatus] = useState<Patient["statut"]>(patients[0]?.statut ?? "En attente");
  const [editPhone, setEditPhone] = useState(patients[0]?.telephone ?? "");
  const [editCity, setEditCity] = useState(patients[0]?.ville ?? "");

  useEffect(() => {
    if (!selectedPatient && patients[0]) {
      setSelectedPatient(patients[0]);
    }
  }, [patients, selectedPatient]);

  useEffect(() => {
    if (!selectedPatient) {
      return;
    }

    const refreshed = patients.find((patient) => patient.id === selectedPatient.id) ?? selectedPatient;
    setSelectedPatient(refreshed);
    setEditStatus(refreshed.statut);
    setEditPhone(refreshed.telephone);
    setEditCity(refreshed.ville);
  }, [patients, selectedPatient?.id]);

  const filteredPatients = useMemo(
    () =>
      patients.filter(
        (patient) =>
          patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.nir.includes(searchTerm),
      ),
    [patients, searchTerm],
  );

  const urgentPatients = patients.filter((patient) => patient.risque === "Prioritaire").length;
  const pendingTasks = patients.flatMap((patient) => patient.tasks).filter((task) => task.statut !== "Terminée");
  const pendingEnrollments = patients
    .flatMap((patient) => patient.enrollments)
    .filter((enrollment) => enrollment.statut !== "Validé");
  const selectedPractitioner = practitioners.find(
    (practitioner) => practitioner.id === selectedPatient.praticienId,
  );

  return (
    <div id="patients-manager-page" className="h-full flex flex-col">
      <div id="patients-manager-header" className="bg-white border-b border-gray-200 px-6 py-4 space-y-3">
        <div id="patients-manager-header-top" className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pilotage des parcours patients</h1>
            <p className="text-gray-500 mt-1">
              Vue gestionnaire enrichie avec enrôlement, suivi opérationnel et orchestration des équipes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            <button id="patients-export-button" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button
              id="patients-create-patient-button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              onClick={() => onOpenFlow("patient")}
            >
              <Plus className="w-4 h-4" />
              Nouveau patient
            </button>
          </div>
        </div>

        <div id="patients-manager-quick-actions" className="grid grid-cols-5 gap-3">
          <QuickActionCard icon={UserPlus} title="Nouveau patient" onClick={() => onOpenFlow("patient")} />
          <QuickActionCard icon={FolderPlus} title="Nouvel épisode" onClick={() => onOpenFlow("episode")} />
          <QuickActionCard icon={ClipboardList} title="Nouvelle tâche" onClick={() => onOpenFlow("task")} />
          <QuickActionCard icon={Stethoscope} title="Nouveau praticien" onClick={() => onOpenFlow("practitioner")} />
          <QuickActionCard icon={ShieldCheck} title="Nouvel enrôlement" onClick={() => onOpenFlow("enrollment")} />
        </div>

        <div id="patients-manager-filters-row" className="flex gap-3">
          <div id="patients-manager-search-card" className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="patients-search-input"
              type="text"
              placeholder="Rechercher par nom, prénom ou NIR..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <button id="patients-filters-button" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>
      </div>

      <div id="patients-manager-content" className="flex-1 overflow-auto p-6">
        <div id="patients-manager-layout" className="grid grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] gap-4">
          <div id="patients-manager-primary-column" className="space-y-4">
            <div id="patients-manager-kpi-section" className="bg-white rounded-lg border border-gray-200 px-6 py-3">
              <div className="grid grid-cols-4 gap-4">
                <KpiCard id="patients-manager-kpi-followed" label="Patients suivis" value={String(patients.length)} accent="text-gray-900" />
                <KpiCard id="patients-manager-kpi-priority" label="Patients prioritaires" value={String(urgentPatients)} accent="text-red-600" />
                <KpiCard id="patients-manager-kpi-open-tasks" label="Tâches ouvertes" value={String(pendingTasks.length)} accent="text-orange-600" />
                <KpiCard
                  id="patients-manager-kpi-pending-enrollments"
                  label="Enrôlements à valider"
                  value={String(pendingEnrollments.length)}
                  accent="text-blue-600"
                />
              </div>
            </div>

            <div id="patients-manager-patients-table-card" className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risque
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prochain rappel
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.slice(0, 16).map((patient) => (
                    <tr
                      key={patient.id}
                      id={toTestId("patients-row", patient.id)}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedPatient.id === patient.id ? "bg-blue-50/60" : ""
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {patient.nom} {patient.prenom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.ville} • {patient.centre}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{patient.typeDepistage}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getStatutColor(patient.statut)}`}>
                          {patient.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getRiskColor(patient.risque)}`}>
                          {patient.risque}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{patient.prochainRappel}</td>
                      <td className="px-4 py-3 text-right">
                        <button id={toTestId("patients-row-actions-button", patient.id)} className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div id="patients-manager-queues-section" className="grid grid-cols-2 gap-4">
              <QueueCard
                id="patients-manager-open-tasks-card"
                title="Tâches à traiter"
                items={pendingTasks.slice(0, 4).map((task) => `${task.titre} • ${task.echeance}`)}
              />
              <QueueCard
                id="patients-manager-enrollments-card"
                title="Enrôlements récents"
                items={pendingEnrollments
                  .slice(0, 4)
                  .map((enrollment) => `${enrollment.canal} • ${enrollment.statut}`)}
              />
            </div>
          </div>

          <div id="patients-manager-secondary-column" className="space-y-4">
            <div id="patients-manager-patient-detail-card" className="bg-white rounded-lg border border-gray-200 p-4">
              <div id="patients-manager-patient-detail-header" className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedPatient.nom} {selectedPatient.prenom}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedPatient.dateNaissance} • {selectedPatient.telephone}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(selectedPatient.statut)}`}>
                  {selectedPatient.statut}
                </span>
              </div>

              <div id="patients-manager-patient-summary" className="mt-6 space-y-4">
                <DetailRow label="NIR" value={selectedPatient.nir} />
                <DetailRow
                  label="Praticien"
                  value={
                    selectedPractitioner
                      ? `Dr. ${selectedPractitioner.prenom} ${selectedPractitioner.nom}`
                      : "Non affecté"
                  }
                />
                <DetailRow label="Canal préféré" value={selectedPatient.canalPrefere} />
                <DetailRow label="Couverture" value={selectedPatient.couverture} />
              </div>

              <div id="patients-manager-patient-edit-card" className="mt-6 rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">Modifier la fiche</p>
                <div className="mt-3 grid gap-3">
                  <label className="space-y-1 text-sm text-gray-700">
                    <span className="font-medium">Statut</span>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      value={editStatus}
                      onChange={(event) => setEditStatus(event.target.value as Patient["statut"])}
                    >
                      <option>En attente</option>
                      <option>Invité</option>
                      <option>Examen réalisé</option>
                      <option>Résultats disponibles</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-sm text-gray-700">
                    <span className="font-medium">Téléphone</span>
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      value={editPhone}
                      onChange={(event) => setEditPhone(event.target.value)}
                    />
                  </label>
                  <label className="space-y-1 text-sm text-gray-700">
                    <span className="font-medium">Ville</span>
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      value={editCity}
                      onChange={(event) => setEditCity(event.target.value)}
                    />
                  </label>
                  <button
                    id="patients-manager-save-patient-button"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    onClick={() =>
                      void onUpdatePatient({
                        ...selectedPatient,
                        statut: editStatus,
                        telephone: editPhone,
                        ville: editCity,
                      }).then(() =>
                        toast.success("Modifications enregistrées", {
                          description: "La fiche patient a été mise à jour dans IndexedDB.",
                        }),
                      )
                    }
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>

              <div id="patients-manager-patient-progress" className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progression du parcours</span>
                  <span>{selectedPatient.progression}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${selectedPatient.progression}%` }}
                  />
                </div>
              </div>

              <div id="patients-manager-patient-activity" className="mt-6 space-y-3">
                <SectionTitle title="Épisodes" />
                {selectedPatient.episodes.map((episode) => (
                  <InfoTile
                    key={episode.id}
                    title={`${episode.type} • ${episode.statut}`}
                    subtitle={`${episode.dateOuverture} • ${episode.prochaineEtape}`}
                  />
                ))}
                <SectionTitle title="Tâches" />
                {selectedPatient.tasks.map((task) => (
                  <InfoTile key={task.id} title={task.titre} subtitle={`${task.statut} • ${task.echeance}`} />
                ))}
              </div>
            </div>

            <div id="patients-manager-practitioner-load-card" className="bg-white rounded-lg border border-gray-200 p-4">
              <SectionTitle title="Charge praticiens" />
              <div id="patients-manager-practitioner-load-list" className="space-y-3 mt-4">
                {practitioners.slice(0, 4).map((practitioner) => (
                  <div
                    id={toTestId("patients-manager-practitioner-load-row", practitioner.id)}
                    key={practitioner.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Dr. {practitioner.prenom} {practitioner.nom}
                      </p>
                      <p className="text-sm text-gray-500">{practitioner.specialite}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{practitioner.patientsActifs}</p>
                      <p className="text-xs text-gray-500">{practitioner.charge}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VectorDocumentIllustration({
  document,
}: {
  document: ProgramDocument;
}) {
  const [background, mid, strong] = getDocumentVectorPalette(document.type);

  return (
    <svg viewBox="0 0 320 220" className="h-full w-full rounded-xl">
      <rect x="0" y="0" width="320" height="220" rx="18" fill={background} />
      <path d="M24 182 C88 116, 130 210, 202 138 S286 120, 300 86" fill="none" stroke={mid} strokeWidth="10" strokeLinecap="round" />
      <circle cx="86" cy="90" r="24" fill={mid} opacity="0.45" />
      <circle cx="226" cy="74" r="14" fill={strong} opacity="0.8" />
      <rect x="30" y="26" width="114" height="18" rx="9" fill="#ffffff" opacity="0.8" />
      <rect x="30" y="54" width="168" height="12" rx="6" fill="#ffffff" opacity="0.7" />
      <rect x="30" y="150" width="120" height="10" rx="5" fill="#ffffff" opacity="0.85" />
      <rect x="30" y="168" width="170" height="10" rx="5" fill="#ffffff" opacity="0.7" />
      <rect x="190" y="120" width="88" height="56" rx="14" fill="#ffffff" opacity="0.84" />
      <path d="M206 148h55" stroke={strong} strokeWidth="8" strokeLinecap="round" />
      <path d="M206 164h34" stroke={mid} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

function DocumentPreviewDialog({
  document,
  onClose,
}: {
  document: ProgramDocument | null;
  onClose: () => void;
}) {
  if (!document) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent id="patients-document-dialog" className="max-w-3xl">
        <DialogHeader>
          <DialogTitle id="patients-document-dialog-title">{document.titre}</DialogTitle>
          <DialogDescription id="patients-document-dialog-description">
            Aperçu document factice avec données simulées pour la démonstration produit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[1.2fr_minmax(260px,1fr)] gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center justify-between text-xs text-blue-700">
                <span>CRDC Île-de-France</span>
                <span>{document.date}</span>
              </div>
              <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{document.type}</p>
                    <p className="text-sm text-gray-500">{document.statut}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <VectorDocumentIllustration document={document} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <p className="text-gray-500">Indicateur</p>
                      <p className="mt-1 font-semibold text-gray-900">{document.indicateur}</p>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <p className="text-gray-500">Auteur</p>
                      <p className="mt-1 font-semibold text-gray-900">{document.auteur}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Résumé clinique simulé</p>
              <p className="mt-2 font-medium text-gray-900">{document.aperçu}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-900">Métadonnées</p>
              <div className="mt-3 space-y-3 text-sm">
                <DetailRow label="Type" value={document.type} />
                <DetailRow label="Date" value={document.date} />
                <DetailRow label="Statut" value={document.statut} />
                <DetailRow label="Indicateur" value={document.indicateur} />
                <DetailRow label="Auteur" value={document.auteur} />
                <DetailRow label="Accès" value="Authentification forte requise" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button id="patients-document-close-button" className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50" onClick={onClose}>
            Fermer
          </button>
          <button id="patients-document-download-button" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={onClose}>
            Télécharger
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormPreviewDialog({
  formulaire,
  program,
  onClose,
}: {
  formulaire: ProgramForm | null;
  program: Program | null;
  onClose: () => void;
}) {
  if (!formulaire || !program) {
    return null;
  }

  const accent = getProgramAccent(program.type);
  const Icon = getProgramIcon(program.type);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent id="patients-form-dialog" className="max-w-3xl">
        <DialogHeader>
          <DialogTitle id="patients-form-dialog-title">{formulaire.titre}</DialogTitle>
          <DialogDescription id="patients-form-dialog-description">Modal factice de renseignement pour illustrer la saisie patient avant examen.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[1.15fr_minmax(260px,1fr)]">
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 ${accent.soft}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80">
                  <Icon className={`h-5 w-5 ${accent.strong}`} />
                </div>
                <div>
                  <p className="text-sm">Programme {program.type}</p>
                  <p className="font-semibold text-gray-900">{formulaire.description}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FakeField label="Date de contact" value="08/03/2026" />
              <FakeField label="Centre de prise en charge" value="CRDC Île-de-France" />
              <FakeField label="Canal utilisé" value="Portail sécurisé" />
              <FakeField label="Référent dossier" value="Dr. Martin Dupont" />
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-900">Champs simulés</p>
              <div className="mt-3 space-y-3">
                {formulaire.champs.map((champ, index) => (
                  <label key={champ} id={toTestId("patients-form-field-label", formulaire.id, champ)} className="block space-y-2 text-sm text-gray-700">
                    <span id={toTestId("patients-form-field-label-text", formulaire.id, champ)} className="font-medium">{champ}</span>
                    <input
                      id={toTestId("patients-form-field-input", formulaire.id, index)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={
                        index === 0
                          ? "Renseigné automatiquement"
                          : index === 1
                          ? "À confirmer avec le patient"
                          : "Exemple de valeur"
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Contrôles avant validation</p>
              <div className="mt-3 space-y-3 text-sm text-gray-700">
                <ChecklistLine text="Pièces justificatives simulées présentes" />
                <ChecklistLine text="Consentement cohérent avec le parcours en cours" />
                <ChecklistLine text="Pré-requis d'examen revus avec le patient" />
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-gray-300 p-4">
              <p className="text-sm font-semibold text-gray-900">État du formulaire</p>
              <p className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {formulaire.statut}
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Cette modal est volontairement fictive: elle simule la saisie structurée et la validation métier.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button id="patients-form-close-button" className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50" onClick={onClose}>
            Fermer
          </button>
          <button
            id="patients-form-save-button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => {
              toast.success("Simulation enregistrée", {
                description: "La démonstration de formulaire a bien été validée.",
              });
              onClose();
            }}
          >
            Enregistrer la simulation
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PatientWorkspace({ patient }: { patient: Patient }) {
  const [selectedDocument, setSelectedDocument] = useState<ProgramDocument | null>(null);
  const [selectedForm, setSelectedForm] = useState<{ formulaire: ProgramForm; program: Program } | null>(null);

  return (
    <>
      <div id="patients-patient-page" className="h-full flex flex-col overflow-auto">
      <div id="patients-patient-header" className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Mon dossier de dépistage</h1>
          <p className="text-gray-500 mt-1">
            Parcours détaillé par type de cancer avec résultats, documents cliquables et formulaires de préparation d'examens.
          </p>
        </div>

        <div id="patients-patient-content" className="p-6 space-y-4">
          <div id="patients-patient-layout" className="grid grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-4">
            <div id="patients-patient-primary-column" className="space-y-4">
              <div id="patients-patient-overview-card" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div id="patients-patient-overview-header" className="border-b border-slate-200 bg-slate-50 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                        <Activity className="h-3.5 w-3.5 text-blue-600" />
                        Parcours courant
                      </div>
                      <h2 className="mt-4 text-lg font-bold text-gray-900">
                        {patient.prenom} {patient.nom}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">Prochain rappel le {patient.prochainRappel}</p>
                      <p className="mt-3 max-w-2xl text-sm text-slate-700">{patient.situationCourante}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatutColor(patient.statut)}`}>
                      {patient.statut}
                    </span>
                  </div>

                  <div id="patients-patient-metrics-section" className="mt-6 grid grid-cols-4 gap-4">
                    <PatientMetric icon={HeartPulse} title="Programme principal" value={patient.typeDepistage} />
                    <PatientMetric icon={Calendar} title="Dernière visite" value={patient.derniereVisite} />
                    <PatientMetric icon={ShieldCheck} title="Consentement" value="Confirmé" />
                    <PatientMetric icon={Clock3} title="Progression" value={`${patient.progression}%`} />
                  </div>
                </div>

                <div id="patients-patient-medical-info-section" className="grid gap-4 p-6 md:grid-cols-4">
                  <MedicalInfoCard icon={Heart} label="Médecin traitant" value={patient.medecinTraitant} />
                  <MedicalInfoCard icon={Droplets} label="Groupe sanguin" value={patient.groupeSanguin} />
                  <MedicalInfoCard icon={Pill} label="Traitement courant" value={patient.traitements[0]} />
                  <MedicalInfoCard icon={AlertTriangle} label="Allergies" value={patient.allergies.join(", ")} />
                </div>

                <div id="patients-patient-clinical-context-section" className="grid gap-6 border-t border-slate-100 p-6 md:grid-cols-[1.15fr_minmax(0,1fr)]">
                  <div id="patients-patient-vitals-card" className="rounded-xl border border-slate-200 p-4">
                    <SectionTitle title="Constantes et contexte courant" />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <VitalChip icon={Activity} label="IMC" value={patient.constantes.imc} />
                      <VitalChip icon={HeartPulse} label="Tension" value={patient.constantes.tension} />
                      <VitalChip icon={Heart} label="FC" value={patient.constantes.frequenceCardiaque} />
                      <VitalChip icon={ShieldCheck} label="SpO2" value={patient.constantes.saturation} />
                    </div>
                  </div>

                  <div id="patients-patient-history-card" className="rounded-xl border border-slate-200 p-4">
                    <SectionTitle title="Antécédents et surveillance" />
                    <div className="mt-4 space-y-3">
                      {patient.antecedents.map((item) => (
                        <TagLine key={item} icon={ChevronRight} text={item} />
                      ))}
                      {patient.traitements.map((item) => (
                        <TagLine key={item} icon={Pill} text={item} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div id="patients-patient-programs-card" className="bg-white rounded-lg border border-gray-200 p-4">
                <Tabs defaultValue={patient.programs[0].type}>
                  <TabsList className="w-full grid grid-cols-3">
                    {patient.programs.map((program) => {
                      const Icon = getProgramIcon(program.type);
                      const accent = getProgramAccent(program.type);
                      return (
                        <TabsTrigger id={toTestId("patients-program-tab", program.type)} key={program.type} value={program.type} className="gap-2">
                          <Icon className={`h-4 w-4 ${accent.strong}`} />
                          {program.type}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {patient.programs.map((program) => {
                    const Icon = getProgramIcon(program.type);
                    const accent = getProgramAccent(program.type);

                    return (
                      <TabsContent key={program.type} value={program.type} className="mt-6 space-y-6">
                        <div id={toTestId("patients-program-summary-section", program.type)} className="grid grid-cols-3 gap-4">
                          <InfoTile title="Niveau de surveillance" subtitle={program.niveauRisque} />
                          <InfoTile title="Résultat clé" subtitle={program.resultatCle} />
                          <InfoTile title="Prochain examen" subtitle={program.prochainExamen} />
                        </div>

                        <div id={toTestId("patients-program-regional-insight-card", program.type)} className={`rounded-xl border p-4 ${accent.soft}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80">
                              <Icon className={`h-5 w-5 ${accent.strong}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Lecture programme régional</p>
                              <p className="mt-2 text-sm">{program.tendanceRegionale}</p>
                            </div>
                          </div>
                        </div>

                        <div id={toTestId("patients-program-timeline-card", program.type)} className="rounded-xl border border-slate-200 p-5">
                          <div className="flex items-center justify-between gap-4">
                            <SectionTitle title="Timeline du parcours" />
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${accent.chip}`}>
                              {program.type}
                            </span>
                          </div>
                          <div className="mt-5 grid gap-4 md:grid-cols-3">
                            {program.parcours.map((step, index) => {
                              const StepIcon = getTimelineIcon(step.statut);
                              return (
                                <div key={step.id} className={`rounded-xl border p-4 ${getTimelineColors(step.statut)}`}>
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <StepIcon className="h-4 w-4" />
                                      <span className="text-xs font-semibold uppercase tracking-wide">{step.statut}</span>
                                    </div>
                                    <span className="text-xs">{step.periode}</span>
                                  </div>
                                  <p className="mt-4 font-semibold text-gray-900">{step.titre}</p>
                                  <p className="mt-2 text-sm text-slate-700">{step.detail}</p>
                                  {index < program.parcours.length - 1 ? (
                                    <div className="mt-4 hidden items-center gap-2 text-xs md:flex">
                                      <span className="h-px flex-1 bg-current/25" />
                                      <ArrowRight className="h-3.5 w-3.5" />
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div id={toTestId("patients-program-assets-layout", program.type)} className="grid grid-cols-[1.1fr_minmax(0,1fr)] gap-6">
                          <div id={toTestId("patients-program-documents-section", program.type)} className="space-y-4">
                            <SectionTitle title="Documents de résultats" />
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                              {program.documents.map((document) => (
                                <button
                                  key={document.id}
                                  id={toTestId("patients-document-button", program.type, document.id)}
                                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left hover:bg-white hover:shadow-sm transition-all"
                                  onClick={() => setSelectedDocument(document)}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="w-[220px] shrink-0 rounded-lg bg-white border border-gray-200 p-3">
                                      <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{document.type}</span>
                                        <span>{document.date}</span>
                                      </div>
                                      <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
                                        <VectorDocumentIllustration document={document} />
                                      </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-3">
                                        <p className="font-medium text-gray-900">{document.titre}</p>
                                        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-medium text-gray-600">
                                          {document.indicateur}
                                        </span>
                                      </div>
                                      <p className="mt-2 text-sm text-gray-500">{document.aperçu}</p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div id={toTestId("patients-program-forms-section", program.type)} className="space-y-4">
                            <SectionTitle title="Formulaires de préparation" />
                            <div className="space-y-3">
                              {program.formulaires.map((formulaire) => (
                                <button
                                  key={formulaire.id}
                                  id={toTestId("patients-form-button", program.type, formulaire.id)}
                                  className="w-full rounded-xl border border-gray-200 px-4 py-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50/50"
                                  onClick={() => setSelectedForm({ formulaire, program })}
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div>
                                      <p className="font-medium text-gray-900">{formulaire.titre}</p>
                                      <p className="text-sm text-gray-500 mt-1">{formulaire.description}</p>
                                    </div>
                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                      {formulaire.statut}
                                    </span>
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {formulaire.champs.slice(0, 3).map((champ) => (
                                      <span key={champ} className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-gray-600">
                                        {champ}
                                      </span>
                                    ))}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div id={toTestId("patients-program-bottom-section", program.type)} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
                          <div id={toTestId("patients-program-exams-card", program.type)} className="rounded-lg border border-gray-200 p-4">
                            <SectionTitle title="Examens proposés selon les résultats" />
                            <div className="mt-4 space-y-3">
                              {program.examensProposes.map((examen) => (
                                <div key={examen.nom} className="rounded-lg bg-gray-50 px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Microscope className="w-4 h-4 text-blue-600" />
                                    <p className="font-medium text-gray-900">{examen.nom}</p>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-2">{examen.justification}</p>
                                  <p className="text-sm font-medium text-blue-700 mt-2">{examen.resultat}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div id={toTestId("patients-program-history-card", program.type)} className="rounded-lg border border-gray-200 p-4">
                            <SectionTitle title="Historique et expertise régionale" />
                            <div className="mt-4 space-y-3">
                              {program.historique.map((item) => (
                                <div key={item} className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>
            </div>

            <div id="patients-patient-secondary-column" className="space-y-4">
              <div id="patients-patient-actions-card" className="bg-white rounded-lg border border-gray-200 p-4">
                <SectionTitle title="Actions à finaliser" />
                <div className="mt-4 space-y-3">
                  {[
                    { title: "Confirmer mes coordonnées", done: true },
                    { title: "Compléter le formulaire coloscopie si FIT positif", done: false },
                    { title: "Télécharger les résultats avant consultation", done: false },
                  ].map((step) => (
                    <div key={step.title} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className={`w-5 h-5 ${step.done ? "text-green-600" : "text-gray-300"}`} />
                        <span className="text-sm font-medium text-gray-900">{step.title}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div id="patients-patient-contact-card" className="bg-white rounded-lg border border-gray-200 p-4">
                <SectionTitle title="Contact référent" />
                <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-4">
                  <p className="font-medium text-gray-900">Dr. Martin Dupont</p>
                  <p className="text-sm text-gray-600 mt-1">CRDC Île-de-France</p>
                  <p className="text-sm text-blue-700 mt-3">Réponse moyenne: moins de 24h</p>
                </div>
              </div>

              <div id="patients-patient-preferences-card" className="bg-white rounded-lg border border-gray-200 p-4">
                <SectionTitle title="Mes préférences" />
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <DetailRow label="Canal préféré" value={patient.canalPrefere} />
                  <DetailRow label="Ville" value={patient.ville} />
                  <DetailRow label="Couverture" value={patient.couverture} />
                </div>
              </div>

              <div id="patients-patient-reference-card" className="bg-white rounded-lg border border-gray-200 p-4">
                <SectionTitle title="Repères médicaux" />
                <div className="mt-4 space-y-3">
                  <InfoTile title="Épisodes ouverts" subtitle={`${patient.episodes.length} suivi(s) en cours`} />
                  <InfoTile title="Tâches cliniques" subtitle={`${patient.tasks.length} action(s) associée(s)`} />
                  <InfoTile title="Enrôlement" subtitle={`${patient.enrollments[0]?.canal ?? "Portail"} • ${patient.enrollments[0]?.statut ?? "Validé"}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DocumentPreviewDialog document={selectedDocument} onClose={() => setSelectedDocument(null)} />
      <FormPreviewDialog
        formulaire={selectedForm?.formulaire ?? null}
        program={selectedForm?.program ?? null}
        onClose={() => setSelectedForm(null)}
      />
    </>
  );
}

function PractitionerWorkspace({
  practitioner,
  patients,
}: {
  practitioner: Practitioner;
  patients: Patient[];
}) {
  const assignedPatients = patients.filter((patient) => patient.praticienId === practitioner.id);

  return (
    <div id="patients-practitioner-page" className="h-full flex flex-col overflow-auto">
      <div id="patients-practitioner-header" className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Ma file active</h1>
        <p className="text-gray-500 mt-1">
          Vue praticien centrée sur les suivis à effectuer, les risques, et les prochaines actions cliniques.
        </p>
      </div>

      <div id="patients-practitioner-content" className="p-6 space-y-4">
        <div id="patients-practitioner-kpi-section" className="grid grid-cols-4 gap-4">
          <KpiCard id="patients-practitioner-kpi-active-patients" label="Patients actifs" value={String(assignedPatients.length)} accent="text-gray-900" />
          <KpiCard
            id="patients-practitioner-kpi-priority-followups"
            label="Relances prioritaires"
            value={String(assignedPatients.filter((patient) => patient.risque === "Prioritaire").length)}
            accent="text-red-600"
          />
          <KpiCard
            id="patients-practitioner-kpi-planned-exams"
            label="Examens planifiés"
            value={String(assignedPatients.filter((patient) => patient.statut === "Invité").length)}
            accent="text-blue-600"
          />
          <KpiCard id="patients-practitioner-kpi-load" label="Charge" value={practitioner.charge} accent="text-emerald-600" />
        </div>

        <div id="patients-practitioner-layout" className="grid grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] gap-4">
          <div id="patients-practitioner-followup-list-card" className="bg-white rounded-lg border border-gray-200 p-4">
            <SectionTitle title="Patients à suivre aujourd'hui" />
            <div id="patients-practitioner-followup-list" className="mt-4 space-y-3">
              {assignedPatients.slice(0, 8).map((patient) => (
                <div
                  id={toTestId("patients-practitioner-followup-row", patient.id)}
                  key={patient.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {patient.prenom} {patient.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {patient.typeDepistage} • {patient.prochainRappel}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(patient.risque)}`}>
                      {patient.risque}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="patients-practitioner-secondary-column" className="space-y-4">
            <div id="patients-practitioner-assignments-card" className="bg-white rounded-lg border border-gray-200 p-4">
              <SectionTitle title="Affectations" />
              <div className="mt-4 space-y-3">
                <InfoTile title={practitioner.structure} subtitle={practitioner.specialite} />
                <InfoTile title={`${practitioner.patientsActifs} patients actifs`} subtitle={practitioner.disponibilite} />
              </div>
            </div>
            <div id="patients-practitioner-checklist-card" className="bg-white rounded-lg border border-gray-200 p-4">
              <SectionTitle title="Checklist de la journée" />
              <div className="mt-4 space-y-3">
                <InfoTile title="Valider 3 résultats" subtitle="Avant 14:00" />
                <InfoTile title="Envoyer 5 relances" subtitle="Par SMS sécurisé" />
                <InfoTile title="Clôturer 2 enrôlements" subtitle="Consentement reçu" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  onClick,
}: {
  icon: typeof Users;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      id={toTestId("patients-quick-action-button", title)}
      className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <span className="text-sm font-medium text-gray-900">{title}</span>
      </div>
    </button>
  );
}

function WorkflowFieldInput({
  field,
  onChange,
}: {
  field: WorkflowField & { value?: string };
  onChange: (value: string) => void;
}) {
  if (field.kind === "select") {
    return (
      <label id={toTestId("patients-workflow-label", field.label)} className="space-y-2 text-sm text-gray-700">
        <span id={toTestId("patients-workflow-label-text", field.label)} className="font-medium">{field.label}</span>
        <select
          id={toTestId("patients-workflow-select", field.label)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={field.value ?? field.defaultValue ?? ""}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.kind === "textarea") {
    return (
      <label id={toTestId("patients-workflow-label", field.label)} className="col-span-2 space-y-2 text-sm text-gray-700">
        <span id={toTestId("patients-workflow-label-text", field.label)} className="font-medium">{field.label}</span>
        <textarea
          id={toTestId("patients-workflow-textarea", field.label)}
          className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={field.placeholder}
          value={field.value ?? field.defaultValue ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  }

  return (
    <label id={toTestId("patients-workflow-label", field.label)} className="space-y-2 text-sm text-gray-700">
      <span id={toTestId("patients-workflow-label-text", field.label)} className="font-medium">{field.label}</span>
      <input
        id={toTestId("patients-workflow-input", field.label)}
        type={field.kind === "date" ? "date" : "text"}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={field.placeholder}
        value={field.value ?? field.defaultValue ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-lg font-bold text-gray-900">{title}</h2>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

function InfoTile({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-4 py-3">
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function QueueCard({ id, title, items }: { id?: string; title: string; items: string[] }) {
  return (
    <div id={id} className="bg-white rounded-lg border border-gray-200 p-4">
      <SectionTitle title={title} />
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientMetric({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Users;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <p className="text-sm text-gray-500 mt-4">{title}</p>
      <p className="font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function MedicalInfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon className="h-5 w-5 text-slate-700" />
      </div>
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function VitalChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-blue-600" />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
          <p className="font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TagLine({
  icon: Icon,
  text,
}: {
  icon: typeof Users;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
      <Icon className="h-4 w-4 text-slate-500" />
      <span>{text}</span>
    </div>
  );
}

function FakeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 font-medium text-gray-900">{value}</p>
    </div>
  );
}

function ChecklistLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      <span>{text}</span>
    </div>
  );
}

function KpiCard({
  id,
  label,
  value,
  accent,
}: {
  id?: string;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div id={id}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export function PatientsPage() {
  const { role, patients, practitioners, activePatient, activePractitioner, createPatient, updatePatient } =
    useAppState();
  const [flow, setFlow] = useState<CreationFlow>(null);

  return (
    <>
      {role === "manager" ? (
        <ManagerWorkspace
          patients={patients}
          practitioners={practitioners}
          onUpdatePatient={updatePatient}
          onOpenFlow={setFlow}
        />
      ) : role === "patient" ? (
        <PatientWorkspace patient={activePatient} />
      ) : (
        <PractitionerWorkspace practitioner={activePractitioner} patients={patients} />
      )}

      <CreationWorkflowDialog
        flow={flow}
        practitioners={practitioners}
        onCreatePatient={createPatient}
        onClose={() => setFlow(null)}
      />
    </>
  );
}
