import React, { useEffect, useRef, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  Database,
  ArrowRight,
  Code2,
  Eye,
  RefreshCw,
  GitBranch,
  ChevronDown,
} from "lucide-react";

const SCHEMA_MERMAID_CODE = `classDiagram
    direction TB

    class Patient {
        +string id
        +string nom
        +string prenom
        +string dateNaissance
        +string nir
        +ScreeningType typeDepistage
        +PatientStatus statut
        +string derniereVisite
        +string prochainRappel
        +string praticienId
        +string centre
        +string ville
        +string telephone
        +string email
        +PatientRisk risque
        +ContactChannel canalPrefere
        +CoverageStatus couverture
        +number progression
        +string medecinTraitant
        +BloodGroup groupeSanguin
        +string[] allergies
        +string[] antecedents
        +string[] traitements
        +Constantes constantes
        +string situationCourante
        +Episode[] episodes
        +Task[] tasks
        +Enrollment[] enrollments
        +ScreeningProgram[] programs
    }

    class Practitioner {
        +string id
        +string nom
        +string prenom
        +string specialite
        +string structure
        +string ville
        +number patientsActifs
        +Workload charge
        +string disponibilite
    }

    class Episode {
        +string id
        +ScreeningType type
        +EpisodeStatus statut
        +string dateOuverture
        +string prochaineEtape
    }

    class Task {
        +string id
        +string titre
        +string echeance
        +Priority priorite
        +TaskStatus statut
        +string assigneA
    }

    class Enrollment {
        +string id
        +EnrollmentChannel canal
        +EnrollmentStatus statut
        +string date
        +boolean consentement
    }

    class ScreeningProgram {
        +ScreeningType type
        +ProgramRisk niveauRisque
        +string tendanceRegionale
        +string resultatCle
        +string prochainExamen
        +string[] historique
        +CareTimelineStep[] parcours
        +Questionnaire[] formulaires
        +ProposedExam[] examensProposes
        +ScreeningDocument[] documents
    }

    class CareTimelineStep {
        +string id
        +string titre
        +string periode
        +TimelineStatus statut
        +string detail
    }

    class Questionnaire {
        +string id
        +string titre
        +QuestionnaireStatus statut
        +string description
        +string[] champs
    }

    class ProposedExam {
        +string nom
        +string justification
        +string resultat
    }

    class ScreeningDocument {
        +string id
        +string titre
        +DocumentType type
        +string date
        +DocumentStatus statut
        +string aperçu
        +string indicateur
        +string auteur
    }

    class Constantes {
        +string imc
        +string tension
        +string frequenceCardiaque
        +string saturation
    }

    class MessageThread {
        +string id
        +string sujet
        +string expediteur
        +string destinataire
        +string aperçu
        +string contenu
        +string date
        +MessageStatus statut
        +Mailbox boite
        +boolean securise
        +Importance importance
        +TargetRole roleCible
        +Attachment[] piecesJointes
    }

    class Attachment {
        +string nom
        +string taille
    }

    class RoleProfile {
        +string nom
        +string fonction
        +string structure
        +string initiales
    }

    class AppMetadata {
        +string id
        +RoleProfile manager
        +RoleProfile patient
        +RoleProfile practitioner
        +UserRole defaultRole
        +string activePatientId
        +string activePractitionerId
    }

    class DemoDataBundle {
        +Patient[] patients
        +Practitioner[] practitioners
        +MessageThread[] messages
        +RoleProfile[] roleProfiles
        +UserRole defaultRole
        +string activePatientId
        +string activePractitionerId
    }

    Patient "1" *-- "1" Constantes : constantes imbriquées
    Patient "1" *-- "0..*" Episode : episodes imbriqués
    Patient "1" *-- "0..*" Task : tasks imbriquées
    Patient "1" *-- "0..*" Enrollment : enrollments imbriqués
    Patient "1" *-- "0..*" ScreeningProgram : programs imbriqués
    ScreeningProgram "1" *-- "0..*" CareTimelineStep : parcours
    ScreeningProgram "1" *-- "0..*" Questionnaire : formulaires
    ScreeningProgram "1" *-- "0..*" ProposedExam : examensProposes
    ScreeningProgram "1" *-- "0..*" ScreeningDocument : documents
    MessageThread "1" *-- "0..*" Attachment : pièces jointes
    Patient ..> Practitioner : praticienId (référence par identifiant)
    DemoDataBundle o-- Patient : patients
    DemoDataBundle o-- Practitioner : practitioners
    DemoDataBundle o-- MessageThread : messages
    DemoDataBundle o-- RoleProfile : roleProfiles
    AppMetadata o-- RoleProfile : profils dans app_metadata

    note for Patient "Stocké comme un objet dans le magasin patients. Ses sous-objets sont imbriqués, pas des magasins séparés."
    note for MessageThread "Les interlocuteurs sont des chaînes et roleCible est un rôle. Aucun identifiant Patient/Practitioner n'est défini ici."
    note for DemoDataBundle "Objet d'amorçage et payload de collections, pas un magasin IndexedDB."
    note for AppMetadata "Un enregistrement bootstrap dans le magasin app_metadata."
`;

const BOOTSTRAP_FLOW_MERMAID_CODE = `flowchart TD
    Open["Ouverture de l'application"] --> Load["AppStateProvider : loadAppData()"]
    Load --> API["fake-firestore : GET /bootstrap"]
    API --> Seeded{"Métadonnées bootstrap présentes ?"}
    Seeded -->|Non| Seed["Initialise IndexedDB depuis demoDataBundle"]
    Seeded -->|Oui| Read["Lit patients, practitioners, messages et app_metadata"]
    Seed --> Ready["Charge DemoDataBundle dans l'état React"]
    Read --> Ready
    API -. "en cas d'erreur" .-> Fallback["Repli sur demoDataBundle local"]
    Fallback --> Ready`;

const PATIENT_JOURNEY_MERMAID_CODE = `flowchart TD
    Patient["Usager avec le rôle Patient"] --> Open["Ouvre Patients : Mon dossier de dépistage"]
    Open --> Data["PatientsPage affiche le patient actif fourni par AppStateProvider"]
    Data --> Overview["Consulte statut, rappel, progression et informations du dossier"]
    Overview --> Program["Choisit un programme de dépistage"]
    Program --> Timeline["Consulte résumé, résultat, prochain examen et timeline"]
    Timeline --> Content["Consulte documents et formulaires de préparation"]
    Content --> Document{"Élément sélectionné"}
    Document -->|Document| Preview["Ouvre l'aperçu du document"]
    Document -->|Formulaire| Form["Ouvre la simulation de formulaire"]
    Form --> Save["Enregistre la simulation : confirmation locale, sans persistance métier"]`;

const PATIENT_RECORD_FLOW_MERMAID_CODE = `flowchart TD
    Manager["Gestionnaire ouvre PatientsPage"] --> Action{"Action sur le dossier"}
    Action -->|Nouveau patient| Form["Suit le formulaire guidé en quatre étapes"]
    Form --> Create["Construit le Patient, son épisode initial et son enrôlement initial"]
    Create --> CreateState["AppStateProvider : createPatient()"]
    CreateState --> CreateStore["fake-firestore : enregistre le Patient par id"]
    CreateStore --> IDB["IndexedDB : magasin patients"]
    Action -->|Modifier la fiche| Edit["Change statut, téléphone ou ville"]
    Edit --> UpdateState["AppStateProvider : updatePatient()"]
    UpdateState --> UpdateStore["fake-firestore : remplace le Patient par id"]
    UpdateStore --> IDB
    IDB --> Refresh["Met à jour la liste et le dossier actif dans l'état React"]
    Refresh --> Feedback["Affiche la fiche mise à jour et la confirmation"]`;

const MESSAGE_FLOW_MERMAID_CODE = `flowchart TD
    User["Utilisateur du rôle actif"] --> Compose["Compose destinataire, sujet et contenu"]
    Compose --> Build["MessagingPage crée un MessageThread\nstatut Envoyé, boîte Envoyés"]
    Build --> State["AppStateProvider : createMessage()"]
    State --> Store["fake-firestore : enregistre le fil par id"]
    Store --> IDB["IndexedDB : magasin messages"]
    IDB --> Update["Ajoute le message à l'état React"]
    Update --> Sent["Affiche le message dans la boîte Envoyés"]
    Sent -.-> Note["Persistance locale de démonstration; aucun envoi externe"]`;

const CYCLE_VIE_MERMAID_CODE = `flowchart TD
    Manager["Gestionnaire ouvre la fiche patient"] --> Select["Choisit un statut dans le sélecteur Patient.statut"]
    Select --> Values["Valeurs possibles :<br/>En attente<br/>Invité<br/>Examen réalisé<br/>Résultats disponibles"]
    Values --> Save["Clique Enregistrer les modifications"]
    Save --> Update["AppStateProvider : updatePatient(patient)"]
    Update --> Persist["fake-firestore remplace l'objet Patient par id dans IndexedDB"]
    Persist --> State["Met à jour patients[] et activePatientId dans l'état React"]
    State --> Display["La fiche et son badge affichent le statut choisi"]
    Display -.-> Note["Le statut est choisi manuellement; aucun acte médical ne déclenche de transition automatique"]`;

const DIAGRAMS = {
  schema: { label: "Modèle de données", title: "Modèle de données complet", code: SCHEMA_MERMAID_CODE },
  flow: { label: "Flux de démarrage", title: "Flux de démarrage de l'application", code: BOOTSTRAP_FLOW_MERMAID_CODE },
  lifecycle: { label: "Cycle de vie", title: "Cycle de vie du statut patient", code: CYCLE_VIE_MERMAID_CODE },
  patient: { label: "Parcours patient", title: "Parcours patient dans l'application", code: PATIENT_JOURNEY_MERMAID_CODE },
  patientRecord: { label: "Dossier patient", title: "Création et mise à jour du dossier", code: PATIENT_RECORD_FLOW_MERMAID_CODE },
  messaging: { label: "Messagerie", title: "Flux d'envoi d'un message", code: MESSAGE_FLOW_MERMAID_CODE },
} as const;

type DiagramKey = keyof typeof DIAGRAMS;

declare global {
  interface Window {
    mermaid?: {
      initialize: (config: Record<string, unknown>) => void;
      render: (id: string, text: string) => Promise<{ svg: string }>;
    };
  }
}

export function UmlViewer() {
  const [activeDiagram, setActiveDiagram] = useState<DiagramKey>("schema");
  const [viewMode, setViewMode] = useState<"rendered" | "code">("rendered");
  const [zoom, setZoom] = useState(1);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMermaidCode = DIAGRAMS[activeDiagram].code;

  // Dynamically load Mermaid library from CDN if not already on window
  useEffect(() => {
    let isCancelled = false;

    async function loadAndRender() {
      setIsLoading(true);
      setHasError(false);

      try {
        if (!window.mermaid) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
          script.async = true;
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Erreur de chargement du script Mermaid CDN"));
            document.head.appendChild(script);
          });
        }

        if (window.mermaid) {
          window.mermaid.initialize({
            startOnLoad: false,
            theme: "neutral",
            securityLevel: "loose",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 13,
          });

          const uniqueId = `mermaid-svg-${Date.now()}`;
          const { svg } = await window.mermaid.render(uniqueId, currentMermaidCode);
          if (!isCancelled) {
            setSvgContent(svg);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.warn("Échec du rendu Mermaid direct, repli sur image vectorielle", err);
        if (!isCancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }

    void loadAndRender();

    return () => {
      isCancelled = true;
    };
  }, [currentMermaidCode]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-w-0 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col flex-none h-[calc(100vh-105px)] min-h-0">
      {/* Top Toolbar */}
      <div className="px-3 py-1.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="font-semibold text-xs tracking-tight">Mermaid Viewer</span>
          <span className="text-[11px] text-slate-400 border-l border-slate-700 pl-2">
            {DIAGRAMS[activeDiagram].title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="uml-diagram-selector">Choisir un diagramme</label>
          <div className="relative">
            <select
              id="uml-diagram-selector"
              value={activeDiagram}
              onChange={(event) => {
                setActiveDiagram(event.target.value as DiagramKey);
                setZoom(1);
              }}
              className="appearance-none rounded-md border border-slate-700 bg-slate-800 py-1 pl-2.5 pr-7 text-xs font-medium text-white outline-none transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-blue-400"
            >
              {Object.entries(DIAGRAMS).map(([key, diagram]) => (
                <option key={key} value={key}>{diagram.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
          </div>

          {/* Zoom controls (only in rendered mode) */}
          {viewMode === "rendered" && (
            <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-md text-slate-300">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="p-1 hover:text-white"
                title="Dézoomer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono w-9 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
                className="p-1 hover:text-white"
                title="Zoomer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 hover:text-white border-l border-slate-700 ml-0.5 pl-1"
                title="Réinitialiser"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Copy Button */}
          <button
            onClick={() => handleCopy(currentMermaidCode)}
            className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md flex items-center gap-1 border border-slate-700 ml-0.5"
            title="Copier le code Mermaid"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copié" : "Copier"}
          </button>

          {/* View mode: icon-only switch, aligned at the far right */}
          <div className="flex bg-slate-800 p-0.5 rounded-md text-xs font-medium">
            <button
              onClick={() => setViewMode("rendered")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "rendered" ? "bg-slate-700 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
              aria-label="Affichage graphique"
              aria-pressed={viewMode === "rendered"}
              title="Affichage graphique"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "code" ? "bg-slate-700 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
              aria-label="Code source Mermaid"
              aria-pressed={viewMode === "code"}
              title="Code source Mermaid"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* RENDERED MERMAID VIEWER (Full height of container, no internal scrollbar) */}
      {viewMode === "rendered" && (
        <div className="p-2 bg-slate-50 flex-1 min-h-0 flex items-center justify-center overflow-auto">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              Génération du diagramme vectoriel...
            </div>
          )}

          {!isLoading && !hasError && svgContent && (
            <div
              ref={containerRef}
              className="w-full h-full min-w-0 min-h-0 flex items-center justify-center transition-transform origin-center duration-150 [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}

          {!isLoading && hasError && (
            <div className="w-full h-full flex items-center justify-center p-2">
              <img
                src={`https://mermaid.ink/svg/${btoa(unescape(encodeURIComponent(currentMermaidCode)))}`}
                alt="Mermaid Diagram"
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-gray-200"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
              />
            </div>
          )}
        </div>
      )}

      {/* CODE SOURCE VIEW */}
      {viewMode === "code" && (
        <div className="p-4 bg-slate-950 text-slate-100 flex-1 min-h-0 overflow-auto">
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed text-cyan-300">
            {currentMermaidCode}
          </pre>
        </div>
      )}
    </div>
  );
}
