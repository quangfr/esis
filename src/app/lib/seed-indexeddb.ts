import { demoDataBundle } from "../data/demo-data";
import { fakeFirestoreRequest } from "./fake-firestore";

export async function reseedIndexedDb() {
  const response = await fakeFirestoreRequest("/seed", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(demoDataBundle),
  });

  if (!response.ok) {
    throw new Error(`IndexedDB seed failed (${response.status})`);
  }

  return response.json();
}
