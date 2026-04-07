import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const notificaciones = await db.notificacion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        cliente: {
          select: { nombre: true }
        }
      }
    })
    return NextResponse.json(notificaciones)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener notificaciones' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const notificacion = await db.notificacion.create({
      data: {
        tipo: data.tipo,
        destino: data.destino,
        asunto: data.asunto || null,
        mensaje: data.mensaje,
        estado: data.estado || 'pendiente',
        clienteId: data.clienteId || null,
        renovacionId: data.renovacionId || null,
      }
    })
    return NextResponse.json(notificacion, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear notificación' }, { status: 500 })
  }
}