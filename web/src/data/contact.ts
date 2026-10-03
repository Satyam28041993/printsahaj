/**
 * The one place the public contact details live. Swap EMAIL here (for a business
 * address later) and every button, link and form on the site follows.
 */

export const PHONE_DISPLAY = "+91 96507 44197";
export const PHONE_TEL = "tel:+919650744197";
export const WHATSAPP_NUMBER = "919650744197";
export const EMAIL = "singhsatyam28@gmail.com";

export const CONSULT_MESSAGE = "Hi Satyam, I'd like a free consultation for my business";

/** https://wa.me link with a prefilled message. Opens WhatsApp (app or web). */
export function whatsappUrl(message: string = CONSULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** The standard "Book a free consultation" link. */
export const WHATSAPP_URL = "https://wa.me/919650744197?text=Hi%20Satyam%2C%20I%27d%20like%20a%20free%20consultation%20for%20my%20business";
