import { motion } from 'framer-motion';
import { Zap, WifiOff, Monitor, Command } from 'lucide-react';

const FEATURES = [
  {
    id: 'speed',
    title: 'Instantané',
    stat: '<1s',
    description: 'Ouverture en moins d\'une seconde. 10x plus rapide que la concurrence.',
    icon: Zap,
    color: 'amber',
    visual: 'keyboard',
  },
  {
    id: 'offline',
    title: 'Offline First',
    stat: '100%',
    description: 'Capturez sans connexion. Sync automatique au retour du réseau.',
    icon: WifiOff,
    color: 'emerald',
    visual: 'sync',
  },
  {
    id: 'native',
    title: 'App Native',
    stat: '3 OS',
    description: 'macOS, Windows, Linux. Raccourcis globaux système.',
    icon: Monitor,
    color: 'blue',
    visual: 'platforms',
  },
];

const colorClasses: Record<string, { gradient: string; text: string; bg: string; glow: string }> = {
  amber: {
    gradient: 'from-amber-500 to-orange-600',
    text: 'text-amber-500',
    bg: 'bg-amber-500/10',
    glow: 'shadow-amber-500/20',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-600',
    text: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    glow: 'shadow-emerald-500/20',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-600',
    text: 'text-blue-500',
    bg: 'bg-blue-500/10',
    glow: 'shadow-blue-500/20',
  },
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-violet-600 dark:text-violet-400 tracking-widest uppercase mb-4"
        >
          Ce qui nous différencie
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight"
        >
          Trois avantages{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
            décisifs.
          </span>
        </motion.h2>
      </div>

      {/* Features Grid - 3 colonnes */}
      <div className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((feature, i) => {
          const colors = colorClasses[feature.color];

          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 rounded-3xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-white/10 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                {/* Gradient accent top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-6 shadow-lg ${colors.glow} group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>

                {/* Stat */}
                <div className={`text-4xl font-bold ${colors.text} mb-2`}>{feature.stat}</div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Visual element for keyboard */}
                {feature.visual === 'keyboard' && (
                  <div className="mt-8 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 border-b-2 border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                      <Command className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 border-b-2 border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm text-xs font-bold text-gray-500 dark:text-gray-400">
                      ⇧
                    </div>
                    <div
                      className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colors.gradient} text-white flex items-center justify-center text-sm font-bold shadow-md`}
                    >
                      C
                    </div>
                  </div>
                )}

                {/* Visual element for sync */}
                {feature.visual === 'sync' && (
                  <div className="mt-8 flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900/30">
                      <WifiOff className="w-3 h-3" />
                      Offline
                    </div>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10 relative">
                        <div className="absolute inset-0 bg-emerald-500/50 w-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Synced
                    </div>
                  </div>
                )}

                {/* Visual element for platforms */}
                {feature.visual === 'platforms' && (
                  <div className="mt-8 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {['macOS', 'Windows', 'Linux'].map((os) => (
                      <span
                        key={os}
                        className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs font-bold text-gray-500 dark:text-gray-400"
                      >
                        {os}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};