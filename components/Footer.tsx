import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1e293b] text-white py-10 px-6 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          
          {/* Bloc 1: Identité et Question */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold font-serif tracking-tight">
              Go'Top <span className="text-brand-500">Pro</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Une question ? Notre équipe d'experts est à votre disposition pour vous accompagner vers l'excellence.
            </p>
          </div>

          {/* Bloc 2: Contacts & Services */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contacts & Services</h4>
            <div className="flex flex-col gap-3 text-sm font-medium">
              <a 
                href="mailto:ourega.goble@canticthinkia.ci" 
                className="text-slate-300 hover:text-brand-400 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                ourega.goble@canticthinkia.ci
              </a>
              <a 
                href="https://wa.me/2250103438456" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-300 hover:text-brand-400 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp: +225 0103438456
              </a>
            </div>
          </div>

          {/* Bloc 3: Liens Légaux */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Légal</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/mentions-legales" className="text-slate-400 hover:text-white transition-colors">Mentions légales</Link>
              <Link to="/confidentialite" className="text-slate-400 hover:text-white transition-colors">Confidentialité</Link>
              <Link to="/cgv" className="text-slate-400 hover:text-white transition-colors">CGV</Link>
            </div>
          </div>

        </div>

        {/* Barre de pied de page (Copyright & Admin) */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            © {new Date().getFullYear()} Go'Top Pro. Propulsé par CanticThinkia.
          </div>
          
          <div className="flex items-center gap-4">
            {/* Cadenas anonyme pour l'accès Admin */}
            <Link 
              to="/admin" 
              aria-label="Accès sécurisé"
              title="Accès sécurisé"
              className="text-slate-600 hover:text-brand-400 transition-colors duration-300"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8-0v4h8z" 
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;