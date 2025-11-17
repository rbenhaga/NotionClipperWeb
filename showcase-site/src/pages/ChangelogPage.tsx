import { Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Zap,
  Database,
  Check,
  AlertCircle
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ChangelogPage() {

  const releases = [
    {
      version: 'v1.2.0',
      date: '2025-11-16',
      title: 'Audit de sécurité et optimisations',
      type: 'security' as const,
      changes: [
        {
          type: 'security',
          title: 'Renforcement de la sécurité',
          description: 'Correction de problèmes critiques identifiés lors de l\'audit de sécurité complet'
        },
        {
          type: 'feature',
          title: 'Suivi des quotas amélioré',
          description: 'Tracking précis des fichiers, minutes en mode focus et mode compact'
        },
        {
          type: 'improvement',
          title: 'Logger de production',
          description: 'Système de logging avec filtrage par niveau pour éviter la pollution en production'
        },
        {
          type: 'fix',
          title: 'Optimisations Edge Functions',
          description: 'Résolution des appels redondants et amélioration des performances'
        }
      ]
    },
    {
      version: 'v1.1.0',
      date: '2025-11-14',
      title: 'Système Freemium/Premium',
      type: 'feature' as const,
      changes: [
        {
          type: 'feature',
          title: 'Abonnement Premium',
          description: 'Système d\'abonnement avec quotas et gestion Stripe'
        },
        {
          type: 'feature',
          title: 'Affichage professionnel des quotas',
          description: 'Interface utilisateur pour suivre l\'utilisation et les limites'
        },
        {
          type: 'improvement',
          title: 'ConfigPanel minimaliste',
          description: 'Redesign du panneau de configuration inspiré d\'Apple/Notion'
        },
        {
          type: 'security',
          title: 'Sécurisation du tracking',
          description: 'Restrictions de la file d\'attente hors ligne pour éviter les abus'
        }
      ]
    },
    {
      version: 'v1.0.0',
      date: '2025-11-13',
      title: 'Lancement initial - Système d\'authentification complet',
      type: 'feature' as const,
      changes: [
        {
          type: 'feature',
          title: 'OAuth Google + Notion',
          description: 'Authentification sécurisée avec Google et connexion Notion'
        },
        {
          type: 'feature',
          title: 'Encryption AES-256-GCM',
          description: 'Chiffrement des tokens Notion côté serveur avec Supabase Vault'
        },
        {
          type: 'feature',
          title: 'Capture automatique du presse-papiers',
          description: 'Détection intelligente du contenu copié (texte, images, liens)'
        },
        {
          type: 'feature',
          title: 'Parser Markdown avancé',
          description: 'Conversion automatique en blocs Notion natifs avec support complet du formatage'
        },
        {
          type: 'feature',
          title: 'Mode hors ligne',
          description: 'File d\'attente locale avec synchronisation automatique au retour de la connexion'
        },
        {
          type: 'feature',
          title: 'Multi-workspaces',
          description: 'Support de plusieurs espaces de travail Notion'
        },
        {
          type: 'feature',
          title: 'Interface i18n',
          description: 'Support français et anglais avec traductions complètes'
        },
        {
          type: 'feature',
          title: 'Auto-reconnexion',
          description: 'Système de reconnexion automatique pour les utilisateurs récurrents'
        }
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'security':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'improvement':
        return <Zap className="w-4 h-4 text-blue-600" />;
      case 'fix':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Check className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return 'Nouvelle fonctionnalité';
      case 'security':
        return 'Sécurité';
      case 'improvement':
        return 'Amélioration';
      case 'fix':
        return 'Correction';
      default:
        return 'Changement';
    }
  };

  const getReleaseIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="w-6 h-6 text-white" />;
      case 'feature':
        return <Sparkles className="w-6 h-6 text-white" />;
      default:
        return <Zap className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Changelog
            </span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Suivez l'évolution de Clipper Pro avec toutes les nouvelles fonctionnalités, améliorations et corrections
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 via-blue-600 to-indigo-600"></div>

            {/* Releases */}
            <div className="space-y-12">
              {releases.map((release, index) => (
                <div key={index} className="relative pl-20">
                  {/* Icon */}
                  <div className="absolute left-0 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    {getReleaseIcon(release.type)}
                  </div>

                  {/* Content */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-sm">
                        {release.version}
                      </span>
                      <span className="text-sm text-gray-500 font-mono">
                        {release.date}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {release.title}
                    </h2>

                    <div className="space-y-4">
                      {release.changes.map((change, changeIndex) => (
                        <div
                          key={changeIndex}
                          className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="mt-0.5">
                            {getTypeIcon(change.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {getTypeLabel(change.type)}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {change.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {change.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid sm:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">15+</div>
              <div className="text-sm text-gray-600">Fonctionnalités</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">9/10</div>
              <div className="text-sm text-gray-600">Score de sécurité</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mb-3">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
              <div className="text-sm text-gray-600">Versions majeures</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Essayez Clipper Pro dès maintenant
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Rejoignez les utilisateurs qui optimisent leur workflow Notion chaque jour
            </p>
            <Link
              to="/auth"
              className="inline-block px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Commencer maintenant
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
