import { useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Calendar, TrendingUp, Filter } from "lucide-react";

const participationData = [
  { mois: "Jan", sein: 620, colorectal: 420, colUterus: 180 },
  { mois: "Fev", sein: 680, colorectal: 520, colUterus: 220 },
  { mois: "Mar", sein: 710, colorectal: 480, colUterus: 240 },
  { mois: "Avr", sein: 750, colorectal: 540, colUterus: 260 },
  { mois: "Mai", sein: 820, colorectal: 580, colUterus: 290 },
  { mois: "Juin", sein: 870, colorectal: 620, colUterus: 310 },
];

const tauxParticipationData = [
  { mois: "Jan", taux: 58.2 },
  { mois: "Fev", taux: 59.5 },
  { mois: "Mar", taux: 60.1 },
  { mois: "Avr", taux: 61.3 },
  { mois: "Mai", taux: 62.8 },
  { mois: "Juin", taux: 63.5 },
];

const repartitionData = [
  { name: "Sein", value: 5100, color: "#3B82F6" },
  { name: "Colorectal", value: 3200, color: "#8B5CF6" },
  { name: "Col utérus", value: 1500, color: "#10B981" },
];

const resultsData = [
  { type: "Négatif", count: 8450, percentage: 86.7 },
  { type: "Positif", count: 890, percentage: 9.1 },
  { type: "Non concluant", count: 410, percentage: 4.2 },
];

export function ReportsPage() {
  const [dateRange, setDateRange] = useState("6months");

  return (
    <div className="h-full flex flex-col overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Rapports et Indicateurs d'Activité
            </h1>
            <p className="text-gray-500 mt-1">
              Tableaux de bord et statistiques des programmes de dépistage
            </p>
          </div>
          <div className="flex gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="1month">Dernier mois</option>
              <option value="3months">3 derniers mois</option>
              <option value="6months">6 derniers mois</option>
              <option value="1year">Année en cours</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                +8.7%
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-1">Dépistages réalisés</p>
            <p className="text-3xl font-bold text-gray-900">9,800</p>
            <p className="text-xs text-gray-500 mt-2">vs période précédente</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                +12.4%
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-1">Invitations envoyées</p>
            <p className="text-3xl font-bold text-gray-900">17,100</p>
            <p className="text-xs text-gray-500 mt-2">vs période précédente</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                +5.2%
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-1">Taux de participation</p>
            <p className="text-3xl font-bold text-gray-900">57.3%</p>
            <p className="text-xs text-gray-500 mt-2">vs période précédente</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-red-600 text-sm font-medium flex items-center gap-1">
                -2.3%
                <TrendingUp className="w-4 h-4 rotate-180" />
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-1">Délai moyen traitement</p>
            <p className="text-3xl font-bold text-gray-900">12j</p>
            <p className="text-xs text-gray-500 mt-2">vs période précédente</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Evolution des dépistages */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Évolution des dépistages réalisés
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sein" fill="#3B82F6" name="Sein" />
                <Bar dataKey="colorectal" fill="#8B5CF6" name="Colorectal" />
                <Bar dataKey="colUterus" fill="#10B981" name="Col utérus" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Taux de participation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Évolution du taux de participation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tauxParticipationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis domain={[50, 70]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="taux"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Taux (%)"
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Répartition par type */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Répartition des dépistages par type
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={repartitionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {repartitionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {repartitionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Résultats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition des résultats</h3>
            <div className="space-y-4 mt-8">
              {resultsData.map((result) => (
                <div key={result.type}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">{result.type}</span>
                    <span className="text-gray-900 font-medium">
                      {result.count.toLocaleString()} ({result.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        result.type === "Négatif"
                          ? "bg-green-600"
                          : result.type === "Positif"
                          ? "bg-red-600"
                          : "bg-yellow-600"
                      }`}
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Total analysé:</span>{" "}
                {resultsData.reduce((sum, r) => sum + r.count, 0).toLocaleString()} examens
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Taux de détection positif: {resultsData[1].percentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Indicateurs détaillés */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Indicateurs d'efficacité</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="border-r border-gray-200 pr-6">
              <p className="text-sm text-gray-500 mb-2">Délai moyen invitation → examen</p>
              <p className="text-2xl font-bold text-gray-900">28 jours</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Amélioration de 15%
              </p>
            </div>
            <div className="border-r border-gray-200 pr-6">
              <p className="text-sm text-gray-500 mb-2">Délai moyen examen → résultats</p>
              <p className="text-2xl font-bold text-gray-900">12 jours</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Amélioration de 8%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Taux de suivi post-dépistage</p>
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Amélioration de 3%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
