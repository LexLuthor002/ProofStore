import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS: Record<string, number> = {
  open: 3500,
  hash: 4000,
  storage: 4500,
  verify: 4000,
  close: 4000
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  open: Scene1,
  hash: Scene2,
  storage: Scene3,
  verify: Scene4,
  close: Scene5,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-mono">
      {/* Persistent background layers */}
      <div className="absolute inset-0 z-0">
        <video
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
          src={`${import.meta.env.BASE_URL}videos/crypto-bg.mp4`}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="noise-overlay" />
        <div className="absolute inset-0 grid-bg" />

        {/* Animated gradient vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
      </div>

      {/* Persistent geometric accents */}
      <motion.div
        className="absolute w-[1px] bg-white/20 z-10"
        animate={{
          left: ['10vw', '90vw', '50vw', '20vw', '10vw'][sceneIndex] ?? '10vw',
          height: ['100vh', '50vh', '80vh', '100vh', '0vh'][sceneIndex] ?? '100vh',
          top: ['0vh', '25vh', '10vh', '0vh', '50vh'][sceneIndex] ?? '0vh'
        }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        className="absolute h-[1px] bg-white/20 z-10"
        animate={{
          top: ['10vh', '80vh', '50vh', '20vh', '90vh'][sceneIndex] ?? '10vh',
          width: ['100vw', '50vw', '80vw', '100vw', '0vw'][sceneIndex] ?? '100vw',
          left: ['0vw', '25vw', '10vw', '0vw', '50vw'][sceneIndex] ?? '0vw'
        }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Crosshair corners */}
      <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-white/40 z-10" />
      <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/40 z-10" />
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/40 z-10" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-white/40 z-10" />

      {/* Scene Content */}
      <div className="relative z-20 w-full h-full">
        <AnimatePresence mode="popLayout">
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
