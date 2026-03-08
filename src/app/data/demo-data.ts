import demoData from "./demo-data.json";

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

export interface RoleProfile {
  nom: string;
  fonction: string;
  structure: string;
  initiales: string;
}

export interface DemoDataBundle {
  patients: Patient[];
  practitioners: Practitioner[];
  messages: MessageThread[];
  roleProfiles: Record<UserRole, RoleProfile>;
  defaultRole: UserRole;
  activePatientId: string;
  activePractitionerId: string;
}

function cloneBundle(bundle: DemoDataBundle): DemoDataBundle {
  return structuredClone(bundle);
}

export function createDemoDataBundle(): DemoDataBundle {
  return cloneBundle(demoData as DemoDataBundle);
}

export const demoDataBundle = createDemoDataBundle();
