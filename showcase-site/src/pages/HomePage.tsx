import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  Sparkles,
  MousePointerClick,
  Chrome,
  Monitor,
  Mic,
  ScanText,
  RefreshCw,
  Focus,
  Upload,
  Image as ImageIcon,
  Globe,
  Video,
  Rocket,
  Calendar
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

      {/* How It Works */}
      <section className="relative py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Simple et Rapide
            </h2>
            <p className="text-xl text-gray-700">
              Capturez et organisez en 3 étapes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
                    <MousePointerClick className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Étape 1
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Cliquez sur l'extension
                </h3>
                <p className="text-gray-600">
                  Un simple clic sur l'icône dans votre navigateur
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Étape 2
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Sélectionnez votre page
                </h3>
                <p className="text-gray-600">
                  Choisissez où sauvegarder dans votre Notion
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                  Étape 3
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  C'est sauvegardé !
                </h3>
                <p className="text-gray-600">
                  Retrouvez tout dans Notion, parfaitement formaté
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Features */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Fonctionnalités actuelles
            </h2>
            <p className="text-xl text-gray-700">
              Tout ce qui est déjà disponible
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Capture instantanée
                </h3>
                <p className="text-gray-700">
                  Sauvegardez n'importe quelle page web en un clic avec raccourci clavier personnalisable
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Format Notion parfait
                </h3>
                <p className="text-gray-700">
                  Convertit automatiquement en blocs Notion natifs avec images, liens et mise en forme
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Upload de fichiers
                </h3>
                <p className="text-gray-700">
                  Importez directement des PDFs, images et documents dans vos pages Notion
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Multi-workspaces
                </h3>
                <p className="text-gray-700">
                  Gérez plusieurs workspaces Notion et basculez facilement entre eux
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Features - Roadmap */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-6">
              <Rocket className="w-4 h-4" />
              <span>ROADMAP</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Fonctionnalités à venir
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Nous travaillons sur des fonctionnalités révolutionnaires qui vont transformer votre workflow Notion
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Voice Recording */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  PRIORITY
                </span>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Voice Recording
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Enregistrez des notes vocales, transcrivez automatiquement avec Whisper AI et sauvegardez dans Notion
                  </p>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Q1 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* OCR */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  PRIORITY
                </span>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <ScanText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    OCR - Extraction de texte
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Extrayez le texte depuis n'importe quelle image, screenshot ou infographie
                  </p>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Q1 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extension ↔ Desktop Sync */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-emerald-200 hover:shadow-xl transition-all">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                  PRIORITY
                </span>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sync Extension ↔ Desktop
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Synchronisation temps réel entre navigateur et desktop, configs unifiées
                  </p>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Q1 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Focus Mode */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Focus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Focus Mode
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Mode lecture sans distraction avec police ajustable et dark mode
                  </p>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Q2 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshots */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Screenshots avancés
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Capture full-page, zone sélectionnée, avec annotations
                  </p>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Q2 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Web Highlights
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Surlignez du texte sur n'importe quel site et sauvegardez avec contexte
                  </p>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Q2 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              Et bien d'autres fonctionnalités en développement...
            </p>
            <Link
              to="/pricing"
              className="inline-block mt-6 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Rejoignez-nous dès maintenant
            </Link>
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
