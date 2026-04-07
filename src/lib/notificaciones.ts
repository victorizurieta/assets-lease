import { db } from '@/lib/db';

interface NotificacionData {
  tipo: 'email' | 'whatsapp';
  destino: string;
  asunto?: string;
  mensaje: string;
  clienteId?: string;
  renovacionId?: string;
}

// Crear registro de notificación en la base de datos
export async function registrarNotificacion(data: NotificacionData) {
  return await db.notificacion.create({
    data: {
      tipo: data.tipo,
      destino: data.destino,
      asunto: data.asunto,
      mensaje: data.mensaje,
      clienteId: data.clienteId,
      renovacionId: data.renovacionId,
      estado: 'pendiente',
    }
  });
}

// Enviar notificación por email
export async function enviarEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const config = await db.configuracion.findFirst();

    if (!config?.emailApiKey) {
      return { success: false, error: 'API Key de Resend no configurada' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html, text }),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Notificación de renovación próxima
export async function notificarRenovacionProxima(
  clienteId: string,
  renovacionId: string,
  emailCliente: string,
  nombreCliente: string,
  fechaVencimiento: Date,
  unidades: number
) {
  const fechaFormateada = fechaVencimiento.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const subject = `Recordatorio de Renovación - ${nombreCliente}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Recordatorio de Renovación</h1>
        </div>
        <div class="content">
          <p>Estimado/a <strong>${nombreCliente}</strong>,</p>
          
          <p>Le informamos que su servicio de rastreo GPS está próximo a vencer.</p>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>📊 Detalles:</strong></p>
            <p style="margin: 5px 0;">• <strong>Fecha de vencimiento:</strong> ${fechaFormateada}</p>
            <p style="margin: 5px 0;">• <strong>Unidades contratadas:</strong> ${unidades}</p>
          </div>
          
          <p>Para evitar interrupciones en el servicio, le recomendamos realizar la renovación antes de la fecha indicada.</p>
          
          <p>Si tiene alguna pregunta o desea realizar la renovación, no dude en contactarnos.</p>
          
          <p style="margin-top: 30px;">Atentamente,<br><strong>Equipo de Soporte</strong></p>
        </div>
        <div class="footer">
          <p>Este es un correo automático, por favor no responda directamente.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Recordatorio de Renovación

Estimado/a ${nombreCliente},

Le informamos que su servicio de rastreo GPS está próximo a vencer.

Detalles:
- Fecha de vencimiento: ${fechaFormateada}
- Unidades contratadas: ${unidades}

Para evitar interrupciones en el servicio, le recomendamos realizar la renovación antes de la fecha indicada.

Atentamente,
Equipo de Soporte
  `;

  // Registrar notificación
  const notificacion = await registrarNotificacion({
    tipo: 'email',
    destino: emailCliente,
    asunto: subject,
    mensaje: text,
    clienteId,
    renovacionId,
  });

  // Enviar email
  const resultado = await enviarEmail(emailCliente, subject, html, text);

  // Actualizar estado de notificación
  if (resultado.success) {
    await db.notificacion.update({
      where: { id: notificacion.id },
      data: { 
        estado: 'enviada',
        enviadaAt: new Date()
      }
    });
  } else {
    await db.notificacion.update({
      where: { id: notificacion.id },
      data: { 
        estado: 'fallida',
        error: resultado.error
      }
    });
  }

  return resultado;
}

// Verificar y enviar notificaciones de renovaciones próximas
export async function verificarRenovacionesProximas() {
  const config = await db.configuracion.findFirst();
  const diasAlerta = config?.diasAlertaRenovacion || 7;
  
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + diasAlerta);

  // Buscar renovaciones que vencen pronto y no han sido notificadas
  const renovaciones = await db.renovacion.findMany({
    where: {
      estado: 'vigente',
      notificado: false,
      fechaVencimiento: {
        lte: fechaLimite,
        gte: new Date()
      }
    },
    include: {
      cliente: true,
      unidad: true
    }
  });

  const resultados = [];
  
  for (const renovacion of renovaciones) {
    if (renovacion.cliente.email) {
      const resultado = await notificarRenovacionProxima(
        renovacion.clienteId,
        renovacion.id,
        renovacion.cliente.email,
        renovacion.cliente.nombre,
        renovacion.fechaVencimiento,
        1 // Se podría calcular el total de unidades del cliente
      );

      if (resultado.success) {
        // Marcar como notificado
        await db.renovacion.update({
          where: { id: renovacion.id },
          data: { notificado: true }
        });
      }

      resultados.push({
        renovacionId: renovacion.id,
        cliente: renovacion.cliente.nombre,
        resultado
      });
    }
  }

  return resultados;
}