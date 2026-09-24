import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native'
import MapView, { Marker, Circle } from 'react-native-maps'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'

interface Props {
  onSelect: (sucursalId: string) => void
}

function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function StepSucursal({ onSelect }: Props) {
  const [sucursales,    setSucursales]    = useState<any[]>([])
  const [seleccionada,  setSeleccionada]  = useState<string | null>(null)
  const [recomendada,   setRecomendada]   = useState<string | null>(null)
  const [ubicacion,     setUbicacion]     = useState<{ lat: number; lon: number } | null>(null)
  const [loadingUbic,   setLoadingUbic]   = useState(true)
  const [loadingSucs,   setLoadingSucs]   = useState(true)

  // Cargar sucursales activas con coordenadas
  useEffect(() => {
    supabase
      .from('sucursales')
      .select('id, nombre, ciudad, direccion, color, latitud, longitud')
      .eq('estatus', 'Activa')
      .not('latitud', 'is', null)
      .order('nombre')
      .then(({ data }) => {
        setSucursales(data || [])
        setLoadingSucs(false)
      })
  }, [])

  // Pedir permiso de ubicación
  useEffect(() => {
    const pedirUbicacion = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLoadingUbic(false)
        return
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        setUbicacion({ lat: loc.coords.latitude, lon: loc.coords.longitude })
      } catch {
        // silencioso
      }
      setLoadingUbic(false)
    }
    pedirUbicacion()
  }, [])

  // Calcular sucursal más cercana
  useEffect(() => {
    if (!ubicacion || sucursales.length === 0) return
    let minDist = Infinity
    let cercana: string | null = null
    for (const s of sucursales) {
      if (!s.latitud || !s.longitud) continue
      const d = distanciaKm(ubicacion.lat, ubicacion.lon, s.latitud, s.longitud)
      if (d < minDist) { minDist = d; cercana = s.id }
    }
    setRecomendada(cercana)
    setSeleccionada(cercana)
  }, [ubicacion, sucursales])

  const loading = loadingUbic || loadingSucs

  const regionInicial = ubicacion
    ? { latitude: ubicacion.lat, longitude: ubicacion.lon, latitudeDelta: 0.3, longitudeDelta: 0.3 }
    : { latitude: 19.4134, longitude: -99.1669, latitudeDelta: 1.5, longitudeDelta: 1.5 }

  return (
    <View style={s.container}>
      <Text style={s.titulo}>Elige tu sucursal</Text>
      <Text style={s.sub}>
        {ubicacion
          ? 'Detectamos tu ubicación y te recomendamos la más cercana'
          : 'Selecciona la sucursal que más te quede'}
      </Text>

      {/* Mapa */}
      <View style={s.mapaContainer}>
        {loading ? (
          <View style={s.mapaLoading}>
            <ActivityIndicator color="#171B24" />
            <Text style={s.mapaLoadingText}>Detectando tu ubicación...</Text>
          </View>
        ) : (
          <MapView style={s.mapa} initialRegion={regionInicial} showsUserLocation={!!ubicacion}>
            {sucursales.map(suc => (
              <Marker
                key={suc.id}
                coordinate={{ latitude: suc.latitud, longitude: suc.longitud }}
                onPress={() => setSeleccionada(suc.id)}
                pinColor={seleccionada === suc.id ? '#171B24' : suc.color || '#6b7280'}
              />
            ))}
          </MapView>
        )}
      </View>

      {/* Lista de sucursales */}
      <ScrollView style={s.lista} showsVerticalScrollIndicator={false}>
        {sucursales.map(suc => {
          const esRecomendada = suc.id === recomendada
          const esSeleccionada = suc.id === seleccionada
          const dist = ubicacion && suc.latitud
            ? distanciaKm(ubicacion.lat, ubicacion.lon, suc.latitud, suc.longitud)
            : null

          return (
            <TouchableOpacity
              key={suc.id}
              style={[s.sucCard, esSeleccionada && s.sucCardActive]}
              onPress={() => setSeleccionada(suc.id)}
              activeOpacity={0.8}>
              <View style={[s.sucDot, { backgroundColor: suc.color || '#171B24' }]} />
              <View style={s.sucInfo}>
                <View style={s.sucNombreRow}>
                  <Text style={[s.sucNombre, esSeleccionada && s.sucNombreActive]}>
                    {suc.nombre}
                  </Text>
                  {esRecomendada && (
                    <View style={s.recomBadge}>
                      <Text style={s.recomBadgeText}>⭐ Recomendada</Text>
                    </View>
                  )}
                </View>
                <Text style={s.sucDireccion}>{suc.direccion}</Text>
                {dist !== null && (
                  <Text style={s.sucDist}>{dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`}</Text>
                )}
              </View>
              {esSeleccionada && (
                <Ionicons name="checkmark-circle" size={22} color="#171B24" />
              )}
            </TouchableOpacity>
          )
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Botón continuar */}
      <TouchableOpacity
        style={[s.btn, !seleccionada && s.btnDisabled]}
        disabled={!seleccionada}
        onPress={() => seleccionada && onSelect(seleccionada)}
        activeOpacity={0.85}>
        <Text style={s.btnText}>Continuar →</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container:       { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  titulo:          { fontSize: 28, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 6 },
  sub:             { fontSize: 14, color: '#9ca3af', fontFamily: 'Gotham_400Regular', marginBottom: 20 },
  mapaContainer:   { height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 20, backgroundColor: '#f3f4f6' },
  mapa:            { flex: 1 },
  mapaLoading:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  mapaLoadingText: { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  lista:           { flex: 1 },
  sucCard:         { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: '#f3f4f6' },
  sucCardActive:   { backgroundColor: '#f0f0f0', borderColor: '#171B24' },
  sucDot:          { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  sucInfo:         { flex: 1, gap: 3 },
  sucNombreRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  sucNombre:       { fontSize: 15, fontFamily: 'Gotham_700Bold', color: '#374151' },
  sucNombreActive: { color: '#111' },
  sucDireccion:    { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  sucDist:         { fontSize: 12, color: '#6b7280', fontFamily: 'Gotham_700Bold' },
  recomBadge:      { backgroundColor: '#fef9c3', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  recomBadgeText:  { fontSize: 11, color: '#854d0e', fontFamily: 'Gotham_700Bold' },
  btn:             { backgroundColor: '#171B24', borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginTop: 12, marginBottom: 40 },
  btnDisabled:     { backgroundColor: '#e5e7eb' },
  btnText:         { color: '#fff', fontSize: 17, fontFamily: 'Gotham_700Bold' },
})