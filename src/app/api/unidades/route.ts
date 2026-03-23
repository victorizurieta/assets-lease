import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const unidades = await db.unidad.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: true,
        equipoGPS: true,
        simCard: true,
      }
    })
    return NextResponse.json(unidades)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener unidades' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const unidad = await db.unidad.create({
      data: {
        placa: data.placa,
        nombre: data.nombre || null,
        marcaVehiculo: data.marcaVehiculo || null,
        modeloVehiculo: data.modeloVehiculo || null,
        anio: data.anio || null,
        color: data.color || null,
        estado: data.estado || 'activo',
        observaciones: data.observaciones || null,
        clienteId: data.clienteId,
      },
      include: {
        cliente: true,
      }
    })
    return NextResponse.json(unidad, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'La placa ya existe' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear unidad' }, { status: 500 })
  }
}