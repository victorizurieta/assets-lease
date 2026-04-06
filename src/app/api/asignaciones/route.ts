import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar historial de asignaciones
export async function GET() {
  try {
    const historial = await db.historialAsignacion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        unidad: {
          include: {
            cliente: true
          }
        },
        equipoGPS: true,
        simCard: true,
      }
    });
    return NextResponse.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
  }
}