import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === 'fr';

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isFrench ? 'Politique de Confidentialité' : 'Privacy Policy'}
          </h1>
          <p className="text-sm text-gray-500 mb-10">
            {isFrench ? 'Dernière mise à jour : ' : 'Last updated: '}
            {new Date().toLocaleDateString(isFrench ? 'fr-FR' : 'en-US')}
          </p>

          <div className="prose prose-gray max-w-none">
            {isFrench ? (
              <>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Collecte des données</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro collecte et traite les données personnelles suivantes :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Adresse e-mail (pour l'authentification et la communication)</li>
                    <li>Nom et prénom (optionnel)</li>
                    <li>Données d'utilisation (statistiques anonymisées)</li>
                    <li>Contenu clipé dans Notion (stocké de manière sécurisée)</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Utilisation des données</h2>
                  <p className="text-gray-700 mb-4">
                    Vos données personnelles sont utilisées pour :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Fournir et améliorer nos services</li>
                    <li>Gérer votre compte et vos abonnements</li>
                    <li>Vous envoyer des notifications importantes</li>
                    <li>Analyser l'utilisation pour améliorer l'expérience utilisateur</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Protection des données (RGPD)</h2>
                  <p className="text-gray-700 mb-4">
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Droit d'accès à vos données personnelles</li>
                    <li>Droit de rectification de vos données</li>
                    <li>Droit à l'effacement (droit à l'oubli)</li>
                    <li>Droit à la portabilité des données</li>
                    <li>Droit d'opposition au traitement</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Partage des données</h2>
                  <p className="text-gray-700 mb-4">
                    Nous ne vendons ni ne partageons vos données personnelles avec des tiers, sauf :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Avec votre consentement explicite</li>
                    <li>Pour des raisons légales ou de conformité</li>
                    <li>Avec nos prestataires de services (Stripe, Supabase) sous contrat strict</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sécurité</h2>
                  <p className="text-gray-700 mb-4">
                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Chiffrement SSL/TLS pour toutes les communications</li>
                    <li>Authentification sécurisée via OAuth 2.0</li>
                    <li>Stockage sécurisé dans des bases de données chiffrées</li>
                    <li>Accès restreint aux données personnelles</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro utilise des cookies essentiels pour :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Maintenir votre session authentifiée</li>
                    <li>Mémoriser vos préférences (langue, thème)</li>
                    <li>Analyser l'utilisation de manière anonyme</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact</h2>
                  <p className="text-gray-700 mb-4">
                    Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits RGPD, contactez-nous à :
                  </p>
                  <p className="text-gray-700">
                    <strong>E-mail :</strong> privacy@notionclipper.com
                    <br />
                    <strong>Responsable :</strong> Rayane Ben Haga
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Data Collection</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro collects and processes the following personal data:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Email address (for authentication and communication)</li>
                    <li>Name (optional)</li>
                    <li>Usage data (anonymized statistics)</li>
                    <li>Clipped content in Notion (securely stored)</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data Usage</h2>
                  <p className="text-gray-700 mb-4">
                    Your personal data is used to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Provide and improve our services</li>
                    <li>Manage your account and subscriptions</li>
                    <li>Send you important notifications</li>
                    <li>Analyze usage to improve user experience</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Protection (GDPR)</h2>
                  <p className="text-gray-700 mb-4">
                    In accordance with the General Data Protection Regulation (GDPR), you have the following rights:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Right to access your personal data</li>
                    <li>Right to rectify your data</li>
                    <li>Right to erasure (right to be forgotten)</li>
                    <li>Right to data portability</li>
                    <li>Right to object to processing</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
                  <p className="text-gray-700 mb-4">
                    We do not sell or share your personal data with third parties, except:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>With your explicit consent</li>
                    <li>For legal or compliance reasons</li>
                    <li>With our service providers (Stripe, Supabase) under strict contract</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Security</h2>
                  <p className="text-gray-700 mb-4">
                    We implement technical and organizational security measures to protect your data:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>SSL/TLS encryption for all communications</li>
                    <li>Secure authentication via OAuth 2.0</li>
                    <li>Secure storage in encrypted databases</li>
                    <li>Restricted access to personal data</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro uses essential cookies to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Maintain your authenticated session</li>
                    <li>Remember your preferences (language, theme)</li>
                    <li>Analyze usage anonymously</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact</h2>
                  <p className="text-gray-700 mb-4">
                    For any questions regarding this privacy policy or to exercise your GDPR rights, contact us at:
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@notionclipper.com
                    <br />
                    <strong>Data Controller:</strong> Rayane Ben Haga
                  </p>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
