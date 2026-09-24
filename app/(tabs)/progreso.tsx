import { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView }      from 'react-native-safe-area-context'
import { useNavigation }     from '@react-navigation/native'
import { supabase }          from '../../lib/supabase'
import ProgresoHeader        from '../../components/progreso/ProgresoHeader'
import ProgresoSemanal       from '../../components/progreso/ProgresoSemanal'
import ProgresoMensual       from '../../components/progreso/ProgresoMensual'
import ProgresoLogros        from '../../components/progreso/ProgresoLogros'
import ProgresoSinPlan       from '../../components/progreso/ProgresoSinPlan'
import FlujoPlan             from '../../components/plan/FlujoPlan'

export default function ProgresoScreen() {
  const navigation  = useNavigation<any>()
  const [cliente,   setCliente]   = useState<any>(null)
  const [membresia, setMembresia] = useState<any>(null)
  const [semanal,   setSemanal]   = useState({ clases: 0, minutos: 0 })
  const [mensual,   setMensual]   = useState({ clases: 0, minutos: 0, asistenciaPct: 0 })
  const [totalClases, setTotalClases] = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [refreshing,setRefreshing]= useState(false)
  const [mostrarPlan, setMostrarPlan] = useState(false)

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: cli } = await supabase
      .from('clientes').select('*').eq('email', session.user.email).single()
    if (cli) setCliente(cli)

    const { data: memb } = await supabase
      .from('membresias')
      .select('*, paquetes(nombre)')
      .eq('cliente_id', cli?.id)
      .eq('estatus', 'Activa')
      .gte('fecha_fin', new Date().toISOString().split('T')[0])
      .order('fecha_fin', { ascending: false })
      .limit(1).single()
    setMembresia(memb || null)

    if (cli) {
      // Semanal
      const inicioSemana = new Date()
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
      inicioSemana.setHours(0, 0, 0, 0)

      const { data: asistSemana } = await supabase
        .from('asistencias')
        .select('*, clases(duracion_minutos)')
        .eq('cliente_id', cli.id)
        .gte('fecha_checkin', inicioSemana.toISOString())

      if (asistSemana) {
        setSemanal({
          clases:  asistSemana.length,
          minutos: asistSemana.reduce((a, r) => a + (r.clases?.duracion_minutos || 0), 0),
        })
      }

      // Mensual
      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)

      const { data: asistMes } = await supabase
        .from('asistencias')
        .select('*, clases(duracion_minutos)')
        .eq('cliente_id', cli.id)
        .gte('fecha_checkin', inicioMes.toISOString())

      if (asistMes) {
        const diasMes    = new Date().getDate()
        const asistPct   = Math.round((asistMes.length / Math.max(diasMes * 0.7, 1)) * 100)
        setMensual({
          clases:        asistMes.length,
          minutos:       asistMes.reduce((a, r) => a + (r.clases?.duracion_minutos || 0), 0),
          asistenciaPct: Math.min(asistPct, 100),
        })
      }

      // Total histórico
      const { count } = await supabase
        .from('asistencias')
        .select('id', { count: 'exact' })
        .eq('cliente_id', cli.id)
      setTotalClases(count || 0)
    }

    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [])

  const diasActivo = cliente?.fecha_alta_original
    ? Math.floor((Date.now() - new Date(cliente.fecha_alta_original).getTime()) / 86400000)
    : 0

  const nombre    = cliente?.nombre_completo?.split(' ')[0] || ''
  const plan      = membresia?.paquetes?.nombre || cliente?.plan || ''

  if (mostrarPlan) return (
    <FlujoPlan
      cliente={cliente}
      onTerminar={() => { setMostrarPlan(false); fetchData() }}
      onReservar={() => setMostrarPlan(false)}
    />
  )

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ProgresoHeader
        nombre={nombre}
        plan={plan}
        diasActivo={diasActivo}
      />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9ca3af" />}>

        {!membresia ? (
          <ProgresoSinPlan onComprarPlan={() => setMostrarPlan(true)} />
        ) : (
          <View style={s.body}>
            <ProgresoSemanal
              clases={semanal.clases}
              minutos={semanal.minutos}
              meta={cliente?.meta || 'Fuerza'}
              objetivo={5}
            />
            <ProgresoMensual
              clases={mensual.clases}
              minutos={mensual.minutos}
              asistenciaPct={mensual.asistenciaPct}
            />
            <ProgresoLogros
              clases={totalClases}
              diasActivo={diasActivo}
            />
            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: '#171B24' },
  scroll:{ flex: 1, backgroundColor: '#f9fafb' },
  body:  { padding: 16, gap: 16 },
})