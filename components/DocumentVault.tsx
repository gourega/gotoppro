
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  ShieldCheck, 
  FileText, 
  FileSearch, 
  Download, 
  X, 
  Loader2, 
  CheckCircle2, 
  Award,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { UserProfile } from '../types';
import { KITA_LOGO, BRAND_LOGO, COACH_KITA_FULL_NAME, COACH_KITA_PHONE, COACH_KITA_ADDRESS } from '../constants';

interface DocumentVaultProps {
  user: UserProfile;
  isElite: boolean;
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ user, isElite }) => {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateInvoicePDF = () => {
    setLoading(true);
    const doc = new jsPDF() as any;
    const today = new Date();
    const invoiceDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : today.toLocaleDateString('fr-FR');
    
    const packName = isElite ? "Pack Excellence Totale (Go'Top Pro)" : `Pack Formation (${user.purchasedModuleIds.length} modules)`;
    const amount = isElite ? 15000 : (user.purchasedModuleIds.length * 500);

    // --- Header Style ---
    doc.setFillColor(12, 74, 110); // brand-900
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text("FACTURE D'HONNEUR", 15, 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("Standard d'Excellence KITA — V2.5", 15, 40);

    // --- Invoice Info ---
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.text(`Facture N° : INV-${user.uid.substring(0,6).toUpperCase()}`, 150, 65);
    doc.text(`Date : ${invoiceDate}`, 150, 72);

    // --- Vendor & Client ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("ÉMETTEUR :", 15, 65);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(COACH_KITA_FULL_NAME, 15, 72);
    doc.text("CANTIC THINK IA", 15, 77);
    doc.text(COACH_KITA_ADDRESS, 15, 82);
    doc.text(`WhatsApp : ${COACH_KITA_PHONE}`, 15, 87);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("CLIENT :", 15, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${user.firstName} ${user.lastName}`, 15, 112);
    doc.text(user.establishmentName || "Établissement Indépendant", 15, 117);
    doc.text(`ID Gérant : ${user.phoneNumber}`, 15, 122);

    // --- Table ---
    doc.autoTable({
      startY: 135,
      head: [['Description de l\'Investissement', 'Type', 'Prix Unitaire', 'Total (F CFA)']],
      body: [
        [packName, 'Licence Unique', `${amount.toLocaleString()} F`, `${amount.toLocaleString()} F`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [12, 74, 110], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } }
    });

    // --- Total ---
    const finalY = (doc as any).lastAutoTable.finalY || 160;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("MONTANT TOTAL RÉGLÉ :", 110, finalY + 20);
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`${amount.toLocaleString()} F CFA`, 160, finalY + 20, { align: 'right' });

    // --- Stamp & Legal ---
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(1);
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(14);
    doc.rect(140, finalY + 40, 50, 20);
    doc.text("PAYÉ", 155, finalY + 53);
    
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text("Cette facture atteste du paiement intégral via Wave CI.", 15, finalY + 80);
    doc.text("Go'Top Pro est une propriété exclusive de CANTICTHINKIA.", 15, finalY + 85);

    doc.save(`Facture_GoTopPro_${user.establishmentName?.replace(/\s/g, '_')}.pdf`);
    setLoading(false);
  };

  const renderAuditContent = () => {
    if (!user.strategicAudit) {
      return (
        <div className="py-20 text-center">
           <FileSearch className="w-16 h-16 text-slate-200 mx-auto mb-6" />
           <p className="text-slate-400 font-medium italic">"Aucun diagnostic initial enregistré. <br/>Réalisez votre Audit Miroir pour débloquer cet acte."</p>
        </div>
      );
    }

    return (
      <div className="prose-kita max-w-none">
        {user.strategicAudit.split('\n').map((line, i) => {
          if (line.startsWith('###')) return <h3 key={i} className="text-xl font-bold text-brand-900 mt-6 mb-4">{line.replace(/### /g, '')}</h3>;
          if (line.trim() === '---') return <hr key={i} className="my-6 border-slate-100" />;
          let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-900 font-black">$1</strong>');
          return <p key={i} className="text-sm text-slate-600 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: processed }} />;
        })}
      </div>
    );
  };

  return (
    <section className="bg-brand-900 rounded-[4rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group border border-brand-800">
      <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform group-hover:scale-110 duration-1000">
        <ShieldCheck className="w-48 h-48 text-amber-400" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-10">
           <div className="h-12 w-12 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
              <Award className="w-6 h-6 text-brand-900" />
           </div>
           <div>
              <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Mon Coffre-Fort Stratégique</h2>
              <p className="text-amber-400/60 font-black text-[9px] uppercase tracking-[0.3em]">Actes Officiels & Preuves d'Investissement</p>
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           {/* CARTE FACTURE */}
           <button 
             onClick={generateInvoicePDF}
             disabled={loading}
             className="bg-white/5 hover:bg-white/10 border border-white/10 p-8 rounded-[2.5rem] text-left transition-all group/card flex items-center justify-between shadow-xl"
           >
              <div className="flex items-center gap-6">
                 <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-amber-400 group-hover/card:scale-110 transition-transform">
                    <FileText className="w-7 h-7" />
                 </div>
                 <div>
                    <h3 className="text-white font-bold text-lg mb-1">Ma Facture d'Honneur</h3>
                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Preuve d'investissement Go'Top Pro</p>
                 </div>
              </div>
              {loading ? <Loader2 className="w-5 h-5 text-amber-400 animate-spin" /> : <Download className="w-5 h-5 text-slate-500 group-hover/card:text-amber-400" />}
           </button>

           {/* CARTE AUDIT */}
           <button 
             onClick={() => setIsAuditModalOpen(true)}
             className="bg-white/5 hover:bg-white/10 border border-white/10 p-8 rounded-[2.5rem] text-left transition-all group/card flex items-center justify-between shadow-xl"
           >
              <div className="flex items-center gap-6">
                 <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 group-hover/card:scale-110 transition-transform">
                    <FileSearch className="w-7 h-7" />
                 </div>
                 <div>
                    <h3 className="text-white font-bold text-lg mb-1">Mon Diagnostic Initial</h3>
                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Le Baseline du salon au Jour 0</p>
                 </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover/card:text-emerald-400" />
           </button>
        </div>
      </div>

      {/* MODAL AUDIT */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
           <div className="bg-white w-full max-w-3xl rounded-[4rem] shadow-2xl p-10 md:p-14 relative animate-in zoom-in-95 max-h-[85vh] flex flex-col">
              <button 
                onClick={() => setIsAuditModalOpen(false)}
                className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-rose-500 transition-colors"
              >
                 <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8 shrink-0">
                 <div className="h-20 w-20 rounded-[1.5rem] bg-brand-900 flex items-center justify-center shadow-xl shadow-brand-900/20">
                    <FileSearch className="w-10 h-10 text-emerald-400" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Rapport de Diagnostic Initial</h2>
                    <p className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em]">Document certifié par Coach Kita</p>
                 </div>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar pr-6">
                 {renderAuditContent()}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Archivé le {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}</span>
                 </div>
                 <button 
                   onClick={() => window.print()}
                   className="bg-brand-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all"
                 >
                    <Eye className="w-4 h-4" /> Imprimer Rapport
                 </button>
              </div>
           </div>
        </div>
      )}
    </section>
  );
};

export default DocumentVault;
