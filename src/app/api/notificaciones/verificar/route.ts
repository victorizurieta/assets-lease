import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Resend from 'resend';

// POST - Verificar y enviar notificaciones de renovaciones próximas
export async function POST() {
  try {
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

    let enviadas = 0;
    let errores = 0;

    for (const renovacion of renovaciones) {
      if (!renovacion.cliente.email) {
        errores++;
        continue;
      }

      try {
        const fechaFormateada = renovacion.fechaVencimiento.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });

        const subject = `Recordatorio de Renovación - ${renovacion.cliente.nombre}`;
        
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #10b981;">📅 Recordatorio de Renovación</h2>
            <p>Estimado/a <strong>${renovacion.cliente.nombre}</strong>,</p>
            <p>Le informamos que su servicio de rastreo GPS está próximo a vencer.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Fecha de vencimiento:</strong> ${fechaFormateada}</p>
              <p style="margin: 5px 0;"><strong>Unidad:</strong> ${renovacion.unidad.placa}</p>
            </div>
            <p>Para evitar interrupciones en el servicio, le recomendamos realizar la renovación antes de la fecha indicada.</p>
          </div>
        `;

        // Registrar notificación
        const notificacion = await db.notificacion.create({
          data: {
            tipo: 'email',
            destino: renovacion.cliente.email,
            asunto: subject,
            mensaje: `Recordatorio de renovación para ${renovacion.cliente.nombre}`,
            clienteId: renovacion.clienteId,
            renovacionId: renovacion.id,
            estado: 'pendiente',
          }
        });

        // Enviar email si hay API key configurada
        if (config?.emailApiKey) {
          const resend = new Resend(config.emailApiKey);
          
          const { data, error } = await resend.emails.send({
            from: config.emailRemitente || 'onboarding@resend.dev',
            to: [renovacion.cliente.email],
            subject: subject,
            html: html,
          });

          if (error) {
            await db.notificacion.update({
              where: { id: notificacion.id },
              data: { estado: 'fallida', error: error.message }
            });
            errores++;
          } else {
            await db.notificacion.update({
              where: { id: notificacion.id },
              data: { estado: 'enviada', enviadaAt: new Date() }
            });
            
            // Marcar renovación como notificada
            await db.renovacion.update({
              where: { id: renovacion.id },
              data: { notificado: true }
            });
            
            enviadas++;
          }
        } else {
          errores++;
        }
      } catch (error) {
        errores++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      total: renovaciones.length,
      enviadas,
      errores 
    });
  } catch (error) {
    console.error('Error verificando renovaciones:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al verificar renovaciones' 
    }, { status: 500 });
  }
}