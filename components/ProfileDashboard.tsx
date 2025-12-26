"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PurchasesList from "./PurchasesList";
import { 
  User, 
  ShoppingBag, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Globe, 
  Edit3, 
  Save, 
  Loader2, 
  LayoutList,
  ArrowLeft
} from "lucide-react";
import { updateProfile } from "@/app/actions/user";

interface Props {
  user: any;
  orders: any[];
  isAdminView?: boolean;
}

export default function ProfileDashboard({ user, orders, isAdminView = false }: Props) {
  // Установлено "profile" по умолчанию для всех
  const [activeTab, setActiveTab] = useState<"profile" | "purchases">("profile");
  
  const [isMounted, setIsMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    socialLink: user.socialLink || "",
    restaurantName: user.restaurantName || "",
    restaurantAddress: user.restaurantAddress || "",
  });

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateProfile(user.id, formData);
      if (res.success) setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Профиль", icon: <User size={14} /> },
    { id: "purchases", label: `Заказы (${orders.length})`, icon: <ShoppingBag size={14} /> },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. ПЕРЕКЛЮЧАТЕЛЬ */}
      {!isAdminView ? (
        <div className="flex justify-center">
          <div className="relative bg-slate-50 p-1 rounded-2xl flex gap-1 border border-slate-200 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative z-10 flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === tab.id ? "text-[#1e1b4b]" : "text-slate-400 hover:text-slate-600"}`}
              >
                {tab.icon} {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTabDashboard" className="absolute inset-0 bg-white rounded-xl shadow-sm z-[-1] border border-slate-100" transition={{ type: "spring", duration: 0.5, bounce: 0.2 }} />
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button 
            onClick={() => setActiveTab(activeTab === 'profile' ? 'purchases' : 'profile')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-white border border-slate-200 text-indigo-600 shadow-sm hover:bg-slate-50"
          >
            {activeTab === 'profile' ? (
              <> <LayoutList size={12} /> История заказов ({orders.length})</>
            ) : (
              <> <ArrowLeft size={12} /> К анкете клиента</>
            )}
          </button>
        </div>
      )}

      {/* 2. КОНТЕНТ */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          
          {activeTab === "profile" ? (
            <div className="bg-white rounded-[32px] border border-white shadow-xl shadow-indigo-900/5 p-6 md:p-8 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <EditableCard icon={<User />} label="ФИО" value={formData.name} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, name: v})} />
                <InfoCard icon={<Mail />} label="Email" value={user.email} />
                <EditableCard icon={<Phone />} label="Телефон" value={formData.phone} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, phone: v})} />
                <EditableCard icon={<Globe />} label="Telegram / VK" value={formData.socialLink} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, socialLink: v})} />
                <EditableCard icon={<Briefcase />} label="Заведение" value={formData.restaurantName} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, restaurantName: v})} />
                <EditableCard icon={<MapPin />} label="Адрес" value={formData.restaurantAddress} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, restaurantAddress: v})} />
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center gap-3 relative z-10">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-[#1e1b4b] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-900/20">
                    <Edit3 size={12} /> {isAdminView ? "Изменить данные" : "Редактировать"}
                  </button>
                ) : (
                  <>
                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50">
                      {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Сохранить
                    </button>
                    <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Отмена</button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
               <PurchasesList orders={orders} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EditableCard({ icon, label, value, isEditing, onChange }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:border-indigo-100 hover:shadow-sm">
      <div className="flex items-center gap-2 mb-1 text-slate-400 group-hover:text-indigo-500 transition-colors">
        {React.cloneElement(icon, { size: 12 })}
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </div>
      {isEditing ? (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-bold text-[#1e1b4b] outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
      ) : (
        <div className="text-[13px] font-bold text-[#1e1b4b] break-words leading-tight">{value || "—"}</div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-60">
      <div className="flex items-center gap-2 mb-1 text-slate-400">
        {React.cloneElement(icon, { size: 12 })}
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-[13px] font-bold text-slate-500">{value}</div>
    </div>
  );
}