import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props { onComprarPlan: () => void }

export default function ProgresoSinPlan({ onComprarPlan }: Props) {
  return (
    <View style={s.container}>
      <View style={s.iconBox}>
        <Ionicons name="bar-chart-outline" size={48} color="#374151" />
      </View>
      <Text style={s.titulo}>Aún no tienes{'\n'}progreso en Navy</Text>
      <Text style={s.sub}>
        Con un paquete activo empezamos a capturar tu progreso desde el día uno — clases, minutos, rachas y más.
      </Text>
      <TouchableOpacity style={s.btn} onPress={onComprarPlan} activeOpacity={0.85}>
        <Text style={s.btnText}>Ver paquetes disponibles →</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  iconBox:   { width: 96, height: 96, borderRadius: 28, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  titulo:    { fontSize: 28, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center', lineHeight: 36 },
  sub:       { fontSize: 15, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 24 },
  btn:       { backgroundColor: '#171B24', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, marginTop: 8 },
  btnText:   { color: '#fff', fontSize: 15, fontFamily: 'Gotham_700Bold' },
})