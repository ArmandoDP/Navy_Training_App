import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type TipoBloqueo = 'sin_plan' | 'room_no_permitido' | 'sin_clases' | 'plan_vencido' | 'clase_llena'

interface Props {
  visible:   boolean
  tipo:      TipoBloqueo
  onClose:   () => void
  onComprar: () => void
}

const CONTENIDO: Record<TipoBloqueo, { icon: string; titulo: string; sub: string; btn: string }> = {
  sin_plan: {
    icon:   'lock-closed-outline',
    titulo: 'Necesitas un plan',
    sub:    'Adquiere un plan para empezar a reservar clases y disfrutar de todos los beneficios de Navy.',
    btn:    'Ver planes disponibles',
  },
  room_no_permitido: {
    icon:   'shield-outline',
    titulo: 'Tu plan no incluye este room',
    sub:    'Tu membresía actual no tiene acceso a este room. Cambia tu plan para acceder a más clases.',
    btn:    'Cambiar mi plan',
  },
  sin_clases: {
    icon:   'calendar-outline',
    titulo: 'Agotaste tus clases',
    sub:    'Has usado todas las clases de tu plan. Renueva o cambia tu plan para seguir entrenando.',
    btn:    'Renovar mi plan',
  },
  plan_vencido: {
    icon:   'time-outline',
    titulo: 'Tu plan venció',
    sub:    'Tu membresía expiró. Renueva tu plan para volver a reservar clases y seguir entrenando.',
    btn:    'Renovar mi plan',
  },
  clase_llena: {
    icon:   'people-outline',
    titulo: 'Clase llena',
    sub:    'No hay cupos disponibles para esta clase. Prueba con otro horario o fecha.',
    btn:    'Ver otras clases',
  },
}

export default function ModalSinAcceso({ visible, tipo, onClose, onComprar }: Props) {
  const c = CONTENIDO[tipo]

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.iconBox}>
            <Ionicons name={c.icon as any} size={32} color="#171B24" />
          </View>
          <Text style={s.titulo}>{c.titulo}</Text>
          <Text style={s.sub}>{c.sub}</Text>

          <TouchableOpacity 
            style={s.btnPrimario} 
            onPress={tipo === 'clase_llena' ? onClose : onComprar} 
            activeOpacity={0.85}>
            <Text style={s.btnPrimarioText}>{c.btn} →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.btnSecundario} onPress={onClose}>
            <Text style={s.btnSecundarioText}>Seguir viendo clases</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay:         { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:           { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32, paddingBottom: 48, alignItems: 'center' },
  iconBox:         { width: 72, height: 72, borderRadius: 36, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  titulo:          { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center', marginBottom: 12 },
  sub:             { fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  btnPrimario:     { backgroundColor: '#171B24', borderRadius: 16, paddingVertical: 18, width: '100%', alignItems: 'center', marginBottom: 12 },
  btnPrimarioText: { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  btnSecundario:   { paddingVertical: 12, width: '100%', alignItems: 'center' },
  btnSecundarioText:{ color: '#9ca3af', fontSize: 14, fontFamily: 'Gotham_400Regular' },
})