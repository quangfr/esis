import { demoDataBundle, type DemoDataBundle, type MessageThread, type Patient, type Practitioner } from "../data/demo-data";

const DATABASE_NAME = "esis-fake-firestore";
const DATABASE_VERSION = 1;
const STORE_NAMES = {
  patients: "patients",
  practitioners: "practitioners",
  messages: "messages",
  metadata: "app_metadata",
} as const;

type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES];
type StoreRecordMap = {
  patients: Patient;
  practitioners: Practitioner;
  messages: MessageThread;
  app_metadata: {
    id: string;
    roleProfiles: DemoDataBundle["roleProfiles"];
    defaultRole: DemoDataBundle["defaultRole"];
    activePatientId: string;
    activePractitionerId: string;
  };
};

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      for (const storeName of Object.values(STORE_NAMES)) {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: "id" });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

async function putMany<T extends { id: string }>(storeName: StoreName, values: T[]) {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);

  for (const value of values) {
    store.put(value);
  }

  await transactionComplete(transaction);
  database.close();
}

async function putOne<T extends { id: string }>(storeName: StoreName, value: T) {
  await putMany(storeName, [value]);
  return value;
}

async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.getAll();

  const result = await new Promise<T[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error ?? new Error(`IndexedDB getAll failed for ${storeName}`));
  });

  database.close();
  return result;
}

async function getById<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.get(id);

  const result = await new Promise<T | undefined>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error ?? new Error(`IndexedDB get failed for ${storeName}/${id}`));
  });

  database.close();
  return result;
}

async function isSeeded() {
  const metadata = await getById<{ id: string }>(STORE_NAMES.metadata, "bootstrap");
  return Boolean(metadata);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function notFound() {
  return jsonResponse({ error: "Not found" }, 404);
}

function toCollectionPayload(bundle: DemoDataBundle) {
  return {
    patients: bundle.patients,
    practitioners: bundle.practitioners,
    messages: bundle.messages,
    roleProfiles: bundle.roleProfiles,
    defaultRole: bundle.defaultRole,
    activePatientId: bundle.activePatientId,
    activePractitionerId: bundle.activePractitionerId,
  };
}

export async function seedFakeFirestore(payload: DemoDataBundle) {
  await Promise.all([
    putMany(STORE_NAMES.patients, payload.patients),
    putMany(STORE_NAMES.practitioners, payload.practitioners),
    putMany(STORE_NAMES.messages, payload.messages),
    putMany(STORE_NAMES.metadata, [
      {
        id: "bootstrap",
        roleProfiles: payload.roleProfiles,
        defaultRole: payload.defaultRole,
        activePatientId: payload.activePatientId,
        activePractitionerId: payload.activePractitionerId,
      },
    ]),
  ]);

  return { ok: true };
}

export async function ensureFakeFirestoreSeeded() {
  if (!(await isSeeded())) {
    await seedFakeFirestore(demoDataBundle);
  }
}

export async function loadBootstrapFromFakeFirestore(): Promise<DemoDataBundle> {
  await ensureFakeFirestoreSeeded();

  const [patients, practitioners, messages, metadata] = await Promise.all([
    getAll<Patient>(STORE_NAMES.patients),
    getAll<Practitioner>(STORE_NAMES.practitioners),
    getAll<MessageThread>(STORE_NAMES.messages),
    getById<StoreRecordMap["app_metadata"]>(STORE_NAMES.metadata, "bootstrap"),
  ]);

  if (!metadata) {
    throw new Error("IndexedDB bootstrap metadata not found");
  }

  return {
    patients,
    practitioners,
    messages,
    roleProfiles: metadata.roleProfiles,
    defaultRole: metadata.defaultRole,
    activePatientId: metadata.activePatientId,
    activePractitionerId: metadata.activePractitionerId,
  };
}

export async function createPatientInFakeFirestore(patient: Patient) {
  await ensureFakeFirestoreSeeded();
  return putOne(STORE_NAMES.patients, patient);
}

export async function updatePatientInFakeFirestore(patient: Patient) {
  await ensureFakeFirestoreSeeded();
  return putOne(STORE_NAMES.patients, patient);
}

export async function createMessageInFakeFirestore(message: MessageThread) {
  await ensureFakeFirestoreSeeded();
  return putOne(STORE_NAMES.messages, message);
}

export async function updateMessageInFakeFirestore(message: MessageThread) {
  await ensureFakeFirestoreSeeded();
  return putOne(STORE_NAMES.messages, message);
}

export async function fakeFirestoreRequest(input: string, init?: RequestInit) {
  const method = init?.method?.toUpperCase() || "GET";
  const url = new URL(input, window.location.origin);
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length === 1 && segments[0] === "seed" && method === "POST") {
    const rawBody = init?.body;
    const payload =
      typeof rawBody === "string" ? (JSON.parse(rawBody) as DemoDataBundle) : demoDataBundle;
    const body = await seedFakeFirestore(payload);
    return jsonResponse(body);
  }

  if (segments.length === 1 && segments[0] === "bootstrap" && method === "GET") {
    return jsonResponse(await loadBootstrapFromFakeFirestore());
  }

  await ensureFakeFirestoreSeeded();

  if (segments.length === 1 && method === "GET") {
    const [collection] = segments;
    if (collection === "patients") {
      return jsonResponse(await getAll<Patient>(STORE_NAMES.patients));
    }
    if (collection === "practitioners") {
      return jsonResponse(await getAll<Practitioner>(STORE_NAMES.practitioners));
    }
    if (collection === "messages") {
      return jsonResponse(await getAll<MessageThread>(STORE_NAMES.messages));
    }
  }

  if (segments.length === 2 && (method === "POST" || method === "PUT" || method === "PATCH")) {
    const [collection, documentId] = segments;
    const rawBody = init?.body;
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : {};

    if (collection === "patients") {
      return jsonResponse(await putOne(STORE_NAMES.patients, { ...body, id: documentId } as Patient));
    }
    if (collection === "messages") {
      return jsonResponse(await putOne(STORE_NAMES.messages, { ...body, id: documentId } as MessageThread));
    }
    if (collection === "practitioners") {
      return jsonResponse(await putOne(STORE_NAMES.practitioners, { ...body, id: documentId } as Practitioner));
    }
  }

  if (segments.length === 2 && method === "GET") {
    const [collection, documentId] = segments;

    if (collection === "patients") {
      const patient = await getById<Patient>(STORE_NAMES.patients, documentId);
      return patient ? jsonResponse(patient) : notFound();
    }
    if (collection === "messages") {
      const message = await getById<MessageThread>(STORE_NAMES.messages, documentId);
      return message ? jsonResponse(message) : notFound();
    }
    if (collection === "practitioners") {
      const practitioner = await getById<Practitioner>(STORE_NAMES.practitioners, documentId);
      return practitioner ? jsonResponse(practitioner) : notFound();
    }
  }

  if (segments.length === 1 && segments[0] === "collections" && method === "GET") {
    return jsonResponse(toCollectionPayload(await loadBootstrapFromFakeFirestore()));
  }

  return notFound();
}
