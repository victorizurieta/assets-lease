import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// GET - Probar configuración de email
export async function GET() {
  try {
    const { db } = await import('@/lib/db');
    const config = await db.configuracion.findFirst();
    
    if (!config?.emailApiKey) {
      return NextResponse.json({ 
        configured: false, 
        error: 'API Key de Resend no configurada' 
      });
    }

    return NextResponse.json({ 
      configured: true,
      emailRemitente: config.emailRemitente 
    });
  } catch (error) {
    return NextResponse.json({ configured: false, error: 'Error al verificar configuración' });
  }
}

// POST - Enviar email
export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    const config = await db.configuracion.findFirst();

    if (!config?.emailApiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'API Key de Resend no configurada. Vaya a Administración para configurarla.' 
      }, { status: 400 });
    }

    const resend = new Resend(config.emailApiKey);
    
    const body = await request.json();
    const { to, subject, html, text } = body;

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan campos requeridos: to, subject, html o text' 
      }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: config.emailRemitente || 'onboarding@resend.dev',
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
      text: text,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data 
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error al enviar email' 
    }, { status: 500 });
  }
}