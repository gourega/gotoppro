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
  Eye,
  Globe,
  PenTool
} from 'lucide-react';
import { UserProfile } from '../types';
import { KITA_LOGO, BRAND_LOGO, COACH_KITA_FULL_NAME, COACH_KITA_PHONE, COACH_KITA_ADDRESS, COACH_KITA_ESTABLISHMENT } from '../constants';

interface DocumentVaultProps {
  user: UserProfile;
  isElite: boolean;
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ user, isElite }) => {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatCFA = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const generateGMBContractPDF = () => {
    setLoading(true);
    const doc = new jsPDF() as any;
    const today = new Date();
    const signDate = user.gmbContractSignedAt ? new Date(user.gmbContractSignedAt).toLocaleDateString('fr-FR') : today.toLocaleDateString('fr-FR');
    
    // --- Header ---
    doc.setFillColor(12, 74, 110);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("CONTRAT DE VISIBILITÉ DIGITALE", 15, 30);
    doc.setFontSize(10);
    doc.text("Standard d'Excellence KITA — Google My Business", 15, 40);

    // --- Parties ---
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("PRESTATAIRE :", 15, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(COACH_KITA_ESTABLISHMENT, 15, 72);
    doc.text(COACH_KITA_ADDRESS, 15, 77);

    doc.setFont('helvetica', 'bold');
    doc.text("BÉNÉFICIAIRE :", 110, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`${user.firstName} ${user.lastName}`, 110, 72);
    doc.text(user.establishmentName || "Salon Go'Top", 110, 77);
    doc.text(`Tél : ${user.phoneNumber}`, 110, 82);

    // --- Clauses ---
    doc.setFont('helvetica', 'bold');
    doc.text("ARTICLE 1 : OBJET DE LA MISSION", 15, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text("Le présent contrat a pour objet la création, le paramétrage et l'optimisation SEO de la fiche Google My Business", 15, 107);
    doc.text("de l'établissement cité ci-dessus par l'équipe d'experts Go'Top Pro.", 15, 112);

    doc.setFont('helvetica', 'bold');
    doc.text("ARTICLE 2 : DURÉE ET MAINTENANCE", 15, 125);
    doc.setFont('helvetica', 'normal');
    doc.text("Le contrat est conclu pour une durée de 12 mois renouvelables. Durant cette période, le prestataire assure", 15, 132);
    doc.text("la mise à jour technique des informations et le support en cas de suspension de la fiche par Google.", 15, 137);

    doc.setFont('helvetica', 'bold');
    doc.text("ARTICLE 3 : INVESTISSEMENT", 15, 150);
    doc.setFont('helvetica', 'normal');
    doc.text("Le montant total de la prestation s'élève à 5 000 F CFA, payable en une seule fois via Wave.", 15, 157);

    doc.setFont('helvetica', 'bold');
    doc.text("ARTICLE 4 : OBLIGATIONS", 15, 170);
    doc.setFont('helvetica', 'normal');
    doc.text("- Le prestataire s'engage à livrer la fiche sous 10 jours ouvrés après réception du paiement et des photos.", 15, 177);
    doc.text("- Le bénéficiaire s'engage à fournir des photos de haute qualité et des informations exactes.", 15, 182);

    // --- Signatures ---
    const finalY = 220;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, finalY, 195, finalY);

    doc.setFontSize(10);
    doc.text("Signature du Mentor (Kita)", 15, finalY + 15);
    doc.text("Signature du Gérant (Digitale)", 120, finalY + 15);
    
    doc.setFontSize(8);
    doc.text("CANTIC THINK IA — Cachet Officiel", 15, finalY + 22);
    doc.text(`Signé le : ${signDate}`, 120, finalY + 22);
    doc.text(`ID Transaction : ${user.uid.substring(0,8).toUpperCase()}`, 120, finalY + 27);

    // Cadre Signature Digitale
    doc.setDrawColor(16, 185, 129);
    doc.rect(120, finalY + 35, 60, 25);
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(12);
    doc.text("CONTRAT SCELLÉ", 125, finalY + 50);

    doc.save(`Contrat_GMB_${user.establishmentName?.replace(/\s/g, '_')}.pdf`);
    setLoading(false);
  };

  const generateInvoicePDF = () => {
    setLoading(true);
    const doc = new jsPDF() as any;
    const today = new Date();
    const invoiceDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : today.toLocaleDateString('fr-FR');
    
    const trainingAmount = isElite ? 15000 : (user.purchasedModuleIds.length * 500);
    const gmbAmount = user.gmbStatus !== 'NONE' ? 5000 : 0;
    const totalAmount = trainingAmount + gmbAmount;
    
    const formattedAmount = formatCFA(totalAmount);

    // --- Header ---
    doc.setFillColor(12, 74, 110);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text("FACTURE D'HONNEUR", 15, 30);
    doc.setFontSize(10);
    doc.text("Standard d'Excellence KITA — V2.5", 15, 40);

    // --- Vendor & Client ---
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("CLIENT :", 15, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${user.firstName} ${user.lastName}`, 15, 112);
    doc.text(user.establishmentName || "Établissement Indépendant", 15, 117);

    const body = [];
    if (trainingAmount > 0) {
      body.push([isElite ? "Pack Excellence Totale" : "Modules Académie", 'Licence Unique', `${formatCFA(trainingAmount)} F`, `${formatCFA(trainingAmount)} F`]);
    }
    if (gmbAmount > 0) {
      body.push(["Contrat Visibilité Google (GMB)", 'Prestation 12 mois', "5 000 F", "5 000 F"]);
    }

    doc.autoTable({
      startY: 135,
      head: [['Description', 'Type', 'Prix Unitaire', 'Total']],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [12, 74, 110] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 160;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL RÉGLÉ : ${formattedAmount} F CFA`, 15, finalY + 20);

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
              <p className="text-amber-400/60 font-black text-[9px] uppercase tracking-[0.3em]">Actes Officiels & Contrats</p>
           </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <h3 className="text-white font-bold text-lg mb-1">Ma Facture</h3>
                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Preuve d'investissement</p>
                 </div>
              </div>
              {loading ? <Loader2 className="w-5 h-5 text-amber-400 animate-spin" /> : <Download className="w-5 h-5 text-slate-500 group-hover/card:text-amber-400" />}
           </button>

           {/* CARTE CONTRAT GMB (Si actif ou en attente) */}
           {user.gmbContractSignedAt && (
             <button 
               onClick={generateGMBContractPDF}
               disabled={loading}
               className="bg-white/5 hover:bg-white/10 border border-white/10 p-8 rounded-[2.5rem] text-left transition-all group/card flex items-center justify-between shadow-xl"
             >
                <div className="flex items-center gap-6">
                   <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-sky-400 group-hover/card:scale-110 transition-transform">
                      <PenTool className="w-7 h-7" />
                   </div>
                   <div>
                      <h3 className="text-white font-bold text-lg mb-1">Mon Contrat GMB</h3>
                      <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Prestation Visibilité</p>
                   </div>
                </div>
                {loading ? <Loader2 className="w-5 h-5 text-sky-400 animate-spin" /> : <Download className="w-5 h-5 text-slate-500 group-hover/card:text-sky-400" />}
             </button>
           )}

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
                    <h3 className="text-white font-bold text-lg mb-1">Mon Diagnostic</h3>
                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Le Baseline du salon</p>
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
                    <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Rapport de Diagnostic</h2>
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
                   className="bg-brand-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all"
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