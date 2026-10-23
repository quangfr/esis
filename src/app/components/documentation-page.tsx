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
  ShieldCheck,
  Users,
  Activity,
  FileText,
  Mail,
  Stethoscope,
  UserCheck,
  CalendarClock,
  Send,
  AlertTriangle,
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
      { name: "praticienId", type: "string", example: '"med-1"', description: "Identifiant applicatif du praticien référent; aucune contrainte de clé étrangère n’est déclarée." },
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
      { name: "tasks", type: "Tache[]", example: "[...]", description: "Tâches d'action et relances assignées à la coordination." },
      { name: "enrollments", type: "Enrolement[]", example: "[...]", description: "Historique d'enrôlement et traçabilité des consentements." },
      { name: "programs", type: "ProgrammeDepistage[]", example: "[...]", description: "Détail complet du ou des programmes de dépistage suivis." },
    ],
  },
  Praticien: {
    title: "Praticien",
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
  Enrolement: {
    title: "Enrolement",
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
  Tache: {
    title: "Tache",
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
  ProgrammeDepistage: {
    title: "ProgrammeDepistage",
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
      { name: "formulaires", type: "Questionnaire[]", example: "[...]", description: "Questionnaires de dépistage intégrés au programme." },
      { name: "examensProposes", type: "ProposedExam[]", example: "[...]", description: "Examens proposés, leur justification et leur résultat." },
      { name: "documents", type: "DocumentMedical[]", example: "[...]", description: "Comptes-rendus radiologiques et bilans biologiques." },
    ],
  },
  DocumentMedical: {
    title: "DocumentMedical",
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
  FilDiscussion: {
    title: "FilDiscussion",
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
      { name: "securise", type: "boolean", example: "true", description: "Indicateur booléen de sécurisation déclaré par le fil." },
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
  Questionnaire: {
    title: "Questionnaire",
    description: "Questionnaire intégré à un ProgrammeDepistage. Les champs sont des libellés de questions.",
    fields: [
      { name: "id", type: "string", example: '"form-1"', description: "Identifiant du questionnaire dans le programme." },
      { name: "titre", type: "string", example: '"Antécédents familiaux"', description: "Titre affiché." },
      { name: "statut", type: "enum", example: '"À compléter"', description: "État de complétion.", choices: ["À compléter", "Complet", "À revoir"] },
      { name: "description", type: "string", example: '"Questionnaire de santé préalable"', description: "Explication du questionnaire." },
      { name: "champs", type: "string[]", example: '["Antécédents", "Traitements"]', description: "Libellés des champs du formulaire." },
    ],
  },
  ProposedExam: {
    title: "ProposedExam",
    description: "Examens proposés dans un ProgrammeDepistage. Objet sans identifiant propre dans le type actuel.",
    fields: [
      { name: "nom", type: "string", example: '"Mammographie bilatérale"', description: "Nom de l'examen proposé." },
      { name: "justification", type: "string", example: '"Dépistage organisé"', description: "Motif ou contexte clinique indiqué." },
      { name: "resultat", type: "string", example: '"À réaliser"', description: "Résultat ou état résumé." },
    ],
  },
  Constantes: {
    title: "Constantes",
    description: "Objet biométrique imbriqué dans Patient.",
    fields: [
      { name: "imc", type: "string", example: '"22.4"', description: "Indice de masse corporelle." },
      { name: "tension", type: "string", example: '"12/8"', description: "Tension artérielle au format affiché." },
      { name: "frequenceCardiaque", type: "string", example: '"72 bpm"', description: "Fréquence cardiaque." },
      { name: "saturation", type: "string", example: '"98%"', description: "Saturation en oxygène." },
    ],
  },
  RoleProfile: {
    title: "RoleProfile",
    description: "Profil de présentation associé à chacun des rôles utilisateur.",
    fields: [
      { name: "nom", type: "string", example: '"Claire Lemoine"', description: "Nom affiché du profil." },
      { name: "fonction", type: "string", example: '"Patiente"', description: "Fonction affichée." },
      { name: "structure", type: "string", example: '"Bordeaux"', description: "Structure ou contexte affiché." },
      { name: "initiales", type: "string", example: '"CL"', description: "Initiales utilisées dans l'interface." },
    ],
  },
  AppMetadata: {
    title: "AppMetadata",
    description: "Enregistrement bootstrap stocké dans app_metadata.",
    fields: [
      { name: "id", type: "string", example: '"bootstrap"', description: "Clé de l'enregistrement de métadonnées." },
      { name: "roleProfiles", type: "Record<UserRole, RoleProfile>", example: "{ manager, patient, practitioner }", description: "Profils de démonstration indexés par rôle." },
      { name: "defaultRole", type: "UserRole", example: '"manager"', description: "Rôle actif par défaut.", choices: ["manager", "patient", "practitioner"] },
      { name: "activePatientId", type: "string", example: '"pt-1"', description: "Identifiant du patient actif dans la session." },
      { name: "activePractitionerId", type: "string", example: '"med-1"', description: "Identifiant du praticien actif dans la session." },
    ],
  },
  DemoDataBundle: {
    title: "DemoDataBundle",
    description: "Bundle de seed et payload de collections. Ce n'est pas un magasin IndexedDB.",
    fields: [
      { name: "patients", type: "Patient[]", example: "[...]", description: "Collection de patients complète, avec sous-objets imbriqués." },
      { name: "practitioners", type: "Practitioner[]", example: "[...]", description: "Collection de professionnels." },
      { name: "messages", type: "MessageThread[]", example: "[...]", description: "Collection de fils de discussion." },
      { name: "roleProfiles", type: "Record<UserRole, RoleProfile>", example: "{ manager, patient, practitioner }", description: "Profils par rôle." },
      { name: "defaultRole", type: "UserRole", example: '"manager"', description: "Rôle sélectionné au démarrage." },
      { name: "activePatientId", type: "string", example: '"pt-1"', description: "Patient actif par défaut." },
      { name: "activePractitionerId", type: "string", example: '"med-1"', description: "Praticien actif par défaut." },
    ],
  },
  CareTimelineStep: {
    title: "CareTimelineStep",
    description: "Étape chronologique imbriquée dans le parcours d'un ProgrammeDepistage.",
    fields: [
      { name: "id", type: "string", example: '"step-1"', description: "Identifiant de l'étape." },
      { name: "titre", type: "string", example: '"Envoi du courrier d’invitation"', description: "Intitulé de l'étape." },
      { name: "periode", type: "string", example: '"Janvier 2026"', description: "Date ou période affichée." },
      { name: "statut", type: "enum", example: '"En cours"', description: "Position dans le parcours.", choices: ["Précédent", "En cours", "Suivant"] },
      { name: "detail", type: "string", example: '"Courrier envoyé"', description: "Précision opérationnelle." },
    ],
  },
  Attachment: {
    title: "Attachment",
    description: "Pièce jointe facultative, imbriquée dans un MessageThread.",
    fields: [
      { name: "nom", type: "string", example: '"convocation.pdf"', description: "Nom du fichier joint." },
      { name: "taille", type: "string", example: '"1.2 Mo"', description: "Taille affichée du fichier." },
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
                  Modèle complet aligné sur les interfaces TypeScript. Les listes métier sont imbriquées dans le dossier Patient.
                </p>
                <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2"><strong>patients</strong><br />Patient et ses sous-objets imbriqués</div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2"><strong>practitioners</strong><br />Praticiens, enregistrements autonomes</div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2"><strong>messages</strong><br />Fils de discussion autonomes</div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2"><strong>app_metadata</strong><br />Profil actif, rôles et identifiants de session</div>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  IndexedDB utilise ces quatre magasins. Les liens par identifiant sont des références applicatives, sans contraintes relationnelles. DemoDataBundle sert au seed et aux réponses de collections, pas de magasin.
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

      {/* Tab Content: Périmètre Fonctionnel Métier */}
      {activeTab === "functional" && (
        <div className="space-y-6">
          {/* Section 1: Finalité & Vision Métier */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Périmètre Métier & Mission de la Plateforme ESIS
                </h2>
                <p className="text-xs text-gray-500">
                  Dispositif régional d'Enrôlement et de Suivi des Dépistages Organisés des Cancers (cahier des charges INCa / DGS).
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              La plateforme <strong>ESIS</strong> a pour finalité d’orchestrer l'ensemble de la chaîne de dépistage organisé des cancers
              sur un territoire de santé. Elle fluidifie la coopération entre les <strong>Centres Régionaux de Coordination des Dépistages des Cancers (CRCDC)</strong>,
              les <strong>professionnels de santé de premier et second recours</strong> (médecins traitants, radiologues, gynécologues, gastro-entérologues, anatomopathologistes)
              et les <strong>usagers éligibles</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <div className="text-blue-900 font-semibold text-xs flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Exhaustivité Populationnelle
                </div>
                <p className="text-[11px] text-blue-800/80 leading-relaxed">
                  Ciblage automatique des populations éligibles par tranches d'âge et NIR sans discrimination géographique ou sociale.
                </p>
              </div>

              <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-100">
                <div className="text-teal-900 font-semibold text-xs flex items-center gap-1.5 mb-1">
                  <CalendarClock className="w-4 h-4 text-teal-600" /> Cadencement & Relances
                </div>
                <p className="text-[11px] text-teal-800/80 leading-relaxed">
                  Automatisation des cycles d'invitation (2 à 5 ans), gestion des kits postaux et relances multicanales (courrier, SMS, portail).
                </p>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                <div className="text-indigo-900 font-semibold text-xs flex items-center gap-1.5 mb-1">
                  <Activity className="w-4 h-4 text-indigo-600" /> Assurance Qualité Médicale
                </div>
                <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                  Double lecture systématique des mammographies, traçabilité des lots de tests FIT et standardisation des comptes-rendus.
                </p>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100">
                <div className="text-purple-900 font-semibold text-xs flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-purple-600" /> Prise en Charge Prioritaire
                </div>
                <p className="text-[11px] text-purple-800/80 leading-relaxed">
                  Circuit court d'alerte et orientation rapide vers les bilans diagnostiques spécialisés en cas d'anomalie détectée.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Programmes Cliniques Couverts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              1. Les 3 Programmes Cliniques de Dépistage Organisé
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sein */}
              <div className="p-4 border border-pink-200 bg-pink-50/30 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase tracking-wide">
                      Cancer du Sein
                    </span>
                    <span className="text-[11px] font-mono font-medium text-pink-900">50 – 74 ans</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Mammographie numérique bilatérale</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    Examen clinique des seins couplé à une mammographie (2 incidences par sein). En cas de cliché initialement normal (ACR 1 ou 2),
                    une <strong>seconde lecture indépendante</strong> par un radiologue expert est réalisée.
                  </p>
                </div>
                <div className="pt-3 border-t border-pink-100 text-[11px] text-gray-700 space-y-1">
                  <div><strong>Rythme :</strong> Tous les 2 ans</div>
                  <div><strong>Indicateur :</strong> Classification BI-RADS / ACR (1 à 5)</div>
                  <div><strong>Étape suivante :</strong> Échographie / Biopsie si ACR 4-5</div>
                </div>
              </div>

              {/* Colorectal */}
              <div className="p-4 border border-blue-200 bg-blue-50/30 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
                      Cancer Colorectal
                    </span>
                    <span className="text-[11px] font-mono font-medium text-blue-900">50 – 74 ans (H & F)</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Test immunologique fécal (FIT)</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    Recherche de sang occulte dans les selles par test immunologique haute sensibilité en prélèvement unique à domicile,
                    commandé en ligne, remis par le médecin traitant ou retiré en pharmacie.
                  </p>
                </div>
                <div className="pt-3 border-t border-blue-100 text-[11px] text-gray-700 space-y-1">
                  <div><strong>Rythme :</strong> Tous les 2 ans</div>
                  <div><strong>Indicateur :</strong> Négatif (&lt; 150 ng/ml) ou Positif (seuil dépassé)</div>
                  <div><strong>Étape suivante :</strong> Coloscopie de diagnostic sous sédation si test positif</div>
                </div>
              </div>

              {/* Col Utérus */}
              <div className="p-4 border border-purple-200 bg-purple-50/30 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase tracking-wide">
                      Col de l'Utérus
                    </span>
                    <span className="text-[11px] font-mono font-medium text-purple-900">25 – 65 ans</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Test HPV-HR & Examen cytologique (FCU)</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    Stratégie adaptée à l'âge : cytologie cervico-utérine de 25 à 29 ans (2 tests à 1 an puis à 3 ans),
                    puis dépistage primaire par <strong>test moléculaire HPV-HR</strong> de 30 à 65 ans.
                  </p>
                </div>
                <div className="pt-3 border-t border-purple-100 text-[11px] text-gray-700 space-y-1">
                  <div><strong>Rythme :</strong> Tous les 3 ans (25-29 ans) puis tous les 5 ans (30-65 ans)</div>
                  <div><strong>Indicateur :</strong> Présence / Absence d'HPV à haut risque oncogène</div>
                  <div><strong>Étape suivante :</strong> Cytologie réflexe / Colposcopie si HPV+</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Chaîne Fonctionnelle de Bout en Bout */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-blue-600" />
              2. Les 4 Piliers Fonctionnels de l'Application
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/40">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-xs mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                  Identification, Éligibilité & Campagne d'Invitation
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Constitution des fichiers cibles par croisement d'âge et historique médical. Envoi des convocations nominatives avec bon de prise en charge à 100% sans avance de frais.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/40">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-xs mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                  Enrôlement, Consentement & Questionnaire Médical
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Adhésion de l'usager par le portail numérique, validation du consentement éclairé (RGPD) et recueil des critères de risque ou antécédents familiaux.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/40">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-xs mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                  Exécution Clinique, Télétransmission & Double Lecture
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Saisie ou téléversement des comptes-rendus par les centres agréés. Gestion du circuit d'assurance qualité avec affectation aléatoire à un second lecteur indépendant.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/40">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-xs mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
                  Clôture de Cycle ou Déclenchement Bilan Diagnostique
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Si résultat normal : archivage de l'épisode et calcul du prochain rappel à échéance. Si anomalie : création d'une alerte prioritaire, tâche de relance et suivi de l'orientation.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Acteurs & Matrice de Droits Métier */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              3. Profils Utilisateurs & Espaces Métier
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Espace Gestionnaire / CRCDC
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Supervise l'ensemble des cohortes départementales et régionales, gère les flux postaux/SMS, suit les non-répondants et résout les dossiers bloqués.
                </p>
                <div className="space-y-1 text-[11px] text-gray-700 font-medium">
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-blue-600" /> Pilotage des cohortes & statistiques</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-blue-600" /> Gestion des relances & enrôlements</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-blue-600" /> Attribution des tâches de coordination</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  Espace Praticien Référent / Centre
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Permet aux médecins traitants, radiologues et spécialistes de consulter l'historique de leurs patients, consigner les actes et télétransmettre les bilans.
                </p>
                <div className="space-y-1 text-[11px] text-gray-700 font-medium">
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-teal-600" /> Consultation de la patientèle active</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-teal-600" /> Validation & signature des comptes-rendus</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-teal-600" /> Messagerie sécurisée interprofessionnelle</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  Espace Usager / Patiente
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Offre à l'usager une vue claire et rassurante de son parcours de prévention, son calendrier d'échéances et ses documents médicaux sécurisés.
                </p>
                <div className="space-y-1 text-[11px] text-gray-700 font-medium">
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-600" /> Suivi personnalisé de la timeline de soins</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-600" /> Consultation & téléchargement des résultats</div>
                  <div className="flex items-center gap-1.5"><ChevronRight className="w-3.5 h-3.5 text-indigo-600" /> Échanges sécurisés avec la coordination</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Diagrammes UML (Viewer Interactif) */}
      {activeTab === "flows" && (
        <div className="w-full flex-1 flex flex-col">
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

## 3. Dictionnaire des Données
- Interfaces TypeScript principales : Patient, Practitioner, Episode, Task, Enrollment, ScreeningProgram, ScreeningDocument, MessageThread et DemoDataBundle.
- Objets imbriqués documentés : Constantes, CareTimelineStep, Questionnaire, ProposedExam et Attachment.
- Métadonnées documentées : RoleProfile et AppMetadata; valeurs des enums indiquées dans les fiches.

## 4. Architecture de Stockage IndexedDB
- esis-fake-firestore v1 : magasins patients, practitioners, messages et app_metadata.
- Les sous-objets métier restent imbriqués dans leur Patient ou Programme; ils ne sont pas des magasins séparés.
- DemoDataBundle sert à l'amorçage et aux payloads de collections, pas au stockage.

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
