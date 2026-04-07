'use client'

import { useState, useEffect } from 'react'

interface Configuracion {
  id: string
  nombreEmpresa: string
  zonaHoraria: string
  moneda: string
  diasAlertaRenovacion: number
  emailRemitente?: string
  emailApiKey?: string
  whatsappApiKey?: string
  whatsappNumero?: string
}

export default function AdminModule() {
  const [config, setConfig] = useState<Configuracion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    zonaHoraria: 'America/Panama',
    moneda: 'USD',
    diasAlertaRenovacion: 7,
    emailRemitente: '',
    emailApiKey: '',
    whatsappApiKey: '',
    whatsappNumero: '',
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/configuracion')
      const data = await response.json()
      if (data) {
        setConfig(data)
        setFormData({
          nombreEmpresa: data.nombreEmpresa || '',
          zonaHoraria: data.zonaHoraria || 'America/Panama',
          moneda: data.moneda || 'USD',
          diasAlertaRenovacion: data.diasAlertaRenovacion || 7,
          emailRemitente: data.emailRemitente || '',
          emailApiKey: data.emailApiKey || '',
          whatsappApiKey: data.whatsappApiKey || '',
          whatsappNumero: data.whatsappNumero || '',
        })
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = config ? 'PUT' : 'POST'
      const response = await fetch('/api/configuracion', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      setConfig(data)
      alert('Configuración guardada correctamente')
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const zonasHorarias = [
    'America/Panama',
    'America/Mexico_City',
    'America/Bogota',
    'America/Lima',
    'America/Santiago',
    'America/Buenos_Aires',
    'America/Guayaquil',
  ]

  const monedas = [
    { code: 'USD', name: 'Dólar Estadounidense' },
    { code: 'EUR', name: 'Euro' },
    { code: 'MXN', name: 'Peso Mexicano' },
    { code: 'COP', name: 'Peso Colombiano' },
    { code: 'PEN', name: 'Sol Peruano' },
    { code: 'CLP', name: 'Peso Chileno' },
    { code: 'ARS', name: 'Peso Argentino' },
  ]

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          <i className="bi bi-gear text-success me-2"></i>
          Configuración del Sistema
        </h4>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="bi bi-building me-2"></i>General
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'notificaciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('notificaciones')}
          >
            <i className="bi bi-bell me-2"></i>Notificaciones
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'sistema' ? 'active' : ''}`}
            onClick={() => setActiveTab('sistema')}
          >
            <i className="bi bi-server me-2"></i>Sistema
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {activeTab === 'general' && (
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="bi bi-building me-2"></i>Nombre de la Empresa
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nombreEmpresa}
                  onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                  placeholder="Mi Empresa GPS"
                />
                <small className="text-muted">Este nombre aparecerá en los reportes y notificaciones</small>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="bi bi-clock me-2"></i>Zona Horaria
                </label>
                <select
                  className="form-select"
                  value={formData.zonaHoraria}
                  onChange={(e) => setFormData({ ...formData, zonaHoraria: e.target.value })}
                >
                  {zonasHorarias.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="bi bi-currency-dollar me-2"></i>Moneda
                </label>
                <select
                  className="form-select"
                  value={formData.moneda}
                  onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                >
                  {monedas.map(m => (
                    <option key={m.code} value={m.code}>{m.code} - {m.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar-warning me-2"></i>Días de Alerta de Renovación
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.diasAlertaRenovacion}
                  onChange={(e) => setFormData({ ...formData, diasAlertaRenovacion: parseInt(e.target.value) || 7 })}
                  min="1"
                  max="30"
                />
                <small className="text-muted">Días de anticipación para alertar renovaciones próximas</small>
              </div>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div className="row g-4">
              <div className="col-12">
                <h6 className="text-primary mb-3">
                  <i className="bi bi-envelope me-2"></i>Configuración de Email (Resend)
                </h6>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email Remitente</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.emailRemitente}
                  onChange={(e) => setFormData({ ...formData, emailRemitente: e.target.value })}
                  placeholder="notificaciones@tuempresa.com"
                />
                <small className="text-muted">Email desde el que se enviarán las notificaciones</small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">API Key de Resend</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.emailApiKey}
                  onChange={(e) => setFormData({ ...formData, emailApiKey: e.target.value })}
                  placeholder="re_xxxxxxxxxx"
                />
                <small className="text-muted">Obtén tu API Key en <a href="https://resend.com" target="_blank" rel="noopener">resend.com</a></small>
              </div>

              <div className="col-12 mt-4">
                <h6 className="text-success mb-3">
                  <i className="bi bi-whatsapp me-2"></i>Configuración de WhatsApp
                </h6>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Número de WhatsApp Business</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.whatsappNumero}
                  onChange={(e) => setFormData({ ...formData, whatsappNumero: e.target.value })}
                  placeholder="+507 1234-5678"
                />
                <small className="text-muted">Número de WhatsApp Business API</small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">WhatsApp API Key</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.whatsappApiKey}
                  onChange={(e) => setFormData({ ...formData, whatsappApiKey: e.target.value })}
                  placeholder="Token de acceso"
                />
                <small className="text-muted">Token de acceso de Meta/WhatsApp Business</small>
              </div>

              <div className="col-12">
                <div className="alert alert-info d-flex align-items-center" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  <div>
                    <strong>Nota:</strong> Las notificaciones por Email y WhatsApp requieren configuración adicional. 
                    Contacta a tu proveedor de servicios para obtener las credenciales necesarias.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sistema' && (
            <div>
              <h6 className="mb-4">Estado del Sistema</h6>
              
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="border rounded p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted">Base de Datos</span>
                      <span className="badge bg-success">Conectada</span>
                    </div>
                    <small className="text-muted">PostgreSQL - Prisma</small>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="border rounded p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted">API</span>
                      <span className="badge bg-success">Operativa</span>
                    </div>
                    <small className="text-muted">Next.js API Routes</small>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="border rounded p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted">Hosting</span>
                      <span className="badge bg-success">Activo</span>
                    </div>
                    <small className="text-muted">Vercel</small>
                  </div>
                </div>

                <div className="col-12">
                  <hr />
                  <h6 className="mb-3">Información del Sistema</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td className="text-muted" style={{ width: '200px' }}>Versión</td>
                        <td>1.0.0</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Framework</td>
                        <td>Next.js 15</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Base de Datos</td>
                        <td>PostgreSQL (Prisma)</td>
                      </tr>
                      <tr>
                        <td className="text-muted">UI Framework</td>
                        <td>Bootstrap 5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {activeTab !== 'sistema' && (
          <div className="card-footer bg-white d-flex justify-content-end gap-2">
            <button 
              className="btn btn-outline-secondary"
              onClick={fetchConfig}
            >
              <i className="bi bi-arrow-counterclockwise me-2"></i>Restaurar
            </button>
            <button 
              className="btn btn-success"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}