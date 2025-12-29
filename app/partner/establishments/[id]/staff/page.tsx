"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, Mail, UserCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function EstablishmentStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/establishments/${id}/staff`)
      .then(res => res.json())
      .then(data => {
        setStaff(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <Loader2 className="animate-spin text-slate-300" size={24} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#1e1b4b]">
      <div className="max-w-[800px] mx-auto px-6 py-12">
        
        <Link href={`/partner/establishments/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all mb-10 group">
          <ArrowLeft size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Назад в заведение</span>
        </Link>

        <header className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Управление</p>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Сотрудники точки</h1>
        </header>

        <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
          {staff.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Сотрудники еще не зарегистрированы</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {staff.map((person) => (
                <Link 
                  key={person.id} 
                  href={`/profile/${person.id}`} // Переход в профиль конкретного человека
                  className="p-6 flex items-center justify-between hover:bg-slate-50/80 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                        {person.name} {person.surname}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                        <Mail size={10} />
                        {person.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {person.role}
                      </span>
                      <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">
                        ID: {person.id.slice(0, 8)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}