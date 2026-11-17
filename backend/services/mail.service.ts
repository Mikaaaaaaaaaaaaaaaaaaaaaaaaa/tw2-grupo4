import nodemailer from "nodemailer";

export async function enviarMail(para: string, asunto: string, html: string) {
  // Cuenta de prueba gratuita de Ethereal (se crea sola, necesita internet)
  const cuenta = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: cuenta.smtp.host,
    port: cuenta.smtp.port,
    secure: cuenta.smtp.secure,
    auth: { user: cuenta.user, pass: cuenta.pass },
  });

  const info = await transporter.sendMail({
    from: '"TechStore" <no-reply@techstore.com>',
    to: para,
    subject: asunto,
    html,
  });

  // Link para ver el mail en el navegador
  console.log("Mail de prueba:", nodemailer.getTestMessageUrl(info));
}