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
  invitationLabel: "TAKLIFNOMA",
  name: "Madina",
  quote: "Har bir soniya siz bilan mazmunli va chiroyli bo‘lishiga ishonaman. Agar siz ham qarshi bo‘lmasangiz, bu kunni birga chiroyli xotiraga aylantirsak ! 😊",
  question: "Men bilan uchrashishga rozi bo‘lasizmi?",
  yesButton: "Ha 💕",
  noButton: "Yo‘q",
  locationQuestion: "Ajoyib! 🥳 Qayerga boramiz?",
  locations: [
    "☕ Kafe",
    "🎬 Kino",
    "✨ Sayr"
  ],
  dateQuestion: "Qachon?",
  dates: [
    "31-avgust 17:00 (Shahrisabz)"
  ],
  submitButton: "Yuborish 💌",
  successTitle: "Rahmat ! Uchrashuvimiz belgilandi! 💕",
  successMessage: "Sizni ko‘rishni intiqlik bilan kutaman.",
  senderName: "Saidakbar",
  noButtonTexts: [
    "Yana bir bor o'ylab ko'ring! 😃",
    "Atigi 1 soat vaqtingizni olaman, xolos!",
    "Shunchaki \"Ha\"ni bosing, pushaymon bo'lmaysiz! 😉",
    "Yo'q deb aytishga baribir yo'l qo'ymayman!",
    "Baribir qochib qutula olmaysiz! 😜",
    "Bitta kofe ichamiz, xolos, rozi bo'la qoling!",
    "Bu tugma baribir ishlamaydi!",
    "Qanchalik harakat qilmang, \"Ha\"ni bosasiz!",
    "Rostdan ham rad etmoqchimisiz? 🥺",
    "Axir juda zo'r vaqt o'tkazamiz!",
    "Bitta imkoniyat bering! ✨",
    "Taqdiringizdan qochib qutula olmaysiz!",
    "Shu tugmani ushlab ko'ring-chi? 🏃‍♂️",
    "\"Yo'q\" degan javob qabul qilinmaydi!",
    "Baribir taslim bo'lasiz!",
    "\"Ha\" tugmasi ancha chiroyli ko'rinyapti, to'g'rimi?",
    "O'zingizni qiynamay, yashil tugmani bosing! 😊",
    "Yomon niyatim yo'q, shunchaki ko'rishaylik!",
    "Bu tugmani bosish uchun juda tez bo'lishingiz kerak!",
    "Baribir \"Ha\" deyishingizni bilardim! ❤️"
  ],
  
  // Default styling configurations
  accentColor: "#db2777", // pink-600
  bgColor: "#fffcf9",     // very warm cream background
  fontFamily: "Playfair Display",
  buttonStyle: "rounded-full"
};

