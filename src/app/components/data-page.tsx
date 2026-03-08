import { useEffect, useMemo, useState } from "react";
import { Database, Download, GripVertical, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "../app-state";
import { demoDataBundle, type DemoDataBundle } from "../data/demo-data";
import { fakeFirestoreRequest } from "../lib/fake-firestore";
import { loadStoredCollections, resetStoredCollections } from "../lib/remote-data";

type HttpVerb = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RoutePreset = {
  label: string;
  method: HttpVerb;
  route: string;
  body: string;
};

type ParameterChip = {
  label: string;
  description: string;
  apply: (currentRoute: string) => string;
};

type FieldSpec = {
  key: string;
  format: string;
  required: string;
  notes: string;
  example?: string;
};

type VerbDefinition = {
  title: string;
  description: string;
  fields: FieldSpec[];
};

type ResponseDefinition = {
  title: string;
  description: string;
  fields: FieldSpec[];
};

type ResponseScenario = {
  key: string;
  label: string;
  body: string;
};

type ApiResponseState = {
  status: number;
  statusText: string;
  body: string;
};

const ROUTE_PRESETS: RoutePreset[] = [
  { label: "Collections overview", method: "GET", route: "/collections", body: "" },
  { label: "Patients collection", method: "GET", route: "/patients", body: "" },
  { label: "Patient by ID", method: "GET", route: "/patients/pt-1", body: "" },
  { label: "Patient episodes", method: "GET", route: "/patients/pt-1/episodes", body: "" },
  {
    label: "Create patient episode",
    method: "POST",
    route: "/patients/pt-1/episodes",
    body: JSON.stringify(
      {
        id: "ep-api-demo",
        type: "Colorectal",
        statut: "Examen planifié",
        dateOuverture: "12/03/2026",
        prochaineEtape: "Confirmer la préparation",
      },
      null,
      2,
    ),
  },
  { label: "Patient tasks", method: "GET", route: "/patients/pt-1/tasks", body: "" },
  {
    label: "Create patient task",
    method: "POST",
    route: "/patients/pt-1/tasks",
    body: JSON.stringify(
      {
        id: "task-api-demo",
        titre: "Appeler le patient",
        echeance: "15/03/2026",
        priorite: "Haute",
        statut: "À faire",
        assigneA: "Dr. Martin Dupont",
      },
      null,
      2,
    ),
  },
  { label: "Patient enrollments", method: "GET", route: "/patients/pt-1/enrollments", body: "" },
  {
    label: "Create patient enrollment",
    method: "POST",
    route: "/patients/pt-1/enrollments",
    body: JSON.stringify(
      {
        id: "enr-api-demo",
        canal: "Portail",
        statut: "À valider",
        date: "08/03/2026",
        consentement: true,
      },
      null,
      2,
    ),
  },
  { label: "Patient programs", method: "GET", route: "/patients/pt-1/programs", body: "" },
  { label: "Patient program by type", method: "GET", route: "/patients/pt-1/programs/Sein", body: "" },
  { label: "Patient program documents", method: "GET", route: "/patients/pt-1/programs/Sein/documents", body: "" },
  { label: "Patient program forms", method: "GET", route: "/patients/pt-1/programs/Sein/formulaires", body: "" },
  { label: "Patient program exams", method: "GET", route: "/patients/pt-1/programs/Sein/examens", body: "" },
  { label: "Patient program timeline", method: "GET", route: "/patients/pt-1/programs/Sein/timeline", body: "" },
  {
    label: "Create patient",
    method: "POST",
    route: "/patients",
    body: JSON.stringify(
      {
        ...demoDataBundle.patients[0],
        id: "pt-api-demo",
        prenom: "Lina",
        nom: "Bertrand",
        telephone: "06 44 55 66 77",
        ville: "Paris",
      },
      null,
      2,
    ),
  },
  {
    label: "Replace patient",
    method: "PUT",
    route: "/patients/pt-1",
    body: JSON.stringify(
      {
        ...demoDataBundle.patients[0],
        id: "pt-1",
        statut: "Examen réalisé",
        ville: "Lyon",
      },
      null,
      2,
    ),
  },
  {
    label: "Patch patient",
    method: "PATCH",
    route: "/patients/pt-1",
    body: JSON.stringify(
      {
        statut: "Résultats disponibles",
        telephone: "06 00 00 00 01",
      },
      null,
      2,
    ),
  },
  { label: "Delete patient", method: "DELETE", route: "/patients/pt-api-demo", body: "" },
  { label: "Practitioners collection", method: "GET", route: "/practitioners", body: "" },
  { label: "Practitioner by ID", method: "GET", route: "/practitioners/pr-1", body: "" },
  { label: "Messages collection", method: "GET", route: "/messages", body: "" },
  { label: "Message by ID", method: "GET", route: "/messages/msg-1", body: "" },
];

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function updateRouteWithQuery(currentRoute: string, key: string, value: string) {
  const url = new URL(currentRoute, "https://fake.local");
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}

function replaceLastSegment(currentRoute: string, replacement: string) {
  const url = new URL(currentRoute, "https://fake.local");
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length >= 2) {
    segments[segments.length - 1] = replacement;
    url.pathname = `/${segments.join("/")}`;
  }
  return `${url.pathname}${url.search}`;
}

function getRouteFamily(route: string) {
  const path = new URL(route, "https://fake.local").pathname;
  if (path === "/collections") {
    return "collections";
  }
  if (path.startsWith("/patients")) {
    return "patients";
  }
  if (path.startsWith("/practitioners")) {
    return "practitioners";
  }
  if (path.startsWith("/messages")) {
    return "messages";
  }
  return "unknown";
}

function isCollectionRoute(route: string, resource: "patients" | "practitioners" | "messages") {
  return new URL(route, "https://fake.local").pathname === `/${resource}`;
}

function isDocumentRoute(route: string, resource: "patients" | "practitioners" | "messages") {
  return new URL(route, "https://fake.local").pathname.startsWith(`/${resource}/`);
}

function getPathSegments(route: string) {
  return new URL(route, "https://fake.local").pathname.split("/").filter(Boolean);
}

function normalizeRequiredLabel(required: string) {
  const normalized = required.trim().toLowerCase();

  if (
    normalized.includes("optional") ||
    normalized.includes("ignored") ||
    normalized.includes("404") ||
    normalized.includes("common")
  ) {
    return "";
  }

  if (
    normalized.includes("required") ||
    normalized.includes("always") ||
    normalized.includes("success") ||
    normalized.includes("recommended")
  ) {
    return "yes";
  }

  return required;
}

function getDefaultExample(field: FieldSpec) {
  if (field.example) {
    return field.example;
  }

  const key = field.key.toLowerCase();
  const format = field.format.toLowerCase();
  const notes = field.notes.toLowerCase();

  if (key.includes("id")) {
    if (notes.includes("episode")) return "ep-1";
    if (notes.includes("task")) return "task-1";
    if (notes.includes("enrollment")) return "enr-1";
    if (notes.includes("practitioner")) return "pr-1";
    if (notes.includes("thread") || notes.includes("message")) return "msg-1";
    if (notes.includes("document")) return "doc-1";
    if (notes.includes("form")) return "form-1";
    if (notes.includes("timeline")) return "step-1";
    return "pt-1";
  }
  if (key.includes("prenom")) return "Marie";
  if (key.includes("nom")) return "Dubois";
  if (key.includes("nir")) return "1 58 01 75 11 27 41";
  if (key.includes("telephone")) return "06 10 15 20 25";
  if (key.includes("email")) return "marie.dubois@example.fr";
  if (key.includes("ville")) return "Paris";
  if (key.includes("centre")) return "CRDC Ile-de-France";
  if (key.includes("specialite")) return "Radiologie";
  if (key.includes("structure")) return "Clinique Saint-Louis";
  if (key.includes("disponibilite")) return "Disponible sous 7 jours";
  if (key.includes("charge")) return "Maitrisee";
  if (key.includes("risque")) return "Standard";
  if (key.includes("statut")) return "Invité";
  if (key.includes("typedepistage") || key.endsWith(".type") || key === "type" || key.includes("programtype")) return "Sein";
  if (key.includes("canal")) return "Portail";
  if (key.includes("rolecible")) return "manager";
  if (key.includes("boite")) return "Réception";
  if (key.includes("importance")) return "Normale";
  if (key.includes("securise") || format.includes("boolean")) return "true";
  if (key.includes("progression") || key.includes("patientsactifs") || key.includes("limit")) return "42";
  if (key.includes("titre")) return "Vérifier le dossier";
  if (key.includes("prochaineetape")) return "Confirmer la préparation";
  if (key.includes("assignea")) return "Dr. Martin Dupont";
  if (key.includes("consentement")) return "true";
  if (key.includes("tendanceregionale")) return "+4% vs région";
  if (key.includes("resultatcle")) return "Aucun signe suspect";
  if (key.includes("prochainexamen")) return "Mammographie 2027";
  if (key.includes("justification")) return "Suivi standard";
  if (key.includes("resultat")) return "RAS";
  if (key.includes("indicateur")) return "BI-RADS 2";
  if (key.includes("auteur")) return "Dr. Sophie Leroy";
  if (key.includes("detail")) return "Convocation envoyée";
  if (key.includes("date") || key.includes("periode") || format.includes("yyyy") || format.includes("dd/mm")) {
    return "12/03/2026";
  }
  if (key.includes("sujet")) return "Résultats disponibles";
  if (key.includes("expediteur")) return "Dr. Martin Dupont";
  if (key.includes("destinataire")) return "Marie Dubois";
  if (key.includes("aperçu")) return "Compte-rendu disponible";
  if (key.includes("contenu")) return "Bonjour, votre document est prêt.";
  if (key.includes("tension")) return "120/80";
  if (key.includes("imc")) return "23.4";
  if (key.includes("frequencecardiaque")) return "72 bpm";
  if (key.includes("saturation")) return "98%";
  if (key.includes("groupe")) return "A+";
  if (key.includes("allergies") || key.includes("antecedents") || key.includes("traitements") || key.includes("historique") || key.includes("champs")) {
    return "[...]";
  }
  if (format.includes("string[]")) return "[...]";
  if (format.includes("array")) return "[...]";
  if (format.includes("enum")) return "sample";
  if (format.includes("number")) return "1";
  if (format.includes("string")) return "sample";

  return "";
}

function getParameterChips(route: string): ParameterChip[] {
  const family = getRouteFamily(route);

  if (family === "collections") {
    return [
      { label: "list=all", description: "Expose the full aggregated list payload.", apply: (current) => updateRouteWithQuery(current, "list", "all") },
      { label: "sort=asc", description: "Sample sorting flag for overview routes.", apply: (current) => updateRouteWithQuery(current, "sort", "asc") },
      { label: "limit=50", description: "Sample numeric window for list APIs.", apply: (current) => updateRouteWithQuery(current, "limit", "50") },
    ];
  }

  if (family === "patients") {
    return [
      { label: "id=pt-1", description: "Injects a real patient id into document routes.", apply: (current) => replaceLastSegment(current, "pt-1") },
      { label: "id=pt-api-demo", description: "Targets the demo patient created from the console.", apply: (current) => replaceLastSegment(current, "pt-api-demo") },
      { label: "child=episodes", description: "Targets patient episodes child collection.", apply: () => "/patients/pt-1/episodes" },
      { label: "child=tasks", description: "Targets patient tasks child collection.", apply: () => "/patients/pt-1/tasks" },
      { label: "child=enrollments", description: "Targets patient enrollments child collection.", apply: () => "/patients/pt-1/enrollments" },
      { label: "child=programs", description: "Targets patient programs child collection.", apply: () => "/patients/pt-1/programs" },
      { label: "list=priority", description: "Sample list selector for patients.", apply: (current) => updateRouteWithQuery(current, "list", "priority") },
      { label: "sort=city", description: "Sample sort key.", apply: (current) => updateRouteWithQuery(current, "sort", "city") },
      { label: "limit=10", description: "Sample numeric limit.", apply: (current) => updateRouteWithQuery(current, "limit", "10") },
    ];
  }

  if (family === "practitioners") {
    return [
      { label: "id=pr-1", description: "Injects a practitioner id into document routes.", apply: (current) => replaceLastSegment(current, "pr-1") },
      { label: "list=active", description: "Sample list selector.", apply: (current) => updateRouteWithQuery(current, "list", "active") },
      { label: "sort=charge", description: "Sample sort key by workload.", apply: (current) => updateRouteWithQuery(current, "sort", "charge") },
      { label: "limit=5", description: "Sample numeric limit.", apply: (current) => updateRouteWithQuery(current, "limit", "5") },
    ];
  }

  if (family === "messages") {
    return [
      { label: "id=msg-1", description: "Injects a message thread id into document routes.", apply: (current) => replaceLastSegment(current, "msg-1") },
      { label: "list=inbox", description: "Sample folder/list selector.", apply: (current) => updateRouteWithQuery(current, "list", "inbox") },
      { label: "sort=priority", description: "Sample sort key for inbox views.", apply: (current) => updateRouteWithQuery(current, "sort", "priority") },
      { label: "limit=20", description: "Sample numeric limit.", apply: (current) => updateRouteWithQuery(current, "limit", "20") },
    ];
  }

  return [];
}

function getRequestBodySample(route: string, method: HttpVerb) {
  const family = getRouteFamily(route);
  const segments = getPathSegments(route);

  if (segments[0] === "patients" && segments[2] === "episodes" && method === "POST") {
    return formatJson({
      id: "ep-api-demo",
      type: "Colorectal",
      statut: "Examen planifié",
      dateOuverture: "12/03/2026",
      prochaineEtape: "Confirmer la préparation",
    });
  }

  if (segments[0] === "patients" && segments[2] === "tasks" && method === "POST") {
    return formatJson({
      id: "task-api-demo",
      titre: "Appeler le patient",
      echeance: "15/03/2026",
      priorite: "Haute",
      statut: "À faire",
      assigneA: "Dr. Martin Dupont",
    });
  }

  if (segments[0] === "patients" && segments[2] === "enrollments" && method === "POST") {
    return formatJson({
      id: "enr-api-demo",
      canal: "Portail",
      statut: "À valider",
      date: "08/03/2026",
      consentement: true,
    });
  }

  if (family === "patients" && method === "POST") {
    return formatJson({
      ...demoDataBundle.patients[0],
      id: "pt-api-demo",
      prenom: "Lina",
      nom: "Bertrand",
      telephone: "06 44 55 66 77",
      ville: "Paris",
    });
  }

  if (family === "patients" && method === "PUT") {
    return formatJson({
      ...demoDataBundle.patients[0],
      id: "pt-1",
      statut: "Examen réalisé",
      ville: "Lyon",
      telephone: "06 11 22 33 44",
    });
  }

  if (family === "patients" && method === "PATCH") {
    return formatJson({
      statut: "Résultats disponibles",
      telephone: "06 00 00 00 01",
    });
  }

  if (family === "practitioners" && method === "POST") {
    return formatJson({
      ...demoDataBundle.practitioners[0],
      id: "pr-api-demo",
      prenom: "Nora",
      nom: "Diallo",
    });
  }

  if (family === "practitioners" && (method === "PUT" || method === "PATCH")) {
    return method === "PUT"
      ? formatJson({
          ...demoDataBundle.practitioners[0],
          id: "pr-1",
          charge: "Maîtrisée",
        })
      : formatJson({
          charge: "Élevée",
          disponibilite: "Créneaux jeudi matin",
        });
  }

  if (family === "messages" && method === "POST") {
    return formatJson({
      ...demoDataBundle.messages[0],
      id: "msg-api-demo",
      subject: "Relance API demo",
    });
  }

  if (family === "messages" && (method === "PUT" || method === "PATCH")) {
    return method === "PUT"
      ? formatJson({
          ...demoDataBundle.messages[0],
          id: "msg-1",
          archived: false,
        })
      : formatJson({
          archived: true,
        });
  }

  return method === "GET" || method === "DELETE" ? "" : formatJson({});
}

function getVerbDefinition(route: string, method: HttpVerb): VerbDefinition {
  const segments = getPathSegments(route);

  if (segments[0] === "patients" && segments[2] === "episodes" && method === "GET") {
    return {
      title: "GET /patients/:id/episodes",
      description: "Reads the episodes child collection for one patient.",
      fields: [
        { key: "id", format: "string", required: "required in route", notes: "Parent patient id." },
        { key: "list", format: "string", required: "optional", notes: "Sample child-list selector." },
        { key: "sort", format: "string", required: "optional", notes: "Sample child sort key such as dateOuverture." },
        { key: "limit", format: "number", required: "optional", notes: "Sample max number of child rows." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "episodes" && method === "POST") {
    return {
      title: "POST /patients/:id/episodes",
      description: "Creates a child episode inside the parent patient document.",
      fields: [
        { key: "id", format: "string", required: "required", notes: "Unique episode identifier." },
        { key: "type", format: "enum", required: "required", notes: "Sein, Colorectal, or Col utérus." },
        { key: "statut", format: "enum", required: "required", notes: "Current episode state." },
        { key: "dateOuverture", format: "string", required: "required", notes: "Displayed opening date." },
        { key: "prochaineEtape", format: "string", required: "required", notes: "Next operational step shown in UI." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "tasks" && method === "GET") {
    return {
      title: "GET /patients/:id/tasks",
      description: "Reads the tasks child collection for one patient.",
      fields: [
        { key: "id", format: "string", required: "required in route", notes: "Parent patient id." },
        { key: "list", format: "string", required: "optional", notes: "Sample child-list selector." },
        { key: "sort", format: "string", required: "optional", notes: "Sample child sort key such as echeance." },
        { key: "limit", format: "number", required: "optional", notes: "Sample max number of child rows." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "tasks" && method === "POST") {
    return {
      title: "POST /patients/:id/tasks",
      description: "Creates a child task inside the parent patient document.",
      fields: [
        { key: "id", format: "string", required: "required", notes: "Unique task identifier." },
        { key: "titre", format: "string", required: "required", notes: "Task title shown in UI." },
        { key: "echeance", format: "string", required: "required", notes: "Due date string." },
        { key: "priorite", format: "enum", required: "required", notes: "Basse, Normale, or Haute." },
        { key: "statut", format: "enum", required: "required", notes: "À faire, En cours, Bloquée, or Terminée." },
        { key: "assigneA", format: "string", required: "required", notes: "Assignee display name." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "enrollments" && method === "GET") {
    return {
      title: "GET /patients/:id/enrollments",
      description: "Reads the enrollments child collection for one patient.",
      fields: [
        { key: "id", format: "string", required: "required in route", notes: "Parent patient id." },
        { key: "list", format: "string", required: "optional", notes: "Sample child-list selector." },
        { key: "sort", format: "string", required: "optional", notes: "Sample child sort key such as date." },
        { key: "limit", format: "number", required: "optional", notes: "Sample max number of child rows." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "enrollments" && method === "POST") {
    return {
      title: "POST /patients/:id/enrollments",
      description: "Creates a child enrollment inside the parent patient document.",
      fields: [
        { key: "id", format: "string", required: "required", notes: "Unique enrollment identifier." },
        { key: "canal", format: "enum", required: "required", notes: "Portail, Téléphone, Cabinet, or Campagne." },
        { key: "statut", format: "enum", required: "required", notes: "À valider, Validé, or Incomplet." },
        { key: "date", format: "string", required: "required", notes: "Displayed enrollment date." },
        { key: "consentement", format: "boolean", required: "required", notes: "Consent flag stored on the child enrollment." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "programs" && segments.length === 3 && method === "GET") {
    return {
      title: "GET /patients/:id/programs",
      description: "Reads the programs child collection for one patient.",
      fields: [
        { key: "id", format: "string", required: "required in route", notes: "Parent patient id." },
        { key: "list", format: "string", required: "optional", notes: "Sample list selector for patient programs." },
        { key: "sort", format: "string", required: "optional", notes: "Sample sort key such as type." },
        { key: "limit", format: "number", required: "optional", notes: "Sample max number of programs." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "programs" && segments.length === 4 && method === "GET") {
    return {
      title: "GET /patients/:id/programs/:programType",
      description: "Reads one screening program child by type for a patient.",
      fields: [
        { key: "id", format: "string", required: "required in route", notes: "Parent patient id." },
        { key: "programType", format: "enum", required: "required in route", notes: "Sein, Colorectal, or Col utérus." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "programs" && segments.length === 5 && method === "GET") {
    return {
      title: `GET /patients/:id/programs/:programType/${segments[4]}`,
      description: "Reads a nested child collection under a patient screening program.",
      fields: [
        { key: "id", format: "string", required: "required in route", notes: "Parent patient id." },
        { key: "programType", format: "enum", required: "required in route", notes: "Program type segment." },
        { key: "list", format: "string", required: "optional", notes: "Sample list selector for the nested child collection." },
      ],
    };
  }

  if (isCollectionRoute(route, "patients") && method === "GET") {
    return {
      title: "GET /patients",
      description: "Reads the full patients collection from IndexedDB.",
      fields: [
        { key: "list", format: "string", required: "optional", notes: "Sample collection view selector such as all or priority." },
        { key: "sort", format: "string", required: "optional", notes: "Sample sort key such as city, statut or prochainRappel." },
        { key: "limit", format: "number", required: "optional", notes: "Sample maximum number of rows to return." },
      ],
    };
  }

  if (isCollectionRoute(route, "patients") && method === "POST") {
    return {
      title: "POST /patients",
      description: "Creates a new patient document in IndexedDB from the request body.",
      fields: [
        { key: "id", format: "string", required: "required", notes: "Unique patient identifier. Required by the fake backend." },
        { key: "prenom", format: "string", required: "required", notes: "Patient first name." },
        { key: "nom", format: "string", required: "required", notes: "Patient last name." },
        { key: "nir", format: "string", required: "recommended", notes: "Displayed in the patient detail card." },
        { key: "telephone", format: "string", required: "recommended", notes: "Displayed in manager and patient views." },
        { key: "ville", format: "string", required: "recommended", notes: "Displayed in patient tables and detail views." },
        { key: "statut", format: "enum", required: "recommended", notes: "Expected values include En attente, Invité, Examen réalisé, Résultats disponibles." },
      ],
    };
  }

  if (isDocumentRoute(route, "patients") && method === "GET") {
    return {
      title: "GET /patients/:id",
      description: "Reads one patient document by id.",
      fields: [
        { key: "id", format: "string", required: "required in route", notes: "Stable patient identifier such as pt-1." },
      ],
    };
  }

  if (isDocumentRoute(route, "patients") && method === "PUT") {
    return {
      title: "PUT /patients/:id",
      description: "Replaces the patient document targeted by the route id.",
      fields: [
        { key: "id", format: "string", required: "optional in body", notes: "The route id wins if body id differs." },
        { key: "prenom", format: "string", required: "recommended", notes: "Include because PUT is treated as a full replacement." },
        { key: "nom", format: "string", required: "recommended", notes: "Include because PUT is treated as a full replacement." },
        { key: "telephone", format: "string", required: "recommended", notes: "Phone shown in patient summary views." },
        { key: "ville", format: "string", required: "recommended", notes: "City shown in lists and details." },
        { key: "statut", format: "enum", required: "recommended", notes: "Full current status of the patient journey." },
      ],
    };
  }

  if (isDocumentRoute(route, "patients") && method === "PATCH") {
    return {
      title: "PATCH /patients/:id",
      description: "Partially updates a patient document by merging the request body into the stored document.",
      fields: [
        { key: "id", format: "string", required: "ignored if present", notes: "The route id is authoritative." },
        { key: "statut", format: "enum", required: "optional", notes: "Patch only the fields that need to change." },
        { key: "telephone", format: "string", required: "optional", notes: "Useful for updating manager-edited contact info." },
        { key: "ville", format: "string", required: "optional", notes: "Useful for updating patient location." },
      ],
    };
  }

  if (isDocumentRoute(route, "patients") && method === "DELETE") {
    return {
      title: "DELETE /patients/:id",
      description: "Deletes a patient document from IndexedDB.",
      fields: [
        { key: "id", format: "string", required: "required in route", notes: "Stable patient identifier such as pt-api-demo." },
      ],
    };
  }

  if (isCollectionRoute(route, "practitioners") && method === "GET") {
    return {
      title: "GET /practitioners",
      description: "Reads the practitioners collection from IndexedDB.",
      fields: [
        { key: "list", format: "string", required: "optional", notes: "Sample list selector such as active." },
        { key: "sort", format: "string", required: "optional", notes: "Sample sort key such as charge or specialite." },
        { key: "limit", format: "number", required: "optional", notes: "Sample maximum number of records to return." },
      ],
    };
  }

  if (isCollectionRoute(route, "practitioners") && method === "POST") {
    return {
      title: "POST /practitioners",
      description: "Creates a new practitioner document in IndexedDB.",
      fields: [
        { key: "id", format: "string", required: "required", notes: "Unique practitioner identifier." },
        { key: "prenom", format: "string", required: "required", notes: "Practitioner first name." },
        { key: "nom", format: "string", required: "required", notes: "Practitioner last name." },
        { key: "specialite", format: "string", required: "recommended", notes: "Displayed in workload and assignment cards." },
        { key: "charge", format: "string", required: "recommended", notes: "Workload label such as Faible, Maîtrisée or Élevée." },
      ],
    };
  }

  if (isDocumentRoute(route, "practitioners") && method === "GET") {
    return {
      title: "GET /practitioners/:id",
      description: "Reads one practitioner document by id.",
      fields: [{ key: "id", format: "string", required: "required in route", notes: "Stable practitioner identifier such as pr-1." }],
    };
  }

  if (isDocumentRoute(route, "practitioners") && method === "PUT") {
    return {
      title: "PUT /practitioners/:id",
      description: "Replaces the practitioner document targeted by the route id.",
      fields: [
        { key: "id", format: "string", required: "optional in body", notes: "The route id is authoritative." },
        { key: "prenom", format: "string", required: "recommended", notes: "Include because PUT is treated as a full replacement." },
        { key: "nom", format: "string", required: "recommended", notes: "Include because PUT is treated as a full replacement." },
        { key: "specialite", format: "string", required: "recommended", notes: "Displayed in practitioner cards." },
        { key: "charge", format: "string", required: "recommended", notes: "Displayed in workload summaries." },
      ],
    };
  }

  if (isDocumentRoute(route, "practitioners") && method === "PATCH") {
    return {
      title: "PATCH /practitioners/:id",
      description: "Partially updates a practitioner document by merging only the provided keys.",
      fields: [
        { key: "charge", format: "string", required: "optional", notes: "Useful for changing workload classification." },
        { key: "disponibilite", format: "string", required: "optional", notes: "Useful for changing displayed availability." },
        { key: "specialite", format: "string", required: "optional", notes: "Useful for adjusting role presentation." },
      ],
    };
  }

  if (isDocumentRoute(route, "practitioners") && method === "DELETE") {
    return {
      title: "DELETE /practitioners/:id",
      description: "Deletes a practitioner document from IndexedDB.",
      fields: [{ key: "id", format: "string", required: "required in route", notes: "Stable practitioner identifier." }],
    };
  }

  if (isCollectionRoute(route, "messages") && method === "GET") {
    return {
      title: "GET /messages",
      description: "Reads the message thread collection from IndexedDB.",
      fields: [
        { key: "list", format: "string", required: "optional", notes: "Sample mailbox selector such as inbox." },
        { key: "sort", format: "string", required: "optional", notes: "Sample sort key such as priority or updatedAt." },
        { key: "limit", format: "number", required: "optional", notes: "Sample maximum number of threads to return." },
      ],
    };
  }

  if (isCollectionRoute(route, "messages") && method === "POST") {
    return {
      title: "POST /messages",
      description: "Creates a new message thread document in IndexedDB.",
      fields: [
        { key: "id", format: "string", required: "required", notes: "Unique thread identifier." },
        { key: "subject", format: "string", required: "recommended", notes: "Visible in thread lists and detail headers." },
        { key: "archived", format: "boolean", required: "optional", notes: "Archive state of the thread." },
        { key: "messages", format: "array", required: "recommended", notes: "Nested thread messages in the stored document." },
      ],
    };
  }

  if (isDocumentRoute(route, "messages") && method === "GET") {
    return {
      title: "GET /messages/:id",
      description: "Reads one message thread by id.",
      fields: [{ key: "id", format: "string", required: "required in route", notes: "Stable thread identifier such as msg-1." }],
    };
  }

  if (isDocumentRoute(route, "messages") && method === "PUT") {
    return {
      title: "PUT /messages/:id",
      description: "Replaces the message thread document targeted by the route id.",
      fields: [
        { key: "id", format: "string", required: "optional in body", notes: "The route id is authoritative." },
        { key: "subject", format: "string", required: "recommended", notes: "Thread title displayed in UI lists." },
        { key: "archived", format: "boolean", required: "recommended", notes: "Thread archive state." },
        { key: "messages", format: "array", required: "recommended", notes: "Nested thread items when replacing the full document." },
      ],
    };
  }

  if (isDocumentRoute(route, "messages") && method === "PATCH") {
    return {
      title: "PATCH /messages/:id",
      description: "Partially updates a message thread document by merging only the provided keys.",
      fields: [
        { key: "archived", format: "boolean", required: "optional", notes: "Useful for archive/unarchive actions." },
        { key: "subject", format: "string", required: "optional", notes: "Useful for retitling a thread." },
        { key: "messages", format: "array", required: "optional", notes: "Useful for replacing the nested message array." },
      ],
    };
  }

  if (isDocumentRoute(route, "messages") && method === "DELETE") {
    return {
      title: "DELETE /messages/:id",
      description: "Deletes a message thread document from IndexedDB.",
      fields: [{ key: "id", format: "string", required: "required in route", notes: "Stable thread identifier." }],
    };
  }

  if (new URL(route, "https://fake.local").pathname === "/collections" && method === "GET") {
    return {
      title: "GET collections overview",
      description: "Returns the aggregated IndexedDB state used by the app debug view.",
      fields: [
        { key: "list", format: "string", required: "optional", notes: "Sample selector for the returned list scope." },
        { key: "sort", format: "string", required: "optional", notes: "Sample sort indicator for debug filtering." },
        { key: "limit", format: "number", required: "optional", notes: "Sample numeric page size." },
      ],
    };
  }

  return {
    title: `${method} route`,
    description: "Unsupported or undocumented combination for the current route.",
    fields: [
      { key: "route", format: "string", required: "always", notes: "Check the current route path." },
      { key: "method", format: "enum", required: "always", notes: "Check the selected HTTP verb." },
    ],
  };
}

function getResponseDefinition(route: string, method: HttpVerb): ResponseDefinition {
  const segments = getPathSegments(route);

  if (segments[0] === "patients" && segments[2] === "episodes" && method === "GET") {
    return {
      title: "GET /patients/:id/episodes response",
      description: "Array payload containing episode child documents.",
      fields: [
        { key: "[].id", format: "string", required: "always", notes: "Stable episode identifier." },
        { key: "[].type", format: "enum", required: "always", notes: "Screening type for the episode." },
        { key: "[].statut", format: "enum", required: "always", notes: "Current episode status." },
        { key: "[].dateOuverture", format: "DD/MM/YYYY", required: "always", notes: "Opening date." },
        { key: "[].prochaineEtape", format: "string", required: "always", notes: "Next care step text." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "episodes" && method === "POST") {
    return {
      title: "POST /patients/:id/episodes response",
      description: "Created episode child document returned by the fake backend.",
      fields: [
        { key: "id", format: "string", required: "always", notes: "Created episode identifier." },
        { key: "type", format: "enum", required: "always", notes: "Screening type." },
        { key: "statut", format: "enum", required: "always", notes: "Stored episode status." },
        { key: "dateOuverture", format: "DD/MM/YYYY", required: "always", notes: "Stored opening date." },
        { key: "prochaineEtape", format: "string", required: "always", notes: "Stored next step." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "tasks" && method === "GET") {
    return {
      title: "GET /patients/:id/tasks response",
      description: "Array payload containing task child documents.",
      fields: [
        { key: "[].id", format: "string", required: "always", notes: "Stable task identifier." },
        { key: "[].titre", format: "string", required: "always", notes: "Task label." },
        { key: "[].echeance", format: "DD/MM/YYYY", required: "always", notes: "Due date." },
        { key: "[].priorite", format: "enum", required: "always", notes: "Priority level." },
        { key: "[].statut", format: "enum", required: "always", notes: "Task status." },
        { key: "[].assigneA", format: "string", required: "always", notes: "Assignee label." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "tasks" && method === "POST") {
    return {
      title: "POST /patients/:id/tasks response",
      description: "Created task child document returned by the fake backend.",
      fields: [
        { key: "id", format: "string", required: "always", notes: "Created task identifier." },
        { key: "titre", format: "string", required: "always", notes: "Task label." },
        { key: "echeance", format: "DD/MM/YYYY", required: "always", notes: "Due date." },
        { key: "priorite", format: "enum", required: "always", notes: "Stored priority level." },
        { key: "statut", format: "enum", required: "always", notes: "Stored task status." },
        { key: "assigneA", format: "string", required: "always", notes: "Stored assignee label." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "enrollments" && method === "GET") {
    return {
      title: "GET /patients/:id/enrollments response",
      description: "Array payload containing enrollment child documents.",
      fields: [
        { key: "[].id", format: "string", required: "always", notes: "Stable enrollment identifier." },
        { key: "[].canal", format: "enum", required: "always", notes: "Enrollment channel." },
        { key: "[].statut", format: "enum", required: "always", notes: "Enrollment state." },
        { key: "[].date", format: "DD/MM/YYYY", required: "always", notes: "Enrollment date." },
        { key: "[].consentement", format: "boolean", required: "always", notes: "Consent flag." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "enrollments" && method === "POST") {
    return {
      title: "POST /patients/:id/enrollments response",
      description: "Created enrollment child document returned by the fake backend.",
      fields: [
        { key: "id", format: "string", required: "always", notes: "Created enrollment identifier." },
        { key: "canal", format: "enum", required: "always", notes: "Stored channel." },
        { key: "statut", format: "enum", required: "always", notes: "Stored enrollment state." },
        { key: "date", format: "DD/MM/YYYY", required: "always", notes: "Stored enrollment date." },
        { key: "consentement", format: "boolean", required: "always", notes: "Stored consent flag." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "programs" && segments.length === 3 && method === "GET") {
    return {
      title: "GET /patients/:id/programs response",
      description: "Array payload containing screening program child documents.",
      fields: [
        { key: "[].type", format: "enum", required: "always", notes: "Program type." },
        { key: "[].niveauRisque", format: "enum", required: "always", notes: "Risk level label." },
        { key: "[].tendanceRegionale", format: "string", required: "always", notes: "Regional comparison summary." },
        { key: "[].resultatCle", format: "string", required: "always", notes: "Key result summary." },
        { key: "[].prochainExamen", format: "string", required: "always", notes: "Next exam label." },
        { key: "[].historique", format: "string[]", required: "common", notes: "Program history entries." },
        { key: "[].parcours", format: "CareTimelineStep[]", required: "common", notes: "Timeline steps." },
        { key: "[].formulaires", format: "Formulaire[]", required: "common", notes: "Program forms." },
        { key: "[].examensProposes", format: "Examen[]", required: "common", notes: "Suggested exams." },
        { key: "[].documents", format: "ScreeningDocument[]", required: "common", notes: "Program documents." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "programs" && segments.length === 4 && method === "GET") {
    return {
      title: "GET /patients/:id/programs/:programType response",
      description: "Single screening program child document.",
      fields: [
        { key: "type", format: "enum", required: "always", notes: "Program type." },
        { key: "niveauRisque", format: "enum", required: "always", notes: "Risk level label." },
        { key: "tendanceRegionale", format: "string", required: "always", notes: "Regional benchmark summary." },
        { key: "resultatCle", format: "string", required: "always", notes: "Main outcome summary." },
        { key: "prochainExamen", format: "string", required: "always", notes: "Next exam label." },
        { key: "historique", format: "string[]", required: "common", notes: "Past program milestones." },
        { key: "parcours", format: "CareTimelineStep[]", required: "common", notes: "Timeline step objects." },
        { key: "parcours[].id", format: "string", required: "common", notes: "Timeline step id." },
        { key: "parcours[].titre", format: "string", required: "common", notes: "Timeline step title." },
        { key: "parcours[].periode", format: "string", required: "common", notes: "Displayed period." },
        { key: "parcours[].statut", format: "enum", required: "common", notes: "Previous/current/next state." },
        { key: "parcours[].detail", format: "string", required: "common", notes: "Timeline detail text." },
        { key: "formulaires", format: "Formulaire[]", required: "common", notes: "Program forms." },
        { key: "formulaires[].id", format: "string", required: "common", notes: "Form identifier." },
        { key: "formulaires[].titre", format: "string", required: "common", notes: "Form title." },
        { key: "formulaires[].statut", format: "enum", required: "common", notes: "Completion state." },
        { key: "formulaires[].description", format: "string", required: "common", notes: "Form summary." },
        { key: "formulaires[].champs", format: "string[]", required: "common", notes: "Field labels shown for the form." },
        { key: "examensProposes", format: "Examen[]", required: "common", notes: "Suggested exam objects." },
        { key: "examensProposes[].nom", format: "string", required: "common", notes: "Exam label." },
        { key: "examensProposes[].justification", format: "string", required: "common", notes: "Why the exam is proposed." },
        { key: "examensProposes[].resultat", format: "string", required: "common", notes: "Current result summary." },
        { key: "documents", format: "ScreeningDocument[]", required: "common", notes: "Program result documents." },
        { key: "documents[].id", format: "string", required: "common", notes: "Document identifier." },
        { key: "documents[].titre", format: "string", required: "common", notes: "Document title." },
        { key: "documents[].type", format: "enum", required: "common", notes: "Document type." },
        { key: "documents[].date", format: "DD/MM/YYYY", required: "common", notes: "Document date." },
        { key: "documents[].statut", format: "enum", required: "common", notes: "Document state." },
        { key: "documents[].aperçu", format: "string", required: "common", notes: "Short preview text." },
        { key: "documents[].indicateur", format: "string", required: "common", notes: "Key indicator shown in the UI." },
        { key: "documents[].auteur", format: "string", required: "common", notes: "Document author label." },
      ],
    };
  }

  if (segments[0] === "patients" && segments[2] === "programs" && segments.length === 5 && method === "GET") {
    if (segments[4] === "documents") {
      return {
        title: "GET /patients/:id/programs/:programType/documents response",
        description: "Array payload containing screening documents for the selected program.",
        fields: [
          { key: "[].id", format: "string", required: "always", notes: "Document identifier." },
          { key: "[].titre", format: "string", required: "always", notes: "Document title." },
          { key: "[].type", format: "enum", required: "always", notes: "Document type." },
          { key: "[].date", format: "DD/MM/YYYY", required: "always", notes: "Document date." },
          { key: "[].statut", format: "enum", required: "always", notes: "Availability state." },
          { key: "[].aperçu", format: "string", required: "always", notes: "Short preview text." },
          { key: "[].indicateur", format: "string", required: "always", notes: "Key indicator shown in the card." },
          { key: "[].auteur", format: "string", required: "always", notes: "Document author label." },
        ],
      };
    }

    if (segments[4] === "formulaires") {
      return {
        title: "GET /patients/:id/programs/:programType/formulaires response",
        description: "Array payload containing screening forms for the selected program.",
        fields: [
          { key: "[].id", format: "string", required: "always", notes: "Form identifier." },
          { key: "[].titre", format: "string", required: "always", notes: "Form title." },
          { key: "[].statut", format: "enum", required: "always", notes: "Completion state." },
          { key: "[].description", format: "string", required: "always", notes: "Form summary." },
          { key: "[].champs", format: "string[]", required: "common", notes: "Field labels shown in the form." },
        ],
      };
    }

    if (segments[4] === "examens") {
      return {
        title: "GET /patients/:id/programs/:programType/examens response",
        description: "Array payload containing suggested exams for the selected program.",
        fields: [
          { key: "[].nom", format: "string", required: "always", notes: "Exam label." },
          { key: "[].justification", format: "string", required: "always", notes: "Clinical rationale." },
          { key: "[].resultat", format: "string", required: "always", notes: "Current result summary." },
        ],
      };
    }

    if (segments[4] === "timeline") {
      return {
        title: "GET /patients/:id/programs/:programType/timeline response",
        description: "Array payload containing care timeline steps for the selected program.",
        fields: [
          { key: "[].id", format: "string", required: "always", notes: "Timeline step identifier." },
          { key: "[].titre", format: "string", required: "always", notes: "Step title." },
          { key: "[].periode", format: "string", required: "always", notes: "Displayed period." },
          { key: "[].statut", format: "enum", required: "always", notes: "Previous/current/next state." },
          { key: "[].detail", format: "string", required: "always", notes: "Step detail text." },
        ],
      };
    }

    return {
      title: `GET /patients/:id/programs/:programType/${segments[4]} response`,
      description: "Array payload containing nested program child resources.",
      fields: [
        { key: "[]", format: "array item", required: "always", notes: `Child documents returned from '${segments[4]}' under the selected program.` },
      ],
    };
  }

  if (new URL(route, "https://fake.local").pathname === "/collections" && method === "GET") {
    return {
      title: "GET /collections response",
      description: "Aggregated debug payload returned by the collections overview route.",
      fields: [
        { key: "patients", format: "array", required: "always", notes: "Current stored patient documents." },
        { key: "practitioners", format: "array", required: "always", notes: "Current stored practitioner documents." },
        { key: "messages", format: "array", required: "always", notes: "Current stored message thread documents." },
        { key: "roleProfiles", format: "object", required: "always", notes: "Role-to-profile mapping for the demo app." },
        { key: "roleProfiles.manager.nom", format: "string", required: "common", notes: "Manager profile display name." },
        { key: "roleProfiles.patient.nom", format: "string", required: "common", notes: "Patient profile display name." },
        { key: "roleProfiles.practitioner.nom", format: "string", required: "common", notes: "Practitioner profile display name." },
        { key: "defaultRole", format: "enum", required: "always", notes: "Default role used at bootstrap." },
        { key: "activePatientId", format: "string", required: "always", notes: "Currently selected patient id." },
        { key: "activePractitionerId", format: "string", required: "always", notes: "Currently selected practitioner id." },
      ],
    };
  }

  if (isCollectionRoute(route, "patients") && method === "GET") {
    return {
      title: "GET /patients response",
      description: "Array payload containing patient documents.",
      fields: [
        { key: "[].id", format: "string", required: "always", notes: "Stable patient identifier." },
        { key: "[].prenom", format: "string", required: "always", notes: "Patient first name." },
        { key: "[].nom", format: "string", required: "always", notes: "Patient last name." },
        { key: "[].dateNaissance", format: "YYYY-MM-DD", required: "always", notes: "Birth date stored for the patient." },
        { key: "[].nir", format: "string", required: "always", notes: "National identifier shown in the detail panel." },
        { key: "[].typeDepistage", format: "enum", required: "always", notes: "Primary screening program currently tracked." },
        { key: "[].statut", format: "enum", required: "always", notes: "Current patient status." },
        { key: "[].derniereVisite", format: "DD/MM/YYYY", required: "common", notes: "Last care interaction date." },
        { key: "[].prochainRappel", format: "DD/MM/YYYY", required: "common", notes: "Next reminder or follow-up date." },
        { key: "[].praticienId", format: "string", required: "always", notes: "Practitioner foreign key used by the UI." },
        { key: "[].centre", format: "string", required: "always", notes: "Owning care center or structure label." },
        { key: "[].ville", format: "string", required: "always", notes: "Displayed city." },
        { key: "[].telephone", format: "string", required: "always", notes: "Primary phone number." },
        { key: "[].email", format: "string", required: "always", notes: "Primary email address." },
        { key: "[].risque", format: "enum", required: "always", notes: "Risk severity shown as a badge." },
        { key: "[].canalPrefere", format: "enum", required: "always", notes: "Preferred outreach channel." },
        { key: "[].couverture", format: "enum", required: "always", notes: "Coverage or insurance verification state." },
        { key: "[].progression", format: "number", required: "always", notes: "Journey completion percentage." },
        { key: "[].medecinTraitant", format: "string", required: "always", notes: "Primary physician name." },
        { key: "[].groupeSanguin", format: "enum", required: "always", notes: "Blood type stored in the record." },
        { key: "[].allergies", format: "string[]", required: "common", notes: "Known allergies list." },
        { key: "[].antecedents", format: "string[]", required: "common", notes: "Relevant history list." },
        { key: "[].traitements", format: "string[]", required: "common", notes: "Current treatment list." },
        { key: "[].constantes.imc", format: "string", required: "common", notes: "BMI metric stored in vitals." },
        { key: "[].constantes.tension", format: "string", required: "common", notes: "Blood pressure summary." },
        { key: "[].constantes.frequenceCardiaque", format: "string", required: "common", notes: "Heart rate summary." },
        { key: "[].constantes.saturation", format: "string", required: "common", notes: "Oxygen saturation summary." },
        { key: "[].situationCourante", format: "string", required: "always", notes: "Current narrative summary for the case." },
        { key: "[].episodes", format: "Episode[]", required: "common", notes: "Embedded episode children." },
        { key: "[].tasks", format: "Task[]", required: "common", notes: "Embedded task children." },
        { key: "[].enrollments", format: "Enrollment[]", required: "common", notes: "Embedded enrollment children." },
        { key: "[].programs", format: "ScreeningProgram[]", required: "common", notes: "Embedded screening program children." },
      ],
    };
  }

  if (isCollectionRoute(route, "patients") && method === "POST") {
    return {
      title: "POST /patients response",
      description: "Created patient document returned by the fake backend.",
      fields: [
        { key: "id", format: "string", required: "always", notes: "Created patient identifier." },
        { key: "prenom", format: "string", required: "always", notes: "Created patient first name." },
        { key: "nom", format: "string", required: "always", notes: "Created patient last name." },
        { key: "dateNaissance", format: "YYYY-MM-DD", required: "common", notes: "Birth date returned from stored document." },
        { key: "nir", format: "string", required: "common", notes: "National identifier when provided." },
        { key: "typeDepistage", format: "enum", required: "common", notes: "Primary screening type." },
        { key: "statut", format: "enum", required: "common", notes: "Stored patient status." },
        { key: "praticienId", format: "string", required: "common", notes: "Linked practitioner id." },
        { key: "centre", format: "string", required: "common", notes: "Owning center label." },
        { key: "ville", format: "string", required: "common", notes: "City returned from stored document." },
        { key: "telephone", format: "string", required: "common", notes: "Stored phone number." },
        { key: "email", format: "string", required: "common", notes: "Stored email address." },
        { key: "risque", format: "enum", required: "common", notes: "Stored risk level." },
        { key: "progression", format: "number", required: "common", notes: "Stored journey progress." },
        { key: "episodes", format: "Episode[]", required: "common", notes: "Stored episode children." },
        { key: "tasks", format: "Task[]", required: "common", notes: "Stored task children." },
        { key: "enrollments", format: "Enrollment[]", required: "common", notes: "Stored enrollment children." },
        { key: "programs", format: "ScreeningProgram[]", required: "common", notes: "Stored screening programs." },
      ],
    };
  }

  if (isDocumentRoute(route, "patients") && method === "GET") {
    return {
      title: "GET /patients/:id response",
      description: "Single patient document or 404 error payload.",
      fields: [
        { key: "id", format: "string", required: "success", notes: "Requested patient identifier." },
        { key: "prenom", format: "string", required: "success", notes: "Patient first name." },
        { key: "nom", format: "string", required: "success", notes: "Patient last name." },
        { key: "dateNaissance", format: "YYYY-MM-DD", required: "success", notes: "Birth date." },
        { key: "nir", format: "string", required: "success", notes: "National identifier." },
        { key: "typeDepistage", format: "enum", required: "success", notes: "Primary screening type." },
        { key: "statut", format: "enum", required: "success", notes: "Current patient status." },
        { key: "derniereVisite", format: "DD/MM/YYYY", required: "success", notes: "Last visit date." },
        { key: "prochainRappel", format: "DD/MM/YYYY", required: "success", notes: "Upcoming reminder date." },
        { key: "praticienId", format: "string", required: "success", notes: "Related practitioner id." },
        { key: "centre", format: "string", required: "success", notes: "Owning center label." },
        { key: "ville", format: "string", required: "success", notes: "Displayed city." },
        { key: "telephone", format: "string", required: "success", notes: "Phone number." },
        { key: "email", format: "string", required: "success", notes: "Email address." },
        { key: "risque", format: "enum", required: "success", notes: "Risk badge value." },
        { key: "canalPrefere", format: "enum", required: "success", notes: "Preferred contact channel." },
        { key: "couverture", format: "enum", required: "success", notes: "Coverage status." },
        { key: "progression", format: "number", required: "success", notes: "Journey progress percentage." },
        { key: "medecinTraitant", format: "string", required: "success", notes: "Primary physician name." },
        { key: "groupeSanguin", format: "enum", required: "success", notes: "Stored blood group." },
        { key: "allergies", format: "string[]", required: "success", notes: "Known allergies list." },
        { key: "antecedents", format: "string[]", required: "success", notes: "History list." },
        { key: "traitements", format: "string[]", required: "success", notes: "Treatment list." },
        { key: "constantes.imc", format: "string", required: "common", notes: "BMI metric." },
        { key: "constantes.tension", format: "string", required: "common", notes: "Blood pressure summary." },
        { key: "constantes.frequenceCardiaque", format: "string", required: "common", notes: "Heart rate summary." },
        { key: "constantes.saturation", format: "string", required: "common", notes: "Oxygen saturation summary." },
        { key: "situationCourante", format: "string", required: "success", notes: "Current patient situation." },
        { key: "episodes", format: "Episode[]", required: "common", notes: "Embedded episode children." },
        { key: "tasks", format: "Task[]", required: "common", notes: "Embedded task children." },
        { key: "enrollments", format: "Enrollment[]", required: "common", notes: "Embedded enrollment children." },
        { key: "programs", format: "ScreeningProgram[]", required: "common", notes: "Embedded program children." },
        { key: "error", format: "string", required: "404 only", notes: "Error message when the patient does not exist." },
      ],
    };
  }

  if (isDocumentRoute(route, "patients") && (method === "PUT" || method === "PATCH")) {
    return {
      title: `${method} /patients/:id response`,
      description: "Updated patient document returned after write-through persistence.",
      fields: [
        { key: "id", format: "string", required: "always", notes: "Updated patient identifier." },
        { key: "prenom", format: "string", required: "common", notes: "Updated or preserved first name." },
        { key: "nom", format: "string", required: "common", notes: "Updated or preserved last name." },
        { key: "statut", format: "enum", required: "common", notes: "Updated or preserved patient status." },
        { key: "telephone", format: "string", required: "common", notes: "Updated or preserved phone number." },
        { key: "ville", format: "string", required: "common", notes: "Updated or preserved city." },
        { key: "email", format: "string", required: "common", notes: "Updated or preserved email." },
        { key: "risque", format: "enum", required: "common", notes: "Updated or preserved risk level." },
        { key: "canalPrefere", format: "enum", required: "common", notes: "Updated or preserved contact channel." },
        { key: "progression", format: "number", required: "common", notes: "Updated or preserved progress." },
        { key: "episodes", format: "Episode[]", required: "common", notes: "Preserved embedded episodes." },
        { key: "tasks", format: "Task[]", required: "common", notes: "Preserved embedded tasks." },
        { key: "enrollments", format: "Enrollment[]", required: "common", notes: "Preserved embedded enrollments." },
        { key: "programs", format: "ScreeningProgram[]", required: "common", notes: "Preserved embedded programs." },
      ],
    };
  }

  if (isDocumentRoute(route, "patients") && method === "DELETE") {
    return {
      title: "DELETE /patients/:id response",
      description: "Deletion confirmation payload.",
      fields: [
        { key: "ok", format: "boolean", required: "always", notes: "True when the delete operation completes." },
        { key: "id", format: "string", required: "always", notes: "Deleted patient identifier." },
      ],
    };
  }

  if (isCollectionRoute(route, "practitioners") && method === "GET") {
    return {
      title: "GET /practitioners response",
      description: "Array payload containing practitioner documents.",
      fields: [
        { key: "[].id", format: "string", required: "always", notes: "Stable practitioner identifier." },
        { key: "[].prenom", format: "string", required: "always", notes: "Practitioner first name." },
        { key: "[].nom", format: "string", required: "always", notes: "Practitioner last name." },
        { key: "[].specialite", format: "string", required: "always", notes: "Primary specialty label." },
        { key: "[].structure", format: "string", required: "always", notes: "Owning structure or clinic." },
        { key: "[].ville", format: "string", required: "always", notes: "Displayed city." },
        { key: "[].patientsActifs", format: "number", required: "always", notes: "Active patient count." },
        { key: "[].charge", format: "string", required: "always", notes: "Workload classification." },
        { key: "[].disponibilite", format: "string", required: "always", notes: "Availability summary." },
      ],
    };
  }

  if (isCollectionRoute(route, "practitioners") && method === "POST") {
    return {
      title: "POST /practitioners response",
      description: "Created practitioner document returned by the fake backend.",
      fields: [
        { key: "id", format: "string", required: "always", notes: "Created practitioner identifier." },
        { key: "prenom", format: "string", required: "always", notes: "Created practitioner first name." },
        { key: "nom", format: "string", required: "always", notes: "Created practitioner last name." },
        { key: "specialite", format: "string", required: "common", notes: "Stored specialty label." },
        { key: "structure", format: "string", required: "common", notes: "Stored structure label." },
        { key: "ville", format: "string", required: "common", notes: "Stored city." },
        { key: "patientsActifs", format: "number", required: "common", notes: "Stored active patient count." },
        { key: "charge", format: "string", required: "common", notes: "Stored workload classification." },
        { key: "disponibilite", format: "string", required: "common", notes: "Stored availability summary." },
      ],
    };
  }

  if (isDocumentRoute(route, "practitioners") && method === "GET") {
    return {
      title: "GET /practitioners/:id response",
      description: "Single practitioner document or 404 error payload.",
      fields: [
        { key: "id", format: "string", required: "success", notes: "Requested practitioner identifier." },
        { key: "prenom", format: "string", required: "success", notes: "Practitioner first name." },
        { key: "nom", format: "string", required: "success", notes: "Practitioner last name." },
        { key: "specialite", format: "string", required: "success", notes: "Specialty label." },
        { key: "structure", format: "string", required: "success", notes: "Owning structure or clinic." },
        { key: "ville", format: "string", required: "success", notes: "Displayed city." },
        { key: "patientsActifs", format: "number", required: "success", notes: "Active patient count." },
        { key: "charge", format: "enum", required: "success", notes: "Workload label." },
        { key: "disponibilite", format: "string", required: "success", notes: "Availability summary." },
        { key: "error", format: "string", required: "404 only", notes: "Error message when the practitioner does not exist." },
      ],
    };
  }

  if (isDocumentRoute(route, "practitioners") && (method === "PUT" || method === "PATCH")) {
    return {
      title: `${method} /practitioners/:id response`,
      description: "Updated practitioner document returned after persistence.",
      fields: [
        { key: "id", format: "string", required: "always", notes: "Updated practitioner identifier." },
        { key: "prenom", format: "string", required: "common", notes: "Updated or preserved first name." },
        { key: "nom", format: "string", required: "common", notes: "Updated or preserved last name." },
        { key: "specialite", format: "string", required: "common", notes: "Updated or preserved specialty." },
        { key: "structure", format: "string", required: "common", notes: "Updated or preserved structure." },
        { key: "ville", format: "string", required: "common", notes: "Updated or preserved city." },
        { key: "patientsActifs", format: "number", required: "common", notes: "Updated or preserved active patient count." },
        { key: "charge", format: "string", required: "common", notes: "Updated or preserved workload label." },
        { key: "disponibilite", format: "string", required: "common", notes: "Updated or preserved availability text." },
      ],
    };
  }

  if (isDocumentRoute(route, "practitioners") && method === "DELETE") {
    return {
      title: "DELETE /practitioners/:id response",
      description: "Deletion confirmation payload.",
      fields: [
        { key: "ok", format: "boolean", required: "always", notes: "True when the delete operation completes." },
        { key: "id", format: "string", required: "always", notes: "Deleted practitioner identifier." },
      ],
    };
  }

  if (isCollectionRoute(route, "messages") && method === "GET") {
    return {
      title: "GET /messages response",
      description: "Array payload containing message thread documents.",
      fields: [
        { key: "[].id", format: "string", required: "always", notes: "Stable message thread identifier." },
        { key: "[].sujet", format: "string", required: "always", notes: "Thread title displayed in the UI." },
        { key: "[].expediteur", format: "string", required: "always", notes: "Sender label." },
        { key: "[].destinataire", format: "string", required: "always", notes: "Recipient label." },
        { key: "[].aperçu", format: "string", required: "always", notes: "Short preview used in message lists." },
        { key: "[].contenu", format: "string", required: "always", notes: "Full message body." },
        { key: "[].date", format: "DD/MM/YYYY HH:mm", required: "always", notes: "Displayed message date/time." },
        { key: "[].statut", format: "enum", required: "always", notes: "Read, draft, sent, or unread status." },
        { key: "[].boite", format: "enum", required: "always", notes: "Mailbox grouping in the UI." },
        { key: "[].securise", format: "boolean", required: "always", notes: "Secure message indicator." },
        { key: "[].importance", format: "enum", required: "always", notes: "Priority label." },
        { key: "[].roleCible", format: "enum", required: "always", notes: "Target user role or 'all'." },
        { key: "[].piecesJointes", format: "Attachment[]", required: "common", notes: "Optional attachments array." },
        { key: "[].piecesJointes[].nom", format: "string", required: "common", notes: "Attachment file name." },
        { key: "[].piecesJointes[].taille", format: "string", required: "common", notes: "Attachment display size." },
      ],
    };
  }

  if (isCollectionRoute(route, "messages") && method === "POST") {
    return {
      title: "POST /messages response",
      description: "Created message thread document returned by the fake backend.",
      fields: [
        { key: "id", format: "string", required: "always", notes: "Created thread identifier." },
        { key: "sujet", format: "string", required: "common", notes: "Stored thread subject." },
        { key: "expediteur", format: "string", required: "common", notes: "Stored sender label." },
        { key: "destinataire", format: "string", required: "common", notes: "Stored recipient label." },
        { key: "aperçu", format: "string", required: "common", notes: "Stored preview text." },
        { key: "contenu", format: "string", required: "common", notes: "Stored body." },
        { key: "date", format: "DD/MM/YYYY HH:mm", required: "common", notes: "Stored date/time." },
        { key: "statut", format: "enum", required: "common", notes: "Stored message state." },
        { key: "boite", format: "enum", required: "common", notes: "Stored mailbox." },
        { key: "securise", format: "boolean", required: "common", notes: "Stored secure flag." },
        { key: "importance", format: "enum", required: "common", notes: "Stored priority." },
        { key: "roleCible", format: "enum", required: "common", notes: "Stored target role." },
        { key: "piecesJointes", format: "Attachment[]", required: "common", notes: "Stored attachments." },
      ],
    };
  }

  if (isDocumentRoute(route, "messages") && method === "GET") {
    return {
      title: "GET /messages/:id response",
      description: "Single message thread document or 404 error payload.",
      fields: [
        { key: "id", format: "string", required: "success", notes: "Requested thread identifier." },
        { key: "sujet", format: "string", required: "success", notes: "Thread title." },
        { key: "expediteur", format: "string", required: "success", notes: "Sender label." },
        { key: "destinataire", format: "string", required: "success", notes: "Recipient label." },
        { key: "aperçu", format: "string", required: "success", notes: "List preview text." },
        { key: "contenu", format: "string", required: "success", notes: "Full message body." },
        { key: "date", format: "DD/MM/YYYY HH:mm", required: "success", notes: "Displayed date/time." },
        { key: "statut", format: "enum", required: "success", notes: "Read, draft, sent, or unread state." },
        { key: "boite", format: "enum", required: "success", notes: "Mailbox folder." },
        { key: "securise", format: "boolean", required: "success", notes: "Secure message indicator." },
        { key: "importance", format: "enum", required: "success", notes: "Priority label." },
        { key: "roleCible", format: "enum", required: "success", notes: "Target user role." },
        { key: "piecesJointes", format: "Attachment[]", required: "common", notes: "Optional attachments array." },
        { key: "piecesJointes[].nom", format: "string", required: "common", notes: "Attachment file name." },
        { key: "piecesJointes[].taille", format: "string", required: "common", notes: "Attachment display size." },
        { key: "error", format: "string", required: "404 only", notes: "Error message when the thread does not exist." },
      ],
    };
  }

  if (isDocumentRoute(route, "messages") && (method === "PUT" || method === "PATCH")) {
    return {
      title: `${method} /messages/:id response`,
      description: "Updated message thread document returned after persistence.",
      fields: [
        { key: "id", format: "string", required: "always", notes: "Updated thread identifier." },
        { key: "sujet", format: "string", required: "common", notes: "Updated or preserved subject." },
        { key: "expediteur", format: "string", required: "common", notes: "Updated or preserved sender." },
        { key: "destinataire", format: "string", required: "common", notes: "Updated or preserved recipient." },
        { key: "aperçu", format: "string", required: "common", notes: "Updated or preserved preview text." },
        { key: "contenu", format: "string", required: "common", notes: "Updated or preserved body." },
        { key: "date", format: "DD/MM/YYYY HH:mm", required: "common", notes: "Updated or preserved date/time." },
        { key: "statut", format: "enum", required: "common", notes: "Updated or preserved status." },
        { key: "boite", format: "enum", required: "common", notes: "Updated or preserved mailbox." },
        { key: "securise", format: "boolean", required: "common", notes: "Updated or preserved secure flag." },
        { key: "importance", format: "enum", required: "common", notes: "Updated or preserved priority." },
        { key: "roleCible", format: "enum", required: "common", notes: "Updated or preserved target role." },
        { key: "piecesJointes", format: "Attachment[]", required: "common", notes: "Updated or preserved attachments." },
      ],
    };
  }

  if (isDocumentRoute(route, "messages") && method === "DELETE") {
    return {
      title: "DELETE /messages/:id response",
      description: "Deletion confirmation payload.",
      fields: [
        { key: "ok", format: "boolean", required: "always", notes: "True when the delete operation completes." },
        { key: "id", format: "string", required: "always", notes: "Deleted thread identifier." },
      ],
    };
  }

  return {
    title: "Response payload",
    description: "Unsupported or undocumented response shape for the current route/verb combination.",
    fields: [
      { key: "error", format: "string", required: "common", notes: "Error message for unsupported combinations." },
    ],
  };
}

function getResponseScenarios(route: string, method: HttpVerb): ResponseScenario[] {
  const family = getRouteFamily(route);

  const defaultReal: ResponseScenario = {
    key: "real",
    label: "Real response (default)",
    body: getExpectedMainResponse(route, method),
  };

  if (family === "collections") {
    return [
      defaultReal,
      {
        key: "empty",
        label: "Empty collections",
        body: formatJson({
          patients: [],
          practitioners: [],
          messages: [],
          roleProfiles: {},
          defaultRole: "manager",
          activePatientId: "",
          activePractitionerId: "",
        }),
      },
    ];
  }

  if (method === "DELETE") {
    return [
      defaultReal,
      { key: "not_found", label: "404 not found", body: formatJson({ error: "Not found" }) },
    ];
  }

  return [
    defaultReal,
    { key: "created", label: "201 created sample", body: formatJson({ ok: true, id: "demo-id" }) },
    { key: "not_found", label: "404 not found", body: formatJson({ error: "Not found" }) },
    {
      key: "bad_request",
      label: "400 validation error",
      body: formatJson({ error: "POST collection requests require an 'id' field in the JSON body" }),
    },
  ];
}

function getExpectedMainResponse(route: string, method: HttpVerb) {
  const family = getRouteFamily(route);
  const segments = getPathSegments(route);

  if (family === "collections") {
    return formatJson({
      patients: demoDataBundle.patients.slice(0, 2),
      practitioners: demoDataBundle.practitioners.slice(0, 2),
      messages: demoDataBundle.messages.slice(0, 1),
      roleProfiles: demoDataBundle.roleProfiles,
      defaultRole: demoDataBundle.defaultRole,
      activePatientId: demoDataBundle.activePatientId,
      activePractitionerId: demoDataBundle.activePractitionerId,
    });
  }

  if (family === "patients") {
    if (method === "GET" && segments[0] === "patients" && segments[2] === "episodes") {
      return formatJson(demoDataBundle.patients[0]?.episodes ?? []);
    }
    if (method === "GET" && segments[0] === "patients" && segments[2] === "tasks") {
      return formatJson(demoDataBundle.patients[0]?.tasks ?? []);
    }
    if (method === "GET" && segments[0] === "patients" && segments[2] === "enrollments") {
      return formatJson(demoDataBundle.patients[0]?.enrollments ?? []);
    }
    if (method === "GET" && segments[0] === "patients" && segments[2] === "programs" && segments.length === 3) {
      return formatJson(demoDataBundle.patients[0]?.programs ?? []);
    }
    if (method === "GET" && segments[0] === "patients" && segments[2] === "programs" && segments.length === 4) {
      const program = demoDataBundle.patients[0]?.programs.find((item) => item.type === segments[3]);
      return formatJson(program ?? null);
    }
    if (method === "GET" && segments[0] === "patients" && segments[2] === "programs" && segments.length === 5) {
      const program = demoDataBundle.patients[0]?.programs.find((item) => item.type === segments[3]);
      if (!program) {
        return formatJson([]);
      }
      if (segments[4] === "documents") {
        return formatJson(program.documents);
      }
      if (segments[4] === "formulaires") {
        return formatJson(program.formulaires);
      }
      if (segments[4] === "examens") {
        return formatJson(program.examensProposes);
      }
      if (segments[4] === "timeline") {
        return formatJson(program.parcours);
      }
      return formatJson([]);
    }
    if (method === "GET" && route.includes("/patients/")) {
      return formatJson(demoDataBundle.patients[0]);
    }
    if (method === "GET") {
      return formatJson(demoDataBundle.patients.slice(0, 2));
    }
    if (method === "DELETE") {
      return formatJson({ ok: true, id: "pt-api-demo" });
    }
    return getRequestBodySample(route, method);
  }

  if (family === "practitioners") {
    if (method === "GET" && route.includes("/practitioners/")) {
      return formatJson(demoDataBundle.practitioners[0]);
    }
    if (method === "GET") {
      return formatJson(demoDataBundle.practitioners.slice(0, 2));
    }
    return getRequestBodySample(route, method);
  }

  if (family === "messages") {
    if (method === "GET" && route.includes("/messages/")) {
      return formatJson(demoDataBundle.messages[0]);
    }
    if (method === "GET") {
      return formatJson(demoDataBundle.messages.slice(0, 2));
    }
    return getRequestBodySample(route, method);
  }

  return formatJson({ ok: true });
}

function buildOpenApiYaml() {
  return `openapi: 3.1.0
info:
  title: ESIS Fake Firestore API
  version: 1.0.0
  description: IndexedDB-backed fake API exposed inside the Data console.
servers:
  - url: /
paths:
  /collections:
    get:
      summary: Read aggregated IndexedDB state
      parameters:
        - name: list
          in: query
          schema: { type: string }
        - name: sort
          in: query
          schema: { type: string }
        - name: limit
          in: query
          schema: { type: integer }
      responses:
        "200":
          description: Aggregated collections payload
  /patients:
    get:
      summary: List patients
      parameters:
        - name: list
          in: query
          schema: { type: string }
        - name: sort
          in: query
          schema: { type: string }
        - name: limit
          in: query
          schema: { type: integer }
      responses:
        "200":
          description: Patient array
    post:
      summary: Create patient
      requestBody:
        required: true
      responses:
        "201":
          description: Created patient
        "400":
          description: Missing id or invalid body
  /patients/{id}:
    get:
      summary: Read patient by id
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Patient document
        "404":
          description: Not found
    put:
      summary: Replace patient by id
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Updated patient
    patch:
      summary: Patch patient by id
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Patched patient
    delete:
      summary: Delete patient by id
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Delete confirmation
  /practitioners:
    get:
      summary: List practitioners
      responses:
        "200":
          description: Practitioner array
    post:
      summary: Create practitioner
      responses:
        "201":
          description: Created practitioner
  /practitioners/{id}:
    get:
      summary: Read practitioner by id
      responses:
        "200":
          description: Practitioner document
    put:
      summary: Replace practitioner by id
      responses:
        "200":
          description: Updated practitioner
    patch:
      summary: Patch practitioner by id
      responses:
        "200":
          description: Patched practitioner
    delete:
      summary: Delete practitioner by id
      responses:
        "200":
          description: Delete confirmation
  /messages:
    get:
      summary: List message threads
      responses:
        "200":
          description: Message array
    post:
      summary: Create message thread
      responses:
        "201":
          description: Created message
  /messages/{id}:
    get:
      summary: Read message by id
      responses:
        "200":
          description: Message document
    put:
      summary: Replace message by id
      responses:
        "200":
          description: Updated message
    patch:
      summary: Patch message by id
      responses:
        "200":
          description: Patched message
    delete:
      summary: Delete message by id
      responses:
        "200":
          description: Delete confirmation
`;
}

export function DataPage() {
  const { reloadFromStorage } = useAppState();
  const [data, setData] = useState<DemoDataBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedPresetLabel, setSelectedPresetLabel] = useState(ROUTE_PRESETS[0].label);
  const [method, setMethod] = useState<HttpVerb>("GET");
  const [route, setRoute] = useState("/collections");
  const [bodyInput, setBodyInput] = useState("");
  const [response, setResponse] = useState<ApiResponseState | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(560);
  const [responseScenarioKey, setResponseScenarioKey] = useState("real");

  async function refresh() {
    setIsLoading(true);
    try {
      setData(await loadStoredCollections());
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    setBodyInput(getRequestBodySample(route, method));
    setResponseScenarioKey("real");
    setResponse(null);
  }, [method, route]);

  function applyPreset(label: string) {
    const preset = ROUTE_PRESETS.find((item) => item.label === label);
    if (!preset) {
      return;
    }

    setSelectedPresetLabel(label);
    setMethod(preset.method);
    setRoute(preset.route);
    setBodyInput(preset.body);
    setResponseScenarioKey("real");
    setResponse(null);
  }

  function handleResizeStart() {
    const handleMove = (event: MouseEvent) => {
      const nextWidth = Math.min(780, Math.max(460, window.innerWidth - event.clientX - 24));
      setSidebarWidth(nextWidth);
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }

  async function handleReset() {
    setIsResetting(true);
    try {
      await resetStoredCollections();
      await reloadFromStorage();
      await refresh();
      toast.success("Données réinitialisées", {
        description: "IndexedDB a été rechargé avec les données de démonstration.",
      });
    } finally {
      setIsResetting(false);
    }
  }

  async function handleSend() {
    setIsSending(true);
    try {
      const requestBody = bodyInput.trim().length > 0 ? bodyInput : undefined;
      const result = await fakeFirestoreRequest(route, {
        method,
        body: method === "GET" || method === "DELETE" ? undefined : requestBody,
      });

      const rawText = await result.text();
      let formattedBody = rawText;

      try {
        formattedBody = formatJson(JSON.parse(rawText));
      } catch {
        formattedBody = rawText;
      }

      setResponse({
        status: result.status,
        statusText: result.statusText,
        body: formattedBody,
      });

      if (result.ok && method !== "GET") {
        await reloadFromStorage();
        await refresh();
        toast.success("Requête exécutée", {
          description: `${method} ${route} a mis à jour IndexedDB.`,
        });
      } else if (!result.ok) {
        toast.error("Requête en erreur", {
          description: `${result.status} ${result.statusText || "Request failed"}`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      setResponse({
        status: 500,
        statusText: "Client Error",
        body: formatJson({ error: message }),
      });
      toast.error("Exécution impossible", { description: message });
    } finally {
      setIsSending(false);
    }
  }

  function handleDownloadOpenApi() {
    const blob = new Blob([buildOpenApiYaml()], { type: "application/yaml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "esis-fake-api.openapi.yaml";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadJson() {
    const blob = new Blob([responsePreview], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "esis-fake-api-response.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const requestPath = useMemo(() => new URL(route, "https://fake.local"), [route]);
  const parameterChips = useMemo(() => getParameterChips(route), [route]);
  const verbDefinition = useMemo(() => getVerbDefinition(route, method), [route, method]);
  const responseDefinition = useMemo(() => getResponseDefinition(route, method), [route, method]);
  const responseScenarios = useMemo(() => getResponseScenarios(route, method), [route, method]);
  const activeResponseScenario =
    responseScenarios.find((scenario) => scenario.key === responseScenarioKey) ?? responseScenarios[0];
  const responsePreview =
    activeResponseScenario.key === "real" && response ? response.body : activeResponseScenario.body;
  const responseStatusLabel =
    activeResponseScenario.key === "real" && response
      ? `${response.status} ${response.statusText}`
      : "Placeholder";
  const responsePreviewModeLabel =
    activeResponseScenario.key === "real" && response ? "Real" : "Sample";

  return (
    <div className="flex h-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-800 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold">Data</h1>
                <p className="mt-0.5 text-sm text-slate-400">
                  Inspecteur IndexedDB du faux backend Firestore.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="data-download-json-button"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
                onClick={handleDownloadJson}
              >
                <Download className="h-3.5 w-3.5" />
                JSON
              </button>
              <button
                id="data-reset-button"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
                onClick={() => void handleReset()}
                disabled={isResetting}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {isResetting ? "Reset..." : "Reset demo data"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-2.5">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Response body</span>
              <select
                id="data-api-response-scenario-select"
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100"
                value={responseScenarioKey}
                onChange={(event) => setResponseScenarioKey(event.target.value)}
              >
                {responseScenarios.map((scenario) => (
                  <option key={scenario.key} value={scenario.key}>
                    {scenario.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="thin-scrollbar h-[calc(100%-41px)] overflow-auto">
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                  <span className="text-xs font-medium text-slate-300">{responsePreviewModeLabel}</span>
                  <span className="text-[11px] uppercase tracking-wide text-slate-500">{responseStatusLabel}</span>
                </div>

                <details className="rounded-xl border border-slate-800 bg-slate-950">
                  <summary className="cursor-pointer px-3 py-2.5 text-sm font-medium text-slate-200">
                    Response body definition
                  </summary>
                  <div className="space-y-3 border-t border-slate-800 p-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">{responseDefinition.title}</p>
                      <p className="mt-2 text-sm leading-5 text-slate-300">{responseDefinition.description}</p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-800">
                      <table className="w-full text-left text-[11px] leading-5 text-slate-300">
                        <thead className="bg-slate-900 text-slate-400">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Key</th>
                            <th className="px-3 py-2 font-semibold">Format</th>
                            <th className="px-3 py-2 font-semibold">Example</th>
                            <th className="px-3 py-2 font-semibold">Required</th>
                            <th className="px-3 py-2 font-semibold">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {responseDefinition.fields.map((field) => (
                            <tr key={field.key} className="border-t border-slate-800 bg-slate-950">
                              <td className="px-3 py-2 font-mono text-emerald-100">{field.key}</td>
                              <td className="px-3 py-2">{field.format}</td>
                              <td className="px-3 py-2 font-mono text-slate-400">{getDefaultExample(field)}</td>
                              <td className="px-3 py-2">{normalizeRequiredLabel(field.required)}</td>
                              <td className="px-3 py-2">{field.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>

                {isLoading && activeResponseScenario.key === "real" && !response ? (
                  <div className="p-4 text-sm text-slate-400">Chargement de l'état IndexedDB...</div>
                ) : (
                  <pre className="min-h-full whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-5 text-cyan-100">
                    {responsePreview}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        id="data-api-resize-handle"
        className="group flex w-3 shrink-0 cursor-col-resize items-center justify-center border-l border-r border-slate-900 bg-slate-950/70 hover:bg-slate-900/90"
        onMouseDown={handleResizeStart}
      >
        <GripVertical className="h-4 w-4 text-slate-600 group-hover:text-slate-300" />
      </div>

      <aside
        id="data-api-console-sidebar"
        className="thin-scrollbar flex shrink-0 flex-col overflow-auto border-l border-slate-800 bg-slate-900 shadow-2xl"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">API Console</p>
            <p className="mt-1 text-sm text-slate-300">Exploreur HTTP simulé relié à IndexedDB.</p>
          </div>
          <button
            id="data-download-openapi-button"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
            onClick={handleDownloadOpenApi}
          >
            <Download className="h-3.5 w-3.5" />
            OpenAPI
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Route name</label>
            <select
              id="data-api-preset-select"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              value={selectedPresetLabel}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {ROUTE_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-2">
            <div
              id="data-api-method-badge"
              className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-cyan-100"
            >
              {method}
            </div>
            <input
              id="data-api-route-input"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100"
              value={route}
              onChange={(event) => setRoute(event.target.value)}
            />
          </div>

          <details className="rounded-xl border border-slate-800 bg-slate-950">
            <summary className="cursor-pointer px-3 py-2.5 text-sm font-medium text-slate-200">
              HTTP parameters
            </summary>
            <div className="space-y-3 border-t border-slate-800 p-3">
              <div className="flex flex-wrap gap-2">
                {parameterChips.length > 0 ? (
                  parameterChips.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-cyan-500 hover:text-cyan-200"
                      onClick={() => setRoute(chip.apply(route))}
                      title={chip.description}
                    >
                      {chip.label}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No common id/list/sort/number parameters for this route.</span>
                )}
              </div>
              <pre className="rounded-lg border border-slate-800 bg-slate-900 p-3 font-mono text-[11px] leading-5 text-slate-300">
                {formatJson({
                  path: requestPath.pathname,
                  query: Object.fromEntries(requestPath.searchParams.entries()),
                })}
              </pre>
            </div>
          </details>

          <details className="rounded-xl border border-slate-800 bg-slate-950">
            <summary className="cursor-pointer px-3 py-2.5 text-sm font-medium text-slate-200">
              Request definition
            </summary>
            <div className="space-y-3 border-t border-slate-800 p-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">{verbDefinition.title}</p>
                <p className="mt-2 text-sm leading-5 text-slate-300">{verbDefinition.description}</p>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-800">
                <table className="w-full text-left text-[11px] leading-5 text-slate-300">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Key</th>
                      <th className="px-3 py-2 font-semibold">Format</th>
                      <th className="px-3 py-2 font-semibold">Example</th>
                      <th className="px-3 py-2 font-semibold">Required</th>
                      <th className="px-3 py-2 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verbDefinition.fields.map((field) => (
                      <tr key={field.key} className="border-t border-slate-800 bg-slate-950">
                        <td className="px-3 py-2 font-mono text-cyan-100">{field.key}</td>
                        <td className="px-3 py-2">{field.format}</td>
                        <td className="px-3 py-2 font-mono text-slate-400">{getDefaultExample(field)}</td>
                        <td className="px-3 py-2">{normalizeRequiredLabel(field.required)}</td>
                        <td className="px-3 py-2">{field.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Body sample</label>
            <textarea
              id="data-api-request-body"
              className="thin-scrollbar min-h-40 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-[11px] leading-5 text-slate-200"
              value={bodyInput}
              onChange={(event) => setBodyInput(event.target.value)}
              placeholder={getRequestBodySample(route, method)}
            />
          </div>

          <button
            id="data-api-send-button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void handleSend()}
            disabled={isSending}
          >
            <Play className="h-4 w-4" />
            {isSending ? "Exécution..." : "Send"}
          </button>

        </div>
      </aside>
    </div>
  );
}
