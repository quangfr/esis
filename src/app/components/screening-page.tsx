import { useState } from "react";
import { Activity, TrendingUp, Users, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ScreeningCampaign {
  id: string;
  type: string;
  nom: string;
  periode: string;
  cible: number;
  invites: number;
  realises: number;
  tauxParticipation: number;
  statut: string;
}

const mockCampaigns: ScreeningCampaign[] = [
  {
    id: "1",
    type: "Sein",
    nom: "Dépistage Cancer du Sein 2026",
    periode: "Janvier - Juin 2026",
    cible: 12500,
    invites: 8200,
    realises: 5100,
    tauxParticipation: 62.2,
    statut: "En cours",
  },
  {
    id: "2",
    type: "Colorectal",
    nom: "Dépistage Cancer Colorectal 2026",
    periode: "Janvier - Décembre 2026",
    cible: 18000,
    invites: 6800,
    realises: 3200,
    tauxParticipation: 47.1,
    statut: "En cours",
  },
  {
    id: "3",
    type: "Col utérus",
    nom: "Dépistage Cancer Col de l'Utérus 2026",
    periode: "Mars - Août 2026",
    cible: 9500,
    invites: 2100,
    realises: 850,
    tauxParticipation: 40.5,
    statut: "En cours",
  },
];

interface ScreeningStats {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export function ScreeningPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<ScreeningCampaign | null>(null);

  const totalCible = mockCampaigns.reduce((sum, c) => sum + c.cible, 0);
  const totalInvites = mockCampaigns.reduce((sum, c) => sum + c.invites, 0);
  const totalRealises = mockCampaigns.reduce((sum, c) => sum + c.realises, 0);
  const tauxMoyen = (totalRealises / totalInvites) * 100;

  const stats: ScreeningStats[] = [
    {
      label: "Population cible",
      value: totalCible,
      change: 5.2,
      icon: <Users className="w-6 h-6" />,
      color: "blue",
    },
    {
      label: "Invitations envoyées",
      value: totalInvites,
      change: 12.4,
      icon: <Calendar className="w-6 h-6" />,
      color: "purple",
    },
    {
      label: "Dépistages réalisés",
      value: totalRealises,
      change: 8.7,
      icon: <Activity className="w-6 h-6" />,
      color: "green",
    },
    {
      label: "Taux de participation",
      value: tauxMoyen,
      change: -2.3,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "orange",
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Campagnes de Dépistage
            </h1>
            <p className="text-gray-500 mt-1">
              Pilotage régional des programmes de dépistage des cancers
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Nouvelle campagne
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="grid grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center text-${stat.color}-600`}
                >
                  {stat.icon}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendingUp className={`w-4 h-4 ${stat.change < 0 ? "rotate-180" : ""}`} />
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.label === "Taux de participation"
                  ? `${stat.value.toFixed(1)}%`
                  : stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns */}
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Campagnes actives</h2>
          <p className="text-gray-500 text-sm">
            Vue d'ensemble des programmes de dépistage en cours
          </p>
        </div>

        <div className="grid gap-6">
          {mockCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{campaign.nom}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {campaign.statut}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {campaign.periode}
                    </span>
                    <span>Type: {campaign.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Taux de participation</p>
                  <p
                    className={`text-2xl font-bold ${
                      campaign.tauxParticipation >= 60
                        ? "text-green-600"
                        : campaign.tauxParticipation >= 50
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {campaign.tauxParticipation.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Invitations</span>
                    <span className="font-medium text-gray-900">
                      {campaign.invites.toLocaleString()} / {campaign.cible.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(campaign.invites / campaign.cible) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Dépistages réalisés</span>
                    <span className="font-medium text-gray-900">
                      {campaign.realises.toLocaleString()} / {campaign.invites.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        campaign.tauxParticipation >= 60
                          ? "bg-green-600"
                          : campaign.tauxParticipation >= 50
                          ? "bg-orange-600"
                          : "bg-red-600"
                      }`}
                      style={{ width: `${(campaign.realises / campaign.invites) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Population cible</p>
                  <p className="font-medium text-gray-900">
                    {campaign.cible.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Invités</p>
                  <p className="font-medium text-gray-900">
                    {campaign.invites.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Réalisés</p>
                  <p className="font-medium text-gray-900">
                    {campaign.realises.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts Section */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Alertes et recommandations</h2>
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">
                  Taux de participation faible - Cancer Colorectal
                </h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Le taux de participation (47.1%) est inférieur à l'objectif de 50%. Envisager
                  une campagne de relance.
                </p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900">
                  Objectif atteint - Cancer du Sein
                </h3>
                <p className="text-sm text-green-800 mt-1">
                  Le taux de participation (62.2%) dépasse l'objectif de 60%. Excellente
                  performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCampaign(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedCampaign.nom}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedCampaign.periode}
                    </span>
                    <span>Type: {selectedCampaign.type}</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {selectedCampaign.statut}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Population cible</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {selectedCampaign.cible.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 mb-1">Invitations envoyées</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {selectedCampaign.invites.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Dépistages réalisés</p>
                  <p className="text-3xl font-bold text-green-900">
                    {selectedCampaign.realises.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 mb-1">Taux de participation</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {selectedCampaign.tauxParticipation.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Détails de la campagne</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Progression des invitations</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full"
                        style={{
                          width: `${
                            (selectedCampaign.invites / selectedCampaign.cible) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {((selectedCampaign.invites / selectedCampaign.cible) * 100).toFixed(1)}%
                      de la population cible invitée
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Taux de réalisation</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{
                          width: `${
                            (selectedCampaign.realises / selectedCampaign.invites) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedCampaign.tauxParticipation.toFixed(1)}% des invités ont réalisé
                      le dépistage
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setSelectedCampaign(null)}
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Modifier la campagne
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
