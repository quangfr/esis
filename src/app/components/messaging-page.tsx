import { useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  Shield,
  Lock,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
} from "lucide-react";

interface Message {
  id: string;
  expediteur: string;
  destinataire: string;
  sujet: string;
  contenu: string;
  date: string;
  statut: "lu" | "non-lu" | "envoye";
  securise: boolean;
  pieceJointe?: {
    nom: string;
    type: string;
    taille: string;
    methodAcces: string;
  };
}

const mockMessages: Message[] = [
  {
    id: "1",
    expediteur: "Dr. Martin Dupont",
    destinataire: "Marie Dubois",
    sujet: "Résultats mammographie - Dépistage sein",
    contenu:
      "Madame Dubois, vos résultats de mammographie sont disponibles. Vous pouvez les consulter de manière sécurisée via le lien ci-joint.",
    date: "2026-03-07 10:30",
    statut: "envoye",
    securise: true,
    pieceJointe: {
      nom: "Resultats_Mammographie_07032026.pdf",
      type: "PDF",
      taille: "2.3 MB",
      methodAcces: "Lien authentifié + 2FA (SMS)",
    },
  },
  {
    id: "2",
    expediteur: "CRDC Île-de-France",
    destinataire: "Sophie Martin",
    sujet: "Invitation dépistage col de l'utérus",
    contenu:
      "Madame Martin, vous êtes éligible au programme de dépistage du cancer du col de l'utérus. Merci de prendre rendez-vous avec votre médecin traitant.",
    date: "2026-03-06 14:15",
    statut: "lu",
    securise: true,
  },
  {
    id: "3",
    expediteur: "Dr. Sophie Leroy",
    destinataire: "Jean Bernard",
    sujet: "Rappel - Test FIT à retourner",
    contenu:
      "Monsieur Bernard, nous vous rappelons de retourner votre test FIT pour le dépistage du cancer colorectal. Le kit vous a été envoyé le 20/02/2026.",
    date: "2026-03-05 09:45",
    statut: "non-lu",
    securise: true,
  },
  {
    id: "4",
    expediteur: "Dr. Martin Dupont",
    destinataire: "Catherine Petit",
    sujet: "Résultats disponibles - Dépistage sein",
    contenu:
      "Madame Petit, vos résultats de dépistage sont maintenant disponibles. Veuillez consulter le document joint de manière sécurisée.",
    date: "2026-03-04 16:20",
    statut: "envoye",
    securise: true,
    pieceJointe: {
      nom: "Resultats_Depistage_04032026.pdf",
      type: "PDF",
      taille: "1.8 MB",
      methodAcces: "Lien UUID + expiration 48h",
    },
  },
];

export function MessagingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  const filteredMessages = mockMessages.filter(
    (msg) =>
      msg.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.destinataire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.expediteur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "lu":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Lu
          </span>
        );
      case "non-lu":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Non lu
          </span>
        );
      case "envoye":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center gap-1">
            <Send className="w-3 h-3" />
            Envoyé
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Messagerie Sécurisée
              <Shield className="w-6 h-6 text-green-600" />
            </h1>
            <p className="text-gray-500 mt-1">
              Communication sécurisée certifiée HDS pour le partage de données de santé
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Nouveau message
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            onClick={() => setShowSecurityInfo(!showSecurityInfo)}
          >
            <Shield className="w-4 h-4" />
            Sécurité
          </button>
        </div>
      </div>

      {/* Security Info Banner */}
      {showSecurityInfo && (
        <div className="bg-blue-50 border-b border-blue-200 px-8 py-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">
                Mesures de sécurité de la messagerie e-SIS
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• Chiffrement de bout en bout des messages et pièces jointes</li>
                <li>• Authentification forte par Carte Professionnelle de Santé (CPS)</li>
                <li>
                  • Traçabilité complète: stockage sécurisé, transmission chiffrée, accès
                  authentifié
                </li>
                <li>
                  • Conformité RGPD et certification Hébergeur de Données de Santé (HDS)
                </li>
                <li>
                  • Méthodes d'accès sécurisées: liens UUID temporaires, double authentification
                  (2FA), mots de passe
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowSecurityInfo(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedMessage(message)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{message.sujet}</h3>
                    {message.securise && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs font-medium">Sécurisé</span>
                      </div>
                    )}
                    {message.pieceJointe && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-xs font-medium">1 fichier</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span>
                      De: <span className="font-medium">{message.expediteur}</span>
                    </span>
                    <span>→</span>
                    <span>
                      À: <span className="font-medium">{message.destinataire}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.contenu}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {message.date}
                  </div>
                  {getStatutBadge(message.statut)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedMessage.sujet}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      De: <span className="font-medium">{selectedMessage.expediteur}</span>
                    </span>
                    <span>→</span>
                    <span>
                      À: <span className="font-medium">{selectedMessage.destinataire}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedMessage.securise && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-medium">Sécurisé</span>
                    </div>
                  )}
                  {getStatutBadge(selectedMessage.statut)}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.contenu}</p>
              </div>

              {selectedMessage.pieceJointe && (
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Paperclip className="w-5 h-5" />
                    Pièce jointe sécurisée
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {selectedMessage.pieceJointe.nom}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedMessage.pieceJointe.type} •{" "}
                          {selectedMessage.pieceJointe.taille}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">
                            Méthode d'accès:{" "}
                            <span className="font-medium">
                              {selectedMessage.pieceJointe.methodAcces}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        Voir le document
                      </button>
                      <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </div>
                  </div>

                  {/* Security Details */}
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Sécurité renforcée
                    </h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>✓ Stockage: Chiffrement AES-256, serveurs certifiés HDS</li>
                      <li>✓ Transmission: TLS 1.3, certificats validés</li>
                      <li>
                        ✓ Traitement: Accès authentifié avec double authentification (code SMS)
                      </li>
                      <li>✓ Traçabilité: Tous les accès sont journalisés et audités</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Envoyé le {selectedMessage.date.split(" ")[0]} à{" "}
                    {selectedMessage.date.split(" ")[1]}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setSelectedMessage(null)}
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Répondre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileIcon() {
  return (
    <svg
      className="w-6 h-6 text-blue-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}
