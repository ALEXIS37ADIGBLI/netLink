export const theme = {
  colors: {
    // Palette principale inspirée des réseaux sociaux
    primary: '#E1306C',        // Rose Instagram moderne
    primaryLight: '#F77737',   // Orange/rose (hover, highlights)
    primaryLighter: '#FDDB92', // Jaune doux / pastel (fonds légers)
    primaryDark: '#C13584',    // Violet-rose plus sombre

    // Neutres modernes
    white: '#FFFFFF',          // Fond principal
    lightGray: '#FAFAFA',      // Fond des cartes
    mediumGray: '#E5E5E5',     // Bordures fines
    darkGray: '#9CA3AF',       // Texte secondaire plus doux

    // Texte
    text: '#111827',           // Noir bleuté (titres)
    textLight: '#6B7280',      // Gris moderne (sous-texte)
    textInverted: '#FFFFFF',   // Texte sur fonds colorés

    // Accents et états
    accent: '#0095F6',         // Bleu Instagram (liens, actions)
    error: '#EF4444',          // Rouge moderne (erreurs)
    success: '#10B981',        // Vert frais (validations)
    warning: '#F59E0B',        // Orange doux (alertes)
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
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 5,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 10,
    }
  }
};
