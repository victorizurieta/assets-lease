import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const renovacion = await db.renovacion.update({
      where: { id },
      data: {
        estado: data.estado,
        notificado: data.notificado,
        resultado: data.resultado || null,
        fechaResultado: data.fechaResultado ? new Date(data.fechaResultado) : null,
        observaciones: data.observaciones || null,
      },
      include: {
        cliente: true,
        unidad: true,
      }
    })
    return NextResponse.json(renovacion)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar renovación' }, { status: 500 })
  }
}