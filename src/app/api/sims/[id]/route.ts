import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const sim = await db.sIMCard.update({
      where: { id },
      data: {
        numeroSim: data.numeroSim,
        operador: data.operador || null,
        tipo: data.tipo || null,
        plan: data.plan || null,
        estado: data.estado,
        observaciones: data.observaciones || null,
      }
    })
    return NextResponse.json(sim)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El número SIM ya existe' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al actualizar SIM' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.sIMCard.delete({ where: { id } })
    return NextResponse.json({ message: 'SIM eliminada' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar SIM' }, { status: 500 })
  }
}