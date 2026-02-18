import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { User, Shield, Briefcase, Mail, Star, Loader2, Award } from 'lucide-react';

const TeamPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axiosClient.get("/auth/team");
        setTeam(res.data);
      } catch (err) {
        console.error("Team load failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">VinPro Roster</h1>
          <p className="text-slate-500 font-medium">Dealership Performance & Team Directory</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member._id} className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 relative group transition-all hover:border-indigo-200">
              
              {/* Role Icon */}
              <div className="absolute top-8 right-8 text-slate-200 group-hover:text-indigo-100 transition-colors">
                {member.role === 'admin' ? <Shield size={32} /> : <Briefcase size={32} />}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <User size={30} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{member.name}</h3>
                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase tracking-widest">
                    {member.role}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <Mail size={16} /> {member.email}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  <Star size={16} className="text-amber-400" /> Member since {new Date(member.createdAt).getFullYear()}
                </div>
              </div>

              {/* Performance Stats Block */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Deals Closed</p>
                  <p className="text-2xl font-black text-slate-900">{member.stats?.totalDealsClosed || 0}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Progress</p>
                  <p className="text-2xl font-black text-emerald-600">{member.goalProgress || 0}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {team.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
            <Award className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold">No team members found. Start by registering an account.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;