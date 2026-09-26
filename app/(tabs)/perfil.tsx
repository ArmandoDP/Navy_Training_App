import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons }            from '@expo/vector-icons'
import { supabase }            from '../../lib/supabase'
import PerfilHeader            from '../../components/perfil/PerfilHeader'
import PerfilMenu              from '../../components/perfil/PerfilMenu'
import PantallaDatosPersonales from '../../components/perfil/PantallaDatosPersonales'
import PantallaEmergencia      from '../../components/perfil/PantallaEmergencia'
import PantallaFacturacion     from '../../components/perfil/PantallaFacturacion'
import PantallaPassword        from '../../components/perfil/PantallaPassword'
import PantallaConfiguracion   from '../../components/perfil/PantallaConfiguracion'
import PantallaHistorialPago   from '../../components/perfil/PantallaHistorialPago'
import PantallaMetodosPago     from '../../components/perfil/PantallaMetodosPago'
import FlujoPlan               from '../../components/plan/FlujoPlan'
import PantallaReservas        from '../../components/perfil/PantallaReservas'
import PantallaNotificaciones  from '../../components/perfil/PantallaNotificaciones'
import SkeletonBox             from '../../components/shared/SkeletonBox'

type Pantalla = null | 'datos' | 'emergencia' | 'facturacion' | 'password' | 'config' | 'historial' | 'metodos' | 'plan' | 'reservas' | 'notif'

export default function PerfilScreen() {
  const [pantalla,      setPantalla]      = useState<Pantalla>(null)
  const [cliente,       setCliente]       = useState<any>(null)
  const [membresia,     setMembresia]     = useState<any>(null)
  const [membresiaCola, setMembresiaCola] = useState<any>(null)
  const [refreshing,    setRefreshing]    = useState(false)
  const [reservasCount, setReservasCount] = useState(0)
  const [ultimoPago,    setUltimoPago]    = useState<any>(null)
  const [loading,       setLoading]       = useState(true)

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const { data: cli } = await supabase
      .from('clientes').select('*').eq('email', session.user.email).single()
    if (cli) setCliente(cli)

    const { data: memb } = await supabase
      .from('membresias')
      .select('*, paquetes(nombre)')
      .eq('cliente_id', cli?.id)
      .eq('estatus', 'Activa')
      .order('fecha_fin', { ascending: false })
      .limit(1)
      .single()
    if (memb) setMembresia(memb)
    
    // Paquete en cola
    const { data: cola } = await supabase
      .from('membresias')
      .select('*, paquetes(nombre, vigencia_dias, clases_incluidas)')
      .eq('cliente_id', cli?.id)
      .eq('estatus', 'Activa')
      .gt('fecha_inicio', new Date().toISOString().split('T')[0])
      .order('fecha_inicio', { ascending: true })
      .limit(1)
      .single()
    setMembresiaCola(cola || null)

    const { count } = await supabase
      .from('reservas')
      .select('id', { count: 'exact' })
      .eq('cliente_id', cli?.id)
      .eq('estatus', 'Confirmada')
      .gte('created_at', new Date().toISOString())
    setReservasCount(count || 0)

    const { data: pago } = await supabase
      .from('pagos')
      .select('monto, created_at')
      .eq('cliente_id', cli?.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (pago) setUltimoPago(pago)

    setLoading(false)
  }

  // ← HOOKS SIEMPRE ANTES DE CUALQUIER RETURN CONDICIONAL
  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [])
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [])

  const handleLogout = async () => await supabase.auth.signOut()

  const handleMenuSelect = (key: string) => {
    if (key === 'datos')       setPantalla('datos')
    if (key === 'emergencia')  setPantalla('emergencia')
    if (key === 'facturacion') setPantalla('facturacion')
    if (key === 'password')    setPantalla('password')
    if (key === 'config')      setPantalla('config')
    if (key === 'historial')   setPantalla('historial')
    if (key === 'metodos')     setPantalla('metodos')
    if (key === 'plan')        setPantalla('plan')
    if (key === 'reservas')    setPantalla('reservas')
    if (key === 'notif')       setPantalla('notif')
  }

  // Sub pantallas
  if (pantalla === 'datos')       return <PantallaDatosPersonales cliente={cliente} onBack={() => setPantalla(null)} onGuardado={fetchData} />
  if (pantalla === 'emergencia')  return <PantallaEmergencia      cliente={cliente} onBack={() => setPantalla(null)} onGuardado={fetchData} />
  if (pantalla === 'facturacion') return <PantallaFacturacion     cliente={cliente} onBack={() => setPantalla(null)} onGuardado={fetchData} />
  if (pantalla === 'password')    return <PantallaPassword                          onBack={() => setPantalla(null)} />
  if (pantalla === 'config')      return <PantallaConfiguracion   cliente={cliente} onBack={() => setPantalla(null)} onGuardado={fetchData} />
  if (pantalla === 'historial')   return <PantallaHistorialPago   cliente={cliente} onBack={() => setPantalla(null)} />
  if (pantalla === 'metodos')     return <PantallaMetodosPago     cliente={cliente} onBack={() => setPantalla(null)} />
  if (pantalla === 'notif')       return <PantallaNotificaciones  cliente={cliente} onBack={() => setPantalla(null)} />
  if (pantalla === 'plan') return (
    <FlujoPlan
      cliente={cliente}
      onTerminar={() => { setPantalla(null); fetchData() }}
      onReservar={() => { setPantalla(null); fetchData() }}
    />
  )
  if (pantalla === 'reservas') return <PantallaReservas cliente={cliente} onBack={() => setPantalla(null)} />

  // Skeleton loading
  if (loading) return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View style={{ gap: 8 }}>
          <SkeletonBox width={80}  height={22} borderRadius={6} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <SkeletonBox width={120} height={12} borderRadius={4} style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
        </View>
        <SkeletonBox width={42} height={42} borderRadius={21} style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </View>
      <View style={{ backgroundColor: '#f9fafb', flex: 1, padding: 16, gap: 12 }}>
        <SkeletonBox width="100%" height={140} borderRadius={20} />
        <SkeletonBox width="100%" height={60}  borderRadius={16} />
        <SkeletonBox width="100%" height={60}  borderRadius={16} />
        <SkeletonBox width="100%" height={60}  borderRadius={16} />
        <SkeletonBox width="100%" height={60}  borderRadius={16} />
      </View>
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitulo}>Mi perfil</Text>
          <Text style={s.headerFecha}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
          </Text>
        </View>
        <View style={s.campana}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View style={s.campanaBadge} />
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9ca3af" />}>

        <PerfilHeader
          cliente={cliente}
          membresia={membresia}
          membresiaCola={membresiaCola}
          onEditar={() => setPantalla('datos')}
          onCambiarPlan={() => setPantalla('plan')}
        />

        <PerfilMenu
          onSelect={handleMenuSelect}
          onLogout={handleLogout}
          tienePlan={!!membresia}
          reservasCount={reservasCount}
          ultimoPago={ultimoPago}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#171B24' },
  header:       { paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitulo: { color: '#fff', fontSize: 22, fontFamily: 'Gotham_700Bold' },
  headerFecha:  { color: '#9ca3af', fontSize: 12, fontFamily: 'Gotham_400Regular', marginTop: 2 },
  campana:      { position: 'relative' },
  campanaBadge: { position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  scroll:       { flex: 1, backgroundColor: '#f9fafb' },
})