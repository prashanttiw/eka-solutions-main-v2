/** Single source of truth for the WhatsApp contact, shared by the float, the CTAs and the
 *  contact section — so the number can never drift between them. */
export const WHATSAPP_NUMBER = '916388752891';
export const WHATSAPP_DISPLAY = '+91 63887 52891';
export const WHATSAPP_MESSAGE = "Hi EKA Solution, I'd like to discuss a software project.";

export const whatsappHref = (message = WHATSAPP_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
