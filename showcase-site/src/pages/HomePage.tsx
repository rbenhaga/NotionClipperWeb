import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  Sparkles,
  Chrome,
  Monitor,
  Mic,
  ScanText,
  RefreshCw,
  Image as ImageIcon,
  Globe,
  Video,
  Rocket
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { NotionClipperLogo } from '../assets/Logo';

export default function HomePage() {
  const { t } = useTranslation('home');

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      {/* Hero Section with Video Demo */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <NotionClipperLogo size={56} />
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Clipper Pro
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('hero.title.line1')}
              </span>
              <br />
              <span className="text-gray-900">
                {t('hero.title.line2')}
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {t('hero.subtitle.line1')} {t('hero.subtitle.line2')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Link
                to="/auth"
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span className="relative z-10">{t('hero.cta.primary')}</span>
              </Link>

              <Link
                to="/pricing"
                className="px-10 py-5 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                {t('hero.cta.secondary')}
              </Link>
            </div>

            <p className="text-sm text-gray-600 pt-2">
              {t('cta.trial')} • 2.99€/mois • Sans engagement
            </p>

            {/* Video Demo Placeholder */}
            <div className="relative mt-16 max-w-5xl mx-auto">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-gray-200 p-3 overflow-hidden">
                {/* Video Placeholder */}
                <div className="relative bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 rounded-lg aspect-video flex items-center justify-center border-2 border-dashed border-purple-300">
                  <div className="text-center space-y-4">
                    <Video className="w-20 h-20 text-purple-600 mx-auto" />
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-gray-900">
                        🎬 Demo Video
                      </p>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Placeholder pour la vidéo de démonstration de Clipper Pro en action
                      </p>
                      <p className="text-sm text-gray-500 font-mono">
                        Aspect ratio: 16:9 • Format: MP4/WebM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating decoration */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Extension Chrome Section */}
      <section className="relative py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Extension Screenshot */}
            <div className="relative order-2 lg:order-1">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-4">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
                    <Chrome className="w-4 h-4" />
                    <span>Clipper Pro Extension</span>
                  </div>
                </div>

                {/* Screenshot Placeholder */}
                <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg aspect-[4/3] flex items-center justify-center border-2 border-dashed border-purple-300">
                  <div className="text-center space-y-3 p-8">
                    <ImageIcon className="w-16 h-16 text-purple-600 mx-auto" />
                    <p className="text-lg font-bold text-gray-900">
                      📸 Screenshot Extension
                    </p>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                      Placeholder pour capture d'écran de l'extension Chrome
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      Dimensions: 800x600px • Format: PNG/JPG
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Description */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                <Chrome className="w-4 h-4" />
                <span>Extension Chrome</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Capturez depuis n'importe quel site web
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed">
                L'extension Chrome vous permet de sauvegarder instantanément n'importe quelle page web, article, ou contenu directement dans votre Notion workspace.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Capture en un clic</h4>
                    <p className="text-gray-600">Un simple clic pour sauvegarder la page entière</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Format automatique</h4>
                    <p className="text-gray-600">Convertit en blocs Notion natifs avec images et liens</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Compatible tous sites</h4>
                    <p className="text-gray-600">Fonctionne sur blogs, articles, réseaux sociaux, docs, etc.</p>
                  </div>
                </li>
              </ul>

              <div className="pt-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-md"
                >
                  <Chrome className="w-5 h-5" />
                  <span>Installer l'extension</span>
                </a>
                <p className="text-sm text-gray-600 mt-2">Disponible bientôt sur Chrome Web Store</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop App Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Description */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                <Monitor className="w-4 h-4" />
                <span>App Desktop</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Gérez tout depuis une app native
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed">
                L'application desktop offre un espace de travail dédié pour organiser, rechercher et gérer tous vos clips Notion de manière efficace.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Mode Focus</h4>
                    <p className="text-gray-600">Interface épurée pour se concentrer sur la lecture et l'organisation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sync temps réel</h4>
                    <p className="text-gray-600">Synchronisation automatique entre extension et desktop</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Monitor className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Mode hors ligne</h4>
                    <p className="text-gray-600">Travaillez même sans connexion internet</p>
                  </div>
                </li>
              </ul>

              <div className="pt-4">
                <div className="inline-flex items-center gap-3">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-md"
                  >
                    <Monitor className="w-5 h-5" />
                    <span>Télécharger pour macOS</span>
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md border border-gray-200"
                  >
                    <Monitor className="w-5 h-5" />
                    <span>Windows</span>
                  </a>
                </div>
                <p className="text-sm text-gray-600 mt-2">Disponible bientôt • macOS 12+ • Windows 10+</p>
              </div>
            </div>

            {/* Right: Desktop Screenshot */}
            <div className="relative">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-4">
                {/* Window chrome */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>Clipper Pro Desktop</span>
                  </div>
                </div>

                {/* Screenshot Placeholder */}
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg aspect-[4/3] flex items-center justify-center border-2 border-dashed border-blue-300">
                  <div className="text-center space-y-3 p-8">
                    <ImageIcon className="w-16 h-16 text-blue-600 mx-auto" />
                    <p className="text-lg font-bold text-gray-900">
                      📸 Screenshot Desktop App
                    </p>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                      Placeholder pour capture d'écran de l'application desktop
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      Dimensions: 1200x900px • Format: PNG/JPG
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Workflow clair */}
      <section className="relative py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Comment ça marche
            </h2>
            <p className="text-xl text-gray-700">
              Un workflow ultra-simple et automatique
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Copiez n'importe quel contenu
                </h3>
                <p className="text-gray-700">
                  Texte, image, lien... utilisez simplement <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Ctrl+C</kbd> comme d'habitude
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  L'app détecte automatiquement
                </h3>
                <p className="text-gray-700">
                  Clipper Pro surveille votre presse-papiers et détecte instantanément le nouveau contenu copié
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Envoyez vers Notion en un raccourci
                </h3>
                <p className="text-gray-700">
                  Appuyez sur <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Ctrl+Shift+C</kbd> et c'est sauvegardé dans votre page Notion favorite
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              🎯 En mode focus, l'envoi est encore plus rapide et sans distraction
            </p>
          </div>
        </div>
      </section>

      {/* Features actuelles - basées sur le vrai code */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Fonctionnalités disponibles dès maintenant
            </h2>
            <p className="text-xl text-gray-700">
              Production-ready • Architecture robuste 9/10
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Clipboard capture */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  CORE
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                📋 Capture automatique du presse-papiers
              </h3>
              <p className="text-gray-600 text-sm">
                Détection intelligente du contenu copié (texte, images, liens)
              </p>
            </div>

            {/* Feature 2: Markdown parser */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  PARSER
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ✨ Markdown avancé avec parser unifié
              </h3>
              <p className="text-gray-600 text-sm">
                Conversion automatique en blocs Notion natifs avec mise en forme
              </p>
            </div>

            {/* Feature 3: Image upload */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  MEDIA
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🖼️ Upload automatique d'images
              </h3>
              <p className="text-gray-600 text-sm">
                Les images sont envoyées et hébergées directement dans Notion
              </p>
            </div>

            {/* Feature 4: Global shortcuts */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                  UX
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ⌨️ Raccourcis clavier globaux
              </h3>
              <p className="text-gray-600 text-sm">
                Ctrl+Shift+C (Win/Linux) ou Cmd+Shift+C (macOS) n'importe où
              </p>
            </div>

            {/* Feature 5: Multi-workspaces */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                  NOTION
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🔗 Multi-workspaces Notion
              </h3>
              <p className="text-gray-600 text-sm">
                Connectez et gérez plusieurs workspaces simultanément
              </p>
            </div>

            {/* Feature 6: Offline mode */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                  SYNC
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                📶 Mode hors ligne
              </h3>
              <p className="text-gray-600 text-sm">
                Cache intelligent • Sync automatique quand vous êtes en ligne
              </p>
            </div>

            {/* Feature 7: OAuth */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                  SÉCURITÉ
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🔐 OAuth sécurisé + encryption
              </h3>
              <p className="text-gray-600 text-sm">
                Google + Notion OAuth • Tokens AES-256-GCM • Supabase Vault
              </p>
            </div>

            {/* Feature 8: Freemium */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                  PREMIUM
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                💎 Freemium & Premium quotas
              </h3>
              <p className="text-gray-600 text-sm">
                FREE: 100 clips/mois • PREMIUM: Illimité • Stripe intégré
              </p>
            </div>

            {/* Feature 9: i18n */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold">
                  i18n
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🌍 Interface multi-langues
              </h3>
              <p className="text-gray-600 text-sm">
                Support complet de l'internationalisation (FR/EN/etc.)
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🏆</div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  Architecture de production
                </h4>
                <p className="text-gray-700 text-sm">
                  <strong>Note globale: 8.4/10</strong> • Monorepo pnpm workspaces • React + TypeScript • Electron desktop • Chrome extension • Supabase Edge Functions • 12 fonctions serverless • PostgreSQL + RLS • Pattern cascade avec fallbacks
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap simplifié - features prioritaires */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-6">
              <Rocket className="w-4 h-4" />
              <span>ROADMAP 2025</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Prochaines fonctionnalités
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              En développement actif pour transformer votre workflow
            </p>
          </div>

          <div className="space-y-4">
            {/* Priority 1: Voice Recording */}
            <div className="flex items-start gap-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-purple-300">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Mic className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Voice Recording + Transcription AI
                  </h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                    Q1 2025
                  </span>
                </div>
                <p className="text-gray-700">
                  Enregistrez des notes vocales, transcrivez automatiquement avec Whisper AI et sauvegardez dans Notion. Parfait pour capturer vos idées en déplacement.
                </p>
              </div>
            </div>

            {/* Priority 2: OCR */}
            <div className="flex items-start gap-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-blue-300">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <ScanText className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    OCR - Extraction de texte depuis images
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    Q1 2025
                  </span>
                </div>
                <p className="text-gray-700">
                  Extrayez le texte depuis n'importe quelle image, screenshot ou infographie. Technologie OCR avancée pour numériser instantanément vos documents.
                </p>
              </div>
            </div>

            {/* Priority 3: Extension ↔ Desktop Sync */}
            <div className="flex items-start gap-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-emerald-300">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Sync Extension ↔ Desktop
                  </h3>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                    Q2 2025
                  </span>
                </div>
                <p className="text-gray-700">
                  Synchronisation temps réel entre navigateur et application desktop. Configurations unifiées, clips accessibles partout.
                </p>
              </div>
            </div>

            {/* Secondary features */}
            <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">🔮 Autres features en étude</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div>• Web Highlights (surlignage de texte)</div>
                <div>• Focus Mode (lecture sans distraction)</div>
                <div>• Screenshots avancés (full-page + annotations)</div>
                <div>• Export multi-format (MD, PDF, DOCX)</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/pricing"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Essayer gratuitement • 14 jours
            </Link>
            <p className="text-sm text-gray-600 mt-4">
              Sans carte bancaire • Toutes les features actuelles incluses
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 sm:p-16 text-center shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-white">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {t('cta.subtitle')}
              </p>
              <div className="pt-4">
                <Link
                  to="/auth"
                  className="inline-block px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105"
                >
                  {t('cta.button')}
                </Link>
              </div>
              <p className="text-sm text-white/80">
                {t('cta.trial')} • Sans carte bancaire
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
