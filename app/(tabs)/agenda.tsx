import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator
} from 'react-native'
import { SafeAreaView }          from 'react-native-safe-area-context'
import { Ionicons }              from '@expo/vector-icons'
import { useFocusEffect }        from '@react-navigation/native'
import { supabase }              from '../../lib/supabase'
import CardReservaProxima        from '../../components/agenda/CardReservaProxima'
import CardReservaHistorico      from '../../components/agenda/CardReservaHistorico'
import ModalCancelarReserva      from '../../components/agenda/ModalCancelarReserva'
import ModalQR                   from '../../components/reservar/ModalQR'
import ModalCalificacion         from '../../components/reservar/ModalCalificacion'

type SubTab = 'proximas' | 'historico'

export default function AgendaScreen() {
  const [subTab,           setSubTab]           = useState<SubTab>('proximas')
  const [clienteId,        setClienteId]        = useState<string | null>(null)
  const [proximas,         setProximas]         = useState<any[]>([])
  const [historico,        setHistorico]        = useState<any[]>([])
  const [loading,          setLoading]          = useState(true)
  const [refreshing,       setRefreshing]       = useState(false)
  const [modalQR,          setModalQR]          = useState(false)
  const [reservaQR,        setReservaQR]        = useState<any | null>(null)
  const [cancelando,       setCancelando]       = useState(false)
  const [modalCancelar,    setModalCancelar]    = useState(false)
  const [canceladaExito,   setCanceladaExito]   = useState(false)
  const [reservaACancelar, setReservaACancelar] = useState<any | null>(null)
  const [claseParaCalif,   setClaseParaCalif]   = useState<any | null>(null)
  const [modalCalif,       setModalCalif]       = useState(false)

  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: cli } = await supabase
      .from('clientes').select('id').eq('email', session.user.email).single()
    if (!cli) return
    setClienteId(cli.id)

    const ahora = new Date().toISOString()

    const SELECT_RESERVA = '*, clases(id, nombre_clase, horario, coach_id, rooms(nombre), staff(nombre, primer_apellido), sucursales(nombre)), room_spots(numero)'

    const [{ data: prox }, { data: hist }] = await Promise.all([
      // Próximas: cualquier estatus Confirmada con horario futuro
      supabase.from('reservas')
        .select(SELECT_RESERVA)
        .eq('cliente_id', cli.id)
        .eq('estatus', 'Confirmada')
        .gt('clases.horario', ahora)  // solo futuras
        .order('clases(horario)', { ascending: true }),

      // Histórico: todas las reservas con horario pasado (sin importar estatus)
      // + las canceladas aunque sean futuras
      supabase.from('reservas')
        .select(`${SELECT_RESERVA}, asistencias(id)`)
        .eq('cliente_id', cli.id)
        .or(`estatus.eq.Cancelada,estatus.eq.No Show,clases.horario.lt.${ahora}`)
        .order('clases(horario)', { ascending: false }),
    ])

    // Próximas: filtrar en cliente por si el join no filtra bien
    setProximas(
      (prox || []).filter(r => r.clases && new Date(r.clases.horario) > new Date())
    )

    // Histórico: clases pasadas + canceladas, sin duplicados
    const vistos = new Set<string>()
    const histFiltrado = (hist || []).filter(r => {
      if (!r.clases) return false
      if (vistos.has(r.id)) return false
      const esPasada   = new Date(r.clases.horario) <= new Date()
      const esCancelada = r.estatus === 'Cancelada' || r.estatus === 'No Show'
      if (esPasada || esCancelada) {
        vistos.add(r.id)
        return true
      }
      return false
    })

    setHistorico(histFiltrado)
    setLoading(false)
  }, [])

  // Se recarga cada vez que el tab de Agenda recibe foco
  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      fetchData()
    }, [fetchData])
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [fetchData])

  const handleCancelar = async () => {
    if (!reservaACancelar) return
    setCancelando(true)
    await supabase.from('reservas').update({ estatus: 'Cancelada' }).eq('id', reservaACancelar.id)
    setCancelando(false)
    setModalCancelar(false)
    setCanceladaExito(true)
    fetchData()
  }

  const historicoAgrupado = historico.reduce((acc: Record<string, any[]>, r) => {
    const fecha     = new Date(r.clases?.horario)
    const ahora     = new Date()
    const esEsteMes = fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
    const key       = esEsteMes
      ? 'Este mes'
      : fecha.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
          .replace(/^\w/, c => c.toUpperCase())
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  if (loading) return (
    <SafeAreaView style={s.safe}>
      <View style={s.loadingBox}><ActivityIndicator color="#fff" /></View>
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      <ModalCancelarReserva
        visible={modalCancelar}
        cancelando={cancelando}
        exitoso={canceladaExito}
        claseNombre={reservaACancelar?.clases?.nombre_clase || ''}
        onConfirmar={handleCancelar}
        onCerrar={() => { setCanceladaExito(false); setReservaACancelar(null) }}
        onVolver={() => setModalCancelar(false)}
      />

      <ModalQR
        visible={modalQR}
        confirmacion={reservaQR}
        onClose={() => { setModalQR(false); setReservaQR(null) }}
      />

      <ModalCalificacion
        visible={modalCalif}
        clase={claseParaCalif}
        clienteId={clienteId}
        onClose={() => { setModalCalif(false); setClaseParaCalif(null) }}
      />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitulo}>Mis reservas</Text>
          <Text style={s.headerSub}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()} · {proximas.length} CLASES
          </Text>
        </View>
        <View style={s.campana}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View style={s.campanaBadge} />
        </View>
      </View>

      {/* Sub tabs */}
      <View style={s.tabsContainer}>
        {(['proximas', 'historico'] as SubTab[]).map(t => (
          <TouchableOpacity key={t} onPress={() => setSubTab(t)}
            style={[s.tab, subTab === t && s.tabActive]}>
            <Text style={[s.tabText, subTab === t && s.tabTextActive]}>
              {t === 'proximas' ? `Próximas (${proximas.length})` : `Histórico (${historico.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9ca3af" />}>

        {/* Próximas */}
        {subTab === 'proximas' && (
          <View style={s.lista}>
            {proximas.length === 0 ? (
              <View style={s.emptyBox}>
                <Ionicons name="calendar-outline" size={48} color="#374151" />
                <Text style={s.emptyText}>No tienes clases próximas</Text>
                <Text style={s.emptySubText}>Ve a Reservar para agendar tu siguiente clase</Text>
              </View>
            ) : proximas.map(r => (
              <CardReservaProxima
                key={r.id}
                reserva={r}
                onCancelar={() => { setReservaACancelar(r); setModalCancelar(true) }}
                onVerQR={() => {
                  setReservaQR({ reserva: r, clase: r.clases, spot: r.room_spots })
                  setModalQR(true)
                }}
              />
            ))}
          </View>
        )}

        {/* Histórico */}
        {subTab === 'historico' && (
          <View style={s.lista}>
            {Object.keys(historicoAgrupado).length === 0 ? (
              <View style={s.emptyBox}>
                <Ionicons name="time-outline" size={48} color="#374151" />
                <Text style={s.emptyText}>Sin historial aún</Text>
                <Text style={s.emptySubText}>Aquí verás tus clases pasadas</Text>
              </View>
            ) : Object.entries(historicoAgrupado).map(([mes, reservas]) => (
              <View key={mes}>
                <Text style={s.mesLabel}>{mes}</Text>
                {(reservas as any[]).map(r => (
                  <CardReservaHistorico
                    key={r.id}
                    reserva={r}
                    onCalificar={() => { setClaseParaCalif(r.clases); setModalCalif(true) }}
                  />
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#171B24' },
  scroll:        { flex: 1, backgroundColor: '#f9fafb' },
  loadingBox:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:        { paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitulo:  { color: '#fff', fontSize: 24, fontFamily: 'Gotham_700Bold' },
  headerSub:     { color: '#9ca3af', fontSize: 12, fontFamily: 'Gotham_400Regular', marginTop: 2 },
  campana:       { position: 'relative' },
  campanaBadge:  { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#171B24', borderBottomWidth: 1, borderBottomColor: '#2d3748' },
  tab:           { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:     { borderBottomColor: '#fff' },
  tabText:       { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  lista:         { padding: 16, gap: 12 },
  mesLabel:      { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#9ca3af', marginBottom: 8, marginTop: 4 },
  emptyBox:      { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyText:     { fontSize: 17, fontFamily: 'Gotham_700Bold', color: '#374151' },
  emptySubText:  { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center' },
})