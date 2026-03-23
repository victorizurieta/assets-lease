import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const equipo = await db.equipoGPS.findUnique({
      where: { id },
      include: { unidad: true }
    })
    if (!equipo) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 })
    }
    return NextResponse.json(equipo)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener equipo' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const equipo = await db.equipoGPS.update({
      where: { id },
      data: {
        imei: data.imei,
        marca: data.marca || null,
        modelo: data.modelo || null,
        tipo: data.tipo || null,
        tecnologia: data.tecnologia || null,
        estado: data.estado,
        observaciones: data.observaciones || null,
      }
    })
    return NextResponse.json(equipo)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El IMEI ya existe' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al actualizar equipo' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.equipoGPS.delete({ where: { id } })
    return NextResponse.json({ message: 'Equipo eliminado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar equipo' }, { status: 500 })
  }
}