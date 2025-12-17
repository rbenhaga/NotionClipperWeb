import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Cookie, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { containerVariants, itemVariants } from '../lib/animations';

export default function PrivacyPage() {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === 'fr';

  const sections = isFrench ? [
    {
      icon: Database,
      title: '1. Collecte des données',
      content: 'Clipper Pro collecte et traite les données personnelles suivantes :',
      items: [
        'Adresse e-mail (pour l\'authentification et la communication)',
        'Nom et prénom (optionnel)',
        'Données d\'utilisation (statistiques anonymisées)',
        'Contenu clipé dans Notion (stocké de manière sécurisée)'
      ]
    },
    {
      icon: Eye,
      title: '2. Utilisation des données',
      content: 'Vos données personnelles sont utilisées pour :',
      items: [
        'Fournir et améliorer nos services',
        'Gérer votre compte et vos abonnements',
        'Vous envoyer des notifications importantes',
        'Analyser l\'utilisation pour améliorer l\'expérience utilisateur'
      ]
    },
    {
      icon: Shield,
      title: '3. Protection des données (RGPD)',
      content: 'Conformément au RGPD, vous disposez des droits suivants :',
      items: [
        'Droit d\'accès à vos données personnelles',
        'Droit de rectification de vos données',
        'Droit à l\'effacement (droit à l\'oubli)',
        'Droit à la portabilité des données',
        'Droit d\'opposition au traitement'
      ]
    },
    {
      icon: Lock,
      title: '4. Sécurité',
      content: 'Nous mettons en œuvre des mesures de sécurité pour protéger vos données :',
      items: [
        'Chiffrement SSL/TLS pour toutes les communications',
        'Authentification sécurisée via OAuth 2.0',
        'Stockage sécurisé dans des bases de données chiffrées',
        'Accès restreint aux données personnelles'
      ]
    },
    {
      icon: Cookie,
      title: '5. Cookies',
      content: 'Clipper Pro utilise des cookies essentiels pour :',
      items: [
        'Maintenir votre session authentifiée',
        'Mémoriser vos préférences (langue, thème)',
        'Analyser l\'utilisation de manière anonyme'
      ]
    },
    {
      icon: Mail,
      title: '6. Contact',
      content: 'Pour toute question ou pour exercer vos droits RGPD :',
      items: [
        'E-mail : privacy@clipperpro.app',
        'Responsable : Rayane Ben Haga'
      ]
    }
  ] : [
    {
      icon: Database,
      title: '1. Data Collection',
      content: 'Clipper Pro collects and processes the following personal data:',
      items: [
        'Email address (for authentication and communication)',
        'Name (optional)',
        'Usage data (anonymized statistics)',
        'Clipped content in Notion (securely stored)'
      ]
    },
    {
      icon: Eye,
      title: '2. Data Usage',
      content: 'Your personal data is used to:',
      items: [
        'Provide and improve our services',
        'Manage your account and subscriptions',
        'Send you important notifications',
        'Analyze usage to improve user experience'
      ]
    },
    {
      icon: Shield,
      title: '3. Data Protection (GDPR)',
      content: 'In accordance with GDPR, you have the following rights:',
      items: [
        'Right to access your personal data',
        'Right to rectify your data',
        'Right to erasure (right to be forgotten)',
        'Right to data portability',
        'Right to object to processing'
      ]
    },
    {
      icon: Lock,
      title: '4. Security',
      content: 'We implement security measures to protect your data:',
      items: [
        'SSL/TLS encryption for all communications',
        'Secure authentication via OAuth 2.0',
        'Secure storage in encrypted databases',
        'Restricted access to personal data'
      ]
    },
    {
      icon: Cookie,
      title: '5. Cookies',
      content: 'Clipper Pro uses essential cookies to:',
      items: [
        'Maintain your authenticated session',
        'Remember your preferences (language, theme)',
        'Analyze usage anonymously'
      ]
    },
    {
      icon: Mail,
      title: '6. Contact',
      content: 'For any questions or to exercise your GDPR rights:',
      items: [
        'Email: privacy@clipperpro.app',
        'Data Controller: Rayane Ben Haga'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {isFrench ? 'Politique de Confidentialité' : 'Privacy Policy'}
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
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {section.content}
                    </p>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
