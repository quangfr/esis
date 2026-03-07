import { useState } from "react";
import { Search, Filter, Plus, Download, MoreHorizontal, Calendar, FileText } from "lucide-react";

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  nir: string;
  typeDepistage: string;
  statut: string;
  derniereVisite: string;
  prochainRappel: string;
}

const mockPatients: Patient[] = [
  {
    id: "1",
    nom: "Dubois",
    prenom: "Marie",
    dateNaissance: "15/03/1968",
    nir: "2 68 03 75 123 456 12",
    typeDepistage: "Sein",
    statut: "En attente",
    derniereVisite: "12/01/2026",
    prochainRappel: "15/03/2026",
  },
  {
    id: "2",
    nom: "Martin",
    prenom: "Sophie",
    dateNaissance: "22/07/1975",
    nir: "2 75 07 93 234 567 23",
    typeDepistage: "Col utérus",
    statut: "Invité",
    derniereVisite: "05/02/2026",
    prochainRappel: "20/04/2026",
  },
  {
    id: "3",
    nom: "Bernard",
    prenom: "Jean",
    dateNaissance: "10/11/1960",
    nir: "1 60 11 75 345 678 34",
    typeDepistage: "Colorectal",
    statut: "Examen réalisé",
    derniereVisite: "28/02/2026",
    prochainRappel: "-",
  },
  {
    id: "4",
    nom: "Petit",
    prenom: "Catherine",
    dateNaissance: "03/05/1970",
    nir: "2 70 05 13 456 789 45",
    typeDepistage: "Sein",
    statut: "Résultats disponibles",
    derniereVisite: "01/03/2026",
    prochainRappel: "-",
  },
  {
    id: "5",
    nom: "Robert",
    prenom: "Pierre",
    dateNaissance: "18/09/1958",
    nir: "1 58 09 69 567 890 56",
    typeDepistage: "Colorectal",
    statut: "En attente",
    derniereVisite: "20/02/2026",
    prochainRappel: "10/03/2026",
  },
];

export function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.nir.includes(searchTerm)
  );

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "En attente":
        return "bg-yellow-100 text-yellow-800";
      case "Invité":
        return "bg-blue-100 text-blue-800";
      case "Examen réalisé":
        return "bg-purple-100 text-purple-800";
      case "Résultats disponibles":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Patients</h1>
            <p className="text-gray-500 mt-1">
              Suivez et gérez les dossiers de dépistage de vos patients
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau patient
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou NIR..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Total patients</p>
            <p className="text-2xl font-bold text-gray-900">{mockPatients.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {mockPatients.filter((p) => p.statut === "En attente").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Invités</p>
            <p className="text-2xl font-bold text-blue-600">
              {mockPatients.filter((p) => p.statut === "Invité").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Résultats disponibles</p>
            <p className="text-2xl font-bold text-green-600">
              {mockPatients.filter((p) => p.statut === "Résultats disponibles").length}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de naissance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type dépistage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prochain rappel
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {patient.nom} {patient.prenom}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.dateNaissance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.nir}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.typeDepistage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatutColor(
                        patient.statut
                      )}`}
                    >
                      {patient.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      {patient.prochainRappel !== "-" && (
                        <Calendar className="w-4 h-4 text-gray-400" />
                      )}
                      {patient.prochainRappel}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Dossier Patient: {selectedPatient.nom} {selectedPatient.prenom}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium">{selectedPatient.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prénom</p>
                  <p className="font-medium">{selectedPatient.prenom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  <p className="font-medium">{selectedPatient.dateNaissance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">NIR</p>
                  <p className="font-medium">{selectedPatient.nir}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type de dépistage</p>
                  <p className="font-medium">{selectedPatient.typeDepistage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatutColor(
                      selectedPatient.statut
                    )}`}
                  >
                    {selectedPatient.statut}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dernière visite</p>
                  <p className="font-medium">{selectedPatient.derniereVisite}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prochain rappel</p>
                  <p className="font-medium">{selectedPatient.prochainRappel}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Actions rapides</h3>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Planifier examen
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Voir documents
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setSelectedPatient(null)}
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
