import { Shield, Lock, Users, Bell, Database, FileText, Key, Globe } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="h-full flex flex-col overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres et Configuration</h1>
          <p className="text-gray-500 mt-1">
            Gérez les paramètres de sécurité et de configuration du système e-SIS
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div id="settings-content" className="flex-1 p-6 space-y-4">
        {/* Security Settings */}
        <div id="settings-security-card" className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sécurité et Conformité</h2>
                <p className="text-sm text-gray-500">
                  Paramètres de sécurité et certification HDS
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    Authentification forte (CPS)
                  </p>
                  <p className="text-sm text-gray-500">
                    Carte Professionnelle de Santé requise
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Activé
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    Chiffrement de bout en bout
                  </p>
                  <p className="text-sm text-gray-500">
                    AES-256 pour toutes les données sensibles
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Activé
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    Hébergement certifié HDS
                  </p>
                  <p className="text-sm text-gray-500">
                    Hébergeur de Données de Santé certifié
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Conforme
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Traçabilité et audit</p>
                  <p className="text-sm text-gray-500">
                    Journalisation de tous les accès
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Activé
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div id="settings-users-card" className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Gestion des utilisateurs
                </h2>
                <p className="text-sm text-gray-500">
                  Contrôle des accès et des permissions
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Administrateurs système</p>
                  <p className="text-sm text-gray-500">Accès complet au système</p>
                </div>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-medium rounded-full">
                  3 utilisateurs
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Praticiens</p>
                  <p className="text-sm text-gray-500">
                    Accès aux dossiers patients et messagerie
                  </p>
                </div>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-medium rounded-full">
                  47 utilisateurs
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Personnel administratif</p>
                  <p className="text-sm text-gray-500">
                    Accès limité aux fonctions administratives
                  </p>
                </div>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-medium rounded-full">
                  12 utilisateurs
                </span>
              </div>
            </div>
            <button id="settings-manage-users-button" className="mt-6 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Gérer les utilisateurs
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div id="settings-notifications-card" className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-500">
                  Alertes et notifications du système
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">
                  Nouveaux résultats de dépistage
                </p>
                <p className="text-sm text-gray-500">
                  Notification lors de la réception de nouveaux résultats
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="settings-notifications-results-toggle" type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Rappels de dépistage</p>
                <p className="text-sm text-gray-500">
                  Rappels automatiques pour les patients éligibles
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="settings-notifications-reminders-toggle" type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Alertes de sécurité</p>
                <p className="text-sm text-gray-500">
                  Notifications des événements de sécurité
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="settings-notifications-security-toggle" type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div id="settings-regional-card" className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Configuration régionale</h2>
                <p className="text-sm text-gray-500">
                  Paramètres spécifiques au CRDC
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centre régional
              </label>
              <select id="settings-region-center-select" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>CRDC Île-de-France</option>
                <option>CRDC Auvergne-Rhône-Alpes</option>
                <option>CRDC Nouvelle-Aquitaine</option>
                <option>CRDC Occitanie</option>
                <option>CRDC Provence-Alpes-Côte d'Azur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Département
              </label>
              <select id="settings-region-department-select" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>75 - Paris</option>
                <option>92 - Hauts-de-Seine</option>
                <option>93 - Seine-Saint-Denis</option>
                <option>94 - Val-de-Marne</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Types de dépistage actifs
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    id="settings-screening-breast-checkbox"
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Cancer du sein</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    id="settings-screening-colorectal-checkbox"
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Cancer colorectal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    id="settings-screening-cervix-checkbox"
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Cancer du col de l'utérus</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div id="settings-system-info-card" className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h3 className="font-medium text-blue-900 mb-4">Informations système</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-600">Version e-SIS</p>
              <p className="font-medium text-blue-900">v3.2.1</p>
            </div>
            <div>
              <p className="text-blue-600">Dernière mise à jour</p>
              <p className="font-medium text-blue-900">05 Mars 2026</p>
            </div>
            <div>
              <p className="text-blue-600">Certification HDS</p>
              <p className="font-medium text-blue-900">Valide jusqu'au 31/12/2026</p>
            </div>
            <div>
              <p className="text-blue-600">Conformité RGPD</p>
              <p className="font-medium text-blue-900">✓ Conforme</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
