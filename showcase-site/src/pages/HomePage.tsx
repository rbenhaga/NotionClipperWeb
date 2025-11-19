import { Link } from 'react-router-dom';
import {
  Zap,
  Sparkles,
  Chrome,
  Monitor,
  Mic,
  RefreshCw,
  Image as ImageIcon,
  Globe,
  Video,
  Heart,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';
import SocialProof from '../components/SocialProof';
import { NotionClipperLogo } from '../assets/Logo';

export default function HomePage() {

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

            {/* BETA Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm">🧪 BETA - Help Us Build It</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto">
              <span className="text-gray-900">
                Save to Notion.
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Even Offline.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              The only Notion clipper with a real offline queue.
              <br />
              No more <span className="font-bold text-red-600">"go online"</span> errors. Ever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Link
                to="/auth"
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span className="relative z-10">Start Free Trial</span>
              </Link>

              <a
                href="#demo"
                className="px-10 py-5 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                Watch 60s Demo ↗
              </a>
            </div>

            {/* Social Proof */}
            <SocialProof />


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

      {/* Why Clipper Pro Exists Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Why Clipper Pro Exists</h3>
                <p className="text-sm text-gray-600">Solving real problems, not adding features</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                Every other clipper assumes you're always online. But you work in trains, planes, cafés, and basements.
              </p>

              <p className="text-gray-700 leading-relaxed text-lg">
                Other clippers fail when you need them most. Clipper Pro queues locally → syncs when you're back.
              </p>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200/50">
                <p className="text-sm font-bold text-gray-900 mb-3">What makes us different:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Works offline (queue + sync when back online)</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Desktop backup (never lose your clips)</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Actually affordable ($4 not $15)</span>
                  </li>
                </ul>
              </div>

              {/* CTA to Pricing */}
              <div className="pt-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      ⭐ Beta users lock in $3.99/mo forever (first 500 only)
                    </p>
                    <p className="text-xs text-gray-600">
                      Free: 10 clips/month • Pro: Unlimited clips + offline mode
                    </p>
                  </div>
                  <Link
                    to="/auth"
                    className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Status - Known Issues Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>Current Status</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              What's Working & What's Not
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transparence totale sur l'état actuel du projet. Voici ce qui fonctionne et ce qui est encore en développement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* What's Working */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">✅ Fonctionnel</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>OAuth Google + Notion (fixé le 18/11/2025)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Backend optimisé (11 tables → 5 tables)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Base de données sécurisée (0 warnings)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Système de quotas et usage tracking</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>RPC functions pour performance optimale</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Integration Stripe pour paiements</span>
                </li>
              </ul>
            </div>

            {/* Known Issues */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <h3 className="text-xl font-bold text-gray-900">⚠️ En développement</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-700">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                  <span>Extension Chrome (en test interne)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                  <span>App Desktop (macOS/Windows en build)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                  <span>Mode Focus (UI en développement)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                  <span>Parser Markdown (quelques edge cases)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                  <span>Sync temps réel (polling de 5s pour l'instant)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Roadmap - Realistic Timeline */}
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">🚀 Roadmap Q1 2025</h3>
            </div>
            
            <div className="space-y-6">
              {/* In Progress */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">🚧</span> In Progress (2-4 weeks)
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 text-gray-700 bg-white/50 p-3 rounded-lg">
                    <Chrome className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Extension Chrome v1.0</p>
                      <p className="text-xs text-gray-600">Beta functional, fixing bugs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-gray-700 bg-white/50 p-3 rounded-lg">
                    <Monitor className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Desktop App macOS</p>
                      <p className="text-xs text-gray-600">Private beta testing</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Quarter */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">🎯</span> Next Quarter (Q2 2025)
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 text-gray-700 bg-white/50 p-3 rounded-lg">
                    <Monitor className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Desktop App Windows</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-gray-700 bg-white/50 p-3 rounded-lg">
                    <Mic className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Voice Recording + AI</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Future */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">🔮</span> Future (Q3+ 2025)
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-white/50 px-3 py-1.5 rounded-full text-gray-700">OCR Text Extraction</span>
                  <span className="text-xs bg-white/50 px-3 py-1.5 rounded-full text-gray-700">Team Workspaces</span>
                  <span className="text-xs bg-white/50 px-3 py-1.5 rounded-full text-gray-700">Mobile App iOS</span>
                  <span className="text-xs bg-white/50 px-3 py-1.5 rounded-full text-gray-700">Templates System</span>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Dernière mise à jour: <span className="font-semibold">18 Novembre 2025</span>
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <ComparisonTable variant="condensed" />
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
                <span>Disponible maintenant</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Fonctionnalités disponibles dès maintenant
              </h2>

              <p className="text-xl text-gray-700 leading-relaxed">
                Toutes les fonctionnalités essentielles sont déjà implémentées et testées.
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
                    <h4 className="font-semibold text-gray-900">Connexion sécurisée</h4>
                    <p className="text-gray-600">Google + Notion avec encryption des données</p>
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

      {/* CTA Final */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to clip without limits?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join the beta and help shape the future of Notion clipping
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/pricing"
              className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-200"
            >
              See Pricing
            </Link>
          </div>
          <p className="text-sm text-purple-200 mt-6">
            No credit card • 14 days free • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
