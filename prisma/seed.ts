import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar datos existentes
  await prisma.notificacion.deleteMany()
  await prisma.renovacion.deleteMany()
  await prisma.unidad.deleteMany()
  await prisma.sIMCard.deleteMany()
  await prisma.equipoGPS.deleteMany()
  await prisma.cliente.deleteMany()
  console.log('Datos anteriores eliminados')

  // Crear clientes
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nombre: 'Transportes García S.A.',
        cedulaRuc: '12345678-1',
        telefono: '+507 234-5678',
        email: 'contacto@transportesgarcia.com',
        direccion: 'Av. Principal, Ciudad de Panamá',
        tipoPlan: 'anual',
        estado: 'activo',
        pais: 'Panamá',
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: 'Logística Express',
        cedulaRuc: '87654321-2',
        telefono: '+507 432-1098',
        email: 'info@logisticaexpress.pa',
        tipoPlan: 'mensual',
        estado: 'activo',
        pais: 'Panamá',
      },
    }),
    prisma.cliente.create({
      data: {
        nombre: 'Flotas Rápidas S.A.',
        cedulaRuc: '11223344-3',
        telefono: '+507 555-1234',
        tipoPlan: 'anual',
        estado: 'activo',
        pais: 'Panamá',
      },
    }),
  ])

  console.log('Clientes creados:', clientes.length)

  // Crear equipos GPS
  const equipos = await Promise.all([
    prisma.equipoGPS.create({
      data: { imei: '861234567890123', marca: 'Teltonika', modelo: 'FMB120', tipo: 'vehicular', tecnologia: '4G', estado: 'disponible' },
    }),
    prisma.equipoGPS.create({
      data: { imei: '861234567890124', marca: 'Teltonika', modelo: 'FMB125', tipo: 'vehicular', tecnologia: '4G', estado: 'disponible' },
    }),
    prisma.equipoGPS.create({
      data: { imei: '861234567890125', marca: 'Suntech', modelo: 'ST310', tipo: 'vehicular', tecnologia: '3G', estado: 'disponible' },
    }),
  ])

  console.log('Equipos GPS creados:', equipos.length)

  // Crear SIM Cards
  const sims = await Promise.all([
    prisma.sIMCard.create({
      data: { numeroSim: '50712345678', operador: 'Claro', tipo: 'postpago', plan: 'Datos 2GB', estado: 'disponible' },
    }),
    prisma.sIMCard.create({
      data: { numeroSim: '50712345679', operador: 'Movistar', tipo: 'prepago', plan: 'Datos 1GB', estado: 'disponible' },
    }),
  ])

  console.log('SIM Cards creadas:', sims.length)

  // Crear unidades
  const unidades = await Promise.all([
    prisma.unidad.create({
      data: { placa: 'ABC-123', nombre: 'Unidad 01', marcaVehiculo: 'Toyota', modeloVehiculo: 'Hilux', anio: 2022, color: 'Blanco', estado: 'activo', clienteId: clientes[0].id },
    }),
    prisma.unidad.create({
      data: { placa: 'DEF-456', nombre: 'Unidad 02', marcaVehiculo: 'Nissan', modeloVehiculo: 'Frontier', anio: 2021, color: 'Negro', estado: 'activo', clienteId: clientes[0].id },
    }),
    prisma.unidad.create({
      data: { placa: 'GHI-789', nombre: 'Camión', marcaVehiculo: 'Mercedes', modeloVehiculo: 'Sprinter', anio: 2023, estado: 'activo', clienteId: clientes[1].id },
    }),
  ])

  console.log('Unidades creadas:', unidades.length)

  // Crear renovaciones
  const hoy = new Date()
  await Promise.all([
    prisma.renovacion.create({
      data: { clienteId: clientes[0].id, unidadId: unidades[0].id, fechaInicio: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1), fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 15), estado: 'vigente' },
    }),
    prisma.renovacion.create({
      data: { clienteId: clientes[0].id, unidadId: unidades[1].id, fechaInicio: new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1), fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 3), estado: 'por_vencer' },
    }),
    prisma.renovacion.create({
      data: { clienteId: clientes[1].id, unidadId: unidades[2].id, fechaInicio: new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1), fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1), estado: 'vencida' },
    }),
  ])

  console.log('Renovaciones creadas')

  // Crear notificaciones
  await Promise.all([
    prisma.notificacion.create({
      data: { tipo: 'email', destino: 'contacto@transportesgarcia.com', asunto: 'Recordatorio de renovación', mensaje: 'Su servicio GPS está próximo a vencer.', estado: 'enviada', enviadaAt: new Date() },
    }),
    prisma.notificacion.create({
      data: { tipo: 'whatsapp', destino: '+507 234-5678', mensaje: 'AssetsLease: Su plan vence en 7 días.', estado: 'enviada', enviadaAt: new Date() },
    }),
  ])

  console.log('Notificaciones creadas')
  console.log('✅ Base de datos poblada correctamente')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })