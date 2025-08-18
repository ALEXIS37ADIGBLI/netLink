export const theme = {
  colors: {
    // Palette bleue principale
    primary: '#1D4ED8',        // Bleu riche (Boutons principaux)
    primaryLight: '#3B82F6',   // Bleu vif (Hover/Active states)
    primaryLighter: '#93C5FD', // Bleu très clair (Arrière-plans)
    primaryDark: '#1E40AF',    // Bleu foncé (Boutons pressés)
    
    // Neutres
    white: '#FFFFFF',          // Fond principal
    lightGray: '#F3F4F6',      // Arrière-plans secondaires
    mediumGray: '#E5E7EB',     // Bordures/Séparateurs
    darkGray: '#6B7280',       // Texte secondaire
    
    // Texte
    text: '#111827',           // Noir bleuté (Texte principal)
    textLight: '#4B5563',      // Texte secondaire
    textInverted: '#FFFFFF',   // Texte sur fond coloré
    
    // Accents et états
    accent: '#2563EB',         // Bleu intermédiaire
    error: '#DC2626',          // Rouge vif (Erreurs)
    success: '#10B981',        // Vert émeraude (Succès)
    warning: '#F59E0B',        // Orange ambré (Alertes)
  },

  fonts: {
    medium: '500',
    semibold: '600',
    bold: '700',
    extraBold: '800',
  },

  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  shadows: {
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: '#1E40AF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 10,
    }
  }
};