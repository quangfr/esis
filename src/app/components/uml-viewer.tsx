import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  Database,
  Layers,
  ArrowRight,
  Share2,
  Box,
  Key,
} from "lucide-react";

interface EntityNode {
  id: string;
  name: string;
  type: "Collection Racine" | "Sous-collection" | "Entité Pivot" | "Dossier Médical";
  color: string;
  badgeBg: string;
  primaryKey: string;
  foreignKeys: string[];
  description: string;
  fieldsCount: number;
  sampleFields: string[];
  relations: Array<{ target: string; type: "1-1" | "1-N" | "N-1"; desc: string }>;
}

const SCHEMA_ENTITIES: EntityNode[] = [
  {
    id: "patients",
    name: "Patient",
    type: "Entité Pivot",
    color: "border-blue-500",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    primaryKey: "id (pt-1...)",
    foreignKeys: ["praticienId -> Practitioner"],
    description: "Entité centrale du système hébergeant l'identité civile, NIR, constantes biométriques, historique et statut de dépistage.",
    fieldsCount: 28,
    sampleFields: ["nom", "prenom", "nir", "dateNaissance", "typeDepistage", "statut", "risque", "progression"],
    relations: [
      { target: "episodes", type: "1-N", desc: "Campagnes & cycles de dépistage datés" },
      { target: "tasks", type: "1-N", desc: "Tâches et relances de coordination" },
      { target: "enrollments", type: "1-N", desc: "Historique de consentement et canaux d'entrée" },
      { target: "programs", type: "1-N", desc: "Programmes cliniques (Sein, Colorectal, Col)" },
      { target: "practitioners", type: "N-1", desc: "Médecin traitant / praticien référent" },
      { target: "messages", type: "1-N", desc: "Fils de messages sécurisés associés" },
    ],
  },
  {
    id: "episodes",
    name: "Episode",
    type: "Sous-collection",
    color: "border-indigo-500",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    primaryKey: "id (ep-1...)",
    foreignKeys: ["patientId (parent)"],
    description: "Campagne de dépistage planifiée pour un organe spécifique (Sein, Colorectal, Col utérus) avec jalonnement temporel.",
    fieldsCount: 5,
    sampleFields: ["type", "statut", "dateOuverture", "prochaineEtape"],
    relations: [
      { target: "patients", type: "N-1", desc: "Rattaché à un dossier patient unique" },
    ],
  },
  {
    id: "tasks",
    name: "Task",
    type: "Sous-collection",
    color: "border-amber-500",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    primaryKey: "id (tsk-1...)",
    foreignKeys: ["patientId (parent)", "assigneA -> Practitioner / Agent"],
    description: "Action de suivi ou relance assignée à l'équipe de coordination régionale ou aux praticiens.",
    fieldsCount: 6,
    sampleFields: ["titre", "echeance", "priorite", "statut", "assigneA"],
    relations: [
      { target: "patients", type: "N-1", desc: "Appartient au patient concerné" },
    ],
  },
  {
    id: "enrollments",
    name: "Enrollment",
    type: "Sous-collection",
    color: "border-teal-500",
    badgeBg: "bg-teal-100 text-teal-800 border-teal-200",
    primaryKey: "id (enr-1...)",
    foreignKeys: ["patientId (parent)"],
    description: "Traçabilité de l'adhésion du patient (Portail, Cabinet, Téléphone, Campagne) et recueil du consentement éclairé.",
    fieldsCount: 5,
    sampleFields: ["canal", "statut", "date", "consentement"],
    relations: [
      { target: "patients", type: "N-1", desc: "Historique d'enrôlement du patient" },
    ],
  },
  {
    id: "programs",
    name: "ScreeningProgram",
    type: "Dossier Médical",
    color: "border-purple-500",
    badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
    primaryKey: "type ('Sein' | 'Colorectal' | 'Col utérus')",
    foreignKeys: ["patientId (parent)"],
    description: "Parcours de soins médicalisé par organe avec stratification du risque, étapes timeline, formulaires et examens.",
    fieldsCount: 10,
    sampleFields: ["niveauRisque", "tendanceRegionale", "resultatCle", "prochainExamen"],
    relations: [
      { target: "timelines", type: "1-N", desc: "Jalons chronologiques de prise en charge" },
      { target: "documents", type: "1-N", desc: "Comptes-rendus radiologiques & bilans" },
      { target: "patients", type: "N-1", desc: "Programme clinique propre à l'usager" },
    ],
  },
  {
    id: "timelines",
    name: "CareTimelineStep",
    type: "Sous-collection",
    color: "border-sky-500",
    badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
    primaryKey: "id (tl-1...)",
    foreignKeys: ["programType (parent)"],
    description: "Jalon chronologique ordonné matérialisant l'avancement dans le parcours (invitation, examen, relecture, rappel).",
    fieldsCount: 5,
    sampleFields: ["titre", "periode", "statut", "detail"],
    relations: [
      { target: "programs", type: "N-1", desc: "Constitue la timeline du programme" },
    ],
  },
  {
    id: "documents",
    name: "ScreeningDocument",
    type: "Sous-collection",
    color: "border-emerald-500",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    primaryKey: "id (doc-1...)",
    foreignKeys: ["programType (parent)", "auteur -> Practitioner"],
    description: "Document médical ou résultat biologique numérisé rattaché au parcours de dépistage.",
    fieldsCount: 8,
    sampleFields: ["titre", "type", "date", "statut", "indicateur", "auteur"],
    relations: [
      { target: "programs", type: "N-1", desc: "Attaché au programme médicalisé" },
      { target: "practitioners", type: "N-1", desc: "Signé ou transmis par un praticien" },
    ],
  },
  {
    id: "practitioners",
    name: "Practitioner",
    type: "Collection Racine",
    color: "border-orange-500",
    badgeBg: "bg-orange-100 text-orange-800 border-orange-200",
    primaryKey: "id (med-1...)",
    foreignKeys: [],
    description: "Professionnels de santé partenaires (médecins généralistes, radiologues, gynécologues, gastro-entérologues).",
    fieldsCount: 9,
    sampleFields: ["nom", "prenom", "specialite", "structure", "ville", "patientsActifs", "charge"],
    relations: [
      { target: "patients", type: "1-N", desc: "Médecin référent de plusieurs patients" },
      { target: "documents", type: "1-N", desc: "Auteur des comptes-rendus médicaux" },
    ],
  },
  {
    id: "messages",
    name: "MessageThread",
    type: "Collection Racine",
    color: "border-rose-500",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
    primaryKey: "id (msg-1...)",
    foreignKeys: ["expediteur / destinataire"],
    description: "Fils de messages chiffrés et sécurisés échangés entre patients, praticiens et coordinateurs régionaux.",
    fieldsCount: 13,
    sampleFields: ["sujet", "expediteur", "destinataire", "date", "statut", "boite", "securise"],
    relations: [
      { target: "patients", type: "N-1", desc: "Échanges concernant l'usager" },
      { target: "practitioners", type: "N-1", desc: "Échanges avec le praticien" },
    ],
  },
];

export function UmlViewer() {
  const [zoom, setZoom] = useState(1);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("patients");
  const [activeMode, setActiveMode] = useState<"interactive" | "mermaid" | "flow">("interactive");
  const [copied, setCopied] = useState(false);

  const selectedEntity = SCHEMA_ENTITIES.find((e) => e.id === selectedEntityId) || SCHEMA_ENTITIES[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaMermaidCode = `classDiagram
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
        +Task[] tasks
        +Enrollment[] enrollments
        +ScreeningProgram[] programs
    }

    class Episode {
        +string id [PK]
        +string type
        +string statut
        +string dateOuverture
        +string prochaineEtape
    }

    class Task {
        +string id [PK]
        +string titre
        +string echeance
        +string priorite
        +string statut
        +string assigneA [FK]
    }

    class Enrollment {
        +string id [PK]
        +string canal
        +string statut
        +string date
        +boolean consentement
    }

    class ScreeningProgram {
        +string type [PK]
        +string niveauRisque
        +string resultatCle
        +string prochainExamen
        +CareTimelineStep[] parcours
        +ScreeningDocument[] documents
    }

    class CareTimelineStep {
        +string id [PK]
        +string titre
        +string periode
        +string statut
        +string detail
    }

    class ScreeningDocument {
        +string id [PK]
        +string titre
        +string type
        +string date
        +string statut
        +string indicateur
        +string auteur [FK]
    }

    class Practitioner {
        +string id [PK]
        +string nom
        +string prenom
        +string specialite
        +string structure
        +number patientsActifs
        +string charge
    }

    class MessageThread {
        +string id [PK]
        +string sujet
        +string expediteur
        +string destinataire
        +string statut
        +string boite
        +boolean securise
    }

    Patient "1" *-- "0..*" Episode : contient (episodes)
    Patient "1" *-- "0..*" Task : possède (tasks)
    Patient "1" *-- "0..*" Enrollment : trace (enrollments)
    Patient "1" *-- "0..*" ScreeningProgram : suit (programs)
    ScreeningProgram "1" *-- "0..*" CareTimelineStep : jalonne (parcours)
    ScreeningProgram "1" *-- "0..*" ScreeningDocument : intègre (documents)
    Practitioner "1" --> "0..*" Patient : suit (praticienId)
    Practitioner "1" --> "0..*" ScreeningDocument : signe (auteur)
    MessageThread ..> Patient : notifie
    MessageThread ..> Practitioner : informe`;

  const patientJourneyMermaidCode = `sequenceDiagram
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="font-semibold text-sm">Visualiseur UML Interactif</span>
          <span className="text-xs text-slate-400 border-l border-slate-700 pl-2.5">
            Schéma des Données & Relations ESIS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-slate-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveMode("interactive")}
              className={`px-3 py-1 rounded transition-colors ${
                activeMode === "interactive" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Schéma Entités-Relations
            </button>
            <button
              onClick={() => setActiveMode("mermaid")}
              className={`px-3 py-1 rounded transition-colors ${
                activeMode === "mermaid" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Code UML Mermaid
            </button>
            <button
              onClick={() => setActiveMode("flow")}
              className={`px-3 py-1 rounded transition-colors ${
                activeMode === "flow" ? "bg-blue-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Flux Parcours Patient
            </button>
          </div>

          {/* Zoom controls */}
          {activeMode === "interactive" && (
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg text-slate-300">
              <button
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
                className="p-1 hover:text-white"
                title="Dézoomer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
                className="p-1 hover:text-white"
                title="Zoomer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 hover:text-white border-l border-slate-700 ml-1 pl-1"
                title="Réinitialiser"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Diagram */}
      {activeMode === "interactive" && (
        <div className="p-6 bg-slate-50">
          <div
            className="transition-transform origin-top-left"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            {/* Legend / Category Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-5 text-xs">
              <span className="font-semibold text-gray-700 mr-2">Typologie des nœuds :</span>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium border border-blue-200">
                ★ Entité Pivot (Patient)
              </span>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg font-medium border border-purple-200">
                ◆ Dossier Médical (ScreeningProgram)
              </span>
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg font-medium border border-indigo-200">
                ● Sous-collections (Episodes, Tasks, Enrollments, Timelines, Documents)
              </span>
              <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-lg font-medium border border-orange-200">
                ▲ Collections Racines (Practitioners, Messages)
              </span>
            </div>

            {/* Entity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SCHEMA_ENTITIES.map((entity) => {
                const isSelected = selectedEntity.id === entity.id;
                return (
                  <div
                    key={entity.id}
                    onClick={() => setSelectedEntityId(entity.id)}
                    className={`cursor-pointer rounded-xl p-4.5 border-2 transition-all duration-150 ${
                      isSelected
                        ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-100"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Box className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-gray-500"}`} />
                        <h3 className="font-bold text-gray-900 text-sm font-mono">{entity.name}</h3>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${entity.badgeBg}`}>
                        {entity.type}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-2">{entity.description}</p>

                    <div className="space-y-1.5 text-[11px] font-mono border-t border-gray-100 pt-2 text-gray-700">
                      <div className="flex items-center gap-1.5 text-blue-700">
                        <Key className="w-3 h-3 text-amber-500" />
                        <span>PK: {entity.primaryKey}</span>
                      </div>
                      {entity.foreignKeys.length > 0 && (
                        <div className="flex items-center gap-1.5 text-slate-500 truncate">
                          <Share2 className="w-3 h-3 text-purple-500 shrink-0" />
                          <span className="truncate">FK: {entity.foreignKeys.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span>{entity.fieldsCount} propriétés</span>
                      <span className="text-blue-600 font-medium flex items-center gap-1">
                        Détails <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Entity Inspector */}
          {selectedEntity && (
            <div className="mt-6 bg-white border border-blue-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-blue-900">{selectedEntity.name}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${selectedEntity.badgeBg}`}>
                      {selectedEntity.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{selectedEntity.description}</p>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-gray-600">
                  <span className="bg-slate-100 px-2 py-1 rounded">Clé : {selectedEntity.primaryKey}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded">{selectedEntity.fieldsCount} champs typés</span>
                </div>
              </div>

              {/* Relations Matrix for Selected Entity */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  Relations du modèle ({selectedEntity.relations.length}) :
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {selectedEntity.relations.map((rel, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-blue-700">{selectedEntity.name}</span>
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-mono text-[10px] font-bold">
                          {rel.type}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="font-mono font-semibold text-indigo-700">{rel.target}</span>
                      </div>
                      <span className="text-[11px] text-gray-600 italic truncate max-w-xs">{rel.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Code Mermaid UML Schema Viewer */}
      {activeMode === "mermaid" && (
        <div className="p-6 bg-slate-950 text-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-slate-200">Diagramme de Classes UML Mermaid (Données ESIS)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Représentation formelle des classes, relations 1-N et clés primaires/étrangères.
              </p>
            </div>
            <button
              onClick={() => handleCopy(schemaMermaidCode)}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copié !" : "Copier le code Mermaid"}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed text-cyan-300">
            {schemaMermaidCode}
          </pre>
        </div>
      )}

      {/* Flux Parcours Patient */}
      {activeMode === "flow" && (
        <div className="p-6 bg-slate-950 text-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-slate-200">Diagramme de Séquence du Parcours Patient</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enchaînement temporel : Identification $\to$ Invitation $\to$ Consentement $\to$ Examen $\to$ Clôture.
              </p>
            </div>
            <button
              onClick={() => handleCopy(patientJourneyMermaidCode)}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copié !" : "Copier le code Mermaid"}
            </button>
          </div>
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed text-emerald-300">
            {patientJourneyMermaidCode}
          </pre>
        </div>
      )}
    </div>
  );
}
