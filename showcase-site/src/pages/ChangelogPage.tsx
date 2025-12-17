import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Shield,
  Zap,
  Check,
  AlertCircle,
  GitCommit,
  Calendar,
  Code,
  ArrowRight
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ChangelogPage() {
  const { i18n } = useTranslation('common');
  const isFrench = i18n.language === 'fr';

  const releases = [
    {
      version: 'v1.2.0',
      date: '2025-11-17',
      title: isFrench ? 'Sécurité renforcée et optimisations' : 'Enhanced Security & Optimizations',
      type: 'security' as const,
      changes: [
        {
          type: 'security',
          title: isFrench ? 'Sécurité renforcée' : 'Enhanced Security',
          description: isFrench 
            ? 'Protection avancée de vos données personnelles et tokens d\'accès'
            : 'Advanced protection for your personal data and access tokens'
        },
        {
          type: 'feature',
          title: isFrench ? 'Suivi d\'utilisation amélioré' : 'Improved Usage Tracking',
          description: isFrench 
            ? 'Visualisez précisément votre consommation de quotas mensuel'
            : 'Precisely visualize your monthly quota consumption'
        },
        {
          type: 'improvement',
          title: isFrench ? 'Performances optimisées' : 'Optimized Performance',
          description: isFrench 
            ? 'Application plus rapide avec moins de consommation de ressources'
            : 'Faster app with lower resource consumption'
        }
      ]
    },
    {
      version: 'v1.1.0',
      date: '2025-11-14',
      title: isFrench ? 'Abonnement Premium et Connexion simplifiée' : 'Premium Subscription & Simplified Login',
      type: 'feature' as const,
      changes: [
        {
          type: 'feature',
          title: isFrench ? 'Connexion avec Google' : 'Google Sign-In',
          description: isFrench 
            ? 'Connectez-vous simplement avec votre compte Google'
            : 'Sign in easily with your Google account'
        },
        {
          type: 'feature',
          title: isFrench ? 'Abonnement Premium' : 'Premium Subscription',
          description: isFrench 
            ? 'Système d\'abonnement mensuel avec paiement sécurisé'
            : 'Monthly subscription system with secure payment'
        },
        {
          type: 'security',
          title: isFrench ? 'Chiffrement des données' : 'Data Encryption',
          description: isFrench 
            ? 'Vos tokens Notion sont chiffrés et stockés en toute sécurité'
            : 'Your Notion tokens are encrypted and stored securely'
        },
        {
          type: 'improvement',
          title: isFrench ? 'Interface redesignée' : 'Redesigned Interface',
          description: isFrench 
            ? 'Design moderne inspiré des meilleures applications du marché'
            : 'Modern design inspired by the best apps on the market'
        }
      ]
    },
    {
      version: 'v1.0.0',
      date: '2025-11-09',
      title: isFrench ? 'Support multilingue et Mode Focus' : 'Multilingual Support & Focus Mode',
      type: 'feature' as const,
      changes: [
        {
          type: 'feature',
          title: isFrench ? '9 langues disponibles' : '9 Languages Available',
          description: isFrench 
            ? 'Interface en français, anglais, espagnol, allemand, portugais, japonais, coréen, arabe et italien'
            : 'Interface in French, English, Spanish, German, Portuguese, Japanese, Korean, Arabic and Italian'
        },
        {
          type: 'feature',
          title: 'Mode Focus',
          description: isFrench 
            ? 'Travaillez sans distraction avec la bulle flottante intelligente'
            : 'Work without distraction with the smart floating bubble'
        },
        {
          type: 'improvement',
          title: isFrench ? 'Animations fluides' : 'Smooth Animations',
          description: isFrench 
            ? 'Expérience utilisateur premium avec des animations soignées'
            : 'Premium user experience with polished animations'
        },
        {
          type: 'feature',
          title: isFrench ? 'Navigation par sections' : 'Section Navigation',
          description: isFrench 
            ? 'Organisez votre contenu avec la table des matières automatique'
            : 'Organize your content with automatic table of contents'
        }
      ]
    },
    {
      version: 'v0.8.0',
      date: '2025-10-15',
      title: isFrench ? 'Extension navigateur et Upload de fichiers' : 'Browser Extension & File Upload',
      type: 'feature' as const,
      changes: [
        {
          type: 'feature',
          title: isFrench ? 'Extension Chrome' : 'Chrome Extension',
          description: isFrench 
            ? 'Capturez n\'importe quelle page web directement depuis votre navigateur'
            : 'Capture any web page directly from your browser'
        },
        {
          type: 'feature',
          title: isFrench ? 'Envoi de fichiers' : 'File Upload',
          description: isFrench 
            ? 'Glissez-déposez vos fichiers pour les ajouter à Notion'
            : 'Drag and drop your files to add them to Notion'
        },
        {
          type: 'feature',
          title: isFrench ? 'Mode hors ligne' : 'Offline Mode',
          description: isFrench 
            ? 'Continuez à travailler sans connexion, tout se synchronise automatiquement'
            : 'Keep working without connection, everything syncs automatically'
        },
        {
          type: 'improvement',
          title: isFrench ? 'Interface compacte' : 'Compact Interface',
          description: isFrench 
            ? 'Mode minimaliste pour gagner de l\'espace sur votre écran'
            : 'Minimalist mode to save space on your screen'
        }
      ]
    },
    {
      version: 'v0.5.0',
      date: '2025-10-03',
      title: isFrench ? 'Architecture technique améliorée' : 'Improved Technical Architecture',
      type: 'improvement' as const,
      changes: [
        {
          type: 'improvement',
          title: isFrench ? 'Stabilité accrue' : 'Increased Stability',
          description: isFrench 
            ? 'Application plus fiable avec moins de bugs'
            : 'More reliable app with fewer bugs'
        },
        {
          type: 'improvement',
          title: isFrench ? 'Code optimisé' : 'Optimized Code',
          description: isFrench 
            ? 'Performances améliorées sur tous les appareils'
            : 'Improved performance on all devices'
        }
      ]
    },
    {
      version: 'v0.3.0',
      date: '2025-09-23',
      title: isFrench ? 'Amélioration du formatage' : 'Formatting Improvements',
      type: 'feature' as const,
      changes: [
        {
          type: 'feature',
          title: isFrench ? 'Markdown avancé' : 'Advanced Markdown',
          description: isFrench 
            ? 'Support complet du formatage Markdown pour vos notes'
            : 'Full Markdown formatting support for your notes'
        },
        {
          type: 'feature',
          title: isFrench ? 'Détection intelligente' : 'Smart Detection',
          description: isFrench 
            ? 'Reconnaît automatiquement le type de contenu que vous copiez'
            : 'Automatically recognizes the type of content you copy'
        },
        {
          type: 'improvement',
          title: isFrench ? 'Compatibilité Notion' : 'Notion Compatibility',
          description: isFrench 
            ? 'Support des dernières fonctionnalités de l\'API Notion'
            : 'Support for the latest Notion API features'
        }
      ]
    },
    {
      version: 'v0.1.0',
      date: '2025-06-30',
      title: isFrench ? 'Première version' : 'First Release',
      type: 'feature' as const,
      changes: [
        {
          type: 'feature',
          title: isFrench ? 'Capture automatique' : 'Automatic Capture',
          description: isFrench 
            ? 'Détecte automatiquement quand vous copiez du contenu'
            : 'Automatically detects when you copy content'
        },
        {
          type: 'feature',
          title: isFrench ? 'Envoi vers Notion' : 'Send to Notion',
          description: isFrench 
            ? 'Envoyez votre contenu directement dans vos pages Notion'
            : 'Send your content directly to your Notion pages'
        },
        {
          type: 'feature',
          title: isFrench ? 'Application desktop' : 'Desktop App',
          description: isFrench 
            ? 'Interface moderne et facile à utiliser'
            : 'Modern and easy-to-use interface'
        }
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
      case 'security':
        return <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'improvement':
        return <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'fix':
        return <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <Check className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return isFrench ? 'Nouveauté' : 'Feature';
      case 'security':
        return isFrench ? 'Sécurité' : 'Security';
      case 'improvement':
        return isFrench ? 'Amélioration' : 'Improvement';
      case 'fix':
        return isFrench ? 'Correction' : 'Fix';
      default:
        return isFrench ? 'Changement' : 'Change';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300';
      case 'security':
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300';
      case 'improvement':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'fix':
        return 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300';
    }
  };

  const getReleaseIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="w-5 h-5 text-white" />;
      case 'feature':
        return <Sparkles className="w-5 h-5 text-white" />;
      default:
        return <Zap className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full mb-8"
          >
            <GitCommit className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              {isFrench ? 'Historique' : 'History'}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-semibold text-neutral-900 dark:text-white mb-4"
          >
            Changelog
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-500 max-w-2xl mx-auto"
          >
            {isFrench 
              ? 'Suivez l\'évolution de Clipper Pro avec toutes les nouvelles fonctionnalités et améliorations'
              : 'Follow the evolution of Clipper Pro with all new features and improvements'}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: GitCommit, value: '421+', label: 'Commits', color: 'violet' },
              { icon: Calendar, value: '6', label: isFrench ? 'Mois de dev' : 'Months of dev', color: 'blue' },
              { icon: Code, value: '50k+', label: isFrench ? 'Lignes de code' : 'Lines of code', color: 'indigo' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 bg-${stat.color}-100 dark:bg-${stat.color}-500/20 rounded-lg mb-3`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-0.5">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500 via-blue-500 to-neutral-300 dark:to-neutral-700" />

            {/* Releases */}
            <div className="space-y-8">
              {releases.map((release, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-14"
                >
                  {/* Icon */}
                  <div className="absolute left-0 w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                    {getReleaseIcon(release.type)}
                  </div>

                  {/* Content */}
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-violet-600 text-white rounded-lg font-bold text-sm">
                          {release.version}
                        </span>
                        <span className="text-sm text-neutral-500 font-mono">
                          {release.date}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                        {release.title}
                      </h2>
                    </div>

                    {/* Changes */}
                    <div className="p-5 space-y-3">
                      {release.changes.map((change, changeIndex) => (
                        <div
                          key={changeIndex}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5">
                            {getTypeIcon(change.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className="font-medium text-neutral-900 dark:text-white text-sm">
                                {change.title}
                              </span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded ${getTypeBadgeColor(change.type)}`}>
                                {getTypeLabel(change.type)}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-500">
                              {change.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300 dark:via-violet-700 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl font-semibold text-neutral-900 dark:text-white mb-4">
            {isFrench ? 'Essayez Clipper Pro' : 'Try Clipper Pro'}
          </h2>
          <p className="text-neutral-500 mb-8">
            {isFrench 
              ? 'Rejoignez les utilisateurs qui optimisent leur workflow Notion chaque jour'
              : 'Join users who optimize their Notion workflow every day'}
          </p>
          
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
          >
            {isFrench ? 'Commencer maintenant' : 'Start now'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
