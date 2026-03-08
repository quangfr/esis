import { demoDataBundle, type DemoDataBundle } from "../data/demo-data";
import { fakeFirestoreRequest } from "./fake-firestore";

async function fetchBootstrapData(): Promise<DemoDataBundle> {
  const response = await fakeFirestoreRequest("/bootstrap");
  if (!response.ok) {
    throw new Error(`Impossible de charger les données IndexedDB (${response.status})`);
  }

  return (await response.json()) as DemoDataBundle;
}

export async function loadAppData(): Promise<DemoDataBundle> {
  try {
    return await fetchBootstrapData();
  } catch (error) {
    console.warn("Chargement IndexedDB indisponible, repli sur les données locales.", error);
    return demoDataBundle;
  }
}

export async function loadStoredCollections(): Promise<DemoDataBundle> {
  const response = await fakeFirestoreRequest("/collections");
  if (!response.ok) {
    throw new Error(`Impossible de charger l'état IndexedDB (${response.status})`);
  }

  return (await response.json()) as DemoDataBundle;
}

export async function resetStoredCollections() {
  const response = await fakeFirestoreRequest("/seed", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(demoDataBundle),
  });

  if (!response.ok) {
    throw new Error(`Impossible de réinitialiser IndexedDB (${response.status})`);
  }

  return response.json();
}
