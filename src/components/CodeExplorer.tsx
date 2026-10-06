import React, { useState } from 'react';
import { FLUTTER_FILES, FlutterFile } from '../flutter_codebase/codeData';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  FolderTree, 
  Archive, 
  Search, 
  FileText,
  Sparkles,
  Info
} from 'lucide-react';
import JSZip from 'jszip';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isZipping, setIsZipping] = useState(false);

  // Copy code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download individual file
  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download entire Flutter project as ZIP
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all project files
      for (const file of FLUTTER_FILES) {
        zip.file(file.path, file.code);
      }

      // Add a README.md explaining how to run
      const readmeContent = `# Flame Jump - 2D Endless Vertical Platformer

Built with Flutter & Flame Game Engine.

## Getting Started

1. Ensure you have Flutter installed:
   \`\`\`bash
   flutter --version
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   flutter pub get
   \`\`\`

3. Place your visual and audio assets in \`assets/images/\` and \`assets/audio/\`:
   - \`assets/images/spritesheet.png\`
   - \`assets/images/bg_grid.png\`
   - \`assets/images/bg_atmosphere.png\`
   - \`assets/images/bg_space.png\`
   - \`assets/audio/jump.wav\`
   - \`assets/audio/spring.wav\`
   - \`assets/audio/break.wav\`
   - \`assets/audio/gameover.wav\`

4. Run the game:
   \`\`\`bash
   flutter run
   \`\`\`
`;
      zip.file('README.md', readmeContent);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'flame_jump_flutter_project.zip';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Filter files
  const filteredFiles = FLUTTER_FILES.filter(f => 
    f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category
  const categories: Array<{ id: string; label: string; files: FlutterFile[] }> = [
    { id: 'config', label: 'Project Config', files: filteredFiles.filter(f => f.category === 'config') },
    { id: 'core', label: 'Core / Entry Point', files: filteredFiles.filter(f => f.category === 'core') },
    { id: 'game', label: 'Flame Game Engine', files: filteredFiles.filter(f => f.category === 'game') },
    { id: 'components', label: 'Game Components', files: filteredFiles.filter(f => f.category === 'components') },
    { id: 'managers', label: 'World Managers', files: filteredFiles.filter(f => f.category === 'managers') },
  ].filter(cat => cat.files.length > 0);

  const lineCount = selectedFile.code.split('\n').length;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-950 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Sidebar: File Tree & Project Actions */}
      <div className="w-full lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree size={18} className="text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">Project Files</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {FLUTTER_FILES.length} files
          </span>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 rounded-md border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Tree List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {cat.label}
              </div>
              <div className="space-y-0.5 mt-0.5">
                {cat.files.map((file) => {
                  const isSelected = selectedFile.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <FileCode size={14} className={isSelected ? 'text-emerald-400' : 'text-slate-400'} />
                      <span className="truncate flex-1">{file.filename}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Download Zip Action */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Archive size={15} />
            <span>{isZipping ? 'Creating ZIP...' : 'Download Full Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Main Code View */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top File Bar */}
        <div className="p-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs text-slate-400">{selectedFile.path}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
              {selectedFile.language}
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              · {lineCount} lines
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
            >
              <Download size={14} />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* File Description Banner */}
        <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-start gap-2 text-xs text-slate-300">
          <Info size={14} className="text-cyan-400 shrink-0 mt-0.5" />
          <span>{selectedFile.description}</span>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-slate-950 select-text">
          <pre className="text-slate-200">
            <code>
              {selectedFile.code.split('\n').map((line, idx) => {
                const isTodo = line.includes('TODO:');
                return (
                  <div 
                    key={idx} 
                    className={`table-row ${isTodo ? 'bg-amber-500/10 text-amber-300 font-semibold' : ''}`}
                  >
                    <span className="table-cell pr-4 text-right text-slate-600 select-none text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre">
                      {line}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
