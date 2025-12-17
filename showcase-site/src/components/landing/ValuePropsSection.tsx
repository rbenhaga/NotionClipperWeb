import { motion } from 'framer-motion';
import { CheckCircle, Zap, Star } from 'lucide-react';

const PROPS = [
  {
    icon: CheckCircle,
    title: 'Fiabilité',
    metric: '99.9%',
    desc: 'Uptime garanti',
    subDesc: 'vs 3.3/5 pour le Clipper officiel',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/20'
  },
  {
    icon: Zap,
    title: 'Vitesse',
    metric: '180ms',
    desc: 'Latence moyenne',
    subDesc: 'Le plus rapide du marché',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    glow: 'group-hover:shadow-amber-500/20'
  },
  {
    icon: Star,
    title: 'Fondateur',
    metric: '1,99€',
    desc: '/mois à vie',
    subDesc: '100 premiers uniquement (au lieu de 3,99€/mois)',
    gradient: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    glow: 'group-hover:shadow-violet-500/20'
  }
];

export const ValuePropsSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-40">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {PROPS.map((prop, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="group relative"
          >
            {/* Ambient Glow on Hover */}
            <div className={`absolute -inset-0.5 bg-gradient-to-br ${prop.gradient} rounded-[34px] blur opacity-0 group-hover:opacity-100 transition duration-500`} />
            
            <div className="relative h-full bg-white dark:bg-[#0B0F19] border border-gray-100 dark:border-white/10 p-8 rounded-[32px] overflow-hidden transition-all duration-300 hover:-translate-y-1">
              
              {/* Inner Highlight Ring */}
              <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-black/5 dark:ring-white/5 pointer-events-none" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-12">
                <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-white/5 ${prop.iconColor} ring-1 ring-inset ring-black/5 dark:ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  <prop.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${prop.iconColor} bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5`}>
                  {prop.title}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl md:text-6xl font-bold tracking-tighter text-gray-900 dark:text-white">
                    {prop.metric}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {prop.desc}
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {prop.subDesc}
                </p>
              </div>

              {/* Decorative gradient bleed - Optimisé */}
              <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${prop.gradient} blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};