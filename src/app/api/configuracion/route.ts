import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener configuración
export async function GET() {
  try {
    // Siempre retorna la primera configuración (solo debe haber una)
    const config = await db.configuracion.findFirst();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

// POST - Crear configuración
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Verificar si ya existe una configuración
    const existing = await db.configuracion.findFirst();
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 });
    }

    const config = await db.configuracion.create({
      data: {
        nombreEmpresa: data.nombreEmpresa || 'GPS Admin',
        zonaHoraria: data.zonaHoraria || 'America/Panama',
        moneda: data.moneda || 'USD',
        diasAlertaRenovacion: data.diasAlertaRenovacion || 7,
        emailRemitente: data.emailRemitente || null,
        emailApiKey: data.emailApiKey || null,
        whatsappApiKey: data.whatsappApiKey || null,
        whatsappNumero: data.whatsappNumero || null,
      }
    });
    
    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error('Error creating config:', error);
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 });
  }
}

// PUT - Actualizar configuración
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    const existing = await db.configuracion.findFirst();
    if (!existing) {
      return NextResponse.json({ error: 'No existe configuración. Use POST para crear.' }, { status: 404 });
    }

    const config = await db.configuracion.update({
      where: { id: existing.id },
      data: {
        nombreEmpresa: data.nombreEmpresa,
        zonaHoraria: data.zonaHoraria,
        moneda: data.moneda,
        diasAlertaRenovacion: data.diasAlertaRenovacion,
        emailRemitente: data.emailRemitente || null,
        emailApiKey: data.emailApiKey || null,
        whatsappApiKey: data.whatsappApiKey || null,
        whatsappNumero: data.whatsappNumero || null,
      }
    });
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}