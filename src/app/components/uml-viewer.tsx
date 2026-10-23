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

const APP_FLOWS_MERMAID_CODE = `flowchart TB
    subgraph Bootstrap["Démarrage de l'application"]
        direction LR
        Open["Ouverture de l'application"] --> Load["AppStateProvider appelle loadAppData"]
        Load --> API["fake-firestore : GET /bootstrap"]
        API --> Seeded{"Métadonnées bootstrap présentes ?"}
        Seeded -->|Non| Demo["Initialise IndexedDB depuis demoDataBundle"]
        Seeded -->|Oui| Read["Lit patients, practitioners, messages et métadonnées"]
        Demo --> Ready["DemoDataBundle chargé dans l'état React"]
        Read --> Ready
        API -. "si erreur : repli" .-> Local["Données locales demoDataBundle"]
    end

    subgraph Patient["Création ou mise à jour d'un patient"]
        direction LR
        Manager["Gestionnaire dans PatientsPage"] --> Action{"Action"}
        Action -->|Création guidée| Create["Construit le dossier initial, avec épisode et enrôlement"]
        Action -->|Enregistrement| Edit["Modifie statut, téléphone ou ville"]
        Create --> PatientStore["AppStateProvider → fake-firestore"]
        Edit --> PatientStore
        PatientStore --> PatientIDB["Écrit l'objet Patient complet par id"]
        PatientIDB --> PatientUI["Met à jour la liste et sélectionne le dossier actif"]
    end

    subgraph Messaging["Envoi d'un message dans la démo"]
        direction LR
        User["Utilisateur du rôle actif"] --> Compose["Compose destinataire, sujet et contenu"]
        Compose --> Message["Crée un MessageThread : Envoyé, boîte Envoyés"]
        Message --> MessageStore["AppStateProvider → fake-firestore"]
        MessageStore --> MessageIDB["Écrit le fil dans IndexedDB (messages)"]
        MessageIDB --> Sent["Actualise l'état et affiche la boîte Envoyés"]
    end

    Bootstrap ~~~ Patient
    Patient ~~~ Messaging`;

const PATIENT_JOURNEY_MERMAID_CODE = `sequenceDiagram
    autonumber
    actor G as Gestionnaire
    participant UI as PatientsPage
    participant State as AppStateProvider
    participant Store as fake-firestore
    participant IDB as IndexedDB (patients)
    participant P as Dossier patient

    G->>UI: Ouvre l'espace patients
    UI->>State: Demande patients et praticiens
    State-->>UI: Affiche la liste et le dossier actif
    alt Création d'un patient
        G->>UI: Suit les étapes du formulaire puis Créer
        UI->>UI: Construit le dossier initial (épisode et enrôlement inclus)
        UI->>State: createPatient(patient)
        State->>Store: createPatientInFakeFirestore(patient)
        Store->>IDB: Enregistre le dossier complet par id
        IDB-->>State: Écriture terminée
        State->>State: Ajoute le dossier à la liste et le sélectionne
    else Modification du dossier
        G->>UI: Modifie statut, téléphone ou ville puis enregistre
        UI->>State: updatePatient(patient)
        State->>Store: updatePatientInFakeFirestore(patient)
        Store->>IDB: Remplace le dossier patient par id
        IDB-->>State: Écriture terminée
        State->>State: Met à jour la liste et le dossier actif
    end
    State-->>UI: Affiche les données mises à jour
    UI-->>G: Confirme l'enregistrement du dossier`;

const CYCLE_VIE_MERMAID_CODE = `stateDiagram-v2
    state "Statut du dossier Patient" as PatientStatus {
        [*] --> EnAttente
        EnAttente: En attente
        Invite: Invité
        ExamenRealise: Examen réalisé
        ResultatsDisponibles: Résultats disponibles
    }
    note right of PatientStatus: Valeurs exactes de Patient.statut.\nLe gestionnaire peut choisir directement l'une des quatre valeurs dans la fiche.\nAucun enchaînement automatique lié à un acte médical n'est implémenté.`;

const DIAGRAMS = {
  schema: { label: "Modèle de données", title: "Modèle de données complet", code: SCHEMA_MERMAID_CODE },
  flow: { label: "Flux", title: "Flux de l'application", code: APP_FLOWS_MERMAID_CODE },
  lifecycle: { label: "Cycle de vie", title: "Cycle de vie des statuts", code: CYCLE_VIE_MERMAID_CODE },
  patient: { label: "Parcours patient", title: "Parcours patient dans la démo", code: PATIENT_JOURNEY_MERMAID_CODE },
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col flex-1 h-[calc(100vh-165px)] min-h-[580px]">
      {/* Top Toolbar */}
      <div className="px-4 py-2 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 shrink-0">
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
              className="appearance-none rounded-md border border-slate-700 bg-slate-800 py-1.5 pl-3 pr-8 text-xs font-medium text-white outline-none transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-blue-400"
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
        <div className="p-4 bg-slate-50 flex-1 flex items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              Génération du diagramme vectoriel...
            </div>
          )}

          {!isLoading && !hasError && svgContent && (
            <div
              ref={containerRef}
              className="w-full h-full flex items-center justify-center transition-transform origin-center duration-150 [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
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
        <div className="p-4 bg-slate-950 text-slate-100 flex-1 overflow-auto">
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed text-cyan-300">
            {currentMermaidCode}
          </pre>
        </div>
      )}
    </div>
  );
}
