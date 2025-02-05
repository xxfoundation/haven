import { useEffect, useRef } from 'react';

export const useAudioContext = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const initAudio = async () => {
      // Create a temporary audio context to request permission
      const tempContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await tempContext.resume();
      
     
      // Clean up temp context
      await tempContext.close();
      
      initialized.current = true;
      
      // Cleanup listeners once initialized
      window.removeEventListener('click', initAudio, true);
      window.removeEventListener('touchstart', initAudio, true);
      window.removeEventListener('keydown', initAudio, true);
    };

    // Wrap the async function
    const handleInteraction = () => {
      initAudio().catch(console.error);
    };

    window.addEventListener('click', handleInteraction, true);
    window.addEventListener('touchstart', handleInteraction, true);
    window.addEventListener('keydown', handleInteraction, true);

    return () => {
      window.removeEventListener('click', handleInteraction, true);
      window.removeEventListener('touchstart', handleInteraction, true);
      window.removeEventListener('keydown', handleInteraction, true);
    };
  }, []);

  // Return whether audio is initialized
  return initialized.current;
}; 