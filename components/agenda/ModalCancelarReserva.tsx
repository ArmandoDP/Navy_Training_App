import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  visible:    boolean
  cancelando: boolean
  exitoso:    boolean
  claseNombre:string
  onConfirmar:() => void
  onCerrar:   () => void
  onVolver:   () => void
}

export default function ModalCancelarReserva({ visible, cancelando, exitoso, claseNombre, onConfirmar, onCerrar, onVolver }: Props) {
  if (!visible && !exitoso) return null

  if (exitoso) return (
    <View style={s.exitoContainer}>
      <View style={s.exitoCheck}>
        <Ionicons name="close" size={36} color="#fff" />
      </View>
      <Text style={s.exitoTitulo}>Reserva cancelada</Text>
      <Text style={s.exitoSub}>
        Tu clase <Text style={{ fontFamily: 'Gotham_700Bold' }}>{claseNombre}</Text> se canceló con éxito,{'\n'}puedes agendar una nueva clase.
      </Text>
      <TouchableOpacity style={s.exitoBtnPrimario} onPress={onCerrar}>
        <Text style={s.exitoBtnPrimarioText}>Reservar otra clase</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.exitoBtnSecundario} onPress={onCerrar}>
        <Text style={s.exitoBtnSecundarioText}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={s.overlay}>
      <View style={s.sheet}>
        <Text style={s.titulo}>Cancelar reserva</Text>
        <Text style={s.subtitulo}>Regla de cancelación</Text>
        <Text style={s.texto}>
          Puedes cancelar tu reserva en cualquier momento. Te recomendamos hacerlo con anticipación para liberar el espacio a otros miembros.
        </Text>
        <TouchableOpacity
          style={s.btn}
          onPress={onConfirmar}
          disabled={cancelando}
          activeOpacity={0.85}>
          <Text style={s.btnText}>
            {cancelando ? 'Cancelando...' : 'Cancelar clase'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.volverBtn} onPress={onVolver}>
          <Ionicons name="chevron-back" size={16} color="#6b7280" />
          <Text style={s.volverText}>Volver a la clase</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  overlay:              { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet:                { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 48 },
  titulo:               { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 16 },
  subtitulo:            { fontSize: 13, fontFamily: 'Gotham_700Bold', color: '#9ca3af', marginBottom: 8 },
  texto:                { fontSize: 14, color: '#6b7280', fontFamily: 'Gotham_400Regular', lineHeight: 22, marginBottom: 28 },
  btn:                  { backgroundColor: '#171B24', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16 },
  btnText:              { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  volverBtn:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  volverText:           { fontSize: 14, color: '#6b7280', fontFamily: 'Gotham_400Regular' },
  exitoContainer:       { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  exitoCheck:           { width: 72, height: 72, borderRadius: 36, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  exitoTitulo:          { color: '#fff', fontSize: 28, fontFamily: 'Gotham_700Bold', textAlign: 'center', marginBottom: 12 },
  exitoSub:             { color: '#9ca3af', fontSize: 15, fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  exitoBtnPrimario:     { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  exitoBtnPrimarioText: { color: '#111', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  exitoBtnSecundario:   { paddingVertical: 14, width: '100%', alignItems: 'center' },
  exitoBtnSecundarioText:{ color: '#9ca3af', fontSize: 15, fontFamily: 'Gotham_400Regular' },
})