'use client'
import { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, NativeSyntheticEvent, NativeScrollEvent
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Documento = 'terminos' | 'aviso'

interface SeccionDoc {
  titulo: string
  contenido: string[]
}

const TERMINOS_SECCIONES: SeccionDoc[] = [
  {
    titulo: '1. Aceptación de los términos',
    contenido: [
      'El acceso, registro y uso de la aplicación móvil NAVY TRAINING CENTER, del sitio web, plataforma de reservas, kioscos digitales, sistemas de acceso, instalaciones físicas y cualquier servicio operado por NAVY TRAINING CENTER implica la aceptación total de los presentes Términos y Condiciones.',
      'En caso de no estar de acuerdo con cualquiera de sus disposiciones, el usuario deberá abstenerse de utilizar cualquiera de los servicios.',
    ]
  },
  {
    titulo: '2. Definiciones',
    contenido: [
      'NAVY: NAVY TRAINING CENTER y todas las sociedades operadoras, sucursales y franquicias autorizadas.',
      'Usuario: Persona física registrada dentro de la plataforma.',
      'App: Aplicación móvil oficial.',
      'Plataforma: Sitio web, software, kioscos, sistemas de acceso y aplicación móvil.',
      'Membresía: Servicio contratado que permite acceder a determinados beneficios.',
      'Clase: Sesión grupal o individual impartida por NAVY.',
      'Coach: Entrenador certificado por NAVY.',
      'Instalaciones: Todos los estudios, gimnasios y espacios operados por NAVY.',
    ]
  },
  {
    titulo: '3. Registro de usuario',
    contenido: [
      'Crear una cuenta personal y proporcionar información veraz.',
      'Mantener actualizados tus datos y método de pago.',
      'Ser responsable de toda actividad realizada desde tu cuenta.',
      'NAVY podrá suspender cuentas con información falsa o incompleta.',
    ]
  },
  {
    titulo: '4. Acceso a instalaciones',
    contenido: [
      'El acceso podrá realizarse mediante: código QR, código dinámico, reconocimiento facial, huella digital, identificación oficial u otro método implementado por NAVY.',
      'NAVY podrá negar el acceso cuando exista adeudo, membresía vencida, uso indebido, incumplimiento del reglamento o riesgo para terceros.',
    ]
  },
  {
    titulo: '5. Membresías',
    contenido: [
      'Las membresías son personales e intransferibles.',
      'No podrán compartirse, revenderse ni utilizarse con fines comerciales.',
      'El uso indebido podrá provocar la cancelación inmediata sin derecho a reembolso.',
    ]
  },
  {
    titulo: '6. Reservas',
    contenido: [
      'Las clases deberán reservarse exclusivamente mediante la aplicación.',
      'Las reservas estarán sujetas a disponibilidad.',
      'NAVY podrá modificar horarios, coaches o salones por razones operativas.',
    ]
  },
  {
    titulo: '7. Lista de espera',
    contenido: [
      'Cuando una clase alcance su capacidad máxima, el usuario podrá ingresar a lista de espera.',
      'La asignación será automática conforme exista disponibilidad.',
      'Será responsabilidad del usuario revisar si obtuvo un lugar.',
    ]
  },
  {
    titulo: '8. Cancelaciones de clase',
    contenido: [
      'Las clases deberán cancelarse con al menos 12 horas de anticipación.',
      'Las cancelaciones posteriores serán consideradas No Show.',
      'No existirán excepciones por olvido.',
    ]
  },
  {
    titulo: '9. Política de No Show',
    contenido: [
      'Membresías activas: cargo por No Show de $150 MXN al método de pago registrado.',
      'Usuarios con paquetes: pérdida automática de la clase.',
      'Usuarios con pases individuales: pérdida del pase.',
      'No será posible eliminar manualmente un No Show generado por la plataforma.',
    ]
  },
  {
    titulo: '10. Política de llegadas tarde',
    contenido: [
      'Después del inicio del calentamiento el acceso podrá ser negado.',
      'La decisión será tomada por el coach.',
      'En dicho supuesto aplicarán las reglas de No Show.',
    ]
  },
  {
    titulo: '11. Pagos y cargos recurrentes',
    contenido: [
      'Los pagos podrán realizarse mediante tarjeta bancaria, Stripe, plataformas autorizadas u otro medio aprobado por NAVY.',
      'Las membresías recurrentes autorizan cargos automáticos periódicos.',
      'Es responsabilidad del usuario mantener vigente su método de pago.',
      'Para cancelar una membresía recurrente se debe notificar en sucursal al menos 2 días antes de que venza el plazo.',
    ]
  },
  {
    titulo: '12. Facturación',
    contenido: [
      'Las facturas deberán solicitarse dentro del mismo mes del pago.',
      'NAVY no estará obligado a emitir CFDI de meses anteriores conforme a la legislación fiscal vigente.',
    ]
  },
  {
    titulo: '13. Reembolsos',
    contenido: [
      'Solo proceden por: cargo duplicado, error atribuible a NAVY, o lesión acreditada mediante certificado médico.',
      'No hay devoluciones por falta de uso, cambio de opinión, vacaciones, mudanza, inconformidad con horarios o ausencia del usuario.',
      'Los reembolsos serán revisados por Gerencia y se realizarán por el mismo medio de pago original.',
    ]
  },
  {
    titulo: '14. Pausa de membresías',
    contenido: [
      'Anual: hasta 3 días por mes.',
      'Semestral: hasta 2 días por mes.',
      'Mensual: hasta 1 día por mes, previa autorización.',
      'Las pausas no son acumulables.',
    ]
  },
  {
    titulo: '15. Estado de salud',
    contenido: [
      'El usuario declara encontrarse físicamente apto y haber consultado a su médico cuando resulte necesario.',
      'El usuario conoce los riesgos inherentes al ejercicio de alta intensidad.',
      'Toda participación será bajo su propio riesgo.',
    ]
  },
  {
    titulo: '16. Responsabilidad médica',
    contenido: [
      'NAVY no presta servicios médicos.',
      'Los coaches brindan únicamente instrucciones deportivas.',
      'Cualquier lesión derivada de enfermedades preexistentes será responsabilidad exclusiva del usuario.',
    ]
  },
  {
    titulo: '17. Primeros auxilios',
    contenido: [
      'En caso de emergencia el usuario autoriza al personal de NAVY para aplicar primeros auxilios, contactar servicios médicos y contactar a su contacto de emergencia registrado.',
    ]
  },
  {
    titulo: '18. Reglamento de instalaciones',
    contenido: [
      'Prohibido: fumar, consumir alcohol, ingresar bajo efectos de drogas, dañar equipo, utilizar lenguaje ofensivo, acosar usuarios, grabar sin consentimiento, apartar equipo o realizar actividades comerciales.',
      'NAVY podrá retirar inmediatamente al usuario que incumpla el reglamento.',
    ]
  },
  {
    titulo: '19. Uso del equipo',
    contenido: [
      'Todo equipo deberá utilizarse conforme a las instrucciones del coach.',
      'El usuario responderá por daños ocasionados por negligencia o mal uso.',
    ]
  },
  {
    titulo: '20. Lockers y objetos personales',
    contenido: [
      'Los lockers son de uso temporal.',
      'NAVY no responde por robo, pérdida, deterioro u objetos olvidados.',
      'Los lockers podrán abrirse al finalizar el día por razones operativas.',
    ]
  },
  {
    titulo: '21. Imagen y grabaciones',
    contenido: [
      'Las instalaciones cuentan con videovigilancia.',
      'NAVY podrá captar fotografías o videos de eventos y clases para fines promocionales.',
      'Quien no desee aparecer podrá solicitarlo por escrito previo al evento.',
    ]
  },
  {
    titulo: '22. Propiedad intelectual',
    contenido: [
      'Todo el contenido de la aplicación, metodología de entrenamiento, marcas, logotipos, imágenes, videos y materiales pertenecen exclusivamente a NAVY.',
      'Queda prohibida su reproducción.',
    ]
  },
  {
    titulo: '23. Suspensión o terminación',
    contenido: [
      'NAVY podrá cancelar una membresía por: fraude, compartir accesos, agresiones, daños al inmueble, incumplimiento reiterado del reglamento o conductas que afecten a la comunidad.',
      'Lo anterior podrá realizarse sin responsabilidad para NAVY.',
    ]
  },
  {
    titulo: '24. Modificaciones',
    contenido: [
      'NAVY podrá modificar estos Términos y Condiciones en cualquier momento.',
      'Las nuevas versiones entrarán en vigor desde su publicación dentro de la aplicación.',
    ]
  },
  {
    titulo: '25. Aviso de privacidad',
    contenido: [
      'El tratamiento de datos personales se realizará conforme al Aviso de Privacidad publicado por NAVY y a la legislación mexicana aplicable.',
    ]
  },
  {
    titulo: '26. Legislación aplicable',
    contenido: [
      'Estos Términos se regirán por las leyes de los Estados Unidos Mexicanos.',
      'Las partes se someten a la jurisdicción de los tribunales competentes de la Ciudad de México, renunciando a cualquier otro fuero.',
    ]
  },
]

const AVISO_SECCIONES: SeccionDoc[] = [
  {
    titulo: '1. Responsable del tratamiento',
    contenido: [
      'Navy Training Club Holding, Querétaro, México, C.P. 76226.',
      'Contacto de privacidad: contacto@navytrainingcenter.com',
    ]
  },
  {
    titulo: '2. Datos que recopilamos',
    contenido: [
      'Identificación: nombre, correo electrónico, teléfono, foto de perfil (opcional).',
      'Membresía y actividad: paquete contratado, sucursal, reservas, historial de asistencia.',
      'Pagos: historial de transacciones. Los datos de tarjeta los procesa el proveedor de pagos.',
      'Técnicos: identificador de dispositivo para notificaciones push, sistema operativo.',
    ]
  },
  {
    titulo: '3. Finalidades del tratamiento',
    contenido: [
      'Crear y administrar tu cuenta, membresía y reservas.',
      'Procesar pagos, renovaciones y facturación.',
      'Enviarte notificaciones sobre membresía, clases y novedades.',
      'Mejorar la app y atender solicitudes de soporte.',
      'No vendemos tus datos ni los usamos para publicidad de terceros.',
    ]
  },
  {
    titulo: '4. Con quién compartimos datos',
    contenido: [
      'Proveedor de pagos: datos de pago y facturación.',
      'Google Firebase / Apple APNs: notificaciones push.',
      'TotalPass / Fitpass: validación de accesos corporativos.',
      'Resend: envío de correos transaccionales.',
      'Microsoft Azure: infraestructura y almacenamiento.',
    ]
  },
  {
    titulo: '5. Retención de datos',
    contenido: [
      'Datos de cuenta: mientras esté activa. Al eliminar, se borran en máximo 30 días.',
      'Historial de pagos: 5 años (obligación fiscal).',
      'Identificadores push: se eliminan al cerrar sesión o desinstalar la app.',
      'Registros técnicos: máximo 12 meses.',
    ]
  },
  {
    titulo: '6. Eliminación de cuenta',
    contenido: [
      'Desde la app: Perfil → Configuración → Eliminar cuenta.',
      'Por correo: contacto@navytrainingcenter.com.',
      'En línea: navytrainingcenter.com/eliminar-cuenta.',
      'Procesamos la solicitud en máximo 30 días naturales.',
    ]
  },
  {
    titulo: '7. Tus derechos (ARCO)',
    contenido: [
      'Puedes ejercer derechos de Acceso, Rectificación, Cancelación y Oposición.',
      'Escribe a contacto@navytrainingcenter.com.',
      'Responderemos en los plazos que marca la ley.',
    ]
  },
  {
    titulo: '8. Menores de edad',
    contenido: [
      'La app no está dirigida a menores de 18 años.',
      'Los menores solo pueden inscribirse a través de su madre, padre o tutor.',
    ]
  },
  {
    titulo: '9. Seguridad',
    contenido: [
      'Cifrado en tránsito (TLS), controles de acceso por rol.',
      'Infraestructura en Microsoft Azure con monitoreo de accesos.',
    ]
  },
]

interface Props {
  visible:    boolean
  onAceptar:  () => void
  onRechazar: () => void
}

export default function ModalTerminos({ visible, onAceptar, onRechazar }: Props) {
  const [paso,           setPaso]           = useState<Documento>('terminos')
  const [terminosLeidos, setTerminosLeidos] = useState(false)
  const [avisoLeido,     setAvisoLeido]     = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const esTerminos  = paso === 'terminos'
  const secciones   = esTerminos ? TERMINOS_SECCIONES : AVISO_SECCIONES
  const titulo      = esTerminos ? 'Términos y Condiciones' : 'Aviso de Privacidad'
  const yaLeido     = esTerminos ? terminosLeidos : avisoLeido

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
    const alFinal = layoutMeasurement.height + contentOffset.y >= contentSize.height - 60
    if (alFinal) {
      if (esTerminos) setTerminosLeidos(true)
      else setAvisoLeido(true)
    }
  }

  const handleSiguiente = () => {
    if (esTerminos) {
      setPaso('aviso')
      scrollRef.current?.scrollTo({ y: 0, animated: false })
    } else {
      onAceptar()
    }
  }

  const reset = () => {
    setPaso('terminos')
    setTerminosLeidos(false)
    setAvisoLeido(false)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => { reset(); onRechazar() }}>

      <View style={s.container}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View style={s.pasos}>
              <View style={[s.paso, esTerminos && s.pasoActivo]} />
              <View style={[s.paso, !esTerminos && s.pasoActivo]} />
            </View>
            <TouchableOpacity onPress={() => { reset(); onRechazar() }} style={s.closeBtn}>
              <Ionicons name="close" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={s.headerBadge}>
            <Ionicons name={esTerminos ? 'document-text' : 'shield-checkmark'} size={14} color="#6366f1" />
            <Text style={s.headerBadgeText}>{esTerminos ? 'Paso 1 de 2' : 'Paso 2 de 2'}</Text>
          </View>
          <Text style={s.titulo}>{titulo}</Text>
          <Text style={s.sub}>Lee el documento completo para poder aceptar</Text>
        </View>

        {/* Hint */}
        {!yaLeido && (
          <View style={s.hint}>
            <Ionicons name="finger-print-outline" size={14} color="#6366f1" />
            <Text style={s.hintText}>Desplázate hacia abajo para leer todo el documento</Text>
          </View>
        )}

        {/* Contenido */}
        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>

          <View style={s.docHeader}>
            <View style={s.docIconBig}>
              <Ionicons name={esTerminos ? 'document-text' : 'shield-checkmark'} size={28} color="#fff" />
            </View>
            <Text style={s.docTituloBig}>{titulo}</Text>
            <Text style={s.docFecha}>Última actualización: 5 de agosto de 2026</Text>
            <Text style={s.docEmpresa}>Navy Training Club Holding · Querétaro, México</Text>
          </View>

          {secciones.map((sec, i) => (
            <View key={i} style={s.seccion}>
              <View style={s.seccionHeader}>
                <View style={s.seccionNum}>
                  <Text style={s.seccionNumText}>{i + 1}</Text>
                </View>
                <Text style={s.seccionTitulo}>{sec.titulo.replace(/^\d+\.\s/, '')}</Text>
              </View>
              {sec.contenido.map((linea, j) => (
                <View key={j} style={s.lineaRow}>
                  <View style={s.lineaDot} />
                  <Text style={s.lineaText}>{linea}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={s.docFooter}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#9ca3af" />
            <Text style={s.docFooterText}>Fin del documento</Text>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          {yaLeido ? (
            <>
              <View style={s.leidoRow}>
                <View style={s.leidoCheck}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <Text style={s.leidoText}>
                  Documento leído — {esTerminos ? 'Términos y Condiciones' : 'Aviso de Privacidad'}
                </Text>
              </View>
              <TouchableOpacity style={s.btnAceptar} onPress={handleSiguiente} activeOpacity={0.85}>
                <Text style={s.btnAceptarText}>
                  {esTerminos ? 'Acepto los Términos →' : 'Acepto ambos documentos →'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnRechazar} onPress={() => { reset(); onRechazar() }}>
                <Text style={s.btnRechazarText}>No acepto</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={s.pendiente}>
              <View style={s.pendienteIcon}>
                <Ionicons name="arrow-down" size={16} color="#6366f1" />
              </View>
              <Text style={s.pendienteText}>Lee el documento completo para habilitar el botón de aceptar</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f9fafb' },
  header:         { backgroundColor: '#fff', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTop:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  pasos:          { flexDirection: 'row', gap: 4 },
  paso:           { width: 24, height: 3, borderRadius: 2, backgroundColor: '#e5e7eb' },
  pasoActivo:     { backgroundColor: '#171B24', width: 36 },
  closeBtn:       { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  headerBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#eef2ff', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start', marginBottom: 8 },
  headerBadgeText:{ fontSize: 11, fontFamily: 'Gotham_700Bold', color: '#6366f1' },
  titulo:         { fontSize: 20, fontFamily: 'Gotham_700Bold', color: '#111', marginBottom: 4 },
  sub:            { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  hint:           { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#eef2ff', paddingHorizontal: 20, paddingVertical: 10 },
  hintText:       { fontSize: 12, color: '#6366f1', fontFamily: 'Gotham_400Regular', flex: 1 },
  scroll:         { flex: 1 },
  docHeader:      { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, backgroundColor: '#171B24', marginBottom: 16 },
  docIconBig:     { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  docTituloBig:   { fontSize: 18, fontFamily: 'Gotham_700Bold', color: '#fff', textAlign: 'center', marginBottom: 4 },
  docFecha:       { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Gotham_400Regular' },
  docEmpresa:     { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Gotham_400Regular', marginTop: 2 },
  seccion:        { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  seccionHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  seccionNum:     { width: 26, height: 26, borderRadius: 8, backgroundColor: '#171B24', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  seccionNumText: { fontSize: 11, fontFamily: 'Gotham_700Bold', color: '#fff' },
  seccionTitulo:  { fontSize: 14, fontFamily: 'Gotham_700Bold', color: '#111', flex: 1 },
  lineaRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  lineaDot:       { width: 5, height: 5, borderRadius: 3, backgroundColor: '#d1d5db', marginTop: 7, flexShrink: 0 },
  lineaText:      { fontSize: 13, color: '#6b7280', fontFamily: 'Gotham_400Regular', flex: 1, lineHeight: 20 },
  docFooter:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 20 },
  docFooterText:  { fontSize: 12, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  footer:         { backgroundColor: '#fff', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#f3f4f6', gap: 10 },
  leidoRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  leidoCheck:     { width: 22, height: 22, borderRadius: 11, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  leidoText:      { fontSize: 13, color: '#22c55e', fontFamily: 'Gotham_700Bold', flex: 1 },
  btnAceptar:     { backgroundColor: '#171B24', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnAceptarText: { color: '#fff', fontSize: 15, fontFamily: 'Gotham_700Bold' },
  btnRechazar:    { alignItems: 'center', paddingVertical: 8 },
  btnRechazarText:{ fontSize: 13, color: '#9ca3af', fontFamily: 'Gotham_400Regular' },
  pendiente:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#eef2ff', borderRadius: 14, padding: 14 },
  pendienteIcon:  { width: 32, height: 32, borderRadius: 10, backgroundColor: '#c7d2fe', alignItems: 'center', justifyContent: 'center' },
  pendienteText:  { fontSize: 13, color: '#6366f1', fontFamily: 'Gotham_400Regular', flex: 1, lineHeight: 18 },
})