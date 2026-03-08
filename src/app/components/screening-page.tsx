import { Activity, AlertTriangle, Calendar, CheckCircle2, Microscope, TrendingUp } from "lucide-react";
import { useAppState, type Patient, type ScreeningProgram } from "../app-state";
import { toTestId } from "../lib/test-ids";

function aggregateByType(patients: Patient[]) {
  const programs = patients.flatMap((patient) =>
    patient.programs.map((program) => ({
      ...program,
      patientName: `${patient.prenom} ${patient.nom}`,
    })),
  );

  return ["Sein", "Colorectal", "Col utérus"].map((type) => {
    const typedPrograms = programs.filter((program) => program.type === type);
    const escalations = typedPrograms.filter(
      (program) => program.niveauRisque !== "Standard",
    ).length;
    const pendingForms = typedPrograms.flatMap((program) => program.formulaires).filter(
      (formulaire) => formulaire.statut !== "Complet",
    ).length;

    return {
      type,
      total: typedPrograms.length,
      escalations,
      pendingForms,
      nextExamens: typedPrograms
        .flatMap((program) => program.examensProposes)
        .filter((exam) => /À planifier|Recommandée|À programmer/.test(exam.resultat)).length,
    };
  });
}

function ProgramCard({
  id,
  title,
  description,
  value,
}: {
  id: string;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div id={id} className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-3 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function ProgramDetail({ program }: { program: ScreeningProgram }) {
  return (
    <div id={toTestId("screening-program-detail", program.type)} className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{program.type}</h3>
          <p className="text-sm text-gray-500 mt-1">{program.resultatCle}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {program.niveauRisque}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Prochain examen</p>
          <p className="mt-2 font-medium text-gray-900">{program.prochainExamen}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Formulaires</p>
          <p className="mt-2 font-medium text-gray-900">
            {program.formulaires.filter((item) => item.statut !== "Complet").length} à compléter
          </p>
        </div>
      </div>
    </div>
  );
}

export function ScreeningPage() {
  const { role, patients, activePatient, activePractitioner } = useAppState();
  const aggregated = aggregateByType(patients);

  if (role === "patient") {
    return (
      <div className="h-full flex flex-col overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Mon programme de dépistage</h1>
          <p className="text-gray-500 mt-1">
            Cette vue reprend vos parcours sein, colorectal et col utérus avec les prochaines décisions médicales.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div id="screening-patient-kpis-section" className="grid grid-cols-3 gap-4">
            <ProgramCard
              id="screening-patient-kpi-programs"
              title="Programmes actifs"
              value={String(activePatient.programs.length)}
              description="Suivis parallèles affichés selon votre âge, vos antécédents et vos derniers résultats."
            />
            <ProgramCard
              id="screening-patient-kpi-exams"
              title="Examens complémentaires"
              value={String(
                activePatient.programs.flatMap((program) => program.examensProposes).filter((exam) =>
                  /À planifier|Recommandée|À programmer/.test(exam.resultat),
                ).length,
              )}
              description="Examens de second niveau préparés automatiquement lorsque les résultats le justifient."
            />
            <ProgramCard
              id="screening-patient-kpi-forms"
              title="Formulaires en attente"
              value={String(
                activePatient.programs.flatMap((program) => program.formulaires).filter((item) => item.statut !== "Complet").length,
              )}
              description="Questionnaires cliniques et préparations ciblées avant examen."
            />
          </div>

          <div id="screening-patient-programs-section" className="grid gap-4">
            {activePatient.programs.map((program) => (
              <ProgramDetail key={program.type} program={program} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (role === "practitioner") {
    const practitionerPatients = patients.filter((patient) => patient.praticienId === activePractitioner.id);
    const secondaryExams = practitionerPatients.flatMap((patient) =>
      patient.programs.flatMap((program) =>
        program.examensProposes
          .filter((exam) => /À planifier|Recommandée|À programmer/.test(exam.resultat))
          .map((exam) => ({
            patient: `${patient.prenom} ${patient.nom}`,
            type: program.type,
            exam,
          })),
      ),
    );

    return (
      <div className="h-full flex flex-col overflow-auto">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Suivi clinique praticien</h1>
          <p className="text-gray-500 mt-1">
            Liste priorisée des examens complémentaires et formulaires à finaliser pour vos patients.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div id="screening-practitioner-kpis-section" className="grid grid-cols-4 gap-4">
            <ProgramCard
              id="screening-practitioner-kpi-patients"
              title="Patients suivis"
              value={String(practitionerPatients.length)}
              description="Patients rattachés à votre file active."
            />
            <ProgramCard
              id="screening-practitioner-kpi-secondary-exams"
              title="Examens secondaires"
              value={String(secondaryExams.length)}
              description="Échographies, coloscopies et colposcopies à organiser."
            />
            <ProgramCard
              id="screening-practitioner-kpi-forms"
              title="Formulaires non complets"
              value={String(
                practitionerPatients
                  .flatMap((patient) => patient.programs.flatMap((program) => program.formulaires))
                  .filter((form) => form.statut !== "Complet").length,
              )}
              description="Préparations d'examen à contrôler avant prise de rendez-vous."
            />
            <ProgramCard
              id="screening-practitioner-kpi-surveillance"
              title="Patients à surveillance"
              value={String(
                practitionerPatients.flatMap((patient) => patient.programs).filter((program) => program.niveauRisque !== "Standard").length,
              )}
              description="Programmes nécessitant un avis spécialisé ou un rythme rapproché."
            />
          </div>

          <div id="screening-practitioner-exams-card" className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-900">Examens à organiser</h2>
            <div className="mt-4 space-y-3">
              {secondaryExams.slice(0, 10).map((item) => (
                <div key={`${item.patient}-${item.type}-${item.exam.nom}`} className="rounded-lg border border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.patient}</p>
                      <p className="text-sm text-gray-500">
                        {item.type} • {item.exam.nom}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-blue-700">{item.exam.resultat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pilotage régional des programmes</h1>
            <p className="text-gray-500 mt-1">
              Lecture croisée des tendances par cancer, avec impact des résultats sur les examens de second niveau.
            </p>
          </div>
          <button id="screening-new-campaign-button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Nouvelle campagne
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div id="screening-manager-kpis-section" className="grid grid-cols-4 gap-4">
          <ProgramCard
            id="screening-manager-kpi-population"
            title="Population suivie"
            value={String(patients.length)}
            description="Patients synthétisés dans les trois filières de dépistage."
          />
          <ProgramCard
            id="screening-manager-kpi-secondary-exams"
            title="Examens secondaires"
            value={String(aggregated.reduce((sum, item) => sum + item.nextExamens, 0))}
            description="Examens induits par les derniers résultats cliniquement significatifs."
          />
          <ProgramCard
            id="screening-manager-kpi-forms"
            title="Formulaires à relancer"
            value={String(aggregated.reduce((sum, item) => sum + item.pendingForms, 0))}
            description="Préparations d'examens encore incomplètes."
          />
          <ProgramCard
            id="screening-manager-kpi-expertise"
            title="Situations à expertise"
            value={String(aggregated.reduce((sum, item) => sum + item.escalations, 0))}
            description="Programmes sortant du rythme standard et nécessitant arbitrage médical."
          />
        </div>

        <div id="screening-manager-program-cards-section" className="grid grid-cols-3 gap-4">
          {aggregated.map((item) => (
            <div id={toTestId("screening-manager-program-card", item.type)} key={item.type} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{item.type}</h2>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="mt-6 space-y-4">
                <StatLine icon={TrendingUp} label="Programmes" value={String(item.total)} />
                <StatLine icon={Microscope} label="Examens de second niveau" value={String(item.nextExamens)} />
                <StatLine icon={AlertTriangle} label="Escalades" value={String(item.escalations)} />
                <StatLine icon={CheckCircle2} label="Formulaires à relancer" value={String(item.pendingForms)} />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-bold text-gray-900">Repères d'expertise régionale</h2>
          <div className="mt-4 space-y-3">
            <ExpertiseNote text="Sein: la double lecture historique reste la base, avec triage vers échographie en cas d'image dense ou asymétrique." />
            <ExpertiseNote text="Colorectal: un FIT positif doit déclencher une filière de coloscopie courte, soutenue par la préparation patient." />
            <ExpertiseNote text="Col utérus: l'articulation HPV, cytologie et colposcopie permet d'éviter les pertes de chance tout en limitant les examens inutiles." />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Icon className="w-4 h-4 text-blue-600" />
        {label}
      </div>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function ExpertiseNote({ text }: { text: string }) {
  return <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">{text}</div>;
}
