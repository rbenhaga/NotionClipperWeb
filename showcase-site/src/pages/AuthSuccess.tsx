import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { successVariants, confettiVariants } from '../lib/animations';

// Confetti piece component
const ConfettiPiece = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    className="absolute top-1/2 left-1/2"
    initial="hidden"
    animate="visible"
    variants={confettiVariants}
    transition={{ delay, duration: 1.5 }}
  >
    <div
      className="w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  </motion.div>
);

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const sessionId = searchParams.get('session_id');
  const [message, setMessage] = useState(
    "You're all set. Redirecting you to the app..."
  );
  const [title, setTitle] = useState('Success!');

  // Confetti colors (purple, blue, emerald, pink)
  const confettiColors = [
    '#A855F7', // purple-500
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#EC4899', // pink-500
    '#F59E0B', // amber-500
  ];

  useEffect(() => {
    // OAuth success (token from Google/Notion)
    if (token) {
      localStorage.setItem('auth_token', token);
      setTitle('Authentication Successful!');
      setMessage("You're all set. Redirecting to your dashboard...");
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2500);
      return;
    }

    // Stripe payment success (session_id from Stripe)
    if (sessionId) {
      setTitle('Payment Successful!');
      setMessage('Welcome to Premium! Redirecting to your dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2500);
      return;
    }

    // No params, redirect immediately
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  }, [token, sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
      {/* Confetti explosion */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <ConfettiPiece
            key={i}
            delay={i * 0.05}
            color={confettiColors[i % confettiColors.length]}
          />
        ))}
      </div>

      {/* Success Card */}
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-apple-xl max-w-md w-full text-center p-12 border border-gray-200 dark:border-gray-800 relative z-10 mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          delay: 0.1,
        }}
      >
        {/* Success Icon with animation */}
        <motion.div
          className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative"
          variants={successVariants}
          initial="hidden"
          animate="visible"
        >
          <CheckCircle className="text-green-600 dark:text-green-400" size={40} />

          {/* Sparkle animation */}
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.3,
            }}
          >
            <Sparkles className="text-yellow-500" size={20} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {title}
        </motion.h1>

        {/* Message */}
        <motion.p
          className="text-gray-600 dark:text-gray-400 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {message}
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="spinner w-8 h-8" />
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="mt-8 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
