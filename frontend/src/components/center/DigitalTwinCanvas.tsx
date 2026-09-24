// @ts-nocheck
import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Model as CraneModel } from './CrawlerCrane'; // Model Crane/Excavator kamu
import { Box, Maximize2, Minimize2, RotateCw, Activity } from 'lucide-react';

// Sub-komponen khusus pemanggil 3D Bulldozer dari folder public
function BulldozerModel() {
  const { scene } = useGLTF('/models/bulldozer/scene.gltf');
  return <primitive object={scene} scale={0.01} position={[0, -0.5, 0]} />;
}

interface DigitalTwinProps {
  selectedFleetType?: string;
}

export default function DigitalTwin3D({ selectedFleetType = 'Excavator' }: DigitalTwinProps) {
  const [selectedSubsystem] = useState<string>('HYDRAULIC_PUMP');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  
  // 1. State untuk status Layar Penuh / Maximize
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 2. Shortcut tombol ESC untuk keluar dari mode Fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className={`select-none flex flex-col justify-between overflow-hidden bg-[#090d14] transition-all duration-300 ${
        isExpanded 
          ? 'fixed inset-0 z-50 w-screen h-screen p-6' 
          : 'relative w-full h-full min-h-[300px] rounded-lg border border-industrial-border/60 p-3'
      }`}
    >
      
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas camera={{ position: [12, 10, 12], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 15, 10]} intensity={1.0} />
          <directionalLight position={[-10, -10, -10]} intensity={0.3} />
          <Environment preset="city" /> 

          {/* Kondisi Switch Model 3D */}
          <Suspense fallback={null}>
            {selectedFleetType === 'Bulldozer' ? (
              <BulldozerModel />
            ) : (
              <CraneModel />
            )}
          </Suspense>

          <OrbitControls autoRotate={isRotating} autoRotateSpeed={1.5} enablePan={true} zoomSpeed={0.5} />
        </Canvas>
      </div>

      {/* Background Blueprint Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Header Viewport Overlay */}
      <div className="relative z-10 flex justify-between items-center text-xs font-mono pointer-events-auto">
        <div className="flex items-center gap-2 bg-industrial-panel/80 backdrop-blur-md px-2 py-1 rounded border border-industrial-border/60">
          <Box size={13} className="text-industrial-yellow" />
          {/* Judul dinamis menyesuaikan model */}
          <span className="text-gray-300 uppercase">
            XCMG {selectedFleetType} DIGITAL TWIN
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded border border-industrial-border/60 transition-colors cursor-pointer ${isRotating ? 'bg-industrial-cyan/20 text-industrial-cyan' : 'bg-industrial-panel text-gray-400'}`}
            title="Toggle Auto Rotate"
          >
            <RotateCw size={13} className={isRotating ? 'animate-spin-slow' : ''} />
          </button>
          
          {/* 3. Tombol Maximize / Minimize yang fungsional */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-industrial-panel text-gray-400 hover:text-white rounded border border-industrial-border/60 transition-colors cursor-pointer"
            title={isExpanded ? "Minimize (Esc)" : "Maximize"}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Left Side Metrics Gauge Overlay */}
      <div className="absolute top-14 left-3 z-10 flex flex-col gap-2 w-24 text-[10px] font-mono pointer-events-auto">
        <div className="bg-industrial-panel/80 backdrop-blur-md p-2 rounded border border-industrial-border/60">
          <span className="text-gray-400 block mb-0.5">Pressure</span>
          <span className="text-white font-bold text-xs">95%</span>
          <div className="w-full bg-gray-800 h-1 rounded-full mt-1 overflow-hidden">
            <div className="bg-industrial-yellow h-full w-[95%]" />
          </div>
        </div>

        <div className="bg-industrial-panel/80 backdrop-blur-md p-2 rounded border border-industrial-border/60">
          <span className="text-gray-400 block mb-0.5">Temp</span>
          <span className="text-white font-bold text-xs">92%</span>
          <div className="w-full bg-gray-800 h-1 rounded-full mt-1 overflow-hidden">
            <div className="bg-industrial-red h-full w-[92%]" />
          </div>
        </div>

        <div className="bg-industrial-panel/80 backdrop-blur-md p-2 rounded border border-industrial-border/60">
          <span className="text-gray-400 block mb-0.5">Network</span>
          <span className="text-white font-bold text-xs">85%</span>
          <div className="w-full bg-gray-800 h-1 rounded-full mt-1 overflow-hidden">
            <div className="bg-industrial-green h-full w-[85%]" />
          </div>
        </div>
      </div>

      <div className="flex-1 pointer-events-none" />

      {/* Subsystem Status Footer Bar */}
      <div className="relative z-10 bg-industrial-panel/90 backdrop-blur-md border border-industrial-border/80 p-2.5 rounded-lg flex justify-between items-center text-xs font-mono pointer-events-auto">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-industrial-red animate-pulse" />
          <div>
            <span className="text-[10px] text-gray-400 block">ACTIVE DIAGNOSTIC FOCUS</span>
            <span className="text-white font-bold">SUBSYSTEM: {selectedSubsystem}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 block">3D ENGINE</span>
          <span className="text-industrial-cyan text-[11px]">React Three Fiber</span>
        </div>
      </div>

    </div>
  );
}

// Preload file 3D Bulldozer biar nggak lag pas pertama diklik
useGLTF.preload('/models/bulldozer/scene.gltf');