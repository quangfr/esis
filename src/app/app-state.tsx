import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type UserRole = "manager" | "patient" | "practitioner";

export interface Practitioner {
  id: string;
  nom: string;
  prenom: string;
  specialite: string;
  structure: string;
  ville: string;
  patientsActifs: number;
  charge: "Faible" | "Maîtrisée" | "Élevée";
  disponibilite: string;
}

export interface Episode {
  id: string;
  type: "Sein" | "Colorectal" | "Col utérus";
  statut: "Invitation envoyée" | "Kit envoyé" | "Examen planifié" | "Résultats disponibles";
  dateOuverture: string;
  prochaineEtape: string;
}

export interface Task {
  id: string;
  titre: string;
  echeance: string;
  priorite: "Basse" | "Normale" | "Haute";
  statut: "À faire" | "En cours" | "Bloquée" | "Terminée";
  assigneA: string;
}

export interface Enrollment {
  id: string;
  canal: "Portail" | "Téléphone" | "Cabinet" | "Campagne";
  statut: "À valider" | "Validé" | "Incomplet";
  date: string;
  consentement: boolean;
}

export interface ScreeningDocument {
  id: string;
  titre: string;
  type: "Compte-rendu" | "Résultat biologique" | "Préparation examen" | "Consentement";
  date: string;
  statut: "Disponible" | "À signer" | "En attente";
  aperçu: string;
  indicateur: string;
  auteur: string;
}

export interface CareTimelineStep {
  id: string;
  titre: string;
  periode: string;
  statut: "Précédent" | "En cours" | "Suivant";
  detail: string;
}

export interface ScreeningProgram {
  type: "Sein" | "Colorectal" | "Col utérus";
  niveauRisque: "Standard" | "Surveillance rapprochée" | "Avis spécialisé";
  tendanceRegionale: string;
  resultatCle: string;
  prochainExamen: string;
  historique: string[];
  parcours: CareTimelineStep[];
  formulaires: Array<{
    id: string;
    titre: string;
    statut: "À compléter" | "Complet" | "À revoir";
    description: string;
    champs: string[];
  }>;
  examensProposes: Array<{
    nom: string;
    justification: string;
    resultat: string;
  }>;
  documents: ScreeningDocument[];
}

export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  nir: string;
  typeDepistage: "Sein" | "Colorectal" | "Col utérus";
  statut: "En attente" | "Invité" | "Examen réalisé" | "Résultats disponibles";
  derniereVisite: string;
  prochainRappel: string;
  praticienId: string;
  centre: string;
  ville: string;
  telephone: string;
  email: string;
  risque: "Standard" | "Modéré" | "Prioritaire";
  canalPrefere: "SMS" | "Email" | "Courrier";
  couverture: "Assurance active" | "Vérification requise";
  progression: number;
  medecinTraitant: string;
  groupeSanguin: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  allergies: string[];
  antecedents: string[];
  traitements: string[];
  constantes: {
    imc: string;
    tension: string;
    frequenceCardiaque: string;
    saturation: string;
  };
  situationCourante: string;
  episodes: Episode[];
  tasks: Task[];
  enrollments: Enrollment[];
  programs: ScreeningProgram[];
}

export interface MessageThread {
  id: string;
  sujet: string;
  expediteur: string;
  destinataire: string;
  aperçu: string;
  contenu: string;
  date: string;
  statut: "Lu" | "Non lu" | "Envoyé" | "Brouillon";
  boite: "Réception" | "Envoyés" | "Brouillons" | "Archives";
  securise: boolean;
  importance: "Normale" | "Haute";
  roleCible: UserRole | "all";
  piecesJointes?: Array<{
    nom: string;
    taille: string;
  }>;
}

interface RoleProfile {
  nom: string;
  fonction: string;
  structure: string;
  initiales: string;
}

interface AppStateContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  patients: Patient[];
  practitioners: Practitioner[];
  messages: MessageThread[];
  activeProfile: RoleProfile;
  activePatient: Patient;
  activePractitioner: Practitioner;
}

const PRACTITIONERS: Practitioner[] = [
  {
    id: "pr-1",
    nom: "Dupont",
    prenom: "Martin",
    specialite: "Radiologie",
    structure: "CRDC Île-de-France",
    ville: "Paris",
    patientsActifs: 38,
    charge: "Maîtrisée",
    disponibilite: "Créneaux libres demain",
  },
  {
    id: "pr-2",
    nom: "Leroy",
    prenom: "Sophie",
    specialite: "Médecine générale",
    structure: "Maison de santé Belleville",
    ville: "Paris",
    patientsActifs: 54,
    charge: "Élevée",
    disponibilite: "Relance asynchrone recommandée",
  },
  {
    id: "pr-3",
    nom: "Nguyen",
    prenom: "Karim",
    specialite: "Gastro-entérologie",
    structure: "Clinique Saint-Louis",
    ville: "Saint-Denis",
    patientsActifs: 29,
    charge: "Faible",
    disponibilite: "Visites de suivi cette semaine",
  },
  {
    id: "pr-4",
    nom: "Moreau",
    prenom: "Claire",
    specialite: "Gynécologie",
    structure: "Cabinet République",
    ville: "Montreuil",
    patientsActifs: 46,
    charge: "Maîtrisée",
    disponibilite: "Créneaux jeudi après-midi",
  },
  {
    id: "pr-5",
    nom: "Diallo",
    prenom: "Nora",
    specialite: "Coordination territoriale",
    structure: "CRDC Seine-Saint-Denis",
    ville: "Bobigny",
    patientsActifs: 33,
    charge: "Maîtrisée",
    disponibilite: "Disponible pour enrôlements complexes",
  },
];

const FIRST_NAMES = [
  "Marie",
  "Sophie",
  "Jean",
  "Catherine",
  "Pierre",
  "Nadia",
  "Luc",
  "Isabelle",
  "Karine",
  "Pascal",
  "Mélanie",
  "Amine",
  "Fatou",
  "Camille",
  "Julien",
  "Aïcha",
  "Laurent",
  "Nathalie",
  "Sarah",
  "Yanis",
];

const LAST_NAMES = [
  "Dubois",
  "Martin",
  "Bernard",
  "Petit",
  "Robert",
  "Richard",
  "Durand",
  "Lefevre",
  "Morel",
  "Simon",
  "Laurent",
  "Michel",
  "Garcia",
  "David",
  "Roux",
  "Fournier",
  "Girard",
  "Andre",
  "Mercier",
  "Blanc",
];

const CITIES = ["Paris", "Montreuil", "Créteil", "Nanterre", "Bobigny", "Saint-Denis"];
const CENTERS = [
  "CRDC Île-de-France",
  "Maison de santé Belleville",
  "Clinique Saint-Louis",
  "Cabinet République",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function buildDate(day: number, month: number, year: number) {
  return `${pad(day)}/${pad(month)}/${year}`;
}

function buildNir(index: number, year: number, month: number) {
  const gender = index % 2 === 0 ? 2 : 1;
  return `${gender} ${String(year).slice(2)} ${pad(month)} 75 ${pad(10 + (index % 89))} ${pad(
    20 + ((index * 7) % 79),
  )} ${pad(30 + ((index * 11) % 69))}`;
}

function buildEpisodes(index: number, type: Patient["typeDepistage"]): Episode[] {
  const episodeStatuses: Episode["statut"][] = [
    "Invitation envoyée",
    "Kit envoyé",
    "Examen planifié",
    "Résultats disponibles",
  ];
  return [
    {
      id: `ep-${index}-1`,
      type,
      statut: episodeStatuses[index % episodeStatuses.length],
      dateOuverture: buildDate(3 + (index % 20), 1 + (index % 3), 2026),
      prochaineEtape:
        index % 3 === 0
          ? "Validation médicale"
          : index % 3 === 1
          ? "Rappel patient"
          : "Transmission des résultats",
    },
  ];
}

function buildTasks(index: number, practitionerId: string): Task[] {
  const statuses: Task["statut"][] = ["À faire", "En cours", "Bloquée", "Terminée"];
  const priorities: Task["priorite"][] = ["Normale", "Haute", "Basse"];
  return [
    {
      id: `task-${index}-1`,
      titre:
        index % 3 === 0
          ? "Confirmer le rendez-vous d'imagerie"
          : index % 3 === 1
          ? "Vérifier la complétude du dossier"
          : "Relancer le retour du kit FIT",
      echeance: buildDate(8 + (index % 18), 3, 2026),
      priorite: priorities[index % priorities.length],
      statut: statuses[index % statuses.length],
      assigneA: practitionerId,
    },
  ];
}

function buildEnrollments(index: number): Enrollment[] {
  const channels: Enrollment["canal"][] = ["Portail", "Téléphone", "Cabinet", "Campagne"];
  const statuses: Enrollment["statut"][] = ["Validé", "À valider", "Incomplet"];
  return [
    {
      id: `enr-${index}-1`,
      canal: channels[index % channels.length],
      statut: statuses[index % statuses.length],
      date: buildDate(1 + (index % 28), 2 + (index % 2), 2026),
      consentement: index % 5 !== 0,
    },
  ];
}

function buildProgramDocuments(index: number, type: ScreeningProgram["type"]): ScreeningDocument[] {
  return [
    {
      id: `doc-${type}-${index}-1`,
      titre:
        type === "Sein"
          ? "Compte-rendu mammographie bilatérale"
          : type === "Colorectal"
          ? "Résultat test immunologique fécal"
          : "Compte-rendu frottis cervico-utérin",
      type: type === "Colorectal" ? "Résultat biologique" : "Compte-rendu",
      date: buildDate(4 + (index % 18), 3, 2026),
      statut: "Disponible",
      aperçu:
        type === "Sein"
          ? "Classification BI-RADS avec comparaison aux clichés antérieurs"
          : type === "Colorectal"
          ? "Recherche d'hémoglobine humaine avec seuil régional de relance"
          : "Cytologie liquidienne et recherche HPV à haut risque",
      indicateur:
        type === "Sein" ? "BI-RADS ACR 2-3" : type === "Colorectal" ? "FIT 148 ng/mL" : "HPV16 détecté",
      auteur:
        type === "Sein"
          ? "Dr. Martin Dupont"
          : type === "Colorectal"
          ? "Dr. Karim Nguyen"
          : "Dr. Claire Moreau",
    },
    {
      id: `doc-${type}-${index}-2`,
      titre:
        type === "Sein"
          ? "Questionnaire préparation imagerie"
          : type === "Colorectal"
          ? "Consignes de prélèvement et retour du kit"
          : "Préparation avant colposcopie",
      type: "Préparation examen",
      date: buildDate(6 + (index % 16), 3, 2026),
      statut: index % 3 === 0 ? "À signer" : "Disponible",
      aperçu:
        type === "Sein"
          ? "Antécédents personnels, implants, douleurs et traitement hormonal"
          : type === "Colorectal"
          ? "Médicaments, transit, date des prélèvements et conditions de transport"
          : "Grossesse, symptômes, traitements locaux et antécédents HPV",
      indicateur:
        type === "Sein"
          ? "Checklist imagerie"
          : type === "Colorectal"
          ? "Préparation veille/J0"
          : "Consentement et antécédents",
      auteur: "Portail patient e-SIS",
    },
  ];
}

function buildCareTimeline(index: number, type: ScreeningProgram["type"]): CareTimelineStep[] {
  if (type === "Sein") {
    return [
      {
        id: `tl-${type}-${index}-1`,
        titre: "Invitation et vérification des antécédents",
        periode: "J-45 à J-20",
        statut: "Précédent",
        detail: "Invitation envoyée, questionnaire familial validé et centre de lecture attribué.",
      },
      {
        id: `tl-${type}-${index}-2`,
        titre: "Mammographie et double lecture",
        periode: "J-7 à J0",
        statut: "En cours",
        detail:
          index % 4 === 0
            ? "Asymétrie focale détectée, double lecture terminée avec orientation échographie."
            : "Clichés bilatéraux relus, densité mammaire documentée sans lésion suspecte.",
      },
      {
        id: `tl-${type}-${index}-3`,
        titre: "Décision de suivi ou examen complémentaire",
        periode: "J+7 à J+21",
        statut: "Suivant",
        detail:
          index % 4 === 0
            ? "Échographie ciblée puis consultation sénologique si image persistante."
            : "Retour au rythme standard de contrôle à 24 mois avec rappel automatisé.",
      },
    ];
  }

  if (type === "Colorectal") {
    return [
      {
        id: `tl-${type}-${index}-1`,
        titre: "Envoi du kit FIT et consignes",
        periode: "J-30 à J-10",
        statut: "Précédent",
        detail: "Kit adressé au domicile, vérification de réception et rappel SMS de prélèvement.",
      },
      {
        id: `tl-${type}-${index}-2`,
        titre: "Analyse biologique FIT",
        periode: "J-3 à J0",
        statut: "En cours",
        detail:
          index % 3 === 0
            ? "Test positif au-dessus du seuil régional, dossier transmis en voie prioritaire."
            : "Test négatif validé, absence d'alerte biologique immédiate.",
      },
      {
        id: `tl-${type}-${index}-3`,
        titre: "Orientation post-résultat",
        periode: "J+5 à J+30",
        statut: "Suivant",
        detail:
          index % 3 === 0
            ? "Formulaire de coloscopie, consultation d'anesthésie et planification sous 30 jours."
            : "Nouveau FIT dans 24 mois avec relance populationnelle standard.",
      },
    ];
  }

  return [
    {
      id: `tl-${type}-${index}-1`,
      titre: "Prélèvement et contexte gynécologique",
      periode: "J-40 à J-10",
      statut: "Précédent",
      detail: "Dernier test, statut vaccinal HPV et facteurs de risque mis à jour dans le dossier.",
    },
    {
      id: `tl-${type}-${index}-2`,
      titre: "Analyse HPV / cytologie",
      periode: "J-5 à J0",
      statut: "En cours",
      detail:
        index % 5 === 0
          ? "HPV haut risque détecté avec besoin de triage colposcopique."
          : "Cytologie rassurante et test HPV négatif ou non persistant.",
    },
    {
      id: `tl-${type}-${index}-3`,
      titre: "Conduite à tenir",
      periode: "J+15 à J+90",
      statut: "Suivant",
      detail:
        index % 5 === 0
          ? "Préparation colposcopie, information patiente et éventuelle biopsie ciblée."
          : "Retour au calendrier standard avec nouveau test HPV à 5 ans.",
    },
  ];
}

function buildPrograms(index: number): ScreeningProgram[] {
  return [
    {
      type: "Sein",
      niveauRisque: index % 4 === 0 ? "Avis spécialisé" : "Standard",
      tendanceRegionale:
        "La région renforce depuis 40 ans le repérage précoce des lésions ACR/BI-RADS et la continuité des doubles lectures.",
      resultatCle:
        index % 4 === 0
          ? "Image asymétrique à contrôler, échographie ciblée recommandée"
          : "Mammographie sans anomalie suspecte, contrôle standard maintenu",
      prochainExamen: index % 4 === 0 ? "Échographie mammaire ciblée" : "Mammographie de contrôle à 24 mois",
      historique: [
        "1990-2005: montée du dépistage organisé et normalisation des doubles lectures.",
        "2006-2020: amélioration continue de la qualité image et réduction des délais de relecture.",
        "2021-2026: priorisation territoriale des patientes à densité élevée ou antécédents familiaux.",
      ],
      parcours: buildCareTimeline(index, "Sein"),
      formulaires: [
        {
          id: `form-sein-${index}-1`,
          titre: "Questionnaire antécédents mammaires",
          statut: "Complet",
          description: "Antécédents familiaux, chirurgie mammaire, hormonothérapie et symptômes récents.",
          champs: ["Antécédents familiaux", "Douleur/localisation", "Implants", "Traitement hormonal"],
        },
        {
          id: `form-sein-${index}-2`,
          titre: "Préparation avant échographie",
          statut: index % 4 === 0 ? "À compléter" : "À revoir",
          description: "Checklist de préparation de l'examen ciblé avec disponibilité et consentement.",
          champs: ["Disponibilités", "Personne de confiance", "Zone symptomatique", "Consentement examen"],
        },
      ],
      examensProposes: [
        {
          nom: "Mammographie bilatérale",
          justification: "Examen de base du programme régional de dépistage organisé.",
          resultat: index % 4 === 0 ? "Anomalie ACR 3" : "Normal",
        },
        {
          nom: "Échographie mammaire",
          justification: "Complément recommandé en cas d'image dense ou asymétrique.",
          resultat: index % 4 === 0 ? "À programmer sous 10 jours" : "Non requise à ce stade",
        },
      ],
      documents: buildProgramDocuments(index, "Sein"),
    },
    {
      type: "Colorectal",
      niveauRisque: index % 3 === 0 ? "Surveillance rapprochée" : "Standard",
      tendanceRegionale:
        "Le programme colorectal régional observe depuis quatre décennies une meilleure détection des lésions avancées grâce aux FIT successifs et aux filières de coloscopie rapide.",
      resultatCle:
        index % 3 === 0
          ? "FIT positif, coloscopie diagnostique recommandée"
          : "FIT négatif, prochain contrôle selon calendrier standard",
      prochainExamen: index % 3 === 0 ? "Coloscopie sous anesthésie légère" : "Nouveau FIT dans 24 mois",
      historique: [
        "1985-2000: généralisation progressive de la prévention et des tests de recherche de sang occulte.",
        "2001-2015: transition vers les tests immunologiques plus sensibles.",
        "2016-2026: amélioration des circuits de coloscopie après FIT positif et suivi des adénomes.",
      ],
      parcours: buildCareTimeline(index, "Colorectal"),
      formulaires: [
        {
          id: `form-colo-${index}-1`,
          titre: "Questionnaire symptômes digestifs",
          statut: "Complet",
          description: "Transit, saignement, antécédents d'adénomes et traitements anticoagulants.",
          champs: ["Transit", "Saignement", "Anticoagulants", "Antécédents familiaux"],
        },
        {
          id: `form-colo-${index}-2`,
          titre: "Préparation coloscopie",
          statut: index % 3 === 0 ? "À compléter" : "Complet",
          description: "Organisation pré-anesthésie, purge, accompagnant et allergies médicamenteuses.",
          champs: ["Pré-anesthésie", "Purge", "Accompagnant", "Allergies"],
        },
      ],
      examensProposes: [
        {
          nom: "Test immunologique fécal",
          justification: "Outil de première intention du dépistage colorectal organisé.",
          resultat: index % 3 === 0 ? "Positif" : "Négatif",
        },
        {
          nom: "Coloscopie",
          justification: "Indiquée après FIT positif pour caractériser et traiter les lésions.",
          resultat: index % 3 === 0 ? "À planifier prioritairement" : "Non indiquée",
        },
      ],
      documents: buildProgramDocuments(index, "Colorectal"),
    },
    {
      type: "Col utérus",
      niveauRisque: index % 5 === 0 ? "Avis spécialisé" : "Standard",
      tendanceRegionale:
        "Le dépistage du col s'appuie sur 40 ans d'expérience combinant frottis, vaccination et désormais triage HPV à haut risque.",
      resultatCle:
        index % 5 === 0
          ? "HPV haut risque détecté, colposcopie à préparer"
          : "Contrôle cytologique rassurant, suivi usuel",
      prochainExamen: index % 5 === 0 ? "Colposcopie avec biopsie ciblée si nécessaire" : "Nouveau test HPV dans 5 ans",
      historique: [
        "1985-2005: structuration du frottis organisé et baisse de l'incidence des formes invasives.",
        "2006-2020: intégration progressive de l'HPV et amélioration du repérage des lésions de haut grade.",
        "2021-2026: personnalisation des rappels selon vaccination, âge et antécédents lésionnels.",
      ],
      parcours: buildCareTimeline(index, "Col utérus"),
      formulaires: [
        {
          id: `form-col-${index}-1`,
          titre: "Questionnaire gynécologique",
          statut: "Complet",
          description: "Derniers frottis, vaccination HPV, symptômes, contraception et grossesse en cours.",
          champs: ["Dernier frottis", "Vaccination HPV", "Symptômes", "Grossesse"],
        },
        {
          id: `form-col-${index}-2`,
          titre: "Préparation colposcopie",
          statut: index % 5 === 0 ? "À compléter" : "Complet",
          description: "Préparation du rendez-vous, consentement et informations sur les suites potentielles.",
          champs: ["Disponibilités", "Consentement", "Traitements locaux", "Personne à prévenir"],
        },
      ],
      examensProposes: [
        {
          nom: "Test HPV",
          justification: "Test de référence après 30 ans dans le programme régional.",
          resultat: index % 5 === 0 ? "HPV 16 positif" : "Négatif",
        },
        {
          nom: "Colposcopie",
          justification: "Examen de second niveau en cas de positivité HPV persistante ou cytologie anormale.",
          resultat: index % 5 === 0 ? "Recommandée" : "Non nécessaire",
        },
      ],
      documents: buildProgramDocuments(index, "Col utérus"),
    },
  ];
}

function buildPatients(): Patient[] {
  return Array.from({ length: 55 }, (_, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(index * 3) % LAST_NAMES.length];
    const practitioner = PRACTITIONERS[index % PRACTITIONERS.length];
    const screeningTypes: Patient["typeDepistage"][] = ["Sein", "Colorectal", "Col utérus"];
    const statuses: Patient["statut"][] = [
      "En attente",
      "Invité",
      "Examen réalisé",
      "Résultats disponibles",
    ];
    const risques: Patient["risque"][] = ["Standard", "Modéré", "Prioritaire"];
    const channels: Patient["canalPrefere"][] = ["SMS", "Email", "Courrier"];
    const typeDepistage = screeningTypes[index % screeningTypes.length];

    return {
      id: `pt-${index + 1}`,
      nom: lastName,
      prenom: firstName,
      dateNaissance: buildDate(1 + ((index * 2) % 28), 1 + (index % 12), 1958 + (index % 20)),
      nir: buildNir(index + 1, 1958 + (index % 20), 1 + (index % 12)),
      typeDepistage,
      statut: statuses[index % statuses.length],
      derniereVisite: buildDate(2 + (index % 24), 1 + ((index + 1) % 3), 2026),
      prochainRappel:
        index % 4 === 2 ? "-" : buildDate(10 + (index % 18), 3 + (index % 2), 2026),
      praticienId: practitioner.id,
      centre: CENTERS[index % CENTERS.length],
      ville: CITIES[index % CITIES.length],
      telephone: `06 ${pad(10 + (index % 80))} ${pad(15 + (index % 70))} ${pad(
        20 + (index % 60),
      )} ${pad(25 + (index % 50))}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@example.fr`,
      risque: risques[index % risques.length],
      canalPrefere: channels[index % channels.length],
      couverture: index % 6 === 0 ? "Vérification requise" : "Assurance active",
      progression: 25 + ((index * 11) % 75),
      medecinTraitant: `Dr. ${practitioner.prenom} ${practitioner.nom}`,
      groupeSanguin: (["A+", "O+", "B+", "AB+", "A-", "O-"] as Patient["groupeSanguin"][])[index % 6],
      allergies:
        index % 4 === 0
          ? ["Iode", "Latex"]
          : index % 4 === 1
          ? ["Pénicilline"]
          : ["Aucune allergie connue"],
      antecedents:
        typeDepistage === "Sein"
          ? ["Antécédent familial premier degré", "Densité mammaire élevée"]
          : typeDepistage === "Colorectal"
          ? ["Polype adénomateux retiré en 2021", "Tabagisme sevré"]
          : ["ASC-US en 2022", "Vaccination HPV incomplète"],
      traitements:
        index % 3 === 0
          ? ["Aspirine faible dose", "Vitamine D"]
          : index % 3 === 1
          ? ["Aucun traitement chronique"]
          : ["Antihypertenseur", "Statine"],
      constantes: {
        imc: `${22 + (index % 7)}.${index % 10}`,
        tension: `${11 + (index % 4)}/${7 + (index % 3)}`,
        frequenceCardiaque: `${64 + (index % 18)} bpm`,
        saturation: `${97 - (index % 2)}%`,
      },
      situationCourante:
        index % 3 === 0
          ? "Patiente joignable, examen complémentaire à organiser avec confirmation du transport."
          : index % 3 === 1
          ? "Surveillance standard, aucun symptôme d'alerte signalé lors du dernier contact."
          : "Dossier stable, attente de validation administrative avant prochaine convocation.",
      episodes: buildEpisodes(index + 1, typeDepistage),
      tasks: buildTasks(index + 1, practitioner.id),
      enrollments: buildEnrollments(index + 1),
      programs: buildPrograms(index + 1),
    };
  });
}

const PATIENTS = buildPatients();

const MESSAGES: MessageThread[] = [
  {
    id: "msg-1",
    sujet: "Résultats mammographie disponibles",
    expediteur: "Dr. Martin Dupont",
    destinataire: "Marie Dubois",
    aperçu: "Le compte-rendu est validé et peut être consulté dans votre espace sécurisé.",
    contenu:
      "Le compte-rendu de mammographie a été validé. Merci de consulter le document sécurisé et de confirmer la bonne réception avant le 10/03/2026.",
    date: "07/03/2026 10:30",
    statut: "Envoyé",
    boite: "Envoyés",
    securise: true,
    importance: "Haute",
    roleCible: "manager",
    piecesJointes: [{ nom: "compte-rendu-mammographie.pdf", taille: "2,3 Mo" }],
  },
  {
    id: "msg-2",
    sujet: "Bienvenue dans votre parcours de dépistage",
    expediteur: "CRDC Île-de-France",
    destinataire: "Marie Dubois",
    aperçu: "Votre inscription a bien été validée, voici les prochaines étapes.",
    contenu:
      "Votre inscription est validée. Étape suivante: choisir un créneau ou demander un rappel infirmier depuis l'onglet Mon parcours.",
    date: "06/03/2026 14:15",
    statut: "Lu",
    boite: "Réception",
    securise: true,
    importance: "Normale",
    roleCible: "patient",
  },
  {
    id: "msg-3",
    sujet: "Patients à relancer cette semaine",
    expediteur: "Coordination territoriale",
    destinataire: "Dr. Sophie Leroy",
    aperçu: "Trois dossiers nécessitent une relance avant vendredi.",
    contenu:
      "Merci de prioriser les patients Bernard Jean, Simon Sarah et David Luc. Les relances conditionnent la clôture du lot colorectal de la semaine.",
    date: "06/03/2026 09:10",
    statut: "Non lu",
    boite: "Réception",
    securise: true,
    importance: "Haute",
    roleCible: "practitioner",
  },
  {
    id: "msg-4",
    sujet: "Brouillon de campagne de relance",
    expediteur: "CRDC Île-de-France",
    destinataire: "Lot colorectal mars",
    aperçu: "Brouillon à relire avant envoi groupé.",
    contenu:
      "Relance collective prévue vendredi 11h. Ajouter un rappel sur le retour du kit et le numéro de support patient.",
    date: "05/03/2026 17:45",
    statut: "Brouillon",
    boite: "Brouillons",
    securise: true,
    importance: "Normale",
    roleCible: "manager",
  },
  {
    id: "msg-5",
    sujet: "Question sur le rendez-vous de suivi",
    expediteur: "Catherine Petit",
    destinataire: "Dr. Martin Dupont",
    aperçu: "Je souhaite déplacer le rendez-vous initialement prévu jeudi.",
    contenu:
      "Je ne pourrai pas me présenter jeudi matin. Pouvez-vous me proposer un créneau la semaine prochaine ou une téléconsultation rapide pour valider le dossier ?",
    date: "05/03/2026 11:22",
    statut: "Non lu",
    boite: "Réception",
    securise: true,
    importance: "Normale",
    roleCible: "all",
  },
  {
    id: "msg-6",
    sujet: "Archive de consentement",
    expediteur: "Plateforme d'enrôlement",
    destinataire: "CRDC Île-de-France",
    aperçu: "Traçabilité du consentement mise à jour.",
    contenu:
      "Le consentement signé de Nadia Richard a été archivé et horodaté. Aucun traitement complémentaire requis.",
    date: "04/03/2026 08:05",
    statut: "Lu",
    boite: "Archives",
    securise: true,
    importance: "Normale",
    roleCible: "manager",
  },
];

const ROLE_PROFILES: Record<UserRole, RoleProfile> = {
  manager: {
    nom: "Dr. Martin Dupont",
    fonction: "Gestionnaire régional",
    structure: "CRDC Île-de-France",
    initiales: "MD",
  },
  patient: {
    nom: "Marie Dubois",
    fonction: "Patiente",
    structure: "Parcours sein",
    initiales: "MA",
  },
  practitioner: {
    nom: "Dr. Sophie Leroy",
    fonction: "Praticienne référente",
    structure: "Maison de santé Belleville",
    initiales: "SL",
  },
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("manager");

  const value = useMemo<AppStateContextValue>(
    () => ({
      role,
      setRole,
      patients: PATIENTS,
      practitioners: PRACTITIONERS,
      messages: MESSAGES,
      activeProfile: ROLE_PROFILES[role],
      activePatient: PATIENTS[0],
      activePractitioner: PRACTITIONERS[1],
    }),
    [role],
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
