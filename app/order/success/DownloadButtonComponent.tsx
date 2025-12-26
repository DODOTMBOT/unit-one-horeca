"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";

export function DownloadButton({ url, fileName }: { url: string; fileName: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download error:", e);
      window.open(url, "_blank");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={handleDownload}
      className={`flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 group transition-all cursor-pointer ${loading ? 'opacity-70 pointer-events-none' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-white transition-colors border border-transparent group-hover:border-blue-100">
          <FileText size={24} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-black text-slate-800">{fileName}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wide">
            {loading ? "Загрузка..." : "Нажмите для скачивания"}
          </span>
        </div>
      </div>
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      </div>
    </div>
  );
}