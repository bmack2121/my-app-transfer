import React, { useState, useMemo } from 'react';
import { Camera, Trash2, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { hapticSuccess, hapticImpactLight } from '../../utils/haptics';

const AppraisalForm = ({ baseValue, onComplete, onCancel }) => {
  const [deductions, setDeductions] = useState([]);
  
  const commonIssues = [
    { id: 'tires', label: 'Bald/Poor Tires', cost: 600 },
    { id: 'windshield', label: 'Cracked Windshield', cost: 450 },
    { id: 'body', label: 'Significant Dents/Scratches', cost: 1000 },
    { id: 'interior', label: 'Interior Tears/Stains', cost: 350 },
    { id: 'mechanical', label: 'Mechanical Issue (CEL)', cost: 1500 },
    { id: 'smoke', label: 'Smoke/Pet Odor', cost: 400 },
  ];

  const toggleIssue = async (issue) => {
    await hapticImpactLight();
    setDeductions(prev => 
      prev.find(i => i.id === issue.id) 
        ? prev.filter(i => i.id !== issue.id) 
        : [...prev, issue]
    );
  };

  const totalDeductions = useMemo(() => 
    deductions.reduce((sum, item) => sum + item.cost, 0), 
  [deductions]);

  const finalACV = baseValue - totalDeductions;

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 animate-in slide-in-from-bottom-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Trade Appraisal</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-white">Cancel</button>
      </div>

      {/* Value Display */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 mb-8 text-center">
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Estimated ACV</p>
        <h3 className="text-5xl font-black text-blue-400">
          ${finalACV.toLocaleString()}
        </h3>
        <p className="text-slate-600 text-xs mt-2 italic">Base Value: ${baseValue.toLocaleString()}</p>
      </div>

      {/* Deduction Checklist */}
      <div className="space-y-3 mb-8">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Condition Adjustments</label>
        <div className="grid grid-cols-1 gap-2">
          {commonIssues.map((issue) => {
            const isActive = deductions.find(i => i.id === issue.id);
            return (
              <button
                key={issue.id}
                onClick={() => toggleIssue(issue)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isActive 
                    ? 'bg-red-500/10 border-red-500/50 text-white' 
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isActive ? <AlertTriangle size={18} className="text-red-500" /> : <div className="w-[18px]" />}
                  <span className="font-semibold text-sm">{issue.label}</span>
                </div>
                <span className={`font-mono font-bold ${isActive ? 'text-red-400' : 'text-slate-600'}`}>
                  -${issue.cost}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={async () => {
            await hapticSuccess();
            onComplete(finalACV, deductions);
          }}
          className="flex-grow py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          APPROVE VALUE
        </button>
      </div>
    </div>
  );
};

export default AppraisalForm;