import { useState, useEffect, useRef, useCallback } from 'react'
import { Animated } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useHaptic } from '../../hooks/useHaptic'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, ActivityIndicator, Modal
} from 'react-native'
import { Ionicons }        from '@expo/vector-icons'
import { SafeAreaView }    from 'react-native-safe-area-context'
import { supabase }        from '../../lib/supabase'
import ClaseRow            from '../../components/reservar/ClaseRow'
import DetalleClase        from '../../components/reservar/DetalleClase'
import ConfirmacionReserva from '../../components/reservar/ConfirmacionReserva'
import ModalQR             from '../../components/reservar/ModalQR'
import ModalSinAcceso      from '../../components/reservar/ModalSinAcceso'
import FlujoPlan           from '../../components/plan/FlujoPlan'
import ModalDetalleReserva from '../../components/reservar/ModalDetalleReserva'
import SkeletonClase from '../../components/reservar/SkeletonClase'


const DIAS_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

function getDias(cantidad = 14) {
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })
}

export default function ReservarScreen() {
  const dias         = getDias(14)
  const diaScrollRef = useRef<ScrollView>(null)
  const haptic = useHaptic()
  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current

  const cambiarDia = (i: number) => {
    // Fade out + slide out
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0,  duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: i > diaIdx ? 20 : -20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setDiaIdx(i)
      slideAnim.setValue(i > diaIdx ? -20 : 20)
      // Fade in + slide in
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start()
    })
  }
  const [diaIdx,          setDiaIdx]          = useState(0)
  const [sucursales,      setSucursales]      = useState<any[]>([])
  const [sucursalId,      setSucursalId]      = useState<string | null>(null)
  const [modalSucursal,   setModalSucursal]   = useState(false)
  const [rooms,           setRooms]           = useState<any[]>([])
  const [roomFiltro,      setRoomFiltro]      = useState('todos')
  const [clases,          setClases]          = useState<any[]>([])
  const [loading,         setLoading]         = useState(true)
  const [clienteId,       setClienteId]       = useState<string | null>(null)
  const [reservasCliente, setReservasCliente] = useState<string[]>([])
  const [claseActiva,     setClaseActiva]     = useState<any | null>(null)
  const [spotSel,         setSpotSel]         = useState<string | null>(null)
  const [reservando,      setReservando]      = useState(false)
  const [confirmacion,    setConfirmacion]    = useState<any | null>(null)
  const [modalQR,         setModalQR]         = useState(false)
  const [confirmacionQR,  setConfirmacionQR]  = useState<any>(null)
  const [modalBloqueo,    setModalBloqueo]    = useState(false)
  const [tipoBloqueo, setTipoBloqueo] = useState<'sin_plan' | 'room_no_permitido' | 'sin_clases' | 'plan_vencido' | 'clase_llena'>('sin_plan')
  const [cliente,         setCliente]         = useState<any>(null)
  const [reservaDetalle,  setReservaDetalle]  = useState<any>(null)
  const [roomsPermitidos, setRoomsPermitidos] = useState<string[]>([])
  const [membresia,       setMembresia]       = useState<any | null>(null)
  const [clasesRestantes, setClasesRestantes] = useState<number | null>(null)
  const [mostrarPlan, setMostrarPlan] = useState(false)
  const [sucursalesPermitidas, setSucursalesPermitidas] = useState<string[]>([])

  const diaActivo    = dias[diaIdx]
  const sucursalInfo = sucursales.find(sx => sx.id === sucursalId)

  const validarAcceso = async (clase: any): Promise<boolean> => {
    if (!membresia) {
      setTipoBloqueo('sin_plan'); setModalBloqueo(true); return false
    }
    const hoy = new Date().toISOString().split('T')[0]
    if (membresia.fecha_fin < hoy) {
      setTipoBloqueo('plan_vencido'); setModalBloqueo(true); return false
    }

    // Verificar clases restantes en tiempo real
    if (membresia?.paquetes?.clases_incluidas) {
      const { count } = await supabase
        .from('reservas')
        .select('id', { count: 'exact' })
        .eq('cliente_id', clienteId)
        .eq('membresia_id', membresia.id)  // ← por membresía específica
        .neq('estatus', 'Cancelada') // ← solo reservas dentro de esta membresía
      
      const restantes = membresia.paquetes.clases_incluidas - (count || 0)
      if (restantes <= 0) {
        setTipoBloqueo('sin_clases'); setModalBloqueo(true); return false
      }
    }

    const sucursalPermitida = sucursalesPermitidas.length === 0 || 
      !clase.sucursal_id || 
      sucursalesPermitidas.includes(clase.sucursal_id)

    if (!sucursalPermitida) {
      setTipoBloqueo('room_no_permitido'); setModalBloqueo(true); return false
    }

    if (!sucursalesPermitidas.includes(clase.sucursal_id) && 
        roomsPermitidos.length > 0 && 
        clase.room_id && 
        !roomsPermitidos.includes(clase.room_id)) {
      setTipoBloqueo('room_no_permitido'); setModalBloqueo(true); return false
    }

    return true
  }

  // Dentro del componente, agrega:
  useFocusEffect(
    useCallback(() => {
      if (sucursalId) {
        fetchClases()
        // Recargar reservas del cliente
        if (clienteId) {
          supabase
            .from('reservas')
            .select('clase_id')
            .eq('cliente_id', clienteId)
            .neq('estatus', 'Cancelada')
            .then(({ data }) => setReservasCliente(data?.map((r: any) => r.clase_id) || []))
          
          // Recalcular clases restantes
          if (membresia?.paquetes?.clases_incluidas) {
            supabase
              .from('reservas')
              .select('id', { count: 'exact' })
              .eq('cliente_id', clienteId)
              .neq('estatus', 'Cancelada')
              .gte('created_at', membresia.fecha_inicio)
              .then(({ count }) => setClasesRestantes(membresia.paquetes.clases_incluidas - (count || 0)))
          }
        }
      }
    }, [sucursalId, clienteId])
  )

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: cli } = await supabase
        .from('clientes').select('*').eq('email', session.user.email).single()
      if (cli) {
        setClienteId(cli.id)
        setCliente(cli)
        const { data: res } = await supabase
          .from('reservas').select('clase_id')
          .eq('cliente_id', cli.id).neq('estatus', 'Cancelada')
        setReservasCliente(res?.map((r: any) => r.clase_id) || [])

        const { data: memb } = await supabase
          .from('membresias')
          .select('*, paquetes(id, nombre, clases_incluidas, acceso_sucursal_hermana)')
          .eq('cliente_id', cli.id)
          .eq('estatus', 'Activa')
          .gte('fecha_fin', new Date().toISOString().split('T')[0])
          .order('fecha_fin', { ascending: false })
          .limit(1)
          .single()

        setMembresia(memb || null)

        if (memb?.paquetes?.id) {
          // rooms permitidos (ya lo tienes)
          const { data: rms } = await supabase
            .from('paquete_rooms').select('room_id').eq('paquete_id', memb.paquetes.id)
          setRoomsPermitidos(rms?.map(r => r.room_id) || [])

          // sucursales permitidas ← NUEVO
          const { data: sucsPermitidas } = await supabase
            .from('paquete_accesos_sucursales')
            .select('sucursal_id')
            .eq('paquete_id', memb.paquetes.id)
          setSucursalesPermitidas(sucsPermitidas?.map(s => s.sucursal_id) || [])

          if (memb.paquetes.clases_incluidas) {
            const { count } = await supabase
              .from('reservas').select('id', { count: 'exact' })
              .eq('cliente_id', cli.id).neq('estatus', 'Cancelada')
              .gte('created_at', memb.fecha_inicio)
            setClasesRestantes(memb.paquetes.clases_incluidas - (count || 0))
          }
        }
      }

      const { data: sucs } = await supabase
        .from('sucursales').select('id, nombre, color')
        .eq('estatus', 'Activa').order('nombre')
      if (sucs && sucs.length > 0) {
        setSucursales(sucs)
        setSucursalId(sucs[0].id)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!sucursalId) return
    supabase.from('rooms').select('id, nombre')
      .eq('sucursal_id', sucursalId)
      .then(({ data }) => { setRooms(data || []); setRoomFiltro('todos') })
  }, [sucursalId])

  useEffect(() => {
    if (!sucursalId) return
    fetchClases()
  }, [sucursalId, diaIdx])

  const fetchClases = async () => {
    setLoading(true)
    const dia    = dias[diaIdx]
    const inicio = new Date(dia); inicio.setHours(0,0,0,0)
    const fin    = new Date(dia); fin.setHours(23,59,59,999)

    const { data } = await supabase.from('clases')
      .select('*, staff(id, nombre, primer_apellido), sucursales(nombre), rooms(id, nombre, ancho, alto, layout, room_spots(*)), reservas(id, estatus, spot_id, cliente_id)')
      .eq('sucursal_id', sucursalId)
      .eq('estado', 'Activa')
      .gte('horario', inicio.toISOString())
      .lte('horario', fin.toISOString())
      .order('horario')

    setClases(data || [])
    setLoading(false)
  }

  const clasesFiltered = clases.filter(c =>
    roomFiltro === 'todos' || c.room_id === roomFiltro
  )

  const getReservaActiva = (clase: any) => {
    if (!clienteId) return null
    return clase.reservas?.find((r: any) =>
      r.cliente_id === clienteId && r.estatus !== 'Cancelada'
    ) || null
  }

  const handleReservar = async () => {
    if (!clienteId || !claseActiva || !spotSel) return
    setReservando(true)

    // Verificar clases restantes en tiempo real
    if (membresia?.paquetes?.clases_incluidas) {
      const { count } = await supabase
        .from('reservas')
        .select('id', { count: 'exact' })
        .eq('cliente_id', clienteId)
        .eq('membresia_id', membresia.id)  // ← por membresía específica
        .neq('estatus', 'Cancelada')
      
      const restantes = membresia.paquetes.clases_incluidas - (count || 0)
      if (restantes <= 0) {
        setReservando(false)
        setTipoBloqueo('sin_clases')
        setModalBloqueo(true)
        return
      }
    }

    // Verificar cupo
    const reservasActivas = claseActiva.reservas?.filter(
      (r: any) => r.estatus !== 'Cancelada'
    ).length || 0

    if (reservasActivas >= claseActiva.capacidad_max) {
      setReservando(false)
      setTipoBloqueo('clase_llena')
      setModalBloqueo(true)
      return
    }

    const { data: reserva, error } = await supabase.from('reservas').insert({
      cliente_id:  clienteId,
      clase_id:    claseActiva.id,
      room_id:     claseActiva.room_id,
      spot_id:     spotSel,
      estatus:     'Confirmada',
      origen:      'App',
      membresia_id: membresia?.id || null,  // ← agrega esto
    }).select().single()

    if (error) { setReservando(false); return }

    haptic.success()

    // Actualizar Wellhub
    if (claseActiva.wellhub_slot_id && claseActiva.wellhub_class_id) {
      try {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/wellhub/actualizar-cupos`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slot_id:      claseActiva.wellhub_slot_id,
            clase_id:     claseActiva.wellhub_class_id,
            total_booked: reservasActivas + 1,
            sucursal_id:  claseActiva.sucursal_id,
          }),
        })
      } catch (e) { console.warn('Error actualizando Wellhub:', e) }
    }

    // Actualizar TotalPass
    if (claseActiva.totalpass_occurrence_uuid) {
      try {
        await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/totalpass-booking/actualizar-cupos`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            occurrence_uuid: claseActiva.totalpass_occurrence_uuid,
            sucursal_id:     claseActiva.sucursal_id,
            slots:           claseActiva.capacidad_max - (reservasActivas + 1),
          }),
        })
      } catch (e) { console.warn('Error actualizando TotalPass:', e) }
    }

    // Notificación + correo + QR
    try {
      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/reservas/confirmar-notificacion`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reserva_id: reserva.id,
          cliente_id: clienteId,
          clase_id:   claseActiva.id,
        }),
      })
    } catch (e) { console.warn('Error notificación:', e) }

    // Recargar reservas del cliente desde Supabase
    const { data: reservasActualizadas } = await supabase
      .from('reservas')
      .select('clase_id')
      .eq('cliente_id', clienteId)
      .neq('estatus', 'Cancelada')
    setReservasCliente(reservasActualizadas?.map((r: any) => r.clase_id) || [])

    // Si agotó las clases del paquete actual → vencer la membresía y tomar la siguiente
    if (membresia?.paquetes?.clases_incluidas) {
      const { count } = await supabase
        .from('reservas')
        .select('id', { count: 'exact' })
        .eq('cliente_id', clienteId)
        .eq('membresia_id', membresia.id)  // ← por membresía específica
        .neq('estatus', 'Cancelada')

      const usadas = count || 0

      if (usadas >= membresia.paquetes.clases_incluidas) {
        // Vencer membresía actual
        await supabase
          .from('membresias')
          .update({ estatus: 'Vencida' })
          .eq('id', membresia.id)

        // Tomar siguiente membresía activa
        const { data: nuevaMemb } = await supabase
          .from('membresias')
          .select('*, paquetes(id, nombre, clases_incluidas, acceso_sucursal_hermana)')
          .eq('cliente_id', clienteId)
          .eq('estatus', 'Activa')
          .gte('fecha_fin', new Date().toISOString().split('T')[0])
          .order('fecha_fin', { ascending: false })
          .limit(1)
          .single()

        setMembresia(nuevaMemb || null)

        // Actualizar plan en clientes
        await supabase
          .from('clientes')
          .update({
            plan:       nuevaMemb?.paquetes?.nombre || '',
            paquete_id: nuevaMemb?.paquetes?.id || null,
          })
          .eq('id', clienteId)

        if (nuevaMemb?.paquetes?.clases_incluidas) {
          setClasesRestantes(nuevaMemb.paquetes.clases_incluidas)
        } else {
          setClasesRestantes(null)
        }
      } else {
        setClasesRestantes(membresia.paquetes.clases_incluidas - usadas)
      }
    }

    const spot = claseActiva.rooms?.room_spots?.find((s: any) => s.id === spotSel)
    setConfirmacion({ reserva, clase: claseActiva, spot })
    setClaseActiva(null)
    setSpotSel(null)
    setReservando(false)
    fetchClases()
  }

  if (mostrarPlan) return (
    <FlujoPlan
      cliente={cliente}
      onTerminar={() => { setMostrarPlan(false); fetchClases() }}
      onReservar={() => setMostrarPlan(false)}
    />
  )

  return (
    <View style={s.container}>

      <ConfirmacionReserva
        confirmacion={confirmacion}
        onVerQR={() => {
          setConfirmacionQR(confirmacion)
          setConfirmacion(null)
          setTimeout(() => setModalQR(true), 300)
        }}
        onVolver={() => setConfirmacion(null)}
      />

      <ModalQR
        visible={modalQR}
        confirmacion={confirmacionQR}
        onClose={() => { setModalQR(false); setConfirmacionQR(null) }}
      />

      <DetalleClase
        clase={claseActiva}
        spotSel={spotSel}
        reservando={reservando}
        reservaActiva={claseActiva ? getReservaActiva(claseActiva) : null}
        onClose={() => { setClaseActiva(null); setSpotSel(null) }}
        onSelectSpot={setSpotSel}
        onReservar={handleReservar}
        onCancelada={() => {
          setClaseActiva(null)
          setSpotSel(null)
          setReservasCliente(prev => prev.filter(id => id !== claseActiva?.id))
          fetchClases()
        }}
      />

      <ModalDetalleReserva
        reserva={reservaDetalle}
        onClose={() => setReservaDetalle(null)}
        onCancelada={() => {
          if (reservaDetalle) {
            setReservasCliente(prev => prev.filter(id => id !== reservaDetalle.clase_id))
          }
          setReservaDetalle(null)
          fetchClases()
        }}
      />

      <ModalSinAcceso
        visible={modalBloqueo}
        tipo={tipoBloqueo}
        onClose={() => setModalBloqueo(false)}
        onComprar={() => { setModalBloqueo(false); setMostrarPlan(true) }}
      />

      {/* Modal selector sucursal */}
      <Modal visible={modalSucursal} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={s.sucursalOverlay}>
          <View style={s.sucursalSheet}>
            <View style={s.sucursalSheetHeader}>
              <Text style={s.sucursalSheetTitulo}>Seleccionar sucursal</Text>
              <TouchableOpacity onPress={() => setModalSucursal(false)}>
                <Ionicons name="close" size={22} color="#111" />
              </TouchableOpacity>
            </View>
            {sucursales.map(suc => (
              <TouchableOpacity key={suc.id}
                style={[s.sucursalItem, sucursalId === suc.id && s.sucursalItemActive]}
                onPress={() => { setSucursalId(suc.id); setModalSucursal(false) }}>
                <View style={[s.sucursalItemDot, { backgroundColor: suc.color }]} />
                <Text style={[s.sucursalItemNombre, sucursalId === suc.id && { color: '#fff' }]}>
                  {suc.nombre}
                </Text>
                {sucursalId === suc.id && (
                  <Ionicons name="checkmark" size={18} color="#fff" style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitulo}>Reservar clase</Text>
        <Text style={s.headerFecha}>
          {diaActivo.toLocaleDateString('es-MX', {
            weekday: 'short', day: 'numeric', month: 'short'
          }).toUpperCase()}
        </Text>
      </View>

      {/* Carrusel días */}
      <View style={s.diasContainer}>
        <ScrollView
          ref={diaScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 4, paddingHorizontal: 16, paddingVertical: 8 }}>
          {dias.map((d, i) => {
            const esHoy  = i === 0
            const activo = diaIdx === i
            return (
              <TouchableOpacity key={i} onPress={() => cambiarDia(i)}
                style={[s.diaBtn, activo && s.diaBtnActive]}>
                <Text style={[s.diaNombre, activo && s.diaNombreActive]}>
                  {esHoy ? 'Hoy' : DIAS_CORTO[d.getDay()]}
                </Text>
                <Text style={[s.diaNum, activo && s.diaNumActive]}>
                  {d.getDate()}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Filtros sucursal */}
      <View style={s.filtrosBar}>
        <TouchableOpacity style={s.sucursalSelector} onPress={() => setModalSucursal(true)}>
          <Text style={s.sucursalLabel}>Sucursal</Text>
          <View style={[s.sucursalDot, { backgroundColor: sucursalInfo?.color || '#6366f1' }]} />
          <Text style={s.sucursalNombre}>{sucursalInfo?.nombre || '...'}</Text>
          <Ionicons name="chevron-down" size={14} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity style={s.filtroBtn}>
          <Ionicons name="funnel-outline" size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Pills rooms */}
      <View style={s.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillsContent}>
          <TouchableOpacity
            onPress={() => setRoomFiltro('todos')}
            style={[s.pill, roomFiltro === 'todos' && s.pillActive]}>
            <Text style={[s.pillText, roomFiltro === 'todos' && s.pillTextActive]}>Todas</Text>
          </TouchableOpacity>
          {rooms.map(r => (
            <TouchableOpacity key={r.id}
              onPress={() => setRoomFiltro(r.id)}
              style={[s.pill, roomFiltro === r.id && s.pillActive]}>
              <Text style={[s.pillText, roomFiltro === r.id && s.pillTextActive]}>{r.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista clases */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
        {loading ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            {[1,2,3,4,5].map(i => <SkeletonClase key={i} />)}
          </View>
        ) : clasesFiltered.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="calendar-outline" size={40} color="#e5e7eb" />
            <Text style={s.emptyText}>No hay clases para este día</Text>
            <Text style={s.emptySubText}>Prueba con otra fecha o sucursal</Text>
          </View>
        ) : (
          <FlatList
            data={clasesFiltered}
            keyExtractor={c => c.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
            renderItem={({ item }) => (
              <ClaseRow
                clase={item}
                reservada={reservasCliente.includes(item.id)}
                onPress={() => {
                  const reservaActiva = getReservaActiva(item)
                  if (reservaActiva) {
                    setReservaDetalle({
                      ...reservaActiva,
                      clases: item,
                      clase_id: item.id,
                    })
                  } else {
                    validarAcceso(item).then(ok => { if (ok) setClaseActiva(item) })
                  }
                }}
              />
            )}
          />
        )}
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#fff' },
  header:              { backgroundColor: '#171B24', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20 },
  headerTitulo:        { color: '#fff', fontSize: 22, fontFamily: 'Gotham_700Bold' },
  headerFecha:         { color: '#9ca3af', fontSize: 12, fontFamily: 'Gotham_400Regular', marginTop: 2 },
  diasContainer:       { backgroundColor: '#171B24' },
  diaBtn:              { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, minWidth: 52 },
  diaBtnActive:        { backgroundColor: '#fff' },
  diaNombre:           { color: '#6b7280', fontSize: 11, fontFamily: 'Gotham_700Bold', marginBottom: 4 },
  diaNombreActive:     { color: '#171B24' },
  diaNum:              { color: '#fff', fontSize: 20, fontFamily: 'Gotham_700Bold' },
  diaNumActive:        { color: '#171B24' },
  filtrosBar:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sucursalSelector:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sucursalLabel:       { fontSize: 13, fontFamily: 'Gotham_400Regular', color: '#6b7280' },
  sucursalDot:         { width: 8, height: 8, borderRadius: 4 },
  sucursalNombre:      { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#111' },
  filtroBtn:           { padding: 8, backgroundColor: '#f9fafb', borderRadius: 10, borderWidth: 1, borderColor: '#f3f4f6' },
  pillsContainer:      { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  pillsContent:        { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  pill:                { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: '#f3f4f6' },
  pillActive:          { backgroundColor: '#171B24' },
  pillText:            { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#6b7280' },
  pillTextActive:      { color: '#fff' },
  loadingBox:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 60 },
  emptyText:           { color: '#374151', fontFamily: 'Gotham_700Bold', fontSize: 16 },
  emptySubText:        { color: '#9ca3af', fontFamily: 'Gotham_400Regular', fontSize: 13 },
  sucursalOverlay:     { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sucursalSheet:       { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48 },
  sucursalSheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sucursalSheetTitulo: { fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#111' },
  sucursalItem:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, marginBottom: 8, backgroundColor: '#f9fafb' },
  sucursalItemActive:  { backgroundColor: '#171B24' },
  sucursalItemDot:     { width: 10, height: 10, borderRadius: 5 },
  sucursalItemNombre:  { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111' },
})