import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, Platform } from 'react-native'
import { useNavigation }  from '@react-navigation/native'
import { useState, useEffect } from 'react'
import { Ionicons }       from '@expo/vector-icons'
import { supabase }       from '../../lib/supabase'
import ImageSlider        from '../../components/shared/ImageSlider'
import { biometriaDisponible, tipoBiometria } from '../../lib/biometrics'
import * as Notifications from 'expo-notifications'
import * as Device        from 'expo-device'

const { height } = Dimensions.get('window')

interface Props { onContinuar?: () => void }

export default function BienvenidoScreen({ onContinuar }: Props) {
  const navigation = useNavigation<any>()
  const [nombre,   setNombre]  = useState('')
  const [modalBio, setModalBio] = useState(false)
  const [bioTipo,  setBioTipo]  = useState('Biometría')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase
        .from('clientes').select('id, nombre_completo')
        .eq('email', session.user.email).single()
      if (data) {
        setNombre(data.nombre_completo?.split(' ')[0] || '')
        registrarPushToken(data.id)
      }
    })
    checkBio()
  }, [])

  const registrarPushToken = async (clienteId: string) => {
    if (!Device.isDevice) return
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') return
    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId: 'f6cc94e2-5033-4e57-8672-80d24b674b3d'
      })
      if (!token) return
      await supabase.from('push_tokens').upsert({
        cliente_id: clienteId,
        token,
        plataforma: Platform.OS,
      }, { onConflict: 'cliente_id' })
    } catch (e) {
      console.log('Error registrando push token:', e)
    }
  }

  const checkBio = async () => {
    const disponible = await biometriaDisponible()
    if (!disponible) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.email) return
    const { data: cli } = await supabase.from('clientes')
      .select('bio_activada').eq('email', session.user.email).single()
    if (!cli?.bio_activada) {
      tipoBiometria().then(setBioTipo)
      setModalBio(true)
    }
  }

  const handleActivar = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.email) {
      await supabase.from('clientes')
        .update({ bio_activada: true })
        .eq('email', session.user.email)
    }
    setModalBio(false)
  }

  const handleContinuar = () => {
    if (onContinuar) onContinuar()
    else navigation.navigate('Main')
  }

  return (
    <View style={s.container}>
      <ImageSlider
        height={height * 0.60}
        gradientColors={['transparent', 'transparent', 'rgba(0,0,0,0.1)', '#0000']}
        interval={3500}
      />
      <View style={s.content}>
        <Text style={s.titulo}>Te damos la bienvenida{nombre ? `, ${nombre}.` : '!'}</Text>
        <Text style={s.sub}>Administra tu membresía, agenda y sé parte de la mejor comunidad de atletas.</Text>
        <TouchableOpacity style={s.btnPrimary} onPress={handleContinuar} activeOpacity={0.85}>
          <Text style={s.btnPrimaryText}>Ir al Inicio →</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalBio} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={s.bioSheet}>
            <View style={s.handle} />
            <View style={{ alignItems: 'center', gap: 16, paddingVertical: 20 }}>
              <View style={s.bioIconBox}>
                <Ionicons
                  name={bioTipo === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                  size={36} color="#171B24" />
              </View>
              <Text style={s.bioTitulo}>Activa {bioTipo}</Text>
              <Text style={s.bioSub}>
                La próxima vez podrás entrar con {bioTipo} sin escribir nada.
              </Text>
            </View>
            <TouchableOpacity style={s.btnActivar} onPress={handleActivar} activeOpacity={0.85}>
              <Text style={s.btnActivarText}>Activar {bioTipo}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 14 }}
              onPress={() => setModalBio(false)}>
              <Text style={{ fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular' }}>Ahora no</Text>
            </TouchableOpacity>
            <View style={{ height: 34 }} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#000' },
  content:        { flex: 1, paddingHorizontal: 28, paddingTop: 8, paddingBottom: 60, justifyContent: 'flex-end', gap: 26 },
  titulo:         { color: '#fff', fontSize: 38, fontFamily: 'Gotham_700Bold', lineHeight: 48 },
  sub:            { color: '#fff', fontSize: 20, fontFamily: 'Gotham_400Regular', lineHeight: 26 },
  btnPrimary:     { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  btnPrimaryText: { color: '#000', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  bioSheet:       { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12 },
  handle:         { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  bioIconBox:     { width: 72, height: 72, borderRadius: 24, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  bioTitulo:      { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center' },
  bioSub:         { fontSize: 15, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
  btnActivar:     { backgroundColor: '#171B24', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 4 },
  btnActivarText: { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
})