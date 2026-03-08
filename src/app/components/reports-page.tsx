import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Activity, Calendar, Download, Filter, TrendingUp, Users } from "lucide-react";
import { toTestId } from "../lib/test-ids";

type BenchmarkKey = "national" | "auvergne" | "nouvelle-aquitaine" | "occitanie";

const BENCHMARK_LABELS: Record<BenchmarkKey, string> = {
  national: "Tendance nationale",
  auvergne: "CRDC Auvergne-Rhône-Alpes",
  "nouvelle-aquitaine": "CRDC Nouvelle-Aquitaine",
  occitanie: "CRDC Occitanie",
};

const trendData = [
  { mois: "Jan", idf: 57.8, national: 56.1, auvergne: 55.4, "nouvelle-aquitaine": 54.8, occitanie: 56.5 },
  { mois: "Fev", idf: 58.9, national: 56.6, auvergne: 55.9, "nouvelle-aquitaine": 55.1, occitanie: 57.0 },
  { mois: "Mar", idf: 59.7, national: 57.0, auvergne: 56.4, "nouvelle-aquitaine": 55.5, occitanie: 57.8 },
  { mois: "Avr", idf: 60.8, national: 57.7, auvergne: 57.1, "nouvelle-aquitaine": 56.2, occitanie: 58.6 },
  { mois: "Mai", idf: 61.9, national: 58.2, auvergne: 57.8, "nouvelle-aquitaine": 56.8, occitanie: 59.1 },
  { mois: "Juin", idf: 63.1, national: 58.9, auvergne: 58.3, "nouvelle-aquitaine": 57.4, occitanie: 59.8 },
];

const typeComparison = [
  { type: "Sein", idf: 66.2, national: 61.8, auvergne: 62.1, "nouvelle-aquitaine": 60.3, occitanie: 61.5 },
  { type: "Colorectal", idf: 54.9, national: 50.2, auvergne: 49.7, "nouvelle-aquitaine": 48.9, occitanie: 51.0 },
  { type: "Col utérus", idf: 58.3, national: 55.1, auvergne: 53.8, "nouvelle-aquitaine": 54.5, occitanie: 55.4 },
];

const crdcComparisonRows = [
  { label: "CRDC Île-de-France", participation: 63.1, delai: 11.4, suivi: 95.8, invitations: 17100 },
  { label: "Tendance nationale", participation: 58.9, delai: 13.2, suivi: 92.7, invitations: 16480 },
  { label: "CRDC Auvergne-Rhône-Alpes", participation: 58.3, delai: 13.7, suivi: 91.8, invitations: 14920 },
  { label: "CRDC Nouvelle-Aquitaine", participation: 57.4, delai: 14.1, suivi: 91.1, invitations: 14620 },
  { label: "CRDC Occitanie", participation: 59.8, delai: 12.8, suivi: 93.0, invitations: 15190 },
];

const nationalNarrative = [
  "L'Île-de-France reste au-dessus de la tendance nationale sur les trois programmes avec un écart particulièrement visible sur le sein.",
  "Le délai moyen invitation vers examen se réduit plus vite que la moyenne nationale, signe d'une meilleure orchestration des rappels et des créneaux.",
  "Le colorectal demeure le point de tension commun à plusieurs CRDC, avec un besoin de fluidifier la filière post-FIT positif.",
];

export function ReportsPage() {
  const [dateRange, setDateRange] = useState("6months");
  const [benchmark, setBenchmark] = useState<BenchmarkKey>("national");

  const summary = useMemo(() => {
    const current = trendData[trendData.length - 1];
    const targetValue = current[benchmark];

    return {
      participation: { current: current.idf, reference: targetValue, delta: current.idf - targetValue },
      depistages: { current: 9800, reference: benchmark === "national" ? 9310 : 9050 },
      invitations: { current: 17100, reference: benchmark === "national" ? 16480 : 15190 },
      delai: { current: 11.4, reference: benchmark === "national" ? 13.2 : 12.8 },
      suivi: { current: 95.8, reference: benchmark === "national" ? 92.7 : 93.0 },
    };
  }, [benchmark]);

  return (
    <div className="h-full flex flex-col overflow-auto bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Rapports et Indicateurs d'Activité</h1>
            <p className="mt-1 text-slate-500">
              Comparaison du CRDC Île-de-France face aux autres CRDC et, par défaut, à la tendance nationale.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              id="reports-date-range-select"
              className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="1month">Dernier mois</option>
              <option value="3months">3 derniers mois</option>
              <option value="6months">6 derniers mois</option>
              <option value="1year">Année en cours</option>
            </select>
            <select
              id="reports-benchmark-select"
              className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={benchmark}
              onChange={(e) => setBenchmark(e.target.value as BenchmarkKey)}
            >
              {Object.entries(BENCHMARK_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button id="reports-filters-button" className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50">
              <Filter className="h-4 w-4" />
              Filtres
            </button>
            <button id="reports-export-button" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-8">
        <div id="reports-kpis-section" className="grid grid-cols-5 gap-6">
          <KpiCard
            id="reports-kpi-participation"
            icon={TrendingUp}
            iconClassName="bg-blue-100 text-blue-700"
            label="Participation"
            value={`${summary.participation.current.toFixed(1)}%`}
            comparison={`+${summary.participation.delta.toFixed(1)} pts vs ${BENCHMARK_LABELS[benchmark]}`}
          />
          <KpiCard
            id="reports-kpi-screenings"
            icon={Activity}
            iconClassName="bg-emerald-100 text-emerald-700"
            label="Dépistages réalisés"
            value={summary.depistages.current.toLocaleString()}
            comparison={`+${(summary.depistages.current - summary.depistages.reference).toLocaleString()} vs ${BENCHMARK_LABELS[benchmark]}`}
          />
          <KpiCard
            id="reports-kpi-invitations"
            icon={Calendar}
            iconClassName="bg-violet-100 text-violet-700"
            label="Invitations envoyées"
            value={summary.invitations.current.toLocaleString()}
            comparison={`+${(summary.invitations.current - summary.invitations.reference).toLocaleString()} vs ${BENCHMARK_LABELS[benchmark]}`}
          />
          <KpiCard
            id="reports-kpi-followup"
            icon={Users}
            iconClassName="bg-amber-100 text-amber-700"
            label="Suivi post-dépistage"
            value={`${summary.suivi.current.toFixed(1)}%`}
            comparison={`+${(summary.suivi.current - summary.suivi.reference).toFixed(1)} pts vs ${BENCHMARK_LABELS[benchmark]}`}
          />
          <KpiCard
            id="reports-kpi-delay"
            icon={TrendingUp}
            iconClassName="bg-rose-100 text-rose-700"
            label="Délai moyen traitement"
            value={`${summary.delai.current.toFixed(1)} j`}
            comparison={`${(summary.delai.reference - summary.delai.current).toFixed(1)} j plus rapide que ${BENCHMARK_LABELS[benchmark]}`}
          />
        </div>

        <div id="reports-trends-layout" className="grid grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] gap-6">
          <div id="reports-trend-chart-card" className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tendance de participation</h3>
                <p className="mt-1 text-sm text-slate-500">
                  La courbe nationale reste affichée en référence, avec comparaison additionnelle selon le CRDC sélectionné.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Référence: {BENCHMARK_LABELS[benchmark]}
              </span>
            </div>
            <div className="mt-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis domain={[52, 66]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="idf" name="CRDC Île-de-France" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="national" name="Tendance nationale" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
                  {benchmark !== "national" ? (
                    <Line
                      type="monotone"
                      dataKey={benchmark}
                      name={BENCHMARK_LABELS[benchmark]}
                      stroke="#c2410c"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div id="reports-side-analysis-section" className="space-y-6">
            <div id="reports-national-narrative-card" className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-sm font-semibold text-blue-900">Lecture nationale par défaut</p>
              <div className="mt-4 space-y-3">
                {nationalNarrative.map((item) => (
                  <div key={item} className="rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div id="reports-key-gap-card" className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-bold text-slate-900">Écart clé</h3>
              <p className="mt-4 text-4xl font-bold text-blue-700">+{summary.participation.delta.toFixed(1)} pts</p>
              <p className="mt-2 text-sm text-slate-600">
                sur le taux de participation du CRDC Île-de-France face à {BENCHMARK_LABELS[benchmark].toLowerCase()}.
              </p>
            </div>
          </div>
        </div>

        <div id="reports-comparison-layout" className="grid grid-cols-[minmax(0,1.3fr)_minmax(340px,1fr)] gap-6">
          <div id="reports-program-comparison-card" className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Comparaison par programme</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Taux de participation par type de cancer, confrontés au benchmark sélectionné et à la tendance nationale.
                </p>
              </div>
            </div>
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis domain={[45, 72]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="idf" name="CRDC Île-de-France" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="national" name="Tendance nationale" fill="#0f766e" radius={[6, 6, 0, 0]} />
                  {benchmark !== "national" ? (
                    <Bar dataKey={benchmark} name={BENCHMARK_LABELS[benchmark]} fill="#c2410c" radius={[6, 6, 0, 0]} />
                  ) : null}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div id="reports-crdc-comparison-card" className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-bold text-slate-900">Comparatif CRDC</h3>
            <div className="mt-4 space-y-3">
              {crdcComparisonRows.map((row, index) => (
                <div
                  id={toTestId("reports-crdc-row", row.label)}
                  key={row.label}
                  className={`rounded-xl border px-4 py-4 ${
                    index === 0 ? "border-blue-200 bg-blue-50/70" : index === 1 ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-900">{row.label}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {row.participation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <MetricMini label="Délai" value={`${row.delai.toFixed(1)} j`} />
                    <MetricMini label="Suivi" value={`${row.suivi.toFixed(1)}%`} />
                    <MetricMini label="Invitations" value={row.invitations.toLocaleString()} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  id,
  icon: Icon,
  iconClassName,
  label,
  value,
  comparison,
}: {
  id: string;
  icon: typeof TrendingUp;
  iconClassName: string;
  label: string;
  value: string;
  comparison: string;
}) {
  return (
    <div id={id} className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-emerald-700">Benchmark actif</span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{comparison}</p>
    </div>
  );
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
