import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Building, Server, Copyright, Cookie, Link2, Gavel } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { containerVariants, itemVariants } from '../lib/animations';

export default function LegalPage() {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === 'fr';

  const sections = isFrench ? [
    {
      icon: Building,
      title: '1. Éditeur du site',
      items: [
        { label: 'Raison sociale', value: 'Rayane Ben Haga (Entrepreneur individuel)' },
        { label: 'Responsable de publication', value: 'Rayane Ben Haga' },
        { label: 'E-mail', value: 'contact@clipperpro.app' },
        { label: 'Site web', value: 'https://clipperpro.app' }
      ]
    },
    {
      icon: Server,
      title: '2. Hébergement',
      items: [
        { label: 'Hébergeur', value: 'Oracle Cloud Infrastructure' },
        { label: 'Adresse', value: 'Oracle Corporation, 500 Oracle Parkway, Redwood City, CA 94065, USA' },
        { label: 'Site web', value: 'https://www.oracle.com/cloud/' }
      ]
    },
    {
      icon: Copyright,
      title: '3. Propriété intellectuelle',
      content: 'L\'ensemble du contenu de ce site (textes, images, vidéos, code source, design) est la propriété exclusive de Rayane Ben Haga. "Clipper Pro" est une marque déposée.'
    },
    {
      icon: Cookie,
      title: '4. Cookies',
      content: 'Ce site utilise des cookies essentiels : cookies de session (authentification), cookies de préférence (langue, thème), et cookies analytiques (anonymisés).'
    },
    {
      icon: Link2,
      title: '5. Liens hypertextes',
      content: 'Ce site peut contenir des liens vers des sites externes. L\'éditeur n\'a aucun contrôle sur le contenu de ces sites et décline toute responsabilité.'
    },
    {
      icon: Gavel,
      title: '6. Droit applicable',
      content: 'Ces mentions légales sont régies par le droit français. Tout litige sera soumis à la compétence exclusive des tribunaux français.'
    }
  ] : [
    {
      icon: Building,
      title: '1. Site Publisher',
      items: [
        { label: 'Company', value: 'Rayane Ben Haga (Sole Proprietor)' },
        { label: 'Publication Director', value: 'Rayane Ben Haga' },
        { label: 'Email', value: 'contact@clipperpro.app' },
        { label: 'Website', value: 'https://clipperpro.app' }
      ]
    },
    {
      icon: Server,
      title: '2. Hosting',
      items: [
        { label: 'Host', value: 'Oracle Cloud Infrastructure' },
        { label: 'Address', value: 'Oracle Corporation, 500 Oracle Parkway, Redwood City, CA 94065, USA' },
        { label: 'Website', value: 'https://www.oracle.com/cloud/' }
      ]
    },
    {
      icon: Copyright,
      title: '3. Intellectual Property',
      content: 'All content on this site (text, images, videos, source code, design) is the exclusive property of Rayane Ben Haga. "Clipper Pro" is a registered trademark.'
    },
    {
      icon: Cookie,
      title: '4. Cookies',
      content: 'This site uses essential cookies: session cookies (authentication), preference cookies (language, theme), and analytics cookies (anonymized).'
    },
    {
      icon: Link2,
      title: '5. Hyperlinks',
      content: 'This site may contain links to external sites. The publisher has no control over the content of these sites and disclaims all responsibility.'
    },
    {
      icon: Gavel,
      title: '6. Governing Law',
      content: 'These legal notices are governed by French law. Any disputes will be subject to the exclusive jurisdiction of French courts.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Gavel className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {isFrench ? 'Mentions Légales' : 'Legal Notice'}
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-400">
            {isFrench ? 'Dernière mise à jour : ' : 'Last updated: '}
            {new Date().toLocaleDateString(isFrench ? 'fr-FR' : 'en-US')}
          </motion.p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {sections.map((section, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {section.title}
                    </h2>
                    {section.items ? (
                      <div className="space-y-2">
                        {section.items.map((item, i) => (
                          <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-900 dark:text-white">{item.label} :</span>{' '}
                            {item.value}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {section.content}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Contact Section */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {isFrench ? 'Contact' : 'Contact'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isFrench ? 'Pour toute question : ' : 'For any questions: '}
                <a href="mailto:legal@clipperpro.app" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                  legal@clipperpro.app
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
