import { useMemo, useState } from "react";
import {
  Archive,
  Clock,
  Download,
  Lock,
  Mail,
  Paperclip,
  Plus,
  Search,
  Send,
  Shield,
  SquarePen,
  Star,
} from "lucide-react";
import { useAppState, type MessageThread, type UserRole } from "../app-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const FOLDERS: Array<MessageThread["boite"]> = ["Réception", "Envoyés", "Brouillons", "Archives"];

const ROLE_COMPOSE_HINTS: Record<UserRole, string[]> = {
  manager: ["Envoyer une relance groupée", "Partager un résultat sécurisé", "Notifier un praticien"],
  patient: ["Poser une question au centre", "Demander un rappel", "Transmettre un document"],
  practitioner: ["Répondre à un patient", "Escalader un dossier", "Partager un avis médical"],
};

function MessageBadge({ label }: { label: MessageThread["statut"] }) {
  const classes =
    label === "Lu"
      ? "bg-green-100 text-green-800"
      : label === "Non lu"
      ? "bg-blue-100 text-blue-800"
      : label === "Envoyé"
      ? "bg-gray-100 text-gray-800"
      : "bg-amber-100 text-amber-800";

  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${classes}`}>{label}</span>;
}

function ComposeDialog({
  open,
  onClose,
  role,
}: {
  open: boolean;
  onClose: () => void;
  role: UserRole;
}) {
  if (!open) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouveau message</DialogTitle>
          <DialogDescription>
            Rédaction sécurisée avec chiffrement, pièces jointes tracées et journalisation d'accès.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2 text-sm text-gray-700">
              <span className="font-medium">Destinataire</span>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom ou groupe"
                defaultValue={
                  role === "manager"
                    ? "Dr. Sophie Leroy"
                    : role === "patient"
                    ? "CRDC Île-de-France"
                    : "Marie Dubois"
                }
              />
            </label>
            <label className="space-y-2 text-sm text-gray-700">
              <span className="font-medium">Niveau de sécurité</span>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Messagerie sécurisée HDS</option>
                <option>Pièce jointe avec accès temporaire</option>
                <option>Partage interne uniquement</option>
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm text-gray-700 block">
            <span className="font-medium">Sujet</span>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Objet du message"
              defaultValue={ROLE_COMPOSE_HINTS[role][0]}
            />
          </label>

          <label className="space-y-2 text-sm text-gray-700 block">
            <span className="font-medium">Contenu</span>
            <textarea
              className="min-h-32 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="Bonjour, merci de consulter ce message dans votre espace sécurisé. Les informations sensibles restent accessibles avec authentification renforcée."
            />
          </label>

          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">Suggestions rapides</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ROLE_COMPOSE_HINTS[role].map((hint) => (
                <span
                  key={hint}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {hint}
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <button className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50" onClick={onClose}>
            Annuler
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" onClick={onClose}>
            Envoyer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MessagingPage() {
  const { role, messages } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [folder, setFolder] = useState<MessageThread["boite"]>("Réception");
  const [selectedMessage, setSelectedMessage] = useState<MessageThread | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const inbox = useMemo(
    () =>
      messages.filter(
        (message) =>
          (message.roleCible === role || message.roleCible === "all") &&
          message.boite === folder &&
          [message.sujet, message.expediteur, message.destinataire, message.aperçu]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      ),
    [folder, messages, role, searchTerm],
  );

  const currentMessage = selectedMessage ?? inbox[0] ?? null;
  const unreadCount = messages.filter(
    (message) => (message.roleCible === role || message.roleCible === "all") && message.statut === "Non lu",
  ).length;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Boîte de messagerie sécurisée
                <Shield className="w-6 h-6 text-green-600" />
              </h1>
              <p className="text-gray-500 mt-1">
                Courriers, notifications et échanges chiffrés adaptés au profil actif.
              </p>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              onClick={() => setComposeOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Nouveau message
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-4">
            <InboxKpi label="Messages non lus" value={String(unreadCount)} />
            <InboxKpi
              label="Messages sécurisés"
              value={String(messages.filter((message) => message.securise).length)}
            />
            <InboxKpi
              label="Pièces jointes"
              value={String(messages.filter((message) => message.piecesJointes?.length).length)}
            />
            <InboxKpi label="Dossiers archivés" value={String(messages.filter((message) => message.boite === "Archives").length)} />
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-8">
          <div className="grid h-full grid-cols-[220px_minmax(340px,1fr)_minmax(0,1.1fr)] gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-2">
                {FOLDERS.map((item) => (
                  <button
                    key={item}
                    className={`w-full rounded-lg px-4 py-3 text-left text-sm transition-colors ${
                      folder === item ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700"
                    }`}
                    onClick={() => {
                      setFolder(item);
                      setSelectedMessage(null);
                    }}
                  >
                    <span className="flex items-center justify-between">
                      {item}
                      <span className="text-xs text-gray-400">
                        {messages.filter((message) => message.boite === item).length}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Raccourcis</p>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Messages prioritaires
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-600" />
                    Partages sensibles
                  </div>
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-gray-500" />
                    Historique patient
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Rechercher un message..."
                    className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto divide-y divide-gray-200">
                {inbox.map((message) => (
                  <button
                    key={message.id}
                    className={`w-full p-4 text-left hover:bg-gray-50 ${
                      currentMessage?.id === message.id ? "bg-blue-50/60" : ""
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">{message.sujet}</p>
                          {message.importance === "Haute" && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {message.expediteur} → {message.destinataire}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{message.aperçu}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">{message.date}</p>
                        <div className="mt-2">
                          <MessageBadge label={message.statut} />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {inbox.length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-500">Aucun message dans ce dossier.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
              {currentMessage ? (
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{currentMessage.sujet}</h2>
                      <p className="text-sm text-gray-500 mt-2">
                        {currentMessage.expediteur} → {currentMessage.destinataire}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageBadge label={currentMessage.statut} />
                      {currentMessage.securise && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          <Lock className="w-3 h-3" />
                          Sécurisé
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg bg-gray-50 p-4 text-gray-700">
                    {currentMessage.contenu}
                  </div>

                  {currentMessage.piecesJointes && (
                    <div className="mt-6 rounded-lg border border-gray-200 p-4">
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        Pièces jointes
                      </p>
                      <div className="mt-4 space-y-3">
                        {currentMessage.piecesJointes.map((piece) => (
                          <div key={piece.nom} className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{piece.nom}</p>
                              <p className="text-sm text-gray-500">{piece.taille}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-white">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <InfoTile icon={Clock} label="Horodatage" value={currentMessage.date} />
                    <InfoTile icon={Mail} label="Dossier" value={currentMessage.boite} />
                    <InfoTile icon={SquarePen} label="Action" value="Répondre rapidement" />
                  </div>

                  <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="font-medium text-green-900">Garantie de sécurité</p>
                    <p className="text-sm text-green-800 mt-2">
                      Message chiffré, accès journalisé, conservation conforme HDS et contrôle du partage par authentification forte.
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
                      Archiver
                    </button>
                    <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Répondre
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  Sélectionner un message pour afficher le détail.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ComposeDialog open={composeOpen} onClose={() => setComposeOpen(false)} role={role} />
    </>
  );
}

function InboxKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <Icon className="w-4 h-4 text-blue-600" />
      <p className="mt-3 text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 mt-1">{value}</p>
    </div>
  );
}
