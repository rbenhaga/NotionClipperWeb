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

      {/* Comment ça marche */}
      <section className="relative py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Workflow Screenshot */}
            <div className="relative order-2 lg:order-1">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-4">
                {/* Window chrome */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Workflow</span>
                  </div>
                </div>

                {/* Workflow Placeholder */}
                <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg aspect-[4/3] flex items-center justify-center border-2 border-dashed border-emerald-300">
                  <div className="text-center space-y-3 p-8">
                    <ImageIcon className="w-16 h-16 text-emerald-600 mx-auto" />
                    <p className="text-lg font-bold text-gray-900">
                      📸 Screenshot Workflow
                    </p>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                      Animation ou image montrant le workflow Copier → Détecter → Envoyer
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      Dimensions: 800x600px • Format: PNG/JPG/GIF
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Description */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                <Zap className="w-4 h-4" />
                <span>Workflow automatique</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Simple comme Copier-Coller
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed">
                Clipper Pro surveille automatiquement votre presse-papiers et envoie le contenu vers Notion en un raccourci clavier.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Copiez du contenu</h4>
                    <p className="text-gray-600">Texte, image, lien... utilisez <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+C</kbd> normalement</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Détection automatique</h4>
                    <p className="text-gray-600">L'app détecte instantanément le nouveau contenu copié</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Envoi en un raccourci</h4>
                    <p className="text-gray-600"><kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl+Shift+C</kbd> et c'est sauvegardé dans Notion</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités actuelles */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Description */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Production Ready</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Fonctionnalités disponibles dès maintenant
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed">
                Architecture robuste 8.4/10 • Toutes les fonctionnalités essentielles sont déjà implémentées et testées.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Capture automatique du presse-papiers</h4>
                    <p className="text-gray-600">Détection intelligente du contenu (texte, images, liens)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Parser Markdown avancé</h4>
                    <p className="text-gray-600">Conversion automatique en blocs Notion natifs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">OAuth sécurisé + Encryption</h4>
                    <p className="text-gray-600">Google + Notion OAuth • Tokens AES-256-GCM • Supabase Vault</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Monitor className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Mode hors ligne + Sync intelligent</h4>
                    <p className="text-gray-600">Cache local • Synchronisation automatique • Multi-workspaces</p>
                  </div>
                </li>
              </ul>

              <div className="pt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <p className="text-sm text-gray-700">
                  <strong>Monorepo pnpm</strong> • React + TypeScript • Electron + Chrome extension • Supabase Edge Functions • PostgreSQL + RLS
                </p>
              </div>
            </div>

            {/* Right: Features Screenshot */}
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
                    <Sparkles className="w-4 h-4" />
                    <span>Features Dashboard</span>
                  </div>
                </div>

                {/* Screenshot Placeholder */}
                <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg aspect-[4/3] flex items-center justify-center border-2 border-dashed border-indigo-300">
                  <div className="text-center space-y-3 p-8">
                    <ImageIcon className="w-16 h-16 text-indigo-600 mx-auto" />
                    <p className="text-lg font-bold text-gray-900">
                      📸 Screenshot Features
                    </p>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                      Interface montrant les fonctionnalités principales en action
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      Dimensions: 1000x750px • Format: PNG/JPG
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap - Prochaines fonctionnalités */}
      <section className="relative py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Roadmap Screenshot */}
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
                    <Rocket className="w-4 h-4" />
                    <span>Roadmap 2025</span>
                  </div>
                </div>

                {/* Screenshot Placeholder */}
                <div className="relative bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg aspect-[4/3] flex items-center justify-center border-2 border-dashed border-pink-300">
                  <div className="text-center space-y-3 p-8">
                    <ImageIcon className="w-16 h-16 text-pink-600 mx-auto" />
                    <p className="text-lg font-bold text-gray-900">
                      📸 Screenshot Roadmap
                    </p>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                      Visuel montrant les prochaines fonctionnalités en développement
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      Dimensions: 1000x750px • Format: PNG/JPG
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Description */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold">
                <Rocket className="w-4 h-4" />
                <span>Roadmap 2025</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Prochaines fonctionnalités
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed">
                En développement actif pour enrichir votre expérience Notion.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Voice Recording + Transcription AI</h4>
                    <p className="text-gray-600">Enregistrez des notes vocales et transcrivez avec Whisper AI (Q1 2025)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ScanText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">OCR - Extraction de texte</h4>
                    <p className="text-gray-600">Extrayez le texte depuis images et screenshots (Q1 2025)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sync Extension ↔ Desktop</h4>
                    <p className="text-gray-600">Synchronisation temps réel entre navigateur et desktop (Q2 2025)</p>
                  </div>
                </li>
              </ul>

              <div className="pt-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                <p className="text-sm text-gray-700">
                  <strong>En étude:</strong> Web Highlights • Focus Mode • Screenshots avancés • Export multi-format
                </p>
              </div>

              <div className="pt-4">
                <Link
                  to="/pricing"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Voir les tarifs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
