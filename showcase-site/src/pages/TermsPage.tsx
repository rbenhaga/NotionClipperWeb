import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, User, CreditCard, AlertTriangle, Scale, Ban, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { containerVariants, itemVariants } from '../lib/animations';

export default function TermsPage() {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === 'fr';

  const sections = isFrench ? [
    {
      icon: FileText,
      title: '1. Acceptation des conditions',
      content: 'En utilisant Clipper Pro, vous acceptez d\'être lié par ces Conditions Générales d\'Utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser nos services.'
    },
    {
      icon: User,
      title: '2. Compte utilisateur',
      content: 'Pour utiliser Clipper Pro, vous devez créer un compte avec des informations exactes, maintenir la sécurité de votre compte, et être responsable de toute activité sur votre compte.'
    },
    {
      icon: CreditCard,
      title: '3. Abonnement et paiement',
      content: 'Les abonnements sont facturés mensuellement ou annuellement. Un essai gratuit de 14 jours est disponible. Les paiements sont traités par Stripe. Vous pouvez annuler à tout moment.'
    },
    {
      icon: Ban,
      title: '4. Utilisation acceptable',
      content: 'Vous vous engagez à ne pas utiliser le service à des fins illégales, tenter de contourner les limitations, partager votre compte, ou interférer avec le fonctionnement du service.'
    },
    {
      icon: Scale,
      title: '5. Propriété intellectuelle',
      content: 'Clipper Pro et tous ses contenus sont la propriété de Rayane Ben Haga. Vous conservez la propriété de tout contenu que vous créez avec Clipper Pro.'
    },
    {
      icon: AlertTriangle,
      title: '6. Limitation de responsabilité',
      content: 'Clipper Pro est fourni "tel quel" sans garantie. Nous ne sommes pas responsables de la perte de données, des interruptions de service, ou des dommages indirects.'
    },
    {
      icon: RefreshCw,
      title: '7. Modifications',
      content: 'Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications seront effectives dès leur publication. Votre utilisation continue constitue votre acceptation.'
    }
  ] : [
    {
      icon: FileText,
      title: '1. Acceptance of Terms',
      content: 'By using Clipper Pro, you agree to be bound by these Terms of Service. If you do not accept these terms, please do not use our services.'
    },
    {
      icon: User,
      title: '2. User Account',
      content: 'To use Clipper Pro, you must create an account with accurate information, maintain the security of your account, and be responsible for all activity on your account.'
    },
    {
      icon: CreditCard,
      title: '3. Subscription and Payment',
      content: 'Subscriptions are billed monthly or annually. A 14-day free trial is available. Payments are securely processed by Stripe. You can cancel at any time.'
    },
    {
      icon: Ban,
      title: '4. Acceptable Use',
      content: 'You agree not to use the service for illegal purposes, attempt to circumvent limitations, share your account, or interfere with the service\'s operation.'
    },
    {
      icon: Scale,
      title: '5. Intellectual Property',
      content: 'Clipper Pro and all its content are owned by Rayane Ben Haga. You retain ownership of any content you create with Clipper Pro.'
    },
    {
      icon: AlertTriangle,
      title: '6. Limitation of Liability',
      content: 'Clipper Pro is provided "as is" without warranty. We are not responsible for data loss, service interruptions, or indirect damages.'
    },
    {
      icon: RefreshCw,
      title: '7. Modifications',
      content: 'We reserve the right to modify these Terms at any time. Changes will be effective upon publication. Your continued use constitutes acceptance.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {isFrench ? "Conditions d'Utilisation" : 'Terms of Service'}
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
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Contact Section */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {isFrench ? 'Contact' : 'Contact'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isFrench ? 'Pour toute question : ' : 'For any questions: '}
                <a href="mailto:legal@clipperpro.app" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
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
