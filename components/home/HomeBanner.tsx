import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import ImageSlider        from '../shared/ImageSlider'

const { width } = Dimensions.get('window')

interface Props {
  membresia:  any
  onVerPlan:  () => void
  onReservar: () => void
}

export default function HomeBanner({ membresia, onVerPlan, onReservar }: Props) {
  return (
    <View style={s.container}>
      {/* Slider de fondo */}
      <Image
        source={require('../../assets/images/slide6.jpg')}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', transform: [{ scaleX: -1 }] }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Contenido encima */}
      <View style={s.content}>
        {!membresia ? (
          <>
            {/* <Text style={s.label}>SIN PLAN ACTIVO</Text> */}
            <Text style={s.titulo}>Tu nuevo reto{'\n'}empieza hoy.</Text>
            <Text style={s.sub}>Mira los planes disponibles{'\n'}y reserva tu primera clase.</Text>
            <TouchableOpacity style={s.btn} onPress={onVerPlan} activeOpacity={0.85}>
              <Text style={s.btnText}>Ver membresías →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* <Text style={s.label}>SIGUE AVANZANDO</Text> */}
            <Text style={s.titulo}>Programa{'\n'}tu semana</Text>
            {/* <Text style={s.sub}>Tu estado de ánimo es{'\n'}temporal, tu progreso{'\n'}es permanente.</Text> */}
            <TouchableOpacity style={s.btn} onPress={onReservar} activeOpacity={0.85}>
              <Text style={s.btnText}>Reservar clases →</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { height: 380, overflow: 'hidden' },
  content:   { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 28, gap: 10, paddingTop: 32 },
  label:     { fontSize: 11, fontFamily: 'Gotham_700Bold', color: 'rgba(255,255,255,0.6)', letterSpacing: 3 },
  titulo:    { fontSize: 30, fontFamily: 'Gotham_700Bold', color: '#fff', lineHeight: 32 },
  sub:       { fontSize: 20, color: 'rgba(255,255,255,255)', fontFamily: 'RadioCanadaBig_400light', lineHeight: 24 },
  btn:       { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 13, paddingHorizontal: 22, alignSelf: 'flex-start', marginTop: 12 },
  btnText:   { color: '#000', fontSize: 16, fontFamily: 'RadioCanadaBig_700Regular' },
})