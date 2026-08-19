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
    "Yana bir o‘ylab ko‘ring 🥺",
    "Atigi 1 soat vaqtingizni olaman ☕",
    "Ha ni bosa qolaylik 💕",
    "Rostdanmi? 💔",
    "Menga rad javobini berish osonmi? 🥺",
    "Yuragimni parchalayapsiz 😭",
    "Rostdan ham bormaysizmi? 🥀",
    "Bitta shirinlik olib beraman! 🧁",
    "Meni xafa qilmang 🥺",
    "Uchrashsak ajoyib bo‘ladi-da ✨",
    "Keyin afsuslanib yurmang 😜",
    "Ha ni bosishingizni bilaman! 🥰",
    "Keling, 'Ha 💕' deb qo‘yaqoling 🙏",
    "Bir marta, iltimos 🥺",
    "Faqat bir chashka kofe uchun ☕",
    "Kino tomosha qilamiz 🎬",
    "Va’da beraman, zerikmaysiz! ✨",
    "Yo‘q tugmasi charchadi 😜",
    "Nega unchalik bag‘ritoshsiz? 💔",
    "Ha degin iltimos 🥺"
  ],
  
  // Default styling configurations
  accentColor: "#db2777", // pink-600
  bgColor: "#fffcf9",     // very warm cream background
  fontFamily: "Playfair Display",
  buttonStyle: "rounded-full"
};

