"use client";

import { Download } from "lucide-react";

export default function DownloadButton({ url, fileName }: { url: string, fileName: string }) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName; // Здесь задаем имя файла
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Ошибка при скачивании:", error);
      // Если fetch не сработал (например, CORS), просто открываем в новой вкладке
      window.open(url, '_blank');
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm"
    >
      <Download size={18} />
    </button>
  );
}