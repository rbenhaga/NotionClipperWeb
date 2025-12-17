/**
 * AnimatedBackground - Static blobs for performance
 * Removed animations to prevent flickering on zoom
 * Responsive: smaller blur and repositioned on mobile for better visibility
 */
export const AnimatedBackground = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      {/* Top-left violet blob - static */}
      {/* Mobile: larger relative size, more visible, less blur */}
      <div
        className="absolute rounded-full 
          w-[80vw] h-[80vw] sm:w-[50vw] sm:h-[50vw] 
          max-w-[700px] max-h-[700px]
          -top-[10%] -left-[20%] sm:-top-[10%] sm:-left-[10%]
          opacity-70 dark:opacity-80 sm:opacity-50 sm:dark:opacity-70
          blur-[50px] sm:blur-[80px]"
        style={{
          background:
            'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(217,70,239,0.2) 50%, transparent 70%)',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* Top-right blue blob - static */}
      {/* Mobile: repositioned to be more visible in viewport */}
      <div
        className="absolute rounded-full 
          w-[70vw] h-[70vw] sm:w-[45vw] sm:h-[45vw] 
          max-w-[600px] max-h-[600px]
          top-[5%] -right-[25%] sm:-top-[5%] sm:-right-[10%]
          opacity-70 dark:opacity-80 sm:opacity-50 sm:dark:opacity-70
          blur-[50px] sm:blur-[80px]"
        style={{
          background:
            'radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(6,182,212,0.18) 50%, transparent 70%)',
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* Bottom-center violet blob - static */}
      {/* Mobile: wider spread, less blur for visibility */}
      <div
        className="absolute rounded-full 
          w-[90vw] h-[70vw] sm:w-[60vw] sm:h-[45vw] 
          max-w-[800px] max-h-[600px]
          -bottom-[15%] left-1/2 -translate-x-1/2
          opacity-70 dark:opacity-80 sm:opacity-50 sm:dark:opacity-70
          blur-[60px] sm:blur-[100px]"
        style={{
          background:
            'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(217,70,239,0.2) 40%, transparent 70%)',
          transform: 'translate3d(-50%,0,0)',
        }}
      />
    </div>
  );
};
