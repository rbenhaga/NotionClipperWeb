import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LegalPage() {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === 'fr';

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isFrench ? 'Mentions Légales' : 'Legal Notice'}
          </h1>
          <p className="text-sm text-gray-500 mb-10">
            {isFrench ? 'Dernière mise à jour : ' : 'Last updated: '}
            {new Date().toLocaleDateString(isFrench ? 'fr-FR' : 'en-US')}
          </p>

          <div className="prose prose-gray max-w-none">
            {isFrench ? (
              <>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Éditeur du site</h2>
                  <p className="text-gray-700 mb-2">
                    <strong>Raison sociale :</strong> Rayane Ben Haga (Entrepreneur individuel)
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Responsable de publication :</strong> Rayane Ben Haga
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>E-mail :</strong> contact@notionclipper.com
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Site web :</strong> https://notionclipper.com
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Hébergement</h2>
                  <p className="text-gray-700 mb-4">
                    Le site Clipper Pro est hébergé par :
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Hébergeur :</strong> Oracle Cloud Infrastructure
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Adresse :</strong> Oracle Corporation, 500 Oracle Parkway, Redwood City, CA 94065, USA
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Site web :</strong> https://www.oracle.com/cloud/
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Propriété intellectuelle</h2>
                  <p className="text-gray-700 mb-4">
                    L'ensemble du contenu de ce site (textes, images, vidéos, code source, design) est la propriété
                    exclusive de Rayane Ben Haga, sauf mention contraire.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Toute reproduction, distribution, modification ou exploitation non autorisée du contenu est strictement interdite
                    et peut faire l'objet de poursuites judiciaires.
                  </p>
                  <p className="text-gray-700 mb-4">
                    <strong>Marques :</strong> "Clipper Pro" et "NotionClipper" sont des marques de Rayane Ben Haga.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Données personnelles (RGPD)</h2>
                  <p className="text-gray-700 mb-4">
                    Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
                    vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données vous concernant.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Pour exercer ces droits, veuillez nous contacter à : <strong>privacy@notionclipper.com</strong>
                  </p>
                  <p className="text-gray-700 mb-4">
                    Pour plus d'informations, consultez notre <a href="/privacy" className="text-gray-900 underline">Politique de Confidentialité</a>.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
                  <p className="text-gray-700 mb-4">
                    Ce site utilise des cookies essentiels pour assurer son bon fonctionnement :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Cookies de session (authentification)</li>
                    <li>Cookies de préférence (langue, thème)</li>
                    <li>Cookies analytiques (anonymisés)</li>
                  </ul>
                  <p className="text-gray-700 mb-4 mt-4">
                    Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, mais certaines fonctionnalités
                    du site pourraient ne plus fonctionner correctement.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Responsabilité</h2>
                  <p className="text-gray-700 mb-4">
                    L'éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site,
                    mais ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
                  </p>
                  <p className="text-gray-700 mb-4">
                    L'éditeur ne pourra être tenu responsable :
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Des erreurs ou omissions dans le contenu</li>
                    <li>De l'indisponibilité temporaire ou définitive du service</li>
                    <li>Des dommages directs ou indirects résultant de l'utilisation du site</li>
                    <li>Du contenu des sites externes liés</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Liens hypertextes</h2>
                  <p className="text-gray-700 mb-4">
                    Ce site peut contenir des liens vers des sites externes. L'éditeur n'a aucun contrôle sur le contenu
                    de ces sites et décline toute responsabilité quant à leur contenu.
                  </p>
                  <p className="text-gray-700 mb-4">
                    La création de liens vers ce site est autorisée sous réserve de ne pas porter atteinte à l'image de Clipper Pro.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Droit applicable</h2>
                  <p className="text-gray-700 mb-4">
                    Les présentes mentions légales sont régies par le droit français. Tout litige relatif à l'utilisation
                    du site sera soumis à la compétence exclusive des tribunaux français.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact</h2>
                  <p className="text-gray-700 mb-4">
                    Pour toute question concernant ces mentions légales :
                  </p>
                  <p className="text-gray-700">
                    <strong>E-mail :</strong> legal@notionclipper.com
                    <br />
                    <strong>Site web :</strong> https://notionclipper.com
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Site Publisher</h2>
                  <p className="text-gray-700 mb-2">
                    <strong>Company:</strong> Rayane Ben Haga (Sole Proprietor)
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Publication Director:</strong> Rayane Ben Haga
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> contact@notionclipper.com
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Website:</strong> https://notionclipper.com
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Hosting</h2>
                  <p className="text-gray-700 mb-4">
                    The Clipper Pro site is hosted by:
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Host:</strong> Oracle Cloud Infrastructure
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Address:</strong> Oracle Corporation, 500 Oracle Parkway, Redwood City, CA 94065, USA
                  </p>
                  <p className="text-gray-700 mb-2">
                    <strong>Website:</strong> https://www.oracle.com/cloud/
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Intellectual Property</h2>
                  <p className="text-gray-700 mb-4">
                    All content on this site (text, images, videos, source code, design) is the exclusive property
                    of Rayane Ben Haga, unless otherwise stated.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Any unauthorized reproduction, distribution, modification or exploitation of the content is strictly prohibited
                    and may result in legal action.
                  </p>
                  <p className="text-gray-700 mb-4">
                    <strong>Trademarks:</strong> "Clipper Pro" and "NotionClipper" are trademarks of Rayane Ben Haga.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Personal Data (GDPR)</h2>
                  <p className="text-gray-700 mb-4">
                    In accordance with the General Data Protection Regulation (GDPR), you have the right to access,
                    rectify, delete and object to data concerning you.
                  </p>
                  <p className="text-gray-700 mb-4">
                    To exercise these rights, please contact us at: <strong>privacy@notionclipper.com</strong>
                  </p>
                  <p className="text-gray-700 mb-4">
                    For more information, see our <a href="/privacy" className="text-gray-900 underline">Privacy Policy</a>.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies</h2>
                  <p className="text-gray-700 mb-4">
                    This site uses essential cookies to ensure proper functioning:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Session cookies (authentication)</li>
                    <li>Preference cookies (language, theme)</li>
                    <li>Analytics cookies (anonymized)</li>
                  </ul>
                  <p className="text-gray-700 mb-4 mt-4">
                    You can disable cookies in your browser settings, but some site features may no longer work properly.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Liability</h2>
                  <p className="text-gray-700 mb-4">
                    The publisher strives to ensure the accuracy and updating of information on this site,
                    but cannot guarantee the accuracy, precision or completeness of the information provided.
                  </p>
                  <p className="text-gray-700 mb-4">
                    The publisher cannot be held responsible for:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Errors or omissions in content</li>
                    <li>Temporary or permanent unavailability of the service</li>
                    <li>Direct or indirect damages resulting from site use</li>
                    <li>Content of linked external sites</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Hyperlinks</h2>
                  <p className="text-gray-700 mb-4">
                    This site may contain links to external sites. The publisher has no control over the content
                    of these sites and disclaims all responsibility for their content.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Creating links to this site is authorized provided it does not harm the image of Clipper Pro.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Governing Law</h2>
                  <p className="text-gray-700 mb-4">
                    These legal notices are governed by French law. Any dispute relating to the use of the site
                    will be subject to the exclusive jurisdiction of French courts.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact</h2>
                  <p className="text-gray-700 mb-4">
                    For any questions regarding these legal notices:
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> legal@notionclipper.com
                    <br />
                    <strong>Website:</strong> https://notionclipper.com
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
