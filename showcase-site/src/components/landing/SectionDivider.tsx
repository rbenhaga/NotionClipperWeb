/**
 * SectionDivider - Minimal premium divider
 * Subtle gradient line that fades from center
 */

export const SectionDivider = () => {
  return (
    <div className="py-12 md:py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div 
          className="h-px w-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 20%, rgba(217,70,239,0.4) 50%, rgba(139,92,246,0.3) 80%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
};
