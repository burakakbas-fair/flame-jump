import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { CodeExplorer } from './components/CodeExplorer';
import { ArchitectureDoc } from './components/ArchitectureDoc';
import { SpriteMappingGuide } from './components/SpriteMappingGuide';
import { 
  Gamepad2, 
  Code2, 
  Columns2, 
  Layers, 
  Palette, 
  Archive, 
  Flame,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { FLUTTER_FILES } from './flutter_codebase/codeData';
import JSZip from 'jszip';

type ActiveTab = 'simulator' | 'split' | 'code' | 'architecture' | 'sprites';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('split');
  const [isExporting, setIsExporting] = useState(false);

  // Quick download zip from top bar
  const handleQuickDownloadZip = async () => {
    try {
      setIsExporting(true);
      const zip = new JSZip();

      for (const file of FLUTTER_FILES) {
        zip.file(file.path, file.code);
      }

      zip.file(
        'README.md',
        `# Flame Jump - Flutter & Flame 2D Endless Platformer\n\nRun with \`flutter run\` after placing assets in \`assets/images/\` and \`assets/audio/\`.\n`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'flame_jump_flutter_codebase.zip';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-40">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Flame size={20} className="fill-emerald-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-wide text-white">FLAME JUMP</span>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-1 rounded">
                Flame 1.18+
              </span>
            </div>
            <div className="text-[10px] text-slate-400 leading-none">
              Flutter 2D Endless Platformer Architecture Studio
            </div>
          </div>
        </div>

        {/* Tab Navigation (Clean Segmented Control) */}
        <nav className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'split'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns2 size={13} />
            <span className="hidden sm:inline">Split View</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'simulator'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 size={13} />
            <span>Play Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'code'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 size={13} />
            <span>Codebase</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'architecture'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={13} />
            <span className="hidden md:inline">Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('sprites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'sprites'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette size={13} />
            <span className="hidden md:inline">Sprite Slicing</span>
          </button>
        </nav>

        {/* Action: Export Project */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickDownloadZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Archive size={14} />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export Flutter (.zip)'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {/* TAB 1: SPLIT VIEW (Simulator on Left, Code Explorer on Right) */}
        {activeTab === 'split' && (
          <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden">
            {/* Left: Playable Simulator Panel */}
            <div className="w-full lg:w-[460px] xl:w-[490px] h-full flex flex-col items-center justify-center p-3 bg-slate-950/80 border-r border-slate-800 shrink-0 overflow-y-auto">
              <GameCanvas />
            </div>

            {/* Right: Code Explorer Panel */}
            <div className="flex-1 h-full min-w-0 overflow-hidden p-3">
              <CodeExplorer />
            </div>
          </div>
        )}

        {/* TAB 2: PLAYABLE SIMULATOR ONLY */}
        {activeTab === 'simulator' && (
          <div className="h-full w-full flex items-center justify-center p-4 overflow-y-auto">
            <GameCanvas />
          </div>
        )}

        {/* TAB 3: CODEBASE EXPLORER ONLY */}
        {activeTab === 'code' && (
          <div className="h-full w-full p-4 overflow-hidden">
            <CodeExplorer />
          </div>
        )}

        {/* TAB 4: ARCHITECTURE DOCUMENTATION */}
        {activeTab === 'architecture' && (
          <div className="h-full w-full overflow-hidden">
            <ArchitectureDoc />
          </div>
        )}

        {/* TAB 5: SPRITE SLICING & ASSET GUIDE */}
        {activeTab === 'sprites' && (
          <div className="h-full w-full overflow-hidden">
            <SpriteMappingGuide />
          </div>
        )}
      </main>
    </div>
  );
}
