import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cliente = await db.cliente.findUnique({
      where: { id },
      include: { unidades: true }
    })
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    return NextResponse.json(cliente)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener cliente' }, { status: 500 })
  }
}

// PUT - Actualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const cliente = await db.cliente.update({
      where: { id },
      data: {
        nombre: data.nombre,
        cedulaRuc: data.cedulaRuc,
        telefono: data.telefono || null,
        email: data.email || null,
        direccion: data.direccion || null,
        tipoPlan: data.tipoPlan,
        estado: data.estado,
        pais: data.pais || null,
        observaciones: data.observaciones || null,
      }
    })
    return NextResponse.json(cliente)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'La cédula/RUC ya existe' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 })
  }
}

// DELETE - Eliminar cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.cliente.delete({ where: { id } })
    return NextResponse.json({ message: 'Cliente eliminado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar cliente' }, { status: 500 })
  }
}