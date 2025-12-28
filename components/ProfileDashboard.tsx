"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PurchasesList from "./PurchasesList";
import { 
  User, ShoppingBag, Phone, Mail, MapPin, Globe, Edit3, Save, Loader2, Users, ShieldCheck
} from "lucide-react";
import { updateProfile } from "@/app/actions/user";

interface Props {
  user: any;
  orders: any[];
  isAdminView?: boolean;
}

export default function ProfileDashboard({ user, orders, isAdminView = false }: Props) {
  const [activeTab, setActiveTab] = useState<"profile" | "purchases" | "team">("profile");
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
    { id: "team", label: user.role === "PARTNER" ? "Код доступа" : "Мой доступ", icon: <Users size={14} /> },
    { id: "purchases", label: `Заказы (${orders.length})`, icon: <ShoppingBag size={14} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="relative bg-slate-100/50 p-1 rounded-2xl flex gap-1 border border-slate-200 shadow-sm backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "text-[#1e1b4b]" : "text-slate-400 hover:text-slate-600"}`}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabDashboard" className="absolute inset-0 bg-white rounded-xl shadow-md z-[-1] border border-slate-100" transition={{ type: "spring", duration: 0.5, bounce: 0.2 }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          
          {activeTab === "profile" && (
            <div className="bg-white rounded-[32px] border border-white shadow-xl shadow-indigo-900/5 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableCard icon={<User />} label="ФИО" value={formData.name} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, name: v})} />
                <InfoCard icon={<Mail />} label="Email" value={user.email} />
                <EditableCard icon={<Phone />} label="Телефон" value={formData.phone} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, phone: v})} />
                <EditableCard icon={<Globe />} label="Социальные сети" value={formData.socialLink} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, socialLink: v})} />
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center gap-3">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-[#1e1b4b] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Редактировать</button>
                ) : (
                  <button onClick={handleSave} className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Сохранить</button>
                )}
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="bg-white rounded-[32px] border border-white shadow-xl shadow-indigo-900/5 p-8 flex flex-col items-center text-center">
              {user.role === "PARTNER" ? (
                <>
                  <h2 className="text-xl font-black uppercase tracking-tight text-[#1e1b4b] mb-8">Инвайт-код</h2>
                  <div className="w-full max-w-[300px] p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                    <div className="text-3xl font-black tracking-[0.2em] text-[#1e1b4b] mb-4">{user.partnerCode}</div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">Передайте этот код сотрудникам для привязки к вашей сети</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6"><ShieldCheck size={32} /></div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-[#1e1b4b] mb-2">Ваш доступ</h2>
                  <div className="w-full max-w-[400px] bg-slate-50 rounded-[30px] p-6 border border-slate-100 flex flex-col gap-2 text-left">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Ваш партнер / владелец:</p>
                    <h4 className="text-sm font-black uppercase text-[#1e1b4b]">{user.parentPartner?.name || "Unit One Partner"}</h4>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase">ID: {user.referredByCode}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "purchases" && <PurchasesList orders={orders} />}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EditableCard({ icon, label, value, isEditing, onChange }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all">
      <div className="flex items-center gap-2 mb-1 text-slate-400">{React.cloneElement(icon, { size: 12 })}<span className="text-[8px] font-black uppercase tracking-widest">{label}</span></div>
      {isEditing ? <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-[12px] font-bold text-[#1e1b4b]" /> : <div className="text-[13px] font-bold text-[#1e1b4b]">{value || "—"}</div>}
    </div>
  );
}

function InfoCard({ icon, label, value }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-60">
      <div className="flex items-center gap-2 mb-1 text-slate-400">{React.cloneElement(icon, { size: 12 })}<span className="text-[8px] font-black uppercase tracking-widest">{label}</span></div>
      <div className="text-[13px] font-bold text-slate-500">{value}</div>
    </div>
  );
}