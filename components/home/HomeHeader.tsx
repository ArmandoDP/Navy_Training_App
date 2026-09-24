import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'

interface Props {
  nombre:   string
  iniciales: string
}

export default function HomeHeader({ nombre, iniciales }: Props) {
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{iniciales}</Text>
        </View>
        <View>
          <Text style={s.hola}>Hola</Text>
          <Text style={s.nombre}>{nombre}</Text>
        </View>
      </View>
      <View style={s.headerRight}>
        <View style={s.campana}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View style={s.campanaBadge} />
        </View>
        {/* <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Text style={s.salir}>Salir</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  header:      { backgroundColor: '#171B24', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6b7280', alignItems: 'center', justifyContent: 'center' },
  avatarText:  { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  hola:        { color: '#ffff', fontSize: 14, fontFamily: 'Gotham_400Regular' },
  nombre:      { color: '#fff', fontSize: 20, fontFamily: 'Gotham_700Bold' },
  campana:     { position: 'relative' },
  campanaBadge:{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  salir:       { color: '#9ca3af', fontSize: 12, fontFamily: 'Gotham_400Regular' },
})