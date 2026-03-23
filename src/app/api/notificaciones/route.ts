import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const notificaciones = await db.notificacion.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(notificaciones)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener notificaciones' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Aquí iría la lógica real de envío (Email/WhatsApp)
    // Por ahora solo guardamos como "enviada" para demo
    const notificacion = await db.notificacion.create({
      data: {
        tipo: data.tipo,
        destino: data.destino,
        asunto: data.asunto || null,
        mensaje: data.mensaje,
        estado: 'enviada',
        enviadaAt: new Date(),
      }
    })
    return NextResponse.json(notificacion, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear notificación' }, { status: 500 })
  }
}