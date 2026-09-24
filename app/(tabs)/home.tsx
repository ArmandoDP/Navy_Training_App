import { useState, useEffect, useCallback, useRef } from 'react'
import SkeletonBox from '../../components/shared/SkeletonBox'
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView }      from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect }     from '@react-navigation/native'
import { supabase }          from '../../lib/supabase'
import ModalCalificacion     from '../../components/reservar/ModalCalificacion'
import HomeHeader            from '../../components/home/HomeHeader'
import HomeBanner            from '../../components/home/HomeBanner'
import HomeProximaClase      from '../../components/home/HomeProximaClase'
import HomeEstaSemana        from '../../components/home/HomeEstaSemana'
import HomeNovedades         from '../../components/home/HomeNovedades'
import FlujoPlan             from '../../components/plan/FlujoPlan'
import { registrarPushToken } from '../../lib/notifications'
import ModalNoShow from '../../components/shared/ModalNoShow'

export default function HomeScreen() {
  const navigation = useNavigation<any>()

  const [cliente,            setCliente]            = useState<any>(null)
  const [membresia,          setMembresia]          = useState<any>(null)
  const [proximaClase,       setProximaClase]       = useState<any>(null)
  const [clasesEstaSemana,   setClasesEstaSemana]   = useState(0)
  const [minutosEstaSemana,  setMinutosEstaSemana]  = useState(0)
  const [loading,            setLoading]            = useState(true)
  const [refreshing,         setRefreshing]         = useState(false)
  const [claseParaCalificar, setClaseParaCalificar] = useState<any | null>(null)
  const [modalCalificacion, setModalCalificacion] = useState(false)
  const [proximasClases, setProximasClases] = useState<any[]>([])
  const [mostrarPlan, setMostrarPlan] = useState(false)
  const [homeKey, setHomeKey] = useState(0)
  const clasesDescartadasRef = useRef<string[]>([])
  // const [penalizacion, setPenalizacion] = useState<any>(null)

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: cli } = await supabase
      .from('clientes').select('*').eq('email', session.user.email).single()
    if (cli) setCliente(cli)

    if (cli) {
      //Push token
      registrarPushToken(cli.id)

      // Clases sin calificar
      const { data: asist } = await supabase
        .from('asistencias')
        .select('clase_id, calificacion_descartada, clases(id, nombre_clase, coach_id, horario, rooms(nombre), staff(nombre, primer_apellido))')
        .eq('cliente_id', cli.id)
        .eq('calificacion_descartada', false)  // ← solo las no descartadas
        .lte('fecha_checkin', new Date().toISOString())
        .order('fecha_checkin', { ascending: false })
        .limit(5)

      if (asist && asist.length > 0) {
        const { data: reseñas } = await supabase
          .from('reseñas').select('clase_id')
          .eq('cliente_id', cli.id)
          .in('clase_id', asist.map((a: any) => a.clase_id))

        const calificadas = reseñas?.map((r: any) => r.clase_id) || []
        const pendiente   = asist.find((a: any) => 
          !calificadas.includes(a.clase_id) &&
          !a.calificacion_descartada  // ← agrega esto
        )
        if (pendiente?.clases) {
          setClaseParaCalificar(pendiente.clases)
          setModalCalificacion(true)
        }
      }

      // Membresía
      const { data: memb } = await supabase
        .from('membresias')
        .select('*, paquetes(nombre)')
        .eq('cliente_id', cli.id)
        .eq('estatus', 'Activa')
        .gte('fecha_fin', new Date().toISOString().split('T')[0])
        .order('fecha_fin', { ascending: false })
        .limit(1)
        .single()
      setMembresia(memb || null)

      // const { data: pen } = await supabase
      //   .from('penalizaciones_noshow')
      //   .select('*')
      //   .eq('cliente_id', cli.id)
      //   .eq('estatus', 'Pendiente')
      //   .limit(1)
      //   .single()
      // setPenalizacion(pen || null)

      // Próxima clase
      const { data: reservas } = await supabase
        .from('reservas')
        .select('*, clases(nombre_clase, horario, duracion_minutos, rooms(nombre), staff(nombre, primer_apellido), sucursales(nombre))')
        .eq('cliente_id', cli.id)
        .eq('estatus', 'Confirmada')
        .order('created_at', { ascending: true })
        .limit(10)

      // Filtrar en JS las que tienen horario futuro
      const ahora = new Date().toISOString()
      const reservasFuturas = reservas?.filter(r => 
        r.clases?.horario && r.clases.horario >= ahora
      ) || []

      setProximasClases(reservasFuturas.slice(0, 5))

      if (reservas && reservas.length > 0) setProximaClase(reservas[0])

      // Esta semana
      const inicioSemana = new Date()
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
      inicioSemana.setHours(0, 0, 0, 0)

      const { data: asistSemana } = await supabase
        .from('asistencias')
        .select('*, clases(duracion_minutos)')
        .eq('cliente_id', cli.id)
        .gte('fecha_checkin', inicioSemana.toISOString())
      if (asistSemana) {
        setClasesEstaSemana(asistSemana.length)
        setMinutosEstaSemana(asistSemana.reduce((acc: number, a: any) => acc + (a.clases?.duracion_minutos || 0), 0))
      }
    }
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [])
  )

  useEffect(() => { fetchData() }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [])

  const nombre    = cliente?.nombre_completo?.split(' ')[0] || ''
  const iniciales = cliente?.nombre_completo?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '?'

  // Flujo de comprar plan
  if (mostrarPlan) return (
    <FlujoPlan
      cliente={cliente}
      onTerminar={() => { 
        setMostrarPlan(false)
        setHomeKey(k => k + 1) // ← fuerza remount
      }}
      onReservar={() => { setMostrarPlan(false); navigation.navigate('Reservar') }}
    />
  )
  if (loading) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header skeleton */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 8 }}>
          <SkeletonBox width={120} height={14} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <SkeletonBox width={180} height={22} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
        </View>
        <SkeletonBox width={42} height={42} borderRadius={21} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </View>

      {/* Body skeleton */}
      <View style={[s.body, { paddingTop: 24 }]}>
        {/* Banner */}
        <SkeletonBox width="100%" height={120} borderRadius={20} style={{ marginBottom: 20 }} />
        {/* Próxima clase */}
        <SkeletonBox width={140} height={14} borderRadius={6} style={{ marginBottom: 12 }} />
        <SkeletonBox width="100%" height={90} borderRadius={16} style={{ marginBottom: 20 }} />
        {/* Esta semana */}
        <SkeletonBox width={120} height={14} borderRadius={6} style={{ marginBottom: 12 }} />
        <SkeletonBox width="100%" height={70} borderRadius={16} />
      </View>
    </SafeAreaView>
  )

  return (
    <SafeAreaView key={homeKey} style={s.safe} edges={['top']}>
      <HomeHeader nombre={nombre} iniciales={iniciales} />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        <HomeBanner
          membresia={membresia}
          onVerPlan={() => setMostrarPlan(true)}
          onReservar={() => navigation.navigate('Reservar')}
        />
        

        <View style={s.body}>
          <HomeProximaClase
            proximasClases={proximasClases}
            onVerAgenda={() => navigation.navigate('Agenda')}
            onVerClase={() => navigation.navigate('Reservar')} 
          />

          {membresia && (
            <HomeEstaSemana
              clases={clasesEstaSemana}
              minutos={minutosEstaSemana}
              meta={cliente?.meta || 'Fuerza'}
            />
          )}

          <HomeNovedades />

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <ModalCalificacion
        visible={modalCalificacion}
        clase={claseParaCalificar}
        clienteId={cliente?.id || null}
        onClose={() => { 
          setModalCalificacion(false)
          if (claseParaCalificar) clasesDescartadasRef.current = [...clasesDescartadasRef.current, claseParaCalificar.id]
          setClaseParaCalificar(null)
        }}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#171B24' },
  scroll:      { flex: 1, backgroundColor: '#f9fafb' },
  loading:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#171B24' },
  loadingText: { color: '#fff', fontFamily: 'Gotham_400Regular' },
  body:        { paddingHorizontal: 16, paddingTop: 20, backgroundColor: '#f9fafb', borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: -20, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.20, shadowRadius: 20, elevation: 16 },
})