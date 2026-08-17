export interface InvitationSettings {
  invitationLabel: string;
  name: string;
  quote: string;
  question: string;
  yesButton: string;
  noButton: string;
  locationQuestion: string;
  locations: string[];
  dateQuestion: string;
  dates: string[];
  submitButton: string;
  successTitle: string;
  successMessage: string;
  senderName: string; // e.g., 'Ahror'
  noButtonTexts: string[]; // List of playful dialogs when clicking No
  
  // Style configurations
  accentColor: string; // e.g., '#ec4899' (pink) or '#be123c' (rose)
  bgColor: string; // e.g., '#fdfaf7' (cream) or '#fff5f5'
  fontFamily: string; // 'Playfair Display' | 'Cormorant Garamond' | 'Great Vibes' | 'Allura' | 'Inter'
  buttonStyle: 'rounded-full' | 'rounded-lg' | 'rounded-none';
}

export const DEFAULT_SETTINGS: InvitationSettings = {
  invitationLabel: "MAXSUS TAKLIFNOMA",
  name: "Sevinch",
  quote: "Har bir kun Siz bilan yanada mazmunli bo‘lishiga ishonaman. Birga vaqt o‘tkazsak, men uchun katta baxt bo‘lardi.",
  question: "Men bilan uchrashishga rozi bo‘lasizmi?",
  yesButton: "Ha 💕",
  noButton: "Yo‘q",
  locationQuestion: "Giyovib! 🎉 Qayerga boramiz?",
  locations: [
    "☕ Kafe",
    "🍽 Restoran",
    "🎬 Kino"
  ],
  dateQuestion: "Qachon?",
  dates: [
    "Shanba, 18:00",
    "Yakshanba, 16:00"
  ],
  submitButton: "Yuborish 💌",
  successTitle: "Uchrashuvimiz belgilandi! 💕",
  successMessage: "Sizni ko‘rishni intiqlik bilan kutaman.",
  senderName: "Ahror",
  noButtonTexts: [
    "Yana bir o‘ylab ko‘ring 🥺",
    "Atigi 1 soat vaqtingizni olaman ☕",
    "Ha ni bosa qolaylik 💕",
    "Rostdanmi? 💔",
    "Keling, 'Ha 💕' tugmasini bosaylik! 🥰"
  ],
  
  // Default styling configurations
  accentColor: "#db2777", // pink-600
  bgColor: "#fffcf9",     // very warm cream background
  fontFamily: "Playfair Display",
  buttonStyle: "rounded-full"
};

