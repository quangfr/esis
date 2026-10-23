# Documentation Fonctionnelle et Architecture des Données ESIS

Ce document présente l'architecture fonctionnelle globale, le dictionnaire détaillé des données par objet, le cycle de vie métier ainsi que les diagrammes de flux UML Mermaid pour la plateforme **ESIS** (Enrôlement & Suivi des Dépistages Organisés).

---

## 1. Contexte & Périmètre Fonctionnel

ESIS est une application front-end de gestion et de suivi des campagnes de dépistage organisé des cancers (Sein, Colorectal, Col de l'utérus). Elle s'articule autour de 3 rôles métiers distincts :

1. **Gestionnaire / Coordinateur (`manager`)** :
   - Pilotage des cohortes, suivi des indicateurs clés (taux de participation, relances, alertes).
   - Enrôlement de nouveaux patients et suivi de leur parcours.
   - Assignation des tâches de coordination et gestion des anomalies.
2. **Professionnel de Santé / Praticien (`practitioner`)** :
   - Consultation des dossiers patients qui lui sont rattachés.
   - Validation des examens, télétransmission et lecture des comptes-rendus.
   - Échanges sécurisés avec la coordination et les patients.
3. **Patient (`patient`)** :
   - Consultation de son programme de dépistage personnalisé et de son calendrier.
   - Renseignement des formulaires de pré-dépistage et consentements.
   - Messagerie sécurisée avec l'équipe de coordination.

---

## 2. Architecture des Données & Relations

```mermaid
classDiagram
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
```

### Représentation et limites du modèle

Le modèle applicatif est constitué d'objets TypeScript. IndexedDB contient quatre magasins (`patients`, `practitioners`, `messages`, `app_metadata`), chacun avec une clé `id`. Les épisodes, tâches, enrôlements et programmes sont des tableaux imbriqués dans un objet patient. Les étapes, questionnaires, examens proposés et documents sont à leur tour imbriqués dans un programme; les pièces jointes sont imbriquées dans un fil de discussion. Ces éléments ne sont donc pas des magasins ou tables autonomes.

`praticienId`, `assigneA` et `auteur` sont des chaînes de caractères. Le schéma ne déclare pas de contraintes de clé étrangère ni de relations relationnelles garanties. Les messages contiennent des noms d'expéditeur et de destinataire et un rôle cible, mais aucun identifiant de patient ou praticien; le diagramme n'invente donc pas de lien direct entre un fil et ces objets.

`DemoDataBundle` sert à l'amorçage initial et aux réponses de collections. Ce n'est pas un magasin IndexedDB. `app_metadata` conserve l'enregistrement `bootstrap`, les profils par rôle, le rôle par défaut et les identifiants actifs.

---

## 3. Dictionnaire Détaillé des Propriétés des Données par Objet

### 3.1. Objet `Patient`
Entité centrale représentant l'usager éligible ou enrôlé dans un ou plusieurs dépistages.

| Nom technique | Type | Exemple | Description / Valeurs autorisées |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `"pt-1"` | Identifiant technique unique du patient. |
| `nom` | `string` | `"Lemoine"` | Nom de famille de l'usager. |
| `prenom` | `string` | `"Claire"` | Prénom de l'usager. |
| `dateNaissance` | `string` | `"14/05/1972"` | Date de naissance au format JJ/MM/AAAA. |
| `nir` | `string` | `"2 72 05 75 123 456 78"` | Numéro d'inscription au répertoire (Sécurité Sociale). |
| `typeDepistage` | `enum` | `"Sein"` | Type de dépistage principal rattaché :<br>• `"Sein"`<br>• `"Colorectal"`<br>• `"Col utérus"` |
| `statut` | `enum` | `"Invité"` | Statut global dans la campagne en cours :<br>• `"En attente"`<br>• `"Invité"`<br>• `"Examen réalisé"`<br>• `"Résultats disponibles"` |
| `derniereVisite` | `string` | `"12/01/2026"` | Date du dernier contact ou examen de dépistage réalisé. |
| `prochainRappel` | `string` | `"12/01/2028"` | Échéance calculée du prochain rappel de dépistage. |
| `praticienId` | `string` | `"med-1"` | Référence (clé étrangère) vers le `Practitioner` référent. |
| `centre` | `string` | `"Centre de Radiologie Gambetta"` | Centre d'examen ou structure de soins rattachée. |
| `ville` | `string` | `"Bordeaux"` | Ville de résidence ou de prise en charge. |
| `telephone` | `string` | `"06 12 34 56 78"` | Numéro de téléphone mobile pour les notifications et relances. |
| `email` | `string` | `"claire.lemoine@email.fr"` | Adresse électronique pour l'accès portail et notifications. |
| `risque` | `enum` | `"Standard"` | Niveau d'évaluation du risque oncologique :<br>• `"Standard"`<br>• `"Modéré"`<br>• `"Prioritaire"` |
| `canalPrefere` | `enum` | `"SMS"` | Canal de communication privilégié par l'usager :<br>• `"SMS"`<br>• `"Email"`<br>• `"Courrier"` |
| `couverture` | `enum` | `"Assurance active"` | État des droits AMO / ALD :<br>• `"Assurance active"`<br>• `"Vérification requise"` |
| `progression` | `number` | `45` | Pourcentage de complétion du cycle en cours (0 à 100). |
| `medecinTraitant` | `string` | `"Dr Marc Fabre"` | Nom du médecin traitant déclaré. |
| `groupeSanguin` | `enum` | `"A+"` | Groupe sanguin et rhésus :<br>• `"A+"`, `"A-"`, `"B+"`, `"B-"`, `"AB+"`, `"AB-"`, `"O+"`, `"O-"` |
| `allergies` | `string[]` | `["Pénicilline", "Iode"]` | Liste des allergies médicamenteuses ou de contact déclarées. |
| `antecedents` | `string[]` | `["Antécédent maternel cancer sein"]` | Antécédents médicaux personnels ou familiaux notables. |
| `traitements` | `string[]` | `["Lévothyrox 50µg"]` | Traitements médicamenteux en cours. |
| `constantes` | `object` | `{ imc: "22.4", tension: "12/8", ... }` | Données biométriques : `imc`, `tension`, `frequenceCardiaque`, `saturation`. |
| `situationCourante`| `string` | `"En attente de mammographie T2"` | Synthèse textuelle de la situation clinique actuelle. |
| `episodes` | `Episode[]` | `[...]` | Liste des campagnes / épisodes historiques de dépistage. |
| `tasks` | `Task[]` | `[...]` | Tâches de suivi et d'actions associées au dossier. |
| `enrollments` | `Enrollment[]` | `[...]` | Historique des canaux d'enrôlement et consentements. |
| `programs` | `ScreeningProgram[]` | `[...]` | Déroulement spécifique par organe (timeline, formulaires, documents). |

---

### 3.2. Objet `Praticien`
Professionnel de santé impliqué (médecin traitant, radiologue, gynécologue, gastro-entérologue).

| Nom technique | Type | Exemple | Description / Valeurs autorisées |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `"med-1"` | Identifiant unique du praticien. |
| `nom` | `string` | `"Fabre"` | Nom de famille du professionnel. |
| `prenom` | `string` | `"Marc"` | Prénom du professionnel. |
| `specialite` | `string` | `"Médecine générale"` | Spécialité médicale (ex: Radiologie, Gynécologie). |
| `structure` | `string` | `"Cabinet Médical Saint-Genès"` | Nom de l'établissement ou du cabinet d'exercice. |
| `ville` | `string` | `"Bordeaux"` | Ville d'exercice. |
| `patientsActifs`| `number` | `142` | Nombre total de patients suivis dans le cadre du dépistage. |
| `charge` | `enum` | `"Maîtrisée"` | Niveau de charge d'activité du praticien :<br>• `"Faible"`<br>• `"Maîtrisée"`<br>• `"Élevée"` |
| `disponibilite`| `string` | `"Sous 48h"` | Délais de disponibilité pour la prise en charge ou avis. |

---

### 3.3. Objet `Episode`
Campagne ou cycle de dépistage daté pour un organe spécifique.

| Nom technique | Type | Exemple | Description / Valeurs autorisées |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `"ep-1"` | Identifiant unique de l'épisode. |
| `type` | `enum` | `"Sein"` | Organe / programme concerné :<br>• `"Sein"`<br>• `"Colorectal"`<br>• `"Col utérus"` |
| `statut` | `enum` | `"Examen planifié"` | Étape courante de l'épisode :<br>• `"Invitation envoyée"`<br>• `"Kit envoyé"`<br>• `"Examen planifié"`<br>• `"Résultats disponibles"` |
| `dateOuverture` | `string` | `"15/01/2026"` | Date de création de l'épisode (format JJ/MM/AAAA). |
| `prochaineEtape`| `string` | `"Réalisation mammographie"` | Action immédiatement attendue dans le parcours. |

---

### 3.4. Objet `Enrolement`
Canal d'entrée et validation du consentement du patient dans la campagne.

| Nom technique | Type | Exemple | Description / Valeurs autorisées |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `"enr-1"` | Identifiant de l'enrôlement. |
| `canal` | `enum` | `"Portail"` | Canal d'initiation :<br>• `"Portail"`<br>• `"Téléphone"`<br>• `"Cabinet"`<br>• `"Campagne"` |
| `statut` | `enum` | `"Validé"` | État de conformité du dossier :<br>• `"À valider"`<br>• `"Validé"`<br>• `"Incomplet"` |
| `date` | `string` | `"10/01/2026"` | Date d'enrôlement constatée. |
| `consentement` | `boolean` | `true` | Recueil explicite du consentement de l'usager (`true` / `false`). |

---

### 3.5. Objet `Tache`
Tâche d'action assignée à un membre de l'équipe de coordination ou praticien.

| Nom technique | Type | Exemple | Description / Valeurs autorisées |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `"tsk-1"` | Identifiant de la tâche. |
| `titre` | `string` | `"Relancer patiente non-répondante"` | Libellé explicite de l'action à mener. |
| `echeance` | `string` | `"28/02/2026"` | Date limite de réalisation. |
| `priorite` | `enum` | `"Haute"` | Degré d'urgence :<br>• `"Basse"`<br>• `"Normale"`<br>• `"Haute"` |
| `statut` | `enum` | `"À faire"` | Avancement de la tâche :<br>• `"À faire"`<br>• `"En cours"`<br>• `"Bloquée"`<br>• `"Terminée"` |
| `assigneA` | `string` | `"Coordination Gironde"` | Entité ou professionnel en charge de la tâche. |

---

### 3.6. Objet `ProgrammeDepistage`
Déroulement clinique spécifique pour un programme de dépistage donné.

| Nom technique | Type | Exemple | Description / Valeurs autorisées |
| :--- | :--- | :--- | :--- |
| `type` | `enum` | `"Sein"` | Type d'organe :<br>• `"Sein"`<br>• `"Colorectal"`<br>• `"Col utérus"` |
| `niveauRisque` | `enum` | `"Standard"` | Stratification du risque :<br>• `"Standard"`<br>• `"Surveillance rapprochée"`<br>• `"Avis spécialisé"` |
| `tendanceRegionale` | `string` | `"+4.2% participation"` | Indicateur statistique régional comparatif. |
| `resultatCle` | `string` | `"ACR 2 (Normal)"` | Résultat synthétique de la dernière exploration. |
| `prochainExamen`| `string` | `"Janvier 2028"` | Échéance calendaire de la prochaine séance. |
| `historique` | `string[]` | `["2024: ACR 2", "2022: ACR 1"]` | Synthèse historique des examens antérieurs. |
| `parcours` | `CareTimelineStep[]` | `[...]` | Étapes chronologiques détaillées (voir ci-après). |
| `formulaires` | `object[]` | `[...]` | Questionnaires médicaux : `id`, `titre`, `statut` (`"À compléter"`, `"Complet"`, `"À revoir"`), `champs`. |
| `examensProposes`| `object[]` | `[...]` | Actes médicaux prescrits : `nom`, `justification`, `resultat`. |
| `documents` | `ScreeningDocument[]` | `[...]` | Pièces jointes et comptes-rendus médicaux. |

---

### 3.7. Objet `CareTimelineStep` (Sous-objet de `ProgrammeDepistage`)
Étape de la timeline du parcours de soins.

| Nom technique | Type | Exemple | Description / Valeurs autorisées |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `"step-1"` | Identifiant de l'étape. |
| `titre` | `string` | `"Envoi du courrier d'invitation"` | Intitulé de l'étape. |
| `periode` | `string` | `"Janvier 2026"` | Période ou date de franchissement. |
| `statut` | `enum` | `"En cours"` | Positionnement dans la chronologie :<br>• `"Précédent"`<br>• `"En cours"`<br>• `"Suivant"` |
| `detail` | `string` | `"Courrier envoyé avec étiquette code-barres"` | Précisions opérationnelles. |

---

### 3.8. Objet `DocumentMedical`
Document médical ou administratif rattaché au parcours.

| Nom technique | Type | Exemple | Description / Valeurs autorisées |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `"doc-1"` | Identifiant unique du document. |
| `titre` | `string` | `"Compte-rendu mammographie T2"` | Nom descriptif du document. |
| `type` | `enum` | `"Compte-rendu"` | Nature du document :<br>• `"Compte-rendu"`<br>• `"Résultat biologique"`<br>• `"Préparation examen"`<br>• `"Consentement"` |
| `date` | `string` | `"20/01/2026"` | Date de dépôt ou d'émission. |
| `statut` | `enum` | `"Disponible"` | Accessibilité du document :<br>• `"Disponible"`<br>• `"À signer"`<br>• `"En attente"` |
| `aperçu` | `string` | `"Mammographie bilatérale sans anomalie suspecte"` | Extrait ou résumé textuel. |
| `indicateur` | `string` | `"ACR 2"` | Classification diagnostique clé. |
| `auteur` | `string` | `"Dr Valérie Martin (Radiologue)"` | Rédacteur ou organisme émetteur. |

---

### 3.9. Objet `FilDiscussion`
Fil de messagerie sécurisée échangé entre les utilisateurs.

| Nom technique | Type | Exemple | Description / Valeurs autorisées |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `"msg-1"` | Identifiant unique du fil de discussion. |
| `sujet` | `string` | `"Confirmation de votre rendez-vous mammographie"` | Objet du message. |
| `expediteur` | `string` | `"Centre Régional de Dépistage"` | Identité affichée de l'émetteur. |
| `destinataire` | `string` | `"Claire Lemoine"` | Identité affichée du récepteur. |
| `aperçu` | `string` | `"Bonjour, nous confirmons votre créneau le..."` | Résumé affiché dans la liste des messages. |
| `contenu` | `string` | `"Bonjour Madame Lemoine, votre rendez-vous est prévu..."` | Corps complet du message. |
| `date` | `string` | `"18/02/2026 14:30"` | Horodatage d'envoi. |
| `statut` | `enum` | `"Non lu"` | État de lecture :<br>• `"Lu"`<br>• `"Non lu"`<br>• `"Envoyé"`<br>• `"Brouillon"` |
| `boite` | `enum` | `"Réception"` | Emplacement de la boîte :<br>• `"Réception"`<br>• `"Envoyés"`<br>• `"Brouillons"`<br>• `"Archives"` |
| `securise` | `boolean` | `true` | Indicateur de chiffrement et conformité MSSanté (`true` / `false`). |
| `importance` | `enum` | `"Normale"` | Degré d'importance :<br>• `"Normale"`<br>• `"Haute"` |
| `roleCible` | `enum` | `"patient"` | Profil ciblé par le message :<br>• `"manager"`<br>• `"patient"`<br>• `"practitioner"`<br>• `"all"` |
| `piecesJointes` | `object[]` | `[{ nom: "Convocation.pdf", taille: "1.2 Mo" }]` | Liste optionnelle de documents joints. |

---

## 4. Architecture Technique de Persistance (In-Browser Storage)

L'application émule un backend Firestore sans nécessiter de serveur distant via une couche **Fake Firestore** s'appuyant sur l'API native **IndexedDB** du navigateur.

### 4.1. Magasins IndexedDB (`esis-fake-firestore`, v1)

| Store | Clé (`keyPath`) | Description |
| :--- | :--- | :--- |
| `patients` | `id` | Objet Patient complet; episodes, tasks, enrollments et programs y sont imbriqués |
| `practitioners` | `id` | Enregistrements Practitioner |
| `messages` | `id` | Enregistrements MessageThread |
| `app_metadata` | `id` | Enregistrement `bootstrap` avec roleProfiles, defaultRole et identifiants actifs |

### 4.2. Hiérarchie d'accès aux données

1. **UI Components** ([patients-page.tsx](file:///c:/Users/Quang/Documents/GitHub/esis/src/app/components/patients-page.tsx), [messaging-page.tsx](file:///c:/Users/Quang/Documents/GitHub/esis/src/app/components/messaging-page.tsx), etc.)
2. **React Context** ([app-state.tsx](file:///c:/Users/Quang/Documents/GitHub/esis/src/app/app-state.tsx)) : Gestion de l'état réactif en mémoire.
3. **Bridge Remote Data** ([remote-data.ts](file:///c:/Users/Quang/Documents/GitHub/esis/src/app/lib/remote-data.ts)) : Passerelle d'abstraction API (`loadAppData()`, `loadStoredCollections()`, `resetStoredCollections()`).
4. **Client Fake Firestore** ([fake-firestore.ts](file:///c:/Users/Quang/Documents/GitHub/esis/src/app/lib/fake-firestore.ts)) : Routage des requêtes REST-like virtuelles (`GET /bootstrap`, `POST /patients/:id`, etc.).
5. **Storage Moteur** : IndexedDB (`esis-fake-firestore`) & fallback vers seed initial ([demo-data.json](file:///c:/Users/Quang/Documents/GitHub/esis/src/app/data/demo-data.json)).

### 4.3. Stratégie de Génération des Données (Auto-Seed & Datasets)

Pour assurer une démonstration interactive fiable et déterministe sans dépendance à une API distante :

1. **Jeu de données de référence (Seed statique)** :
   - Fichier maître [`src/app/data/demo-data.json`](file:///c:/Users/Quang/Documents/GitHub/esis/src/app/data/demo-data.json) contenant les collections complètes.
   - Typage TypeScript strict et fonction de clonage immuable [`createDemoDataBundle()`](file:///c:/Users/Quang/Documents/GitHub/esis/src/app/data/demo-data.ts).
2. **Amorçage automatique (Auto-seeding)** :
   - Au premier chargement (`GET /bootstrap`), si la base IndexedDB est vide, le faux backend Firestore injecte automatiquement le bundle racine dans les object stores (`patients`, `practitioners`, `messages`, `app_metadata`).
3. **Dérivation automatique des vues métiers (Patients, Dossiers, Examens)** :
   - **Patients** : Collection pivot matérialisant l'identité civile, NIR, antécédents, constantes biométriques et statuts de dépistage.
   - **Dossiers** : Dénormalisés dynamiquement par assemblage des `enrollments`, `episodes` et `tasks` rattachés au patient.
   - **Examens** : Extraits automatiquement des `programs` et `documents` médicaux (mammographies bilatérales, tests FIT colorectaux, tests HPV-HR) avec leurs conclusions sémiologiques standardisées (ACR 1 à 5).
4. **Persistance des mutations & Réinitialisation** :
   - Toute création ou modification via l'interface ou l'onglet API est immédiatement persistée dans IndexedDB.
   - La réinitialisation par `POST /seed` (disponible via le bouton *Reset* ou l'onglet API) réinstancie l'état d'origine sans corrompre le schéma.

---

## 5. Diagrammes des Flux Fonctionnels & UML Mermaid

### 5.1. Flux d'Initialisation & Démarrage de l'Application

```mermaid
sequenceDiagram
    autonumber
    actor User as Utilisateur
    participant UI as React UI (App)
    participant Provider as AppStateProvider
    participant Remote as Remote Data Layer
    participant FakeFS as Fake Firestore (API Engine)
    participant IDB as IndexedDB (esis-fake-firestore)
    participant Seed as Demo Data JSON

    User->>UI: Ouvre la plateforme ESIS
    UI->>Provider: Initialisation (Mount)
    Provider->>Remote: loadAppData()
    Remote->>FakeFS: fakeFirestoreRequest("GET /bootstrap")
    FakeFS->>IDB: Lecture 'app_metadata/bootstrap'
    alt IndexedDB est vide ou non initialisé
        FakeFS->>Seed: Lecture createDemoDataBundle()
        FakeFS->>IDB: Ecriture stores (patients, praticiens, fil_discussions, metadata)
        IDB-->>FakeFS: Confirmation écriture seed
    else Données existantes dans IndexedDB
        IDB-->>FakeFS: Restitution des collections sauvegardées
    end
    FakeFS-->>Remote: Response 200 OK (DemoDataBundle)
    Remote-->>Provider: Données hydratées
    Provider->>UI: Mise à jour du State global & Fin de chargement (isLoading = false)
    UI-->>User: Affichage du Tableau de Bord
```

---

### 5.2. Flux Métier : Enrôlement & Création d'un Nouveau Patient

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Gestionnaire
    participant PatientsUI as PatientsPage
    participant Provider as AppStateProvider
    participant FakeFS as Fake Firestore
    participant IDB as IndexedDB

    Manager->>PatientsUI: Renseigne le formulaire & clique sur "Créer le patient"
    PatientsUI->>Provider: createPatient(nouveauPatient)
    Provider->>FakeFS: createPatientInFakeFirestore(nouveauPatient)
    FakeFS->>IDB: put("patients", nouveauPatient)
    IDB-->>FakeFS: Succès transaction
    FakeFS-->>Provider: Résolution Promise (OK)
    Provider->>Provider: Met à jour patients[] en mémoire & activePatientId
    Provider-->>PatientsUI: Re-render avec le nouveau patient actif
    PatientsUI-->>Manager: Feedback visuel & affichage du dossier créé
```

---

### 5.3. Flux Métier : Émission et Traitement d'un Message Sécurisé

```mermaid
sequenceDiagram
    autonumber
    actor Sender as Expéditeur (Manager / Praticien)
    participant MsgUI as MessagingPage
    participant Provider as AppStateProvider
    participant FakeFS as Fake Firestore
    participant IDB as IndexedDB

    Sender->>MsgUI: Rédige un message (Sujet, Destinataire, Pièce jointe)
    Sender->>MsgUI: Valide l'envoi
    MsgUI->>Provider: createMessage(nouveauMessage)
    Provider->>FakeFS: createMessageInFakeFirestore(nouveauMessage)
    FakeFS->>IDB: put("messages", nouveauMessage)
    IDB-->>FakeFS: Confirmation écriture
    FakeFS-->>Provider: OK
    Provider->>Provider: prepend nouveauMessage dans messages[]
    Provider-->>MsgUI: Rafraîchissement de la boîte d'envoi / fils
    MsgUI-->>Sender: Confirmation d'envoi affichée
```

---

### 5.4. Cycle de Vie d'un Parcours de Dépistage

```mermaid
stateDiagram-v2
    [*] --> Eligible: Identification cohorte / Age / NIR
    Eligible --> EnAttente: Enrôlement saisi (Portail / Campagne)
    EnAttente --> Invite: Envoi invitation / kit de dépistage
    Invite --> ExamenPlanifie: Prise de RDV / Réception kit
    ExamenPlanifie --> ExamenRealise: Examen réalisé chez le praticien
    ExamenRealise --> ResultatsDisponibles: Transmission & double lecture
    ResultatsDisponibles --> SuiviStandard: Résultat négatif (Rappel à 2 ans)
    ResultatsDisponibles --> SurveillanceRapprochee: Anomalie / Avis spécialisé
    SuiviStandard --> [*]
    SurveillanceRapprochee --> [*]
```

---

## 6. Règles Opérationnelles et Navigation

- **Onglet Données (`/donnees`)** : Visualisation matricielle d'exemples réels (10 patients, 10 dossiers complets, 10 examens avec l'ensemble de leurs propriétés en colonnes et export JSON).
- **Onglet API (`/api`)** : Inspecteur interactif des endpoints du faux backend Firestore (routes, payloads, simulation de réponses et réinitialisation).
- **Persistance locale** : Les données modifiées restent stockées dans l'IndexedDB du profil de navigateur local.
- **Réinitialisation** : Le bouton de réinitialisation disponible dans l'onglet API ou Paramètres déclenche `POST /seed` et recharge le jeu de données d'origine ([demo-data.json](file:///c:/Users/Quang/Documents/GitHub/esis/src/app/data/demo-data.json)).
