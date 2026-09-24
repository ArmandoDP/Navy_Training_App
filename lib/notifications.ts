import * as Notifications from 'expo-notifications'
import * as Device        from 'expo-device'
import Constants          from 'expo-constants'
import { Platform }       from 'react-native'
import { supabase }       from './supabase'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound:  false,
    shouldSetBadge:   false,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
})

export async function registrarPushToken(clienteId: string) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:             'default',
      importance:       Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#FF231F7C',
    })
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId

    if (!projectId) throw new Error('Project ID not found')

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
    console.log('Push token:', token)

    // Guardar en Supabase
    if (token) {
      await supabase.from('push_tokens').upsert({
        cliente_id: clienteId,
        token,
        plataforma: Platform.OS,
      }, { onConflict: 'cliente_id,token' })
    }

    return token
  } catch (e) {
    console.log('Error registrando push token:', e)
    return null
  }
}

export async function enviarNotificacionLocal(titulo: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body, sound: false },
    trigger: {
      type:    Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  })
}