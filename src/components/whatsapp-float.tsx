import { schoolConfig } from "@/config/school";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par les formations de ${schoolConfig.name}.`
  );
  const href = `https://wa.me/${schoolConfig.whatsapp.replace(/[^0-9]/g, "")}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
    </a>
  );
}
