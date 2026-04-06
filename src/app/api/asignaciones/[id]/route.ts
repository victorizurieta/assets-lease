import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener una asignación por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const asignacion = await db.historialAsignacion.findUnique({
      where: { id },
      include: {
        unidad: {
          include: { cliente: true }
        },
        equipoGPS: true,
        simCard: true,
      }
    });
    
    if (!asignacion) {
      return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(asignacion);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener asignación' }, { status: 500 });
  }
}

// DELETE - Eliminar una asignación del historial
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.historialAsignacion.delete({
      where: { id }
    });
    return NextResponse.json({ message: 'Asignación eliminada' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar asignación' }, { status: 500 });
  }
}