import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsPage() {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === 'fr';

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isFrench ? "Conditions Générales d'Utilisation" : 'Terms of Service'}
          </h1>
          <p className="text-sm text-gray-500 mb-10">
            {isFrench ? 'Dernière mise à jour : ' : 'Last updated: '}
            {new Date().toLocaleDateString(isFrench ? 'fr-FR' : 'en-US')}
          </p>

          <div className="prose prose-gray max-w-none">
            {isFrench ? (
              <>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptation des conditions</h2>
                  <p className="text-gray-700 mb-4">
                    En utilisant Clipper Pro, vous acceptez d'être lié par ces Conditions Générales d'Utilisation (CGU).
                    Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description du service</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro est un outil permettant de capturer et d'organiser du contenu directement dans Notion.
                    Le service est fourni "tel quel" et nous nous réservons le droit de modifier ou d'interrompre le service à tout moment.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Compte utilisateur</h2>
                  <p className="text-gray-700 mb-4">
                    Pour utiliser Clipper Pro, vous devez :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Créer un compte avec des informations exactes</li>
                    <li>Maintenir la sécurité de votre compte</li>
                    <li>Nous informer immédiatement de toute utilisation non autorisée</li>
                    <li>Être responsable de toute activité sur votre compte</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Abonnement et paiement</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro propose un plan gratuit et des plans premium payants :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Les abonnements sont facturés mensuellement ou annuellement</li>
                    <li>Un essai gratuit de 14 jours est disponible pour les plans premium</li>
                    <li>Les paiements sont traités par Stripe de manière sécurisée</li>
                    <li>Vous pouvez annuler votre abonnement à tout moment</li>
                    <li>Aucun remboursement n'est disponible pour les périodes déjà payées</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Utilisation acceptable</h2>
                  <p className="text-gray-700 mb-4">
                    Vous vous engagez à ne pas :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Utiliser le service à des fins illégales</li>
                    <li>Tenter de contourner les limitations du service</li>
                    <li>Partager votre compte avec d'autres personnes</li>
                    <li>Interférer avec le fonctionnement du service</li>
                    <li>Extraire des données du service par des moyens automatisés</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Propriété intellectuelle</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro et tous ses contenus (code, design, marque) sont la propriété de Rayane Ben Haga.
                    Vous conservez la propriété de tout contenu que vous créez avec Clipper Pro.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation de responsabilité</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro est fourni "tel quel" sans garantie d'aucune sorte. Nous ne sommes pas responsables :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>De la perte de données</li>
                    <li>Des interruptions de service</li>
                    <li>Des dommages indirects ou consécutifs</li>
                    <li>De l'utilisation du service par des tiers</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Résiliation</h2>
                  <p className="text-gray-700 mb-4">
                    Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de violation de ces CGU.
                    Vous pouvez également supprimer votre compte à tout moment depuis les paramètres.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications</h2>
                  <p className="text-gray-700 mb-4">
                    Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications seront effectives
                    dès leur publication. Votre utilisation continue du service après les modifications constitue votre acceptation.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Droit applicable</h2>
                  <p className="text-gray-700 mb-4">
                    Ces CGU sont régies par le droit français. Tout litige sera soumis à la compétence exclusive des tribunaux français.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact</h2>
                  <p className="text-gray-700 mb-4">
                    Pour toute question concernant ces conditions, contactez-nous à :
                  </p>
                  <p className="text-gray-700">
                    <strong>E-mail :</strong> legal@notionclipper.com
                    <br />
                    <strong>Responsable :</strong> Rayane Ben Haga
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-700 mb-4">
                    By using Clipper Pro, you agree to be bound by these Terms of Service.
                    If you do not accept these terms, please do not use our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro is a tool for capturing and organizing content directly in Notion.
                    The service is provided "as is" and we reserve the right to modify or discontinue the service at any time.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Account</h2>
                  <p className="text-gray-700 mb-4">
                    To use Clipper Pro, you must:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Create an account with accurate information</li>
                    <li>Maintain the security of your account</li>
                    <li>Notify us immediately of any unauthorized use</li>
                    <li>Be responsible for all activity on your account</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription and Payment</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro offers a free plan and paid premium plans:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Subscriptions are billed monthly or annually</li>
                    <li>A 14-day free trial is available for premium plans</li>
                    <li>Payments are securely processed by Stripe</li>
                    <li>You can cancel your subscription at any time</li>
                    <li>No refunds are available for periods already paid</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
                  <p className="text-gray-700 mb-4">
                    You agree not to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Use the service for illegal purposes</li>
                    <li>Attempt to circumvent service limitations</li>
                    <li>Share your account with others</li>
                    <li>Interfere with the service's operation</li>
                    <li>Extract data from the service by automated means</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro and all its content (code, design, brand) are owned by Rayane Ben Haga.
                    You retain ownership of any content you create with Clipper Pro.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
                  <p className="text-gray-700 mb-4">
                    Clipper Pro is provided "as is" without warranty of any kind. We are not responsible for:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Data loss</li>
                    <li>Service interruptions</li>
                    <li>Indirect or consequential damages</li>
                    <li>Third-party use of the service</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
                  <p className="text-gray-700 mb-4">
                    We reserve the right to suspend or terminate your account for violations of these Terms.
                    You may also delete your account at any time from settings.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications</h2>
                  <p className="text-gray-700 mb-4">
                    We reserve the right to modify these Terms at any time. Changes will be effective upon publication.
                    Your continued use of the service after changes constitutes acceptance.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
                  <p className="text-gray-700 mb-4">
                    These Terms are governed by French law. Any disputes will be subject to the exclusive jurisdiction of French courts.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact</h2>
                  <p className="text-gray-700 mb-4">
                    For any questions regarding these terms, contact us at:
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> legal@notionclipper.com
                    <br />
                    <strong>Responsible:</strong> Rayane Ben Haga
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
