import { useState, useEffect } from 'react'
import { View }                from 'react-native'
import { supabase }            from '../../lib/supabase'
import PantallaSeleccionarSucursal from './PantallaSeleccionarSucursal'
import PantallaElegirPlan          from './PantallaElegirPlan'
import PantallaPago                from './PantallaPago'
import PantallaConfirmacionPago    from './PantallaConfirmacionPago'

type Paso = 'sucursal' | 'plan' | 'pago' | 'confirmacion'

interface Props {
  cliente:    any
  onTerminar: () => void
  onReservar: () => void
}

export default function FlujoPlan({ cliente, onTerminar, onReservar }: Props) {
  const [paso,              setPaso]              = useState<Paso>('sucursal')
  const [sucursales,        setSucursales]        = useState<any[]>([])
  const [sucursalSel,       setSucursalSel]       = useState<string | null>(null)
  const [paquetes,          setPaquetes]          = useState<any[]>([])
  const [loadingPaquetes,   setLoadingPaquetes]   = useState(false)
  const [planSel,           setPlanSel]           = useState<string | null>(null)
  const [paqueteActivo,     setPaqueteActivo]     = useState<any | null>(null)
  const [tarjetas,          setTarjetas]          = useState<any[]>([])

  useEffect(() => {
    supabase.from('sucursales').select('id, nombre, color')
      .eq('estatus', 'Activa').order('nombre')
      .then(({ data }) => setSucursales(data || []))
  }, [])

  useEffect(() => {
    if (!sucursalSel) return
    setLoadingPaquetes(true)
    console.log('Fetching paquetes para sucursal:', sucursalSel)
    fetch(`${process.env.EXPO_PUBLIC_CRM_URL}/api/paquetes/disponibles?sucursal_id=${sucursalSel}`)
        .then(r => r.json())
        .then(d => { 
        console.log('Paquetes response:', d)
        setPaquetes(d.paquetes || []) 
        setLoadingPaquetes(false) 
        })
        .catch(e => {
        console.log('Error:', e)
        setLoadingPaquetes(false)
        })
    }, [sucursalSel])

  useEffect(() => {
    if (!cliente?.id) return
    fetch(`${process.env.EXPO_PUBLIC_CRM_URL}/api/stripe/payment-methods?cliente_id=${cliente.id}`)
      .then(r => r.json())
      .then(d => setTarjetas(d.paymentMethods || []))
  }, [cliente])

  if (paso === 'sucursal') return (
    <PantallaSeleccionarSucursal
      sucursales={sucursales}
      sucursalSeleccionada={sucursalSel}
      onSeleccionar={setSucursalSel}
      onContinuar={() => setPaso('plan')}
      onBack={onTerminar}
    />
  )

  if (paso === 'plan') return (
    <PantallaElegirPlan
      paquetes={paquetes}
      loading={loadingPaquetes}
      planSeleccionado={planSel}
      onSeleccionar={setPlanSel}
      onComprar={p => { setPaqueteActivo(p); setPaso('pago') }}
      onBack={() => setPaso('sucursal')}
    />
  )

  if (paso === 'pago') return (
    <PantallaPago
      paquete={paqueteActivo}
      cliente={cliente}
      tarjetas={tarjetas}
      onPagado={() => setPaso('confirmacion')}
      onBack={() => setPaso('plan')}
    />
  )

  if (paso === 'confirmacion') return (
    <PantallaConfirmacionPago
      paquete={paqueteActivo}
      cliente={cliente}
      onReservar={onReservar}
      onInicio={onTerminar}
    />
  )

  return <View />
}