import { Resend } from "resend";
import type { Reservation } from "./db/schema";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

export async function sendReservationEmail(reservation: Reservation & { customerUsername?: string }) {
  const restaurantEmail = process.env.RESTAURANT_EMAIL;
  if (!restaurantEmail || !process.env.RESEND_API_KEY) return;

  const subject = `Nueva reserva: ${reservation.customerName} — ${reservation.date} ${reservation.time}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #92400e;">Nueva Reserva — El Kiosco Café Bar</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Cliente</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reservation.customerName}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Teléfono</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reservation.phone}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Fecha</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reservation.date}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Hora</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reservation.time}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Personas</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reservation.guests}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Ocasión</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${reservation.occasion || "No especificada"}</td></tr>
        <tr><td style="padding: 8px;"><strong>Notas</strong></td><td style="padding: 8px;">${reservation.notes || "—"}</td></tr>
      </table>
      ${reservation.customerUsername ? `<p style="color: #6b7280; font-size: 14px;">Instagram: @${reservation.customerUsername}</p>` : ""}
      <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Enviado automáticamente por el Agente IA de El Kiosco</p>
    </div>
  `;

  await getResend().emails.send({
    from: "El Kiosco IA <onboarding@resend.dev>",
    to: [restaurantEmail],
    subject,
    html,
  });
}

export async function sendCancellationEmail(reservation: Reservation) {
  const restaurantEmail = process.env.RESTAURANT_EMAIL;
  if (!restaurantEmail || !process.env.RESEND_API_KEY) return;

  await getResend().emails.send({
    from: "El Kiosco IA <onboarding@resend.dev>",
    to: [restaurantEmail],
    subject: `Cancelación: ${reservation.customerName} — ${reservation.date} ${reservation.time}`,
    html: `<p>El cliente <strong>${reservation.customerName}</strong> canceló su reserva para el <strong>${reservation.date}</strong> a las <strong>${reservation.time}</strong> (${reservation.guests} personas).</p>`,
  });
}
