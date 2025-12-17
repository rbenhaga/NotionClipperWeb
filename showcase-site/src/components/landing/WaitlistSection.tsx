import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, Gift, Shield } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';

export const WaitlistSection = () => {
  const { t } = useTranslation('landing');
  const { user } = useAuth();

  const handleNotionAuth = () => {
    authService.initiateNotionOAuth('web');
  };

  // If user is already logged in, show success state
  if (user) {
    return (
      <section id="waitlist" className="relative py-14 sm:py-20 px-4 sm:px-6 overflow-hidden bg-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-600/8 dark:bg-emerald-900/8 blur-[80px] rounded-full" />
        </div>

        <div className="max-w-xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-white/80 dark:bg-[#121212]/80 backdrop-blur-2xl shadow-2xl shadow-emerald-500/5 border border-white/50 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/10">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

              <div className="p-6 sm:p-10 md:p-12 text-center">
                {/* Success checkmark */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5 sm:mb-6 ring-4 ring-emerald-500/20">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t('waitlist.registered.title', 'Vous êtes inscrit !')}
                </h2>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-sm mx-auto">
                  {t('waitlist.registered.subtitle', 'Merci {{name}} ! Vous serez notifié dès que Clipper Pro sera disponible.').replace('{{name}}', user.name)}
                </p>

                {/* Email confirmation pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user.email}
                  </span>
                </div>

                <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                  {t('waitlist.registered.note', 'Vous recevrez un email dès le lancement.')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="waitlist" className="relative py-14 sm:py-20 px-4 sm:px-6 overflow-hidden bg-transparent">

      {/* Background Lighting Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-violet-600/8 dark:bg-violet-900/8 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="relative"
        >
          {/* Premium Card Container */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-white/80 dark:bg-[#121212]/80 backdrop-blur-2xl shadow-2xl shadow-violet-500/5 border border-white/50 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/10">

            {/* Top Shine */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent" />

            <div className="p-6 sm:p-10 md:p-12 text-center">

              {/* Badge Exclusif */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] mb-5 sm:mb-8">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-600 dark:text-violet-400" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-300 dark:to-fuchsia-300">
                  {t('waitlist.badge')}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 sm:mb-6 drop-shadow-sm">
                {t('waitlist.title')}
              </h2>
              <p className="text-sm sm:text-lg text-gray-500 dark:text-gray-400 mb-6 sm:mb-10 leading-relaxed">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold">{t('waitlist.subtitle')}</span><br />
                {t('waitlist.subtitleTrial')}
              </p>

              {/* Notion OAuth Button */}
              <button
                onClick={handleNotionAuth}
                className="group relative w-full max-w-sm mx-auto flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-semibold text-base sm:text-lg hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity rounded-2xl" />

                {/* Notion Logo - Official */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" fill="#fff" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z" fill="#000" />
                </svg>


                <span>{t('waitlist.notionCta', 'Continuer avec Notion')}</span>
              </button>

              {/* Security note */}
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" />
                {t('waitlist.securityNote', 'Connexion sécurisée via OAuth officiel Notion')}
              </p>

              <div className="mt-6 sm:mt-10 flex flex-wrap justify-center gap-4 sm:gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
                  <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {t('waitlist.features.trial')}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {t('waitlist.features.discount')}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
