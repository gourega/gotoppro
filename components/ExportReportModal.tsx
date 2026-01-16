
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { X, FileText, Download, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { KitaTransaction, UserProfile } from '../types';
import { BRAND_LOGO } from '../constants';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: KitaTransaction[];
  user: UserProfile;
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose, transactions, user }) => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'semester' | 'year'>('month');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const generatePDF = async () => {
    setLoading(true);
    const doc = new jsPDF() as any;
    const today = new Date();
    const currentYear = today.getFullYear();

    // Filtrage des données selon la période
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      if (d.getFullYear() !== currentYear) return false;
      
      if (period === 'month') return d.getMonth() === today.getMonth();
      if (period === 'quarter') {
        const q = Math.floor(today.getMonth() / 3);
        return Math.floor(d.getMonth() / 3) === q;
      }
      if (period === 'semester') {
        const s = today.getMonth() < 6 ? 0 : 1;
        const ts = d.getMonth() < 6 ? 0 : 1;
        return s === ts;
      }
      return true; // year
    });

    const income = filtered.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const net = income - expense;

    // Header
    doc.setFillColor(12, 74, 110); // Brand 900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("BILAN FINANCIER", 15, 25);
    
    doc.setFontSize(10);
    doc.text("GO'TOP PRO - L'EXCELLENCE BEAUTÉ", 15, 32);

    // Salon Info
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(12);
    doc.text(`Établissement : ${user.establishmentName || 'Salon Indépendant'}`, 15, 55);
    doc.text(`Gérant : ${user.firstName} ${user.lastName}`, 15, 62);
    doc.text(`Période : ${period.toUpperCase()} - ${currentYear}`, 15, 69);
    doc.text(`Date du rapport : ${today.toLocaleDateString('fr-FR')}`, 150, 55);

    // Summary Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 80, 180, 30, 3, 3, 'FD');
    
    doc.setFontSize(10);
    doc.text("RECETTES TOTALES", 25, 90);
    doc.text("DÉPENSES TOTALES", 80, 90);
    doc.text("BÉNÉFICE NET", 145, 90);
    
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`${income.toLocaleString()} F`, 25, 100);
    doc.setTextColor(244, 63, 94); // Rose
    doc.text(`${expense.toLocaleString()} F`, 80, 100);
    doc.setTextColor(12, 74, 110); // Brand 900
    doc.text(`${net.toLocaleString()} F`, 145, 100);

    // Table
    const tableData = filtered.map(t => [
      new Date(t.date).toLocaleDateString('fr-FR'),
      t.label,
      t.category,
      t.staffName || 'Gérant',
      t.type === 'INCOME' ? `+${t.amount}` : `-${t.amount}`
    ]);

    doc.autoTable({
      startY: 120,
      head: [['Date', 'Opération', 'Catégorie', 'Intervenant', 'Montant (F)']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [12, 74, 110], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Document généré par Go'Top Pro - Standard d'Excellence KITA.", 105, finalY + 20, { align: 'center' });

    doc.save(`Bilan_${user.establishmentName?.replace(/\s/g, '_')}_${period}.pdf`);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl p-10 md:p-14 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Rapport Financier</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X /></button>
        </div>

        <div className="space-y-8">
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Sélectionnez la période de votre bilan. Go'Top Pro générera un certificat comptable au format PDF pour votre gestion ou vos dossiers bancaires.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <PeriodBtn active={period === 'month'} onClick={() => setPeriod('month')} label="Ce Mois" icon={<Calendar className="w-4 h-4" />} />
            <PeriodBtn active={period === 'quarter'} onClick={() => setPeriod('quarter')} label="Trimestre" icon={<Calendar className="w-4 h-4" />} />
            <PeriodBtn active={period === 'semester'} onClick={() => setPeriod('semester')} label="Semestre" icon={<Calendar className="w-4 h-4" />} />
            <PeriodBtn active={period === 'year'} onClick={() => setPeriod('year')} label="Année" icon={<Calendar className="w-4 h-4" />} />
          </div>

          <button 
            onClick={generatePDF} 
            disabled={loading}
            className="w-full bg-brand-900 text-white py-6 rounded-2xl font-black uppercase text-[11px] shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Download className="w-5 h-5" />}
            Télécharger le Bilan PDF
          </button>
        </div>
      </div>
    </div>
  );
};

const PeriodBtn = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
      active ? 'bg-brand-50 border-brand-500 text-brand-900 scale-105 shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default ExportReportModal;
