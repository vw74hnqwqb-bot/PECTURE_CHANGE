import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Maximize2, 
  Plus,
  ArrowRight,
  Monitor,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageState {
  src: string;
  name: string;
  type: string;
  width: number;
  height: number;
  size: number;
}

export default function App() {
  const [image, setImage] = useState<ImageState | null>(null);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('Custom');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const state = {
            src: event.target?.result as string,
            name: file.name,
            type: file.type,
            width: img.width,
            height: img.height,
            size: file.size
          };
          setImage(state);
          setTargetWidth(img.width);
          setTargetHeight(img.height);
          setActivePreset('Custom');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (aspectRatio && image) {
      setTargetHeight(Math.round(val * (image.height / image.width)));
    }
    setActivePreset('Custom');
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (aspectRatio && image) {
      setTargetWidth(Math.round(val * (image.width / image.height)));
    }
    setActivePreset('Custom');
  };

  const applyPreset = (ratio: string) => {
    if (!image) return;
    setActivePreset(ratio);
    if (ratio === '16:9') {
      const h = Math.round(targetWidth * (9 / 16));
      setTargetHeight(h);
    } else if (ratio === '4:3') {
      const h = Math.round(targetWidth * (3 / 4));
      setTargetHeight(h);
    } else if (ratio === '1:1') {
      setTargetHeight(targetWidth);
    }
  };

  const downloadResizedImage = async () => {
    if (!image) return;
    setIsProcessing(true);
    
    const img = new Image();
    img.src = image.src;
    
    await new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const link = document.createElement('a');
          link.download = `aspect-${image.name}`;
          link.href = canvas.toDataURL(image.type);
          link.click();
        }
        resolve(null);
      };
    });
    
    setIsProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-paper text-ink selection:bg-ink selection:text-paper"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end p-6 md:p-8 border-b border-ink/10 flex-shrink-0 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tighter leading-none italic uppercase">Aspect Studio</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] mt-3 opacity-60 font-sans font-bold">이미지 변환 및 정밀 보정 유닛</p>
        </div>
        <div className="flex gap-8 md:gap-12 text-[11px] uppercase tracking-widest font-bold pb-1 font-sans">
          <button className="border-b border-ink transition-colors whitespace-nowrap">작업 공간</button>
          <button className="opacity-40 hover:opacity-100 transition-opacity whitespace-nowrap">컬렉션</button>
          <button className="opacity-40 hover:opacity-100 transition-opacity whitespace-nowrap">아카이브</button>
        </div>
      </header>

      {/* Main Interface */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-ink/10 p-6 md:p-8 flex flex-col flex-shrink-0 overflow-y-auto max-h-[50vh] lg:max-h-full">
          <div className="mb-8 md:mb-10">
            <span className="text-[10px] font-serif italic mb-6 block opacity-50">01 / 주 규격 (Dimensions)</span>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8">
              <div className="group">
                <label className="text-[10px] uppercase tracking-wider mb-2 block font-bold opacity-70">가로 너비 (px)</label>
                <input 
                  type="number"
                  value={targetWidth || ''}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border-b border-ink/20 focus:border-ink py-2 text-2xl md:text-3xl font-serif focus:outline-none transition-colors"
                />
              </div>
              <div className="group">
                <label className="text-[10px] uppercase tracking-wider mb-2 block font-bold opacity-70">세로 높이 (px)</label>
                <input 
                  type="number"
                  value={targetHeight || ''}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent border-b border-ink/20 focus:border-ink py-2 text-2xl md:text-3xl font-serif focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="mb-8 md:mb-10">
            <span className="text-[10px] font-serif italic mb-6 block opacity-50">02 / 비율 제약 (Ratio)</span>
            <div className="flex flex-wrap gap-2">
              {['16:9', '4:3', '1:1', 'Custom'].map((ratio) => (
                <button 
                  key={ratio}
                  onClick={() => ratio === 'Custom' ? setActivePreset('Custom') : applyPreset(ratio)}
                  className={`px-3 md:px-4 py-2 border border-ink rounded-full text-[10px] uppercase font-bold transition-all ${
                    activePreset === ratio 
                    ? 'bg-ink text-paper' 
                    : 'bg-transparent text-ink hover:bg-ink/5'
                  }`}
                >
                  {ratio === 'Custom' ? '직접 입력' : ratio}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setAspectRatio(!aspectRatio)}
              className="mt-6 flex items-center gap-3 group select-none"
            >
              <div className={`w-4 h-4 border border-ink flex items-center justify-center transition-colors ${aspectRatio ? 'bg-ink' : 'bg-transparent'}`}>
                {aspectRatio && <div className="w-2 h-2 bg-paper rounded-full" />}
              </div>
              <span className="text-[11px] uppercase tracking-widest font-bold opacity-60 group-hover:opacity-100 transition-opacity">종횡비 고정 유지 (Lock Ratio)</span>
            </button>
          </div>

          <div className="mt-auto hidden lg:flex flex-col">
            <div className="flex justify-between text-[11px] uppercase tracking-widest mb-6 border-t border-ink/10 pt-6">
              <span className="opacity-50 font-bold">포맷</span>
              <span className="font-bold">{image ? image.type.split('/')[1].toUpperCase() : '---'} / 100%</span>
            </div>
            <button 
              onClick={downloadResizedImage}
              disabled={!image || isProcessing}
              className="w-full py-6 bg-ink text-paper uppercase text-xs tracking-[0.3em] font-bold hover:bg-ink/90 transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed"
            >
              {isProcessing ? '처리 중...' : '이미지 내보내기'}
            </button>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <section className="flex-1 bg-canvas p-6 md:p-12 relative flex items-center justify-center overflow-hidden min-h-[400px]">
          {/* Metadata Overlay - Hidden on small mobile */}
          <div className="absolute top-4 left-4 md:top-8 md:left-8 items-center gap-4 hidden sm:flex">
            <div className="w-1.5 h-1.5 bg-ink rounded-full"></div>
            <span className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-40 italic font-serif truncate max-w-[150px] md:max-w-none">
              레이어: {image ? image.name : '파일 선택 안됨'}
            </span>
          </div>

          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-8 hidden md:block" style={{ writingMode: 'vertical-rl' }}>
            <span className="text-[10px] uppercase tracking-widest opacity-40 font-mono rotate-180">
              배율: {image ? Math.round((targetWidth / image.width) * 100) : 0}%
            </span>
          </div>

          {/* Device Icons HUD */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3 opacity-30">
            <Monitor size={14} />
            <Smartphone size={14} />
          </div>

          {/* Grid Background Lines */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
             <div className="absolute inset-0" style={{ 
               backgroundImage: 'linear-gradient(to right, #121212 1px, transparent 1px), linear-gradient(to bottom, #121212 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }} />
          </div>

          {/* Preview Container */}
          <div className="relative group w-full h-full flex items-center justify-center">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {!image ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-lg aspect-video bg-neutral-heavy border border-ink/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center cursor-pointer hover:border-ink/20 transition-all relative overflow-hidden p-6 text-center"
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="100" y2="100" stroke="#121212" strokeWidth="0.2" />
                    <line x1="100" y1="0" x2="0" y2="100" stroke="#121212" strokeWidth="0.2" />
                  </svg>
                </div>
                
                <div className="z-10">
                  <div className="text-[10px] font-serif italic mb-3 opacity-60 uppercase">준비된 영역</div>
                  <div className="text-2xl md:text-3xl font-serif tracking-tighter leading-tight mb-6">에셋을 올려 <br/> 정밀 분석을 시작하세요</div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 border border-ink rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-ink hover:text-paper transition-all">
                    <Plus size={12} />
                    파일 선택하기
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-neutral-heavy border border-ink/5 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.2)] flex items-center justify-center group"
                style={{ 
                  maxHeight: '90%',
                  maxWidth: '90%'
                }}
              >
                <img 
                  src={image.src} 
                  alt="Clinical Preview" 
                  className="max-w-full max-h-full object-contain mix-blend-multiply opacity-90"
                />

                {/* Handles */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-ink -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-ink translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-ink -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-ink translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                {/* Size Indicator Hover */}
                <div className="absolute inset-x-0 -bottom-12 md:-bottom-10 opacity-0 md:group-hover:opacity-100 transition-opacity flex justify-center pointer-events-none">
                  <div className="bg-ink text-paper text-[9px] md:text-[10px] px-3 py-1 font-mono tracking-wider tabular-nums flex items-center gap-2">
                    <span className="opacity-40 uppercase">규격:</span>
                    {targetWidth} &times; {targetHeight}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Mobile Actions - Only visible on small/medium screens */}
      <div className="lg:hidden p-6 border-t border-ink/10 bg-white">
        <button 
          onClick={downloadResizedImage}
          disabled={!image || isProcessing}
          className="w-full py-5 bg-ink text-paper uppercase text-[11px] tracking-[0.3em] font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-20"
        >
          {isProcessing ? '처리 중...' : (
            <>
              이미지 내보내기 
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      {/* Footer Bar */}
      <footer className="flex flex-col sm:flex-row justify-between items-center px-8 py-6 md:py-4 bg-ink text-paper text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold font-sans flex-shrink-0 gap-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="w-1 h-1 bg-paper/40 rounded-full animate-pulse"></div>
            <span>세션: ASP-2605</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-40">원본 크기:</span>
            <span>{image ? formatSize(image.size) : '0 KB'}</span>
          </div>
          {image && (
            <div className="flex items-center gap-3 hidden md:flex">
              <span className="opacity-40">원본 비율:</span>
              <span className="font-mono">{image.width} &times; {image.height}</span>
            </div>
          )}
        </div>
        <div className="opacity-40 tracking-wider text-center">
          &copy; 2026 ASPECT STUDIO / ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
}
