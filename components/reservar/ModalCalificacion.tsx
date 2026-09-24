import { useState } from 'react'
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'

interface Props {
  visible:   boolean
  clase:     any | null
  clienteId: string | null
  onClose:   () => void
}

export default function ModalCalificacion({ visible, clase, clienteId, onClose }: Props) {
  const [rating,      setRating]      = useState(0)
  const [comentario,  setComentario]  = useState('')
  const [enviando,    setEnviando]    = useState(false)
  const [enviado,     setEnviado]     = useState(false)

  if (!clase) return null

  const coachNombre = clase.staff
    ? `${clase.staff.nombre} ${clase.staff.primer_apellido}`
    : 'el coach'

  const handleEnviar = async () => {
    if (rating === 0 || !clienteId) return
    setEnviando(true)

    // 1. Insertar reseña
    await supabase.from('reseñas').insert({
      cliente_id: clienteId,
      staff_id:   clase.coach_id,
      clase_id:   clase.id,
      rating,
      comentario: comentario.trim() || null,
    })

    // 2. Recalcular rating promedio del coach
    const { data: reseñas } = await supabase
      .from('reseñas')
      .select('rating')
      .eq('staff_id', clase.coach_id)

    if (reseñas && reseñas.length > 0) {
      const promedio = reseñas.reduce((a, r) => a + r.rating, 0) / reseñas.length
      await supabase.from('staff').update({
        rating:        Math.round(promedio * 10) / 10,
        total_reseñas: reseñas.length,
      }).eq('id', clase.coach_id)
    }

    await supabase.from('asistencias')
      .update({ calificacion_descartada: true })
      .eq('cliente_id', clienteId)
      .eq('clase_id', clase.id)

    setEnviando(false)
    setEnviado(true)
  }

  const handleCerrar = async () => {
    // Si no calificó, marcar como descartada
    if (!enviado && clienteId && clase?.id) {
      await supabase.from('asistencias')
        .update({ calificacion_descartada: true })
        .eq('cliente_id', clienteId)
        .eq('clase_id', clase.id)
    }
    setRating(0)
    setComentario('')
    setEnviado(false)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Pantalla de éxito */}
        {enviado ? (
          <View style={s.exitoContainer}>
            <TouchableOpacity style={s.exitoClose} onPress={handleCerrar}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={s.exitoCheck}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </View>
            <Text style={s.exitoTitulo}>Gracias por tus comentarios</Text>
            <Text style={s.exitoSub}>
              Con tu opinión mejoramos nuestros servicios,{'\n'}nos alegra que disfrutaras tu clase
            </Text>
            <TouchableOpacity style={s.exitoBtnPrimario} onPress={handleCerrar}>
              <Text style={s.exitoBtnPrimarioText}>Reservar otra clase</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.exitoBtnSecundario} onPress={handleCerrar}>
              <Text style={s.exitoBtnSecundarioText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Sheet de calificación
          <View style={s.overlay}>
            <View style={s.sheet}>

              {/* Avatar coach */}
              <View style={s.coachAvatar}>
                <Ionicons name="person" size={32} color="#6b7280" />
              </View>
              <Text style={s.coachNombre}>{clase.staff?.nombre} {clase.staff?.primer_apellido}</Text>

              <Text style={s.titulo}>
                ¿Qué te pareció{'\n'}tu clase de {clase.rooms?.nombre || clase.nombre_clase} con {clase.staff?.nombre}?
              </Text>
              <Text style={s.sub}>
                Tu opinión nos importa para mejorar nuestros{'\n'}servicios, califica a tu coach.
              </Text>

              {/* Estrellas */}
              <View style={s.estrellas}>
                {[1,2,3,4,5].map(i => (
                  <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7}>
                    <Ionicons
                      name={i <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={i <= rating ? '#f59e0b' : '#d1d5db'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.estrellasLabels}>
                <Text style={s.estrellasLabel}>Muy mala</Text>
                <Text style={s.estrellasLabel}>Muy buena</Text>
              </View>

              {/* Comentario */}
              <TextInput
                style={s.input}
                placeholder="Deja un comentario"
                placeholderTextColor="#9ca3af"
                multiline
                value={comentario}
                onChangeText={setComentario}
                numberOfLines={3}
              />
              <Text style={s.anonimo}>Tu comentario se envía de forma anónima.</Text>

              {/* Botones */}
              <TouchableOpacity
                style={[s.btnTerminar, rating === 0 && s.btnDisabled]}
                disabled={rating === 0 || enviando}
                onPress={handleEnviar}
                activeOpacity={0.85}>
                <Text style={s.btnTerminarText}>
                  {enviando ? 'Enviando...' : 'Terminar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.btnCancelar} onPress={handleCerrar}>
                <Text style={s.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  )
}

const s = StyleSheet.create({
  // Sheet
  overlay:         { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet:           { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 28, paddingTop: 32, paddingBottom: 48, alignItems: 'center' },
  coachAvatar:     { width: 72, height: 72, borderRadius: 36, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  coachNombre:     { fontSize: 14, color: '#6b7280', fontFamily: 'Gotham_400Regular', marginBottom: 16 },
  titulo:          { fontSize: 22, fontFamily: 'Gotham_700Bold', color: '#111', textAlign: 'center', lineHeight: 30, marginBottom: 8 },
  sub:             { fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  estrellas:       { flexDirection: 'row', gap: 8, marginBottom: 8 },
  estrellasLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  estrellasLabel:  { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  input:           { width: '100%', backgroundColor: '#f9fafb', borderRadius: 14, padding: 16, fontSize: 14, color: '#111', fontFamily: 'Gotham_400Regular', minHeight: 80, textAlignVertical: 'top', marginBottom: 8 },
  anonimo:         { fontSize: 11, color: '#9ca3af', fontFamily: 'Gotham_400Regular', alignSelf: 'flex-start', marginBottom: 24 },
  btnTerminar:     { backgroundColor: '#171B24', borderRadius: 16, paddingVertical: 18, width: '100%', alignItems: 'center', marginBottom: 12 },
  btnDisabled:     { backgroundColor: '#e5e7eb' },
  btnTerminarText: { color: '#fff', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  btnCancelar:     { paddingVertical: 12, width: '100%', alignItems: 'center' },
  btnCancelarText: { fontSize: 15, color: '#6b7280', fontFamily: 'Gotham_400Regular' },

  // Éxito
  exitoContainer:      { flex: 1, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  exitoClose:          { position: 'absolute', top: 56, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  exitoCheck:          { width: 72, height: 72, borderRadius: 36, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  exitoTitulo:         { color: '#fff', fontSize: 26, fontFamily: 'Gotham_700Bold', textAlign: 'center', marginBottom: 12 },
  exitoSub:            { color: '#9ca3af', fontSize: 14, fontFamily: 'Gotham_400Regular', textAlign: 'center', lineHeight: 22, marginBottom: 48 },
  exitoBtnPrimario:    { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  exitoBtnPrimarioText:{ color: '#111', fontSize: 16, fontFamily: 'Gotham_700Bold' },
  exitoBtnSecundario:  { paddingVertical: 14, width: '100%', alignItems: 'center' },
  exitoBtnSecundarioText: { color: '#9ca3af', fontSize: 15, fontFamily: 'Gotham_400Regular' },
})