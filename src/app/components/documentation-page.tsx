import { useState } from "react";
import {
  BookOpen,
  Boxes,
  FileCode,
  GitBranch,
  Layers,
  Workflow,
  CheckCircle2,
  ChevronRight,
  Table as TableIcon,
} from "lucide-react";
import { UmlViewer } from "./uml-viewer";

interface FieldDef {
  name: string;
  type: string;
  example: string;
  description: string;
  choices?: string[];
}

interface ObjectDef {
  title: string;
  description: string;
  fields: FieldDef[];
}

const DATA_DICTIONARY: Record<string, ObjectDef> = {
  Patient: {
    title: "Patient",
    description: "Entité pivot contenant l'identité civile, médicale, les statuts et les collections liées (épisodes, tâches, programmes).",
    fields: [
      { name: "id", type: "string", example: '"pt-1"', description: "Identifiant technique unique du patient." },
      { name: "nom", type: "string", example: '"Lemoine"', description: "Nom de famille de l'usager." },
      { name: "prenom", type: "string", example: '"Claire"', description: "Prénom de l'usager." },
      { name: "dateNaissance", type: "string", example: '"14/05/1972"', description: "Date de naissance au format JJ/MM/AAAA." },
      { name: "nir", type: "string", example: '"2 72 05 75 123 456 78"', description: "Numéro de Sécurité Sociale (15 chiffres formatés)." },
      {
        name: "typeDepistage",
        type: "enum",
        example: '"Sein"',
        description: "Programme de dépistage principal rattaché.",
        choices: ["Sein", "Colorectal", "Col utérus"],
      },
      {
        name: "statut",
        type: "enum",
        example: '"Invité"',
        description: "Statut d'avancement du patient dans la campagne en cours.",
        choices: ["En attente", "Invité", "Examen réalisé", "Résultats disponibles"],
      },
      { name: "derniereVisite", type: "string", example: '"12/01/2026"', description: "Date de la dernière interaction ou examen médical." },
      { name: "prochainRappel", type: "string", example: '"12/01/2028"', description: "Échéance cible pour la prochaine invitation de dépistage." },
      { name: "praticienId", type: "string", example: '"med-1"', description: "Identifiant du praticien référent rattaché (clé étrangère)." },
      { name: "centre", type: "string", example: '"Centre de Radiologie Gambetta"', description: "Établissement ou centre de santé de prise en charge." },
      { name: "ville", type: "string", example: '"Bordeaux"', description: "Commune de résidence." },
      { name: "telephone", type: "string", example: '"06 12 34 56 78"', description: "Numéro de téléphone mobile pour rappels et SMS." },
      { name: "email", type: "string", example: '"claire.lemoine@email.fr"', description: "Adresse courriel pour notifications et portail usager." },
      {
        name: "risque",
        type: "enum",
        example: '"Standard"',
        description: "Niveau de risque oncologique évalué.",
        choices: ["Standard", "Modéré", "Prioritaire"],
      },
      {
        name: "canalPrefere",
        type: "enum",
        example: '"SMS"',
        description: "Canal de communication plébiscité par le patient.",
        choices: ["SMS", "Email", "Courrier"],
      },
      {
        name: "couverture",
        type: "enum",
        example: '"Assurance active"',
        description: "Statut d'ouverture des droits de prise en charge AMO / ALD.",
        choices: ["Assurance active", "Vérification requise"],
      },
      { name: "progression", type: "number", example: "45", description: "Pourcentage de complétion du cycle en cours (0 à 100)." },
      { name: "medecinTraitant", type: "string", example: '"Dr Marc Fabre"', description: "Nom du médecin traitant référent déclaré." },
      {
        name: "groupeSanguin",
        type: "enum",
        example: '"A+"',
        description: "Groupe sanguin et facteur Rhésus.",
        choices: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      { name: "allergies", type: "string[]", example: '["Pénicilline", "Iode"]', description: "Allergies médicamenteuses ou environnementales connues." },
      { name: "antecedents", type: "string[]", example: '["Antécédent familial cancer sein"]', description: "Antécédents médicaux et familiaux notables." },
      { name: "traitements", type: "string[]", example: '["Lévothyrox 50µg"]', description: "Traitements réguliers en cours." },
      { name: "constantes", type: "object", example: '{ imc: "22.4", tension: "12/8", ... }', description: "Biométrie : IMC, tension artérielle, fréquence cardiaque, saturation O2." },
      { name: "situationCourante", type: "string", example: '"En attente de mammographie T2"', description: "Résumé synthétique pour la fiche de prise en charge." },
      { name: "episodes", type: "Episode[]", example: "[...]", description: "Sous-collection des épisodes et campagnes passées/en cours." },
      { name: "tasks", type: "Task[]", example: "[...]", description: "Tâches d'action et relances assignées à la coordination." },
      { name: "enrollments", type: "Enrollment[]", example: "[...]", description: "Historique d'enrôlement et traçabilité des consentements." },
      { name: "programs", type: "ScreeningProgram[]", example: "[...]", description: "Détail complet du ou des programmes de dépistage suivis." },
    ],
  },
  Practitioner: {
    title: "Practitioner",
    description: "Professionnel de santé intervenant (médecin traitant, radiologue, gynécologue, gastro-entérologue).",
    fields: [
      { name: "id", type: "string", example: '"med-1"', description: "Identifiant technique unique du praticien." },
      { name: "nom", type: "string", example: '"Fabre"', description: "Nom de famille du professionnel." },
      { name: "prenom", type: "string", example: '"Marc"', description: "Prénom du professionnel." },
      { name: "specialite", type: "string", example: '"Médecine générale"', description: "Discipline médicale exercée." },
      { name: "structure", type: "string", example: '"Cabinet Médical Saint-Genès"', description: "Nom de la structure ou du cabinet d'exercice." },
      { name: "ville", type: "string", example: '"Bordeaux"', description: "Ville d'exercice." },
      { name: "patientsActifs", type: "number", example: "142", description: "Nombre de patients suivis dans le cadre du dépistage." },
      {
        name: "charge",
        type: "enum",
        example: '"Maîtrisée"',
        description: "Charge de travail estimée du praticien.",
        choices: ["Faible", "Maîtrisée", "Élevée"],
      },
      { name: "disponibilite", type: "string", example: '"Sous 48h"', description: "Délai moyen de prise en charge ou retour d'avis." },
    ],
  },
  Episode: {
    title: "Episode",
    description: "Épisode ou campagne datée de dépistage pour un organe donné.",
    fields: [
      { name: "id", type: "string", example: '"ep-1"', description: "Identifiant unique de l'épisode." },
      {
        name: "type",
        type: "enum",
        example: '"Sein"',
        description: "Organe / programme ciblé par l'épisode.",
        choices: ["Sein", "Colorectal", "Col utérus"],
      },
      {
        name: "statut",
        type: "enum",
        example: '"Examen planifié"',
        description: "Statut d'avancement de l'épisode.",
        choices: ["Invitation envoyée", "Kit envoyé", "Examen planifié", "Résultats disponibles"],
      },
      { name: "dateOuverture", type: "string", example: '"15/01/2026"', description: "Date de création de l'épisode (JJ/MM/AAAA)." },
      { name: "prochaineEtape", type: "string", example: '"Réalisation mammographie"', description: "Libellé de la prochaine action requise." },
    ],
  },
  Enrollment: {
    title: "Enrollment",
    description: "Canal d'adhésion et recueil du consentement du patient pour la campagne.",
    fields: [
      { name: "id", type: "string", example: '"enr-1"', description: "Identifiant de l'enrôlement." },
      {
        name: "canal",
        type: "enum",
        example: '"Portail"',
        description: "Moyen d'entrée dans le dispositif.",
        choices: ["Portail", "Téléphone", "Cabinet", "Campagne"],
      },
      {
        name: "statut",
        type: "enum",
        example: '"Validé"',
        description: "État de complétude de l'enrôlement.",
        choices: ["À valider", "Validé", "Incomplet"],
      },
      { name: "date", type: "string", example: '"10/01/2026"', description: "Date de l'enrôlement." },
      { name: "consentement", type: "boolean", example: "true", description: "Indicateur d'acceptation éclairée de l'usager (true / false)." },
    ],
  },
  Task: {
    title: "Task",
    description: "Tâche de coordination ou relance opérationnelle.",
    fields: [
      { name: "id", type: "string", example: '"tsk-1"', description: "Identifiant de la tâche." },
      { name: "titre", type: "string", example: '"Relancer patiente non-répondante"', description: "Action à réaliser." },
      { name: "echeance", type: "string", example: '"28/02/2026"', description: "Date limite de traitement." },
      {
        name: "priorite",
        type: "enum",
        example: '"Haute"',
        description: "Niveau d'urgence.",
        choices: ["Basse", "Normale", "Haute"],
      },
      {
        name: "statut",
        type: "enum",
        example: '"À faire"',
        description: "État de traitement de la tâche.",
        choices: ["À faire", "En cours", "Bloquée", "Terminée"],
      },
      { name: "assigneA", type: "string", example: '"Coordination Gironde"', description: "Acteur responsable de la complétion." },
    ],
  },
  ScreeningProgram: {
    title: "ScreeningProgram",
    description: "Parcours de soins médicalisé propre à un organe de dépistage.",
    fields: [
      {
        name: "type",
        type: "enum",
        example: '"Sein"',
        description: "Organe de dépistage concerné.",
        choices: ["Sein", "Colorectal", "Col utérus"],
      },
      {
        name: "niveauRisque",
        type: "enum",
        example: '"Standard"',
        description: "Classification du risque médical.",
        choices: ["Standard", "Surveillance rapprochée", "Avis spécialisé"],
      },
      { name: "tendanceRegionale", type: "string", example: '"+4.2% participation"', description: "Repère comparatif statistique." },
      { name: "resultatCle", type: "string", example: '"ACR 2 (Normal)"', description: "Diagnostic synthétique issu du dernier examen." },
      { name: "prochainExamen", type: "string", example: '"Janvier 2028"', description: "Période planifiée du prochain contrôle." },
      { name: "historique", type: "string[]", example: '["2024: ACR 2", "2022: ACR 1"]', description: "Historique des conclusions d'examens." },
      { name: "parcours", type: "CareTimelineStep[]", example: "[...]", description: "Jalons chronologiques de la timeline de soins." },
      { name: "formulaires", type: "object[]", example: "[...]", description: "Questionnaires (statuts: 'À compléter' | 'Complet' | 'À revoir')." },
      { name: "examensProposes", type: "object[]", example: "[...]", description: "Actes préconisés avec justification clinique." },
      { name: "documents", type: "ScreeningDocument[]", example: "[...]", description: "Comptes-rendus radiologiques et bilans biologiques." },
    ],
  },
  ScreeningDocument: {
    title: "ScreeningDocument",
    description: "Document médical ou administratif associé au dossier patient.",
    fields: [
      { name: "id", type: "string", example: '"doc-1"', description: "Identifiant du document." },
      { name: "titre", type: "string", example: '"Compte-rendu mammographie T2"', description: "Intitulé du compte-rendu ou formulaire." },
      {
        name: "type",
        type: "enum",
        example: '"Compte-rendu"',
        description: "Catégorie documentaire.",
        choices: ["Compte-rendu", "Résultat biologique", "Préparation examen", "Consentement"],
      },
      { name: "date", type: "string", example: '"20/01/2026"', description: "Date d'émission ou de téléversement." },
      {
        name: "statut",
        type: "enum",
        example: '"Disponible"',
        description: "Disponibilité du fichier.",
        choices: ["Disponible", "À signer", "En attente"],
      },
      { name: "aperçu", type: "string", example: '"Mammographie bilatérale sans anomalie"', description: "Résumé textuel du contenu." },
      { name: "indicateur", type: "string", example: '"ACR 2"', description: "Classification sémiologique standardisée." },
      { name: "auteur", type: "string", example: '"Dr Valérie Martin (Radiologue)"', description: "Médecin signataire ou organisme émetteur." },
    ],
  },
  MessageThread: {
    title: "MessageThread",
    description: "Fil de discussion sécurisé (messagerie interne inter-acteurs).",
    fields: [
      { name: "id", type: "string", example: '"msg-1"', description: "Identifiant unique du fil de discussion." },
      { name: "sujet", type: "string", example: '"Confirmation de votre rendez-vous"', description: "Objet du message." },
      { name: "expediteur", type: "string", example: '"Coordination ESIS"', description: "Identité de l'expéditeur." },
      { name: "destinataire", type: "string", example: '"Claire Lemoine"', description: "Destinataire du message." },
      { name: "aperçu", type: "string", example: '"Bonjour, nous vous confirmons..."', description: "Extrait synthétique affiché en liste." },
      { name: "contenu", type: "string", example: '"Bonjour Mme Lemoine, votre examen est calé..."', description: "Texte complet du message." },
      { name: "date", type: "string", example: '"18/02/2026 14:30"', description: "Date et heure d'envoi." },
      {
        name: "statut",
        type: "enum",
        example: '"Non lu"',
        description: "État de lecture.",
        choices: ["Lu", "Non lu", "Envoyé", "Brouillon"],
      },
      {
        name: "boite",
        type: "enum",
        example: '"Réception"',
        description: "Dossier de classement du message.",
        choices: ["Réception", "Envoyés", "Brouillons", "Archives"],
      },
      { name: "securise", type: "boolean", example: "true", description: "Garantie de transmission chiffrée (MSSanté)." },
      {
        name: "importance",
        type: "enum",
        example: '"Normale"',
        description: "Niveau de priorité.",
        choices: ["Normale", "Haute"],
      },
      {
        name: "roleCible",
        type: "enum",
        example: '"patient"',
        description: "Rôle utilisateur visé par la diffusion.",
        choices: ["manager", "patient", "practitioner", "all"],
      },
      { name: "piecesJointes", type: "object[]", example: '[{ nom: "convocation.pdf", taille: "1.2 Mo" }]', description: "Fichiers joints attachés au fil." },
    ],
  },
};

export function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<"dictionary" | "functional" | "flows" | "raw">("dictionary");
  const [selectedEntity, setSelectedEntity] = useState<string>("Patient");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const activeEntityDef = DATA_DICTIONARY[selectedEntity];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 max-w-7xl mx-auto w-full">
      {/* Header compact */}
      <div className="mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-3">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Documentation</h1>
            <p className="text-xs text-gray-500 truncate">
              Architecture fonctionnelle, dictionnaire de données & diagrammes ESIS
            </p>
          </div>
        </div>

        {/* Navigation Tabs (compact) */}
        <div className="flex flex-wrap gap-1 border-b border-gray-200 mt-2.5">
          <button
            onClick={() => setActiveTab("dictionary")}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "dictionary"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            1. Dictionnaire
          </button>
          <button
            onClick={() => setActiveTab("functional")}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "functional"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Périmètre
          </button>
          <button
            onClick={() => setActiveTab("flows")}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "flows"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            3. Diagrammes UML
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "raw"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            4. Markdown
          </button>
        </div>
      </div>

      {/* Tab Content: Data Dictionary */}
      {activeTab === "dictionary" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TableIcon className="w-5 h-5 text-blue-600" />
                  Dictionnaire des Propriétés par Objet
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez une entité pour consulter ses attributs, types, exemples, descriptions et listes de choix exhaustives.
                </p>
              </div>

              {/* Entity Selector Pills */}
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(DATA_DICTIONARY).map((entityKey) => (
                  <button
                    key={entityKey}
                    onClick={() => setSelectedEntity(entityKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedEntity === entityKey
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {entityKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Entity Card */}
            {activeEntityDef && (
              <div>
                <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3.5 mb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Objet : <span className="font-mono">{activeEntityDef.title}</span>
                  </div>
                  <p className="text-xs text-blue-800/80 mt-1">{activeEntityDef.description}</p>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Nom technique</th>
                        <th className="px-3 py-3">Type</th>
                        <th className="px-3 py-3">Exemple</th>
                        <th className="px-4 py-3">Description & Choix autorisés</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                      {activeEntityDef.fields.map((field) => (
                        <tr key={field.name} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-blue-700 whitespace-nowrap">
                            {field.name}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                                field.type === "enum"
                                  ? "bg-purple-100 text-purple-700 font-semibold"
                                  : field.type === "string"
                                  ? "bg-slate-100 text-slate-700"
                                  : field.type === "number"
                                  ? "bg-amber-100 text-amber-800"
                                  : field.type === "boolean"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-sky-100 text-sky-700"
                              }`}
                            >
                              {field.type}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-mono text-gray-500 whitespace-nowrap text-[11px]">
                            {field.example}
                          </td>
                          <td className="px-4 py-3 leading-relaxed">
                            <div className="text-gray-800">{field.description}</div>
                            {field.choices && field.choices.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] uppercase font-semibold text-gray-500">
                                  Choix autorisés ({field.choices.length}) :
                                </span>
                                {field.choices.map((choice) => (
                                  <span
                                    key={choice}
                                    className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-mono text-[11px]"
                                  >
                                    "{choice}"
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Functional & Roles */}
      {activeTab === "functional" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600" />
              Objectifs Métier d'ESIS
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              La plateforme <strong>ESIS</strong> (Enrôlement & Suivi des Dépistages Organisés) a pour objectif
              d'orchestrer, fluidifier et sécuriser l'ensemble de la chaîne de dépistage précoce des cancers
              (<strong>Dépistage du cancer du sein</strong>, <strong>colorectal</strong> et <strong>col de l'utérus</strong>).
              Elle centralise les interactions entre la coordination régionale, les professionnels de santé de ville/hospitaliers
              et les usagers éligibles.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Gestionnaire / Coordinateur
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Supervise les cohortes éligibles, gère les flux d'invitations et de relances, suit les taux de participation
                  et traite les anomalies ou dossiers prioritaires.
                </p>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-blue-500" /> Pilotage des cohortes</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-blue-500" /> Enrôlement de patients</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-blue-500" /> Assignation des tâches</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  Professionnel de Santé (Praticien)
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Médecins traitants, radiologues, gynécologues ou gastro-entérologues réalisant les examens de dépistage
                  et consignant les résultats cliniques.
                </p>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-teal-500" /> Consultation dossier clinique</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-teal-500" /> Validation des comptes-rendus</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-teal-500" /> Messagerie sécurisée inter-pro</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  Usager / Patient
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Consulte son statut d'éligibilité, ses rendez-vous, remplit ses questionnaires de pré-dépistage
                  et accède à ses comptes-rendus numérisés.
                </p>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-500" /> Suivi du calendrier personnel</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-500" /> Remplissage formulaires en ligne</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-500" /> Réception sécurisée des résultats</div>
                </div>
              </div>
            </div>
          </div>

          {/* Programmes de dépistage */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              Programmes de Dépistage Pris en Charge
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-pink-100 bg-pink-50/50 rounded-lg">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase">
                  Dépistage Sein
                </span>
                <h3 className="font-semibold text-gray-900 mt-2 text-sm">Mammographie & Examen Clinique</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Public cible : Femmes 50-74 ans. Rythme : tous les 2 ans avec double lecture systématique des clichés radiologiques.
                </p>
              </div>

              <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                  Dépistage Colorectal
                </span>
                <h3 className="font-semibold text-gray-900 mt-2 text-sm">Test Immunologique Fécal (FIT)</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Public cible : Hommes et femmes 50-74 ans. Commande/envoi de kit à domicile ou remise en cabinet/pharmacie.
                </p>
              </div>

              <div className="p-4 border border-purple-100 bg-purple-50/50 rounded-lg">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">
                  Dépistage Col de l'Utérus
                </span>
                <h3 className="font-semibold text-gray-900 mt-2 text-sm">Test HPV-HR & Frottis (FCU)</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Public cible : Femmes 25-65 ans. Test cytologique (25-29 ans) puis test HPV-HR tous les 5 ans (30-65 ans).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Diagrammes UML (Viewer Interactif) */}
      {activeTab === "flows" && (
        <div className="space-y-6">
          <UmlViewer />
        </div>
      )}

      {/* Tab Content: Raw Markdown */}
      {activeTab === "raw" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                Fichier docs/ARCHITECTURE.md
              </h2>
              <p className="text-xs text-gray-500">
                Source de vérité documentaire du projet versionnée dans le dépôt.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> À jour avec dictionnaires complets
            </span>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs text-gray-800 overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed">
            <p className="text-gray-500 font-semibold mb-2"># Chemin relatif : docs/ARCHITECTURE.md</p>
            <pre className="whitespace-pre-wrap">{`# Documentation Fonctionnelle et Architecture des Données ESIS

## 1. Contexte & Périmètre Fonctionnel
- 3 rôles métiers : Gestionnaire / Coordinateur, Praticien, Patient.
- Dépistages : Sein, Colorectal, Col de l'utérus.

## 2. Architecture des Données & Relations
- Diagramme de classes UML Mermaid.

## 3. Dictionnaire Détaillé des Propriétés par Objet
- Patient (28 propriétés typées avec enum exhaustifs)
- Practitioner (9 propriétés)
- Episode (5 propriétés)
- Enrollment (5 propriétés)
- Task (6 propriétés)
- ScreeningProgram (10 propriétés)
- CareTimelineStep (5 propriétés)
- ScreeningDocument (8 propriétés)
- MessageThread (13 propriétés)

## 4. Architecture de Stockage IndexedDB
- esis-fake-firestore v1 (patients, practitioners, messages, app_metadata)

## 5. Diagrammes UML Mermaid
- State machine cycle de vie
- Séquence de bootstrap
- Séquence d'enrôlement patient
- Séquence de messagerie`}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
