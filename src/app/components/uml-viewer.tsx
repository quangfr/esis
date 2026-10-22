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
} from "lucide-react";

const SCHEMA_MERMAID_CODE = `classDiagram
    direction TB

    class Patient {
        +string id [PK]
        +string nom
        +string prenom
        +string dateNaissance
        +string nir
        +string typeDepistage
        +string statut
        +string risque
        +string praticienId [FK]
        +Episode[] episodes
        +Tache[] tasks
        +Enrolement[] enrollments
        +ProgrammeDepistage[] programs
    }

    class Episode {
        +string id [PK]
        +string type
        +string statut
        +string dateOuverture
        +string prochaineEtape
    }

    class Tache {
        +string id [PK]
        +string titre
        +string echeance
        +string priorite
        +string statut
        +string assigneA [FK]
    }

    class Enrolement {
        +string id [PK]
        +string canal
        +string statut
        +string date
        +boolean consentement
    }

    class ProgrammeDepistage {
        +string type [PK]
        +string niveauRisque
        +string resultatCle
        +string prochainExamen
        +CareTimelineStep[] parcours
        +DocumentMedical[] documents
    }

    class CareTimelineStep {
        +string id [PK]
        +string titre
        +string periode
        +string statut
        +string detail
    }

    class DocumentMedical {
        +string id [PK]
        +string titre
        +string type
        +string date
        +string statut
        +string indicateur
        +string auteur [FK]
    }

    class Praticien {
        +string id [PK]
        +string nom
        +string prenom
        +string specialite
        +string structure
        +number patientsActifs
        +string charge
    }

    class FilDiscussion {
        +string id [PK]
        +string sujet
        +string expediteur
        +string destinataire
        +string statut
        +string boite
        +boolean securise
    }

    Patient "1" *-- "0..*" Episode : contient
    Patient "1" *-- "0..*" Tache : possède
    Patient "1" *-- "0..*" Enrolement : trace
    Patient "1" *-- "0..*" ProgrammeDepistage : suit
    ProgrammeDepistage "1" *-- "0..*" CareTimelineStep : jalonne
    ProgrammeDepistage "1" *-- "0..*" DocumentMedical : intègre
    Praticien "1" --> "0..*" Patient : suit
    Praticien "1" --> "0..*" DocumentMedical : signe
    FilDiscussion ..> Patient : notifie
    FilDiscussion ..> Praticien : informe`;

const PATIENT_JOURNEY_MERMAID_CODE = `sequenceDiagram
    autonumber
    actor P as Patient (Usager)
    actor C as Coordination ESIS
    actor M as Praticien / Centre

    Note over C: 1. Identification & Ciblage de l'éligibilité
    C->>P: 2. Envoi invitation & kit de dépistage (SMS / Courrier)
    P->>C: 3. Enrôlement & consentement éclairé (Portail en ligne)
    P->>M: 4. Prise de rendez-vous & examen (Mammographie / Test FIT)
    M->>M: 5. Réalisation acte & double lecture experte
    M->>C: Télétransmission compte-rendu radiologique / biologique
    C->>P: 6. Mise à disposition compte-rendu sécurisé & notification
    alt Résultat Normal (Négatif / ACR 1-2)
        C->>P: Clôture du cycle standard & rappel planifié à 24 mois
    else Anomalie Détectée (Positif / ACR 4-5)
        C->>M: Alerte prioritaire & déclenchement bilan diagnostique
    end`;

const CYCLE_VIE_MERMAID_CODE = `stateDiagram-v2
    [*] --> Eligible: Identification cohorte / Age / NIR
    Eligible --> EnAttente: Enrôlement saisi (Portail / Campagne)
    EnAttente --> Invite: Envoi invitation / kit de dépistage
    Invite --> ExamenPlanifie: Prise de RDV / Réception kit
    ExamenPlanifie --> ExamenRealise: Examen réalisé chez le praticien
    ExamenRealise --> ResultatsDisponibles: Transmission & double lecture
    ResultatsDisponibles --> SuiviStandard: Résultat normal (Rappel à 2 ans)
    ResultatsDisponibles --> SurveillanceRapprochee: Anomalie / Avis spécialisé
    SuiviStandard --> [*]
    SurveillanceRapprochee --> [*]`;

declare global {
  interface Window {
    mermaid?: {
      initialize: (config: Record<string, unknown>) => void;
      render: (id: string, text: string) => Promise<{ svg: string }>;
    };
  }
}

export function UmlViewer() {
  const [activeDiagram, setActiveDiagram] = useState<"schema" | "flow" | "lifecycle">("schema");
  const [viewMode, setViewMode] = useState<"rendered" | "code">("rendered");
  const [zoom, setZoom] = useState(1);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMermaidCode =
    activeDiagram === "schema"
      ? SCHEMA_MERMAID_CODE
      : activeDiagram === "flow"
      ? PATIENT_JOURNEY_MERMAID_CODE
      : CYCLE_VIE_MERMAID_CODE;

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
            {activeDiagram === "schema"
              ? "1. Schéma Entités-Relations"
              : activeDiagram === "flow"
              ? "2. Flux Parcours Patient"
              : "3. Cycle de Vie Dépistage"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 3 Diagrams Selector */}
          <div className="flex bg-slate-800 p-0.5 rounded-md text-xs font-medium">
            <button
              onClick={() => {
                setActiveDiagram("schema");
                setZoom(1);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeDiagram === "schema" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              1. Schéma Entités-Relations
            </button>
            <button
              onClick={() => {
                setActiveDiagram("flow");
                setZoom(1);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeDiagram === "flow" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              2. Flux Parcours Patient
            </button>
            <button
              onClick={() => {
                setActiveDiagram("lifecycle");
                setZoom(1);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeDiagram === "lifecycle" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              3. Cycle de Vie
            </button>
          </div>

          {/* View Mode: Rendered Diagram vs Source Code */}
          <div className="flex bg-slate-800 p-0.5 rounded-md text-xs font-medium">
            <button
              onClick={() => setViewMode("rendered")}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === "rendered" ? "bg-slate-700 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
              title="Affichage graphique"
            >
              <Eye className="w-3.5 h-3.5" /> Graphique
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                viewMode === "code" ? "bg-slate-700 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
              title="Code source Mermaid"
            >
              <Code2 className="w-3.5 h-3.5" /> Code
            </button>
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
