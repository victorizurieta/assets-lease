import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar todos los clientes
export async function GET() {
  try {
    const clientes = await db.cliente.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(clientes)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const cliente = await db.cliente.create({
      data: {
        nombre: data.nombre,
        cedulaRuc: data.cedulaRuc,
        telefono: data.telefono || null,
        email: data.email || null,
        direccion: data.direccion || null,
        tipoPlan: data.tipoPlan,
        estado: data.estado || 'activo',
        pais: data.pais || null,
        observaciones: data.observaciones || null,
      }
    })
    return NextResponse.json(cliente, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'La cédula/RUC ya existe' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 })
  }
}