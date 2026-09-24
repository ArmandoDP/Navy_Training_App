import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ModalInvitadoApp from '../plan/ModalInvitadoApp'
import { useState, useEffect } from 'react'

interface Props {
  paquete:    any
  cliente:    any  // ← agrega
  onReservar: () => void
  onInicio:   () => void
}

export default function PantallaConfirmacionPago({ paquete, cliente, onReservar, onInicio }: Props) {
  const [mostrarInvitado, setMostrarInvitado] = useState(false)

  // Si el paquete tiene 2 usuarios, mostrar modal de invitado
  useEffect(() => {
    if (paquete?.max_usuarios === 2) {
      setMostrarInvitado(true)
    }
  }, [])

  if (mostrarInvitado) return (
    <ModalInvitadoApp
      paquete={paquete}
      cliente={cliente}
      onTerminar={() => setMostrarInvitado(false)}
    />
  )

  return (
    <View style={s.container}>
      <View style={s.check}>
        <Ionicons name="checkmark" size={48} color="#fff" />
      </View>
      <Text style={s.titulo}>¡Gracias por tu pago!</Text>
      <Text style={s.sub}>
        Tu paquete <Text style={s.bold}>{paquete?.nombre}</Text> está activo.{'\n'}
        {paquete?.clases_incluidas ? `${paquete.clases_incluidas} clases` : 'Ilimitado'} / {paquete?.vigencia_dias} días.
      </Text>
      <TouchableOpacity style={s.btnPrimario} onPress={onReservar}>
        <Text style={s.btnPrimarioText}>Reservar mi primera clase</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnSecundario} onPress={onInicio}>
        <Text style={s.btnSecundarioText}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  check:           { width: 80, height: 80, borderRadius: 40, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  titulo:          { color: '#fff', fontSize: 28, fontFamily: 'Gotham_700Bold', textAlign: 'center', marginBottom: 12 },
  sub:             { color: '#9ca3af', fontSize: 15, fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  bold:            { fontFamily: 'Gotham_700Bold', color: '#fff' },
  btnPrimario:     { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  btnPrimarioText: { color: '#111', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  btnSecundario:   { paddingVertical: 14, width: '100%', alignItems: 'center' },
  btnSecundarioText:{ color: '#9ca3af', fontSize: 15, fontFamily: 'Gotham_400Regular' },
})