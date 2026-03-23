import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const sims = await db.sIMCard.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(sims)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener SIMs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const sim = await db.sIMCard.create({
      data: {
        numeroSim: data.numeroSim,
        operador: data.operador || null,
        tipo: data.tipo || null,
        plan: data.plan || null,
        estado: data.estado || 'disponible',
        observaciones: data.observaciones || null,
      }
    })
    return NextResponse.json(sim, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El número SIM ya existe' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear SIM' }, { status: 500 })
  }
}