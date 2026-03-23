import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const renovaciones = await db.renovacion.findMany({
      orderBy: { fechaVencimiento: 'asc' },
      include: {
        cliente: true,
        unidad: true,
      }
    })
    return NextResponse.json(renovaciones)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener renovaciones' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const renovacion = await db.renovacion.create({
      data: {
        clienteId: data.clienteId,
        unidadId: data.unidadId,
        fechaInicio: new Date(data.fechaInicio),
        fechaVencimiento: new Date(data.fechaVencimiento),
        estado: data.estado || 'vigente',
        notificado: data.notificado || false,
        observaciones: data.observaciones || null,
      },
      include: {
        cliente: true,
        unidad: true,
      }
    })
    return NextResponse.json(renovacion, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear renovación' }, { status: 500 })
  }
}