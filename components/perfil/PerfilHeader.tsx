import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  cliente:       any
  membresia:     any
  membresiaCola: any
  onEditar:      () => void
  onCambiarPlan: () => void
}

export default function PerfilHeader({ cliente, membresia, membresiaCola, onEditar, onCambiarPlan }: Props) {
  const [showCola, setShowCola] = useState(false)

  const iniciales  = cliente?.nombre_completo?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '?'
  const nombre     = cliente?.nombre_completo || '—'
  const plan       = membresia?.paquetes?.nombre || cliente?.plan || 'Sin plan activo'
  const fechaFin   = membresia?.fecha_fin || null
  const clasesRest = membresia?.paquetes?.clases_incluidas
    ? membresia.paquetes.clases_incluidas - (cliente?.clases_usadas || 0)
    : null

  const diasRestantes = fechaFin
    ? Math.ceil((new Date(fechaFin).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : null

  const formatFecha = (fecha: string) => {
    if (!fecha) return '—'
    const [year, month, day] = fecha.split('-')
    return new Date(Number(year), Number(month) - 1, Number(day))
      .toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const origenLabel = (origen: string) => {
    if (origen === 'Cortesia') return '🎁 Cortesía — sin costo'
    if (origen === 'Stripe')   return '💳 Comprado en línea'
    if (origen === 'Terminal') return '💳 Comprado en sucursal'
    if (origen === 'Migración') return '📦 Migración'
    return origen || '—'
  }

  const vigenciaLabel = (dias?: number) => {
    if (!dias) return '—'
    if (dias >= 365) return `${Math.floor(dias/365)} año${Math.floor(dias/365) > 1 ? 's' : ''}`
    if (dias >= 30)  return `${Math.floor(dias/30)} mes${Math.floor(dias/30) > 1 ? 'es' : ''}`
    return `${dias} días`
  }

  return (
    <View style={s.container}>

      {/* Card usuario */}
      <View style={s.userCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{iniciales}</Text>
        </View>
        <View style={s.userInfo}>
          <Text style={s.nombre}>{nombre}</Text>
          <Text style={s.email}>{cliente?.email || '—'}</Text>
        </View>
        <TouchableOpacity onPress={onEditar} style={s.editBtn}>
          <Ionicons name="pencil-outline" size={18} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Card plan */}
      {(membresia || cliente?.plan) && (
        <View style={s.planCard}>
          <View style={s.planTop}>
            <Text style={s.planLabel}>PLAN ACTUAL</Text>
            {diasRestantes !== null && (
              <View style={[s.diasBadge, diasRestantes <= 7 && s.diasBadgeRojo]}>
                <Ionicons name="time-outline" size={10} color={diasRestantes <= 7 ? '#ef4444' : '#9ca3af'} />
                <Text style={[s.diasText, diasRestantes <= 7 && { color: '#ef4444' }]}>
                  {diasRestantes <= 0 ? 'Expirado' : `${diasRestantes}d restantes`}
                </Text>
              </View>
            )}
          </View>

          <Text style={s.planNombre}>{plan}</Text>

          <View style={s.planInfo}>
            {clasesRest !== null && (
              <View style={s.infoChip}>
                <Ionicons name="fitness-outline" size={12} color="#9ca3af" />
                <Text style={s.infoChipText}>{clasesRest} clases restantes</Text>
              </View>
            )}
            {fechaFin && (
              <View style={s.infoChip}>
                <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
                <Text style={s.infoChipText}>
                  Vence {new Date(fechaFin).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            )}
          </View>

          <View style={s.planBtns}>
            <TouchableOpacity style={s.renovarBtn} onPress={onCambiarPlan} activeOpacity={0.85}>
              <Ionicons name="refresh-outline" size={15} color="#171B24" />
              <Text style={s.renovarText}>{membresia ? 'Cambiar plan' : 'Contratar plan'}</Text>
            </TouchableOpacity>
            {membresiaCola && (
              <TouchableOpacity style={s.colaBtn} onPress={() => setShowCola(true)} activeOpacity={0.85}>
                <Ionicons name="layers-outline" size={15} color="#fff" />
                <Text style={s.colaBtnText}>En cola</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Bottom sheet — paquete en cola */}
      <Modal visible={showCola} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />

            <View style={s.sheetHeader}>
              <View style={s.sheetIconWrap}>
                <Ionicons name="layers-outline" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetTitulo}>Paquete en cola</Text>
                <Text style={s.sheetSub}>Se activará al vencer tu plan actual</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCola(false)} style={s.sheetClose}>
                <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Card paquete */}
            <View style={s.sheetPlanCard}>
              <View>
                <Text style={s.sheetPlanNombre}>{membresiaCola?.paquetes?.nombre}</Text>
                <Text style={s.sheetPlanSub}>
                  {vigenciaLabel(membresiaCola?.paquetes?.vigencia_dias)} de vigencia
                </Text>
              </View>
              <View style={s.sheetPlanBadge}>
                <Text style={s.sheetPlanBadgeText}>EN COLA</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {[
                {
                  icon: 'calendar-outline',
                  label: 'Fecha de inicio',
                  val: formatFecha(membresiaCola?.fecha_inicio),
                },
                {
                  icon: 'flag-outline',
                  label: 'Fecha de término',
                  val: formatFecha(membresiaCola?.fecha_fin),
                },
                {
                  icon: 'timer-outline',
                  label: 'Duración',
                  val: vigenciaLabel(membresiaCola?.paquetes?.vigencia_dias),
                },
                {
                  icon: 'business-outline',
                  label: 'Sucursal',
                  val: membresiaCola?.sucursales?.nombre || cliente?.sucursales?.nombre || 'Todas las sucursales',
                },
                {
                  icon: 'gift-outline',
                  label: 'Origen',
                  val: origenLabel(membresiaCola?.origen),
                },
                {
                  icon: 'cash-outline',
                  label: 'Costo',
                  val: membresiaCola?.precio_pagado === 0
                    ? 'Sin costo (cortesía)'
                    : `$${(membresiaCola?.precio_pagado || 0).toLocaleString('es-MX')} MXN`,
                },
                {
                  icon: 'fitness-outline',
                  label: 'Clases incluidas',
                  val: membresiaCola?.paquetes?.clases_incluidas
                    ? `${membresiaCola.paquetes.clases_incluidas} clases`
                    : 'Ilimitadas',
                },
                {
                  icon: 'checkmark-circle-outline',
                  label: 'Estatus',
                  val: membresiaCola?.estatus || '—',
                },
              ].map((item, i) => (
                <View key={i} style={s.sheetRow}>
                  <View style={s.sheetRowIcon}>
                    <Ionicons name={item.icon as any} size={16} color="#6b7280" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sheetRowLabel}>{item.label}</Text>
                    <Text style={s.sheetRowVal}>{item.val}</Text>
                  </View>
                </View>
              ))}

              {membresiaCola?.notas && (
                <View style={s.sheetNotas}>
                  <Text style={s.sheetNotasLabel}>Notas</Text>
                  <Text style={s.sheetNotasText}>{membresiaCola.notas}</Text>
                </View>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity style={s.sheetCerrar} onPress={() => setShowCola(false)} activeOpacity={0.85}>
              <Text style={s.sheetCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  )
}

const s = StyleSheet.create({
  container: { backgroundColor: '#f9fafb', padding: 16, gap: 12 },

  userCard:   { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  avatar:     { width: 52, height: 52, borderRadius: 26, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontFamily: 'Gotham_700Bold', color: '#fff' },
  userInfo:   { flex: 1 },
  nombre:     { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#0f172a' },
  email:      { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 2 },
  editBtn:    { padding: 8, backgroundColor: '#f9fafb', borderRadius: 10 },

  planCard:      { backgroundColor: '#171B24', borderRadius: 20, padding: 20, gap: 12 },
  planTop:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planLabel:     { fontSize: 10, color: '#4b5563', fontFamily: 'Gotham_700Bold', letterSpacing: 2 },
  diasBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8 },
  diasBadgeRojo: { backgroundColor: 'rgba(239,68,68,0.12)' },
  diasText:      { fontSize: 10, color: '#9ca3af', fontFamily: 'Gotham_700Bold' },
  planNombre:    { fontSize: 26, fontFamily: 'Gotham_700Bold', color: '#fff', letterSpacing: -0.5 },
  planInfo:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoChip:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  infoChipText:  { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  planBtns:      { flexDirection: 'row', gap: 8 },
  renovarBtn:    { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  renovarText:   { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#171B24' },
  colaBtn:       { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  colaBtnText:   { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#fff' },

  overlay:          { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:            { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '85%' },
  sheetHandle:      { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetHeader:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sheetIconWrap:    { width: 44, height: 44, borderRadius: 22, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center' },
  sheetTitulo:      { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#0f172a' },
  sheetSub:         { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 2 },
  sheetClose:       { padding: 8 },
  sheetPlanCard:    { backgroundColor: '#171B24', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sheetPlanNombre:  { fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#fff' },
  sheetPlanSub:     { fontSize: 12, color: '#6b7280', fontFamily: 'Gotham_400Regular', marginTop: 3 },
  sheetPlanBadge:   { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  sheetPlanBadgeText:{ fontSize: 9, fontFamily: 'Gotham_700Bold', color: '#9ca3af', letterSpacing: 1 },
  sheetRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sheetRowIcon:     { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  sheetRowLabel:    { fontSize: 10, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textTransform: 'uppercase', letterSpacing: 0.5 },
  sheetRowVal:      { fontSize: 14, color: '#0f172a', fontFamily: 'Gotham_700Bold', marginTop: 2 },
  sheetNotas:       { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, marginTop: 12 },
  sheetNotasLabel:  { fontSize: 10, color: '#9ca3af', fontFamily: 'Gotham_700Bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  sheetNotasText:   { fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_400Regular', lineHeight: 20 },
  sheetCerrar:      { backgroundColor: '#171B24', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  sheetCerrarText:  { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#fff' },
})