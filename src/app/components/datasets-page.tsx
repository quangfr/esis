import { useState, useMemo } from "react";
import {
  Database,
  Table as TableIcon,
  User,
  FolderOpen,
  Stethoscope,
  Search,
  Filter,
  Download,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
  Activity,
  FileText,
} from "lucide-react";
import { demoDataBundle, type Patient, type Episode } from "../data/demo-data";

export function DatasetsPage() {
  const [activeCategory, setActiveCategory] = useState<"patients" | "dossiers" | "examens">("patients");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // 10 exemples de patients
  const samplePatients: Patient[] = useMemo(() => {
    return demoDataBundle.patients.slice(0, 10);
  }, []);

  // 10 exemples de dossiers (enrôlement / parcours complet)
  const sampleDossiers = useMemo(() => {
    return samplePatients.map((patient, index) => {
      const episode = patient.episodes[0] || {
        id: `ep-gen-${index + 1}`,
        type: patient.typeDepistage,
        statut: patient.statut === "Invité" ? "Kit envoyé" : "Examen planifié",
        dateOuverture: patient.derniereVisite || "15/01/2026",
        prochaineEtape: patient.situationCourante || "Consultation de contrôle",
      };
      const enrollment = patient.enrollments[0] || {
        canal: patient.canalPrefere === "SMS" ? "Portail" : "Campagne",
        statut: "Validé",
        date: patient.derniereVisite || "10/01/2026",
        consentement: true,
      };
      const task = patient.tasks[0] || {
        titre: "Suivi du retour d'examen",
        echeance: patient.prochainRappel || "15/03/2026",
        priorite: patient.risque === "Prioritaire" ? "Haute" : "Normale",
        statut: "En cours",
      };

      return {
        dossierId: `DOS-2026-${String(index + 1).padStart(4, "0")}`,
        patientId: patient.id,
        patientNom: `${patient.nom} ${patient.prenom}`,
        nir: patient.nir,
        typeDepistage: patient.typeDepistage,
        statutDossier: enrollment.statut,
        canalEntree: enrollment.canal,
        consentement: enrollment.consentement ? "Validé" : "Non recueilli",
        medecinTraitant: patient.medecinTraitant,
        centreSuivi: patient.centre,
        dateCreation: episode.dateOuverture,
        prochaineEcheance: patient.prochainRappel,
        progression: `${patient.progression}%`,
        tacheUrgente: task.titre,
        prioriteTache: task.priorite,
        couvertureSociale: patient.couverture,
      };
    });
  }, [samplePatients]);

  // 10 exemples d'examens (programmes, bilans, comptes-rendus)
  const sampleExamens = useMemo(() => {
    return samplePatients.map((patient, index) => {
      const program = patient.programs[0];
      const doc = program?.documents?.[0] || {
        id: `DOC-RAD-${100 + index}`,
        titre: `Compte-rendu dépistage ${patient.typeDepistage}`,
        type: "Compte-rendu",
        date: patient.derniereVisite,
        statut: "Disponible",
        indicateur: patient.typeDepistage === "Sein" ? "ACR 2" : "Négatif (Normal)",
        auteur: patient.medecinTraitant,
      };
      const examenPropose = program?.examensProposes?.[0] || {
        nom: patient.typeDepistage === "Sein" ? "Mammographie bilatérale numérique" : patient.typeDepistage === "Colorectal" ? "Test FIT immunologique" : "Test HPV-HR haute sensibilité",
        justification: "Dépistage organisé de masse - Tranche d'âge cible",
        resultat: doc.indicateur,
      };

      return {
        examenId: `EXAM-${String(202600 + index + 1)}`,
        patientId: patient.id,
        patientNom: `${patient.nom} ${patient.prenom}`,
        dateNaissance: patient.dateNaissance,
        typeExamen: examenPropose.nom,
        organeCible: patient.typeDepistage,
        dateExamen: doc.date || patient.derniereVisite,
        praticienAuteur: doc.auteur || patient.medecinTraitant,
        centreExamen: patient.centre,
        resultatSynthétique: doc.indicateur,
        statutExamen: doc.statut,
        justificationMedicale: examenPropose.justification,
        prochainControle: program?.prochainExamen || patient.prochainRappel,
        niveauRisque: program?.niveauRisque || patient.risque,
      };
    });
  }, [samplePatients]);

  // Filtrage
  const filteredPatients = useMemo(() => {
    return samplePatients.filter((p) => {
      const matchesSearch =
        p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nir.includes(searchQuery) ||
        p.ville.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || p.typeDepistage === filterType;
      return matchesSearch && matchesType;
    });
  }, [samplePatients, searchQuery, filterType]);

  const filteredDossiers = useMemo(() => {
    return sampleDossiers.filter((d) => {
      const matchesSearch =
        d.dossierId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.patientNom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.nir.includes(searchQuery) ||
        d.centreSuivi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || d.typeDepistage === filterType;
      return matchesSearch && matchesType;
    });
  }, [sampleDossiers, searchQuery, filterType]);

  const filteredExamens = useMemo(() => {
    return sampleExamens.filter((e) => {
      const matchesSearch =
        e.examenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.patientNom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.typeExamen.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.praticienAuteur.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || e.organeCible === filterType;
      return matchesSearch && matchesType;
    });
  }, [sampleExamens, searchQuery, filterType]);

  const exportCurrentTableJson = () => {
    const data =
      activeCategory === "patients"
        ? filteredPatients
        : activeCategory === "dossiers"
        ? filteredDossiers
        : filteredExamens;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `esis-sample-${activeCategory}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Données d'Exemple</h1>
            <p className="text-sm text-gray-500">
              Tables des objets principaux : 10 exemples complets de Patients, Dossiers et Examens avec l'ensemble des propriétés en colonnes.
            </p>
          </div>
        </div>

        <button
          onClick={exportCurrentTableJson}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-2xs hover:bg-gray-50 transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-gray-500" />
          Exporter ({activeCategory}.json)
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveCategory("patients")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activeCategory === "patients"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <User className="w-4 h-4" />
            10 Exemples Patients
          </button>
          <button
            onClick={() => setActiveCategory("dossiers")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activeCategory === "dossiers"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            10 Exemples Dossiers
          </button>
          <button
            onClick={() => setActiveCategory("examens")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activeCategory === "examens"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            10 Exemples Examens
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-48 md:w-64"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700"
          >
            <option value="all">Tous dépistages</option>
            <option value="Sein">Sein</option>
            <option value="Colorectal">Colorectal</option>
            <option value="Col utérus">Col utérus</option>
          </select>
        </div>
      </div>

      {/* TABLE 1: PATIENTS */}
      {activeCategory === "patients" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">Table : Patients</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                {filteredPatients.length} enregistrements affichés (10 maximum)
              </span>
            </div>
            <span className="text-xs text-gray-500">Colonnes = Propriétés de l'objet Patient</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-100 border-b border-gray-200 text-gray-800 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-3 py-3 font-mono">id</th>
                  <th className="px-3 py-3">Identité</th>
                  <th className="px-3 py-3">Date Naiss.</th>
                  <th className="px-3 py-3 font-mono">NIR</th>
                  <th className="px-3 py-3">Dépistage</th>
                  <th className="px-3 py-3">Statut</th>
                  <th className="px-3 py-3">Risque</th>
                  <th className="px-3 py-3">Progression</th>
                  <th className="px-3 py-3">Médecin Traitant</th>
                  <th className="px-3 py-3">Centre / Ville</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Canal</th>
                  <th className="px-3 py-3">Dernière Visite</th>
                  <th className="px-3 py-3">Prochain Rappel</th>
                  <th className="px-3 py-3">Groupe Sang.</th>
                  <th className="px-3 py-3">Couverture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-medium text-blue-600 whitespace-nowrap">{p.id}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">
                      {p.nom} {p.prenom}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{p.dateNaissance}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-600 whitespace-nowrap">{p.nir}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-medium text-[11px] bg-pink-100 text-pink-700">
                        {p.typeDepistage}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full font-medium text-[11px] bg-amber-100 text-amber-800">
                        {p.statut}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          p.risque === "Prioritaire"
                            ? "bg-red-100 text-red-700"
                            : p.risque === "Modéré"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.risque}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-mono">{p.progression}%</td>
                    <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{p.medecinTraitant}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{p.centre}</div>
                      <div className="text-[11px] text-gray-500">{p.ville}</div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-[11px]">
                      <div>{p.telephone}</div>
                      <div className="text-gray-500">{p.email}</div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-mono text-gray-600">{p.canalPrefere}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{p.derniereVisite}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-blue-600 font-medium">{p.prochainRappel}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-mono">{p.groupeSanguin}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                        {p.couverture}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 2: DOSSIERS */}
      {activeCategory === "dossiers" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">Table : Dossiers de Dépistage</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                {filteredDossiers.length} dossiers enregistrés
              </span>
            </div>
            <span className="text-xs text-gray-500">Colonnes = Propriétés administratives & d'enrôlement du dossier</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-100 border-b border-gray-200 text-gray-800 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-3 py-3 font-mono">Dossier ID</th>
                  <th className="px-3 py-3 font-mono">Patient ID</th>
                  <th className="px-3 py-3">Usager Rattaché</th>
                  <th className="px-3 py-3 font-mono">NIR</th>
                  <th className="px-3 py-3">Programme Cible</th>
                  <th className="px-3 py-3">Statut Dossier</th>
                  <th className="px-3 py-3">Canal Entrée</th>
                  <th className="px-3 py-3">Consentement</th>
                  <th className="px-3 py-3">Ouverture</th>
                  <th className="px-3 py-3">Prochaine Échéance</th>
                  <th className="px-3 py-3">Avancement</th>
                  <th className="px-3 py-3">Médecin Référent</th>
                  <th className="px-3 py-3">Centre de Suivi</th>
                  <th className="px-3 py-3">Tâche Associée</th>
                  <th className="px-3 py-3">Priorité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDossiers.map((d) => (
                  <tr key={d.dossierId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-medium text-indigo-700 whitespace-nowrap">{d.dossierId}</td>
                    <td className="px-3 py-2.5 font-mono text-gray-600 whitespace-nowrap">{d.patientId}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">{d.patientNom}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-600 whitespace-nowrap">{d.nir}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-medium text-[11px] bg-blue-100 text-blue-800">
                        {d.typeDepistage}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full font-medium text-[11px] bg-green-100 text-green-800">
                        {d.statutDossier}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-mono">{d.canalEntree}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-teal-50 text-teal-700 border border-teal-200 font-medium">
                        {d.consentement}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{d.dateCreation}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-blue-600 font-medium">{d.prochaineEcheance}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-mono">{d.progression}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{d.medecinTraitant}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">{d.centreSuivi}</td>
                    <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{d.tacheUrgente}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-700">
                        {d.prioriteTache}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 3: EXAMENS */}
      {activeCategory === "examens" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">Table : Examens Médicaux & Comptes-Rendus</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                {filteredExamens.length} examens répertoriés
              </span>
            </div>
            <span className="text-xs text-gray-500">Colonnes = Propriétés cliniques, radiologiques et biologiques</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-100 border-b border-gray-200 text-gray-800 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-3 py-3 font-mono">Examen ID</th>
                  <th className="px-3 py-3 font-mono">Patient ID</th>
                  <th className="px-3 py-3">Usager</th>
                  <th className="px-3 py-3">Date Naiss.</th>
                  <th className="px-3 py-3">Acte Réalisé</th>
                  <th className="px-3 py-3">Organe</th>
                  <th className="px-3 py-3">Date Acte</th>
                  <th className="px-3 py-3">Praticien / Signataire</th>
                  <th className="px-3 py-3">Centre d'Examen</th>
                  <th className="px-3 py-3">Résultat Diagnostic</th>
                  <th className="px-3 py-3">Statut CR</th>
                  <th className="px-3 py-3">Risque Évalué</th>
                  <th className="px-3 py-3">Prochain Contrôle</th>
                  <th className="px-3 py-3">Justification Médicale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExamens.map((e) => (
                  <tr key={e.examenId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-medium text-emerald-700 whitespace-nowrap">{e.examenId}</td>
                    <td className="px-3 py-2.5 font-mono text-gray-600 whitespace-nowrap">{e.patientId}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">{e.patientNom}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{e.dateNaissance}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 whitespace-nowrap">{e.typeExamen}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-medium text-[11px] bg-purple-100 text-purple-700">
                        {e.organeCible}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{e.dateExamen}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{e.praticienAuteur}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">{e.centreExamen}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-mono font-semibold text-[11px] bg-emerald-100 text-emerald-800">
                        {e.resultatSynthétique}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-700 font-medium">
                        {e.statutExamen}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-blue-100 text-blue-700 font-medium">
                        {e.niveauRisque}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-blue-600 font-medium">{e.prochainControle}</td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-xs truncate" title={e.justificationMedicale}>
                      {e.justificationMedicale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
