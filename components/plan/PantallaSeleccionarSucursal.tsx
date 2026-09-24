import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons }       from '@expo/vector-icons'
import SubPantallaLayout  from '../perfil/SubPantallaLayout'

interface Props {
  sucursales:        any[]
  sucursalSeleccionada: string | null
  onSeleccionar:     (id: string) => void
  onContinuar:       () => void
  onBack:            () => void
}

const DIRECCIONES: Record<string, string> = {
  'Condesa':           'Av. Nuevo León 107, Condesa, Cuauhtémoc.',
  'Interlomas Gym':    'Blvd. Palmas Hills 1, Naucalpan de Juárez.',
  'Interlomas Studio': 'Blvd. Palmas Hills 1, Naucalpan de Juárez.',
  'Juriquilla':        'Calle R. M. Clemencia Borja Taboada 532, El Salitre.',
  'Lomas':             'Volcán 150, Lomas de Chapultepec, Miguel Hidalgo.',
  'Refugio':           'Fray Junipero Serra, El Refugio, Santiago de Querétaro, Qro.',
}

export default function PantallaSeleccionarSucursal({ sucursales, sucursalSeleccionada, onSeleccionar, onContinuar, onBack }: Props) {
  return (
    <SubPantallaLayout
      titulo="Plan"
      subtitulo="NUEVO PAQUETE"
      onBack={onBack}
      onGuardar={sucursalSeleccionada ? onContinuar : undefined}
      guardando={false}>

      <Text style={s.titulo}>Elige tu sucursal NAVY</Text>

      <View style={s.lista}>
        {sucursales.map(suc => (
          <TouchableOpacity key={suc.id}
            style={[s.item, sucursalSeleccionada === suc.id && s.itemActive]}
            onPress={() => onSeleccionar(suc.id)}
            activeOpacity={0.8}>
            <View style={[s.itemIcon, { backgroundColor: sucursalSeleccionada === suc.id ? '#fff' : '#f3f4f6' }]}>
              <Ionicons name="barbell-outline" size={22}
                color={sucursalSeleccionada === suc.id ? '#171B24' : '#6b7280'} />
            </View>
            <View style={s.itemTexto}>
              <Text style={[s.itemNombre, sucursalSeleccionada === suc.id && s.itemNombreActive]}>
                {suc.nombre}
              </Text>
              <Text style={[s.itemSub, sucursalSeleccionada === suc.id && s.itemSubActive]}>
                {DIRECCIONES[suc.nombre] || suc.nombre}
              </Text>
            </View>
            {sucursalSeleccionada === suc.id && (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </SubPantallaLayout>
  )
}

const s = StyleSheet.create({
  titulo:        { fontSize: 24, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 4 },
  sub:           { fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginBottom: 8 },
  lista:         { gap: 10 },
  item:          { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6' },
  itemActive:    { backgroundColor: '#171B24', borderColor: '#171B24' },
  itemIcon:      { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemTexto:     { flex: 1 },
  itemNombre:    { fontSize: 16, fontFamily: 'Gotham_700Bold', color: '#111' },
  itemNombreActive: { color: '#fff' },
  itemSub:       { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginTop: 2 },
  itemSubActive: { color: 'rgba(255,255,255,0.6)' },
})