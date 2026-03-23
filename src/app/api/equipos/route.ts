import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const equipos = await db.equipoGPS.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(equipos)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener equipos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const equipo = await db.equipoGPS.create({
      data: {
        imei: data.imei,
        marca: data.marca || null,
        modelo: data.modelo || null,
        tipo: data.tipo || null,
        tecnologia: data.tecnologia || null,
        estado: data.estado || 'disponible',
        observaciones: data.observaciones || null,
      }
    })
    return NextResponse.json(equipo, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El IMEI ya existe' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear equipo' }, { status: 500 })
  }
}