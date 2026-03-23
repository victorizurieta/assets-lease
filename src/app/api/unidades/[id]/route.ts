import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const unidad = await db.unidad.update({
      where: { id },
      data: {
        placa: data.placa,
        nombre: data.nombre || null,
        marcaVehiculo: data.marcaVehiculo || null,
        modeloVehiculo: data.modeloVehiculo || null,
        anio: data.anio || null,
        color: data.color || null,
        estado: data.estado,
        observaciones: data.observaciones || null,
        clienteId: data.clienteId,
      },
      include: {
        cliente: true,
        equipoGPS: true,
        simCard: true,
      }
    })
    return NextResponse.json(unidad)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'La placa ya existe' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al actualizar unidad' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.unidad.delete({ where: { id } })
    return NextResponse.json({ message: 'Unidad eliminada' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar unidad' }, { status: 500 })
  }
}