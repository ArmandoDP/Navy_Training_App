import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  cliente:   any
  membresia: any
  onEditar: () => void
  onCambiarPlan: () => void
}

export default function PerfilHeader({ cliente, membresia, onEditar, onCambiarPlan }: Props) {
  const iniciales     = cliente?.nombre_completo?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || '?'
  const nombre        = cliente?.nombre_completo || '—'
  const plan          = membresia?.paquetes?.nombre || cliente?.plan || 'Sin plan activo'
  const fechaFin      = membresia?.fecha_fin || null
  const clasesRest    = cliente?.clases_restantes || 0

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
          <Text style={s.planLabel}>Mi plan</Text>
          <Ionicons name="barbell-outline" size={28} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={s.planNombre}>{plan}</Text>
          <View style={s.planInfo}>
            <Text style={s.planClases}>{clasesRest} clases restantes</Text>
            {fechaFin && (
              <Text style={s.planVence}>
                Vence: {new Date(fechaFin).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </Text>
            )}
          </View>
          <TouchableOpacity style={s.renovarBtn} onPress={onCambiarPlan}>
            <Text style={s.renovarText}>{membresia ? 'Cambiar plan' : 'Renovar'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container:   { backgroundColor: '#f9fafb', padding: 16, gap: 12 },
  userCard:    { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  avatar:      { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#374151' },
  userInfo:    { flex: 1 },
  nombre:      { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
  email:       { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 2 },
  editBtn:     { padding: 8 },
  planCard:    { backgroundColor: '#171B24', borderRadius: 16, padding: 20, gap: 4 },
  planLabel:   { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginBottom: 8 },
  planNombre:  { fontSize: 28, fontFamily: 'Gotham_700Bold', color: '#fff', marginBottom: 4 },
  planInfo:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  planClases:  { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  planVence:   { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  renovarBtn:  { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  renovarText: { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#111' },
})