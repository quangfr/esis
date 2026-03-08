import { useEffect, useState } from "react";
import { Database, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "../app-state";
import { type DemoDataBundle } from "../data/demo-data";
import { loadStoredCollections, resetStoredCollections } from "../lib/remote-data";

export function DataPage() {
  const { reloadFromStorage } = useAppState();
  const [data, setData] = useState<DemoDataBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

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

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Data</h1>
            <p className="mt-1 text-sm text-slate-400">
              Vue complète de l'état courant stocké dans IndexedDB via le faux backend Firestore.
            </p>
          </div>
        </div>

        <button
          id="data-reset-button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
          onClick={() => void handleReset()}
          disabled={isResetting}
        >
          <RotateCcw className="h-4 w-4" />
          {isResetting ? "Réinitialisation..." : "Reset demo data"}
        </button>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-800 px-5 py-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            indexeddb://esis-fake-firestore/collections
          </div>
          <div className="h-[calc(100%-49px)] overflow-auto">
            {isLoading ? (
              <div className="p-6 text-sm text-slate-400">Chargement de l'état IndexedDB...</div>
            ) : (
              <pre className="min-h-full whitespace-pre-wrap break-words p-6 font-mono text-sm leading-6 text-cyan-100">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
