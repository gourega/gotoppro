
// Add React import to avoid UMD global reference error
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Composant utilitaire qui gère le défilement de la fenêtre.
 * À chaque changement de route, il remonte en haut de la page,
 * sauf si une ancre (#) est présente dans l'URL.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Si l'URL ne contient pas d'ancre (ex: #contact), on remonte en haut.
    // Cela permet de respecter les liens internes qui pointent vers des sections précises.
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" // "instant" pour éviter l'effet visuel de défilement pendant le chargement
      });
    } else {
      // Si une ancre est présente, on laisse le navigateur gérer le focus sur l'élément ID
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
