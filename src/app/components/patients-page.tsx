import { useMemo, useState } from "react";
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

function CreationWorkflowDialog({
  flow,
  onClose,
}: {
  flow: CreationFlow;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  if (!flow) {
    return null;
  }

  const steps = FLOW_STEPS[flow];
  const isLast = step === steps.length - 1;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{FLOW_LABELS[flow]}</DialogTitle>
          <DialogDescription>
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
            <label className="space-y-2 text-sm text-gray-700">
              <span className="font-medium">Libellé principal</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Saisir une valeur"
                defaultValue={
                  flow === "patient"
                    ? "Marie Dubois"
                    : flow === "episode"
                    ? "Épisode colorectal 2026"
                    : flow === "task"
                    ? "Relance patient prioritaire"
                    : flow === "practitioner"
                    ? "Dr. Nora Diallo"
                    : "Portail citoyen"
                }
              />
            </label>
            <label className="space-y-2 text-sm text-gray-700">
              <span className="font-medium">Référence</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Référence interne"
                defaultValue={
                  flow === "patient"
                    ? "DOSS-2026-1842"
                    : flow === "episode"
                    ? "EP-2026-031"
                    : flow === "task"
                    ? "TSK-118"
                    : flow === "practitioner"
                    ? "PRO-064"
                    : "ENR-447"
                }
              />
            </label>
            <label className="space-y-2 text-sm text-gray-700">
              <span className="font-medium">Canal ou responsable</span>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>CRDC Île-de-France</option>
                <option>Maison de santé Belleville</option>
                <option>Cabinet République</option>
                <option>Portail patient</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-gray-700">
              <span className="font-medium">Date cible</span>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="2026-03-12"
              />
            </label>
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
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
          >
            {step === 0 ? "Annuler" : "Retour"}
          </button>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => (isLast ? onClose() : setStep(step + 1))}
          >
            {isLast ? "Créer" : "Continuer"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ManagerWorkspace({
  patients,
  practitioners,
  onOpenFlow,
}: {
  patients: Patient[];
  practitioners: Practitioner[];
  onOpenFlow: (flow: Exclude<CreationFlow, null>) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient>(patients[0]);

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
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-8 py-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pilotage des parcours patients</h1>
            <p className="text-gray-500 mt-1">
              Vue gestionnaire enrichie avec enrôlement, suivi opérationnel et orchestration des équipes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              onClick={() => onOpenFlow("patient")}
            >
              <Plus className="w-4 h-4" />
              Nouveau patient
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <QuickActionCard icon={UserPlus} title="Nouveau patient" onClick={() => onOpenFlow("patient")} />
          <QuickActionCard icon={FolderPlus} title="Nouvel épisode" onClick={() => onOpenFlow("episode")} />
          <QuickActionCard icon={ClipboardList} title="Nouvelle tâche" onClick={() => onOpenFlow("task")} />
          <QuickActionCard icon={Stethoscope} title="Nouveau praticien" onClick={() => onOpenFlow("practitioner")} />
          <QuickActionCard icon={ShieldCheck} title="Nouvel enrôlement" onClick={() => onOpenFlow("enrollment")} />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou NIR..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="grid grid-cols-4 gap-6">
          <KpiCard label="Patients suivis" value={String(patients.length)} accent="text-gray-900" />
          <KpiCard label="Patients prioritaires" value={String(urgentPatients)} accent="text-red-600" />
          <KpiCard label="Tâches ouvertes" value={String(pendingTasks.length)} accent="text-orange-600" />
          <KpiCard label="Enrôlements à valider" value={String(pendingEnrollments.length)} accent="text-blue-600" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prochain rappel
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.slice(0, 16).map((patient) => (
                    <tr
                      key={patient.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedPatient.id === patient.id ? "bg-blue-50/60" : ""
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {patient.nom} {patient.prenom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.ville} • {patient.centre}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{patient.typeDepistage}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getStatutColor(patient.statut)}`}>
                          {patient.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getRiskColor(patient.risque)}`}>
                          {patient.risque}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{patient.prochainRappel}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <QueueCard
                title="Tâches à traiter"
                items={pendingTasks.slice(0, 4).map((task) => `${task.titre} • ${task.echeance}`)}
              />
              <QueueCard
                title="Enrôlements récents"
                items={pendingEnrollments
                  .slice(0, 4)
                  .map((enrollment) => `${enrollment.canal} • ${enrollment.statut}`)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
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

              <div className="mt-6 space-y-4">
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

              <div className="mt-6">
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

              <div className="mt-6 space-y-3">
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

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <SectionTitle title="Charge praticiens" />
              <div className="space-y-3 mt-4">
                {practitioners.slice(0, 4).map((practitioner) => (
                  <div key={practitioner.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{document.titre}</DialogTitle>
          <DialogDescription>
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
          <button className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50" onClick={onClose}>
            Fermer
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={onClose}>
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{formulaire.titre}</DialogTitle>
          <DialogDescription>Modal factice de renseignement pour illustrer la saisie patient avant examen.</DialogDescription>
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
                  <label key={champ} className="block space-y-2 text-sm text-gray-700">
                    <span className="font-medium">{champ}</span>
                    <input
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
          <button className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50" onClick={onClose}>
            Fermer
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={onClose}>
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
      <div className="h-full flex flex-col overflow-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Mon dossier de dépistage</h1>
          <p className="text-gray-500 mt-1">
            Parcours détaillé par type de cancer avec résultats, documents cliquables et formulaires de préparation d'examens.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-6">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_34%),linear-gradient(135deg,#ffffff,#f8fbff)] p-6">
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

                  <div className="mt-6 grid grid-cols-4 gap-4">
                    <PatientMetric icon={HeartPulse} title="Programme principal" value={patient.typeDepistage} />
                    <PatientMetric icon={Calendar} title="Dernière visite" value={patient.derniereVisite} />
                    <PatientMetric icon={ShieldCheck} title="Consentement" value="Confirmé" />
                    <PatientMetric icon={Clock3} title="Progression" value={`${patient.progression}%`} />
                  </div>
                </div>

                <div className="grid gap-4 p-6 md:grid-cols-4">
                  <MedicalInfoCard icon={Heart} label="Médecin traitant" value={patient.medecinTraitant} />
                  <MedicalInfoCard icon={Droplets} label="Groupe sanguin" value={patient.groupeSanguin} />
                  <MedicalInfoCard icon={Pill} label="Traitement courant" value={patient.traitements[0]} />
                  <MedicalInfoCard icon={AlertTriangle} label="Allergies" value={patient.allergies.join(", ")} />
                </div>

                <div className="grid gap-6 border-t border-slate-100 p-6 md:grid-cols-[1.15fr_minmax(0,1fr)]">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <SectionTitle title="Constantes et contexte courant" />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <VitalChip icon={Activity} label="IMC" value={patient.constantes.imc} />
                      <VitalChip icon={HeartPulse} label="Tension" value={patient.constantes.tension} />
                      <VitalChip icon={Heart} label="FC" value={patient.constantes.frequenceCardiaque} />
                      <VitalChip icon={ShieldCheck} label="SpO2" value={patient.constantes.saturation} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
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

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <Tabs defaultValue={patient.programs[0].type}>
                  <TabsList className="w-full grid grid-cols-3">
                    {patient.programs.map((program) => {
                      const Icon = getProgramIcon(program.type);
                      const accent = getProgramAccent(program.type);
                      return (
                        <TabsTrigger key={program.type} value={program.type} className="gap-2">
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
                        <div className="grid grid-cols-3 gap-4">
                          <InfoTile title="Niveau de surveillance" subtitle={program.niveauRisque} />
                          <InfoTile title="Résultat clé" subtitle={program.resultatCle} />
                          <InfoTile title="Prochain examen" subtitle={program.prochainExamen} />
                        </div>

                        <div className={`rounded-xl border p-4 ${accent.soft}`}>
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

                        <div className="rounded-xl border border-slate-200 p-5">
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

                        <div className="grid grid-cols-[1.1fr_minmax(0,1fr)] gap-6">
                          <div className="space-y-4">
                            <SectionTitle title="Documents de résultats" />
                            <div className="grid grid-cols-2 gap-4">
                              {program.documents.map((document) => (
                                <button
                                  key={document.id}
                                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left hover:bg-white hover:shadow-sm transition-all"
                                  onClick={() => setSelectedDocument(document)}
                                >
                                  <div className="rounded-lg bg-white border border-gray-200 p-3">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span>{document.type}</span>
                                      <span>{document.date}</span>
                                    </div>
                                    <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
                                      <VectorDocumentIllustration document={document} />
                                    </div>
                                  </div>
                                  <div className="mt-3 flex items-center justify-between gap-3">
                                    <p className="font-medium text-gray-900">{document.titre}</p>
                                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-gray-600">
                                      {document.indicateur}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">{document.aperçu}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <SectionTitle title="Formulaires de préparation" />
                            <div className="space-y-3">
                              {program.formulaires.map((formulaire) => (
                                <button
                                  key={formulaire.id}
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

                        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
                          <div className="rounded-lg border border-gray-200 p-4">
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

                          <div className="rounded-lg border border-gray-200 p-4">
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

            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
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

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <SectionTitle title="Contact référent" />
                <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-4">
                  <p className="font-medium text-gray-900">Dr. Martin Dupont</p>
                  <p className="text-sm text-gray-600 mt-1">CRDC Île-de-France</p>
                  <p className="text-sm text-blue-700 mt-3">Réponse moyenne: moins de 24h</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <SectionTitle title="Mes préférences" />
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <DetailRow label="Canal préféré" value={patient.canalPrefere} />
                  <DetailRow label="Ville" value={patient.ville} />
                  <DetailRow label="Couverture" value={patient.couverture} />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
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
    <div className="h-full flex flex-col overflow-auto">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Ma file active</h1>
        <p className="text-gray-500 mt-1">
          Vue praticien centrée sur les suivis à effectuer, les risques, et les prochaines actions cliniques.
        </p>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-6">
          <KpiCard label="Patients actifs" value={String(assignedPatients.length)} accent="text-gray-900" />
          <KpiCard
            label="Relances prioritaires"
            value={String(assignedPatients.filter((patient) => patient.risque === "Prioritaire").length)}
            accent="text-red-600"
          />
          <KpiCard
            label="Examens planifiés"
            value={String(assignedPatients.filter((patient) => patient.statut === "Invité").length)}
            accent="text-blue-600"
          />
          <KpiCard label="Charge" value={practitioner.charge} accent="text-emerald-600" />
        </div>

        <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <SectionTitle title="Patients à suivre aujourd'hui" />
            <div className="mt-4 space-y-3">
              {assignedPatients.slice(0, 8).map((patient) => (
                <div key={patient.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
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

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <SectionTitle title="Affectations" />
              <div className="mt-4 space-y-3">
                <InfoTile title={practitioner.structure} subtitle={practitioner.specialite} />
                <InfoTile title={`${practitioner.patientsActifs} patients actifs`} subtitle={practitioner.disponibilite} />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
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

function QueueCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
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
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export function PatientsPage() {
  const { role, patients, practitioners, activePatient, activePractitioner } = useAppState();
  const [flow, setFlow] = useState<CreationFlow>(null);

  return (
    <>
      {role === "manager" ? (
        <ManagerWorkspace
          patients={patients}
          practitioners={practitioners}
          onOpenFlow={setFlow}
        />
      ) : role === "patient" ? (
        <PatientWorkspace patient={activePatient} />
      ) : (
        <PractitionerWorkspace practitioner={activePractitioner} patients={patients} />
      )}

      <CreationWorkflowDialog flow={flow} onClose={() => setFlow(null)} />
    </>
  );
}
