📋 INFORME DE AUDITORÍA - CORPORATE EPIS PILOT
Sistema de Mesa de Ayuda con IA
📌 DATOS GENERALES
Campo	Información
Entidad Auditada	Corporate EPIS Pilot
Ubicación	Tacna, Tacna, Tacna, Perú
Período auditado	24 de junio de 2026
Auditor Responsable	Cristian Aldair Quispe Levano
Fecha del Informe	24 de junio de 2026
Versión del Sistema	1.0.0
Repositorio	Ver repositorio
📑 ÍNDICE
Resumen Ejecutivo

Antecedentes

Objetivos de la Auditoría

Alcance de la Auditoría

Metodología

Hallazgos y Observaciones

Análisis de Riesgos

Recomendaciones

Conclusiones

Plan de Acción

Evidencias

📊 1. RESUMEN EJECUTIVO
La auditoría al sistema Corporate EPIS Pilot se realizó con el objetivo de evaluar la resiliencia en la persistencia de datos, la configuración del despliegue en contenedores Docker y la usabilidad de la interfaz de usuario.

🔍 Hallazgos Principales
#	Hallazgo	Criticidad	Estado
1	Error de montaje de volumen en Docker Compose	🔴 ALTA	✅ Corregido
2	Falta de inicialización dinámica de base de datos	🟡 MEDIA	✅ Corregido
3	Omisión del historial de chats en frontend	🟢 BAJA	✅ Corregido
✅ Estado Final
El sistema se encuentra 100% operativo con el modelo smollm:360m de Ollama, permitiendo la creación y persistencia de tickets en SQLite y el almacenamiento del historial de conversaciones en localStorage.

📋 2. ANTECEDENTES
2.1 Contexto de la Entidad
Corporate EPIS Pilot es una plataforma de asistencia virtual conversacional diseñada para entornos empresariales. El sistema implementa una arquitectura RAG (Retrieval-Augmented Generation) que permite responder dudas basándose en una fuente de conocimiento interna.

2.2 Tecnologías del Sistema
Componente	Tecnología	Función
Backend	Python 3.10, FastAPI, LangChain	Lógica de negocio y API
Frontend	React, TypeScript, MUI	Interfaz de usuario
Base de Datos	SQLite	Persistencia de tickets
IA	smollm:360m (Ollama)	Procesamiento de lenguaje
Contenedores	Docker, Docker Compose	Despliegue
🎯 3. OBJETIVOS DE LA AUDITORÍA
3.1 Objetivo General
Evaluar la resiliencia en la persistencia de datos, la configuración del despliegue en contenedores Docker y la usabilidad de la interfaz de usuario en el sistema de asistencia virtual "Corporate EPIS Pilot".

3.2 Objetivos Específicos
#	Objetivo	Estado
1	Auditar y corregir la configuración del volumen de base de datos en Docker Compose	✅ Cumplido
2	Reestructurar la inicialización dinámica de la base de datos SQLite	✅ Cumplido
3	Habilitar la persistencia del historial de chats con localStorage	✅ Cumplido
4	Validar el flujo de comunicaciones en contenedores	✅ Cumplido
📌 4. ALCANCE DE LA AUDITORÍA
4.1 Componentes Evaluados
✅ Backend (FastAPI, Python, LangChain)

✅ Frontend (React, TypeScript, MUI)

✅ Base de Datos (SQLite)

✅ Despliegue Docker

✅ Modelo IA (smollm:360m)

✅ Sistema RAG y ChromaDB

4.2 Período Auditado
24 de junio de 2026 (8 horas efectivas de auditoría)

🛠️ 5. METODOLOGÍA
5.1 Enfoque
Tipo	Descripción
Basado en Riesgos	Identificación y priorización de riesgos críticos
Basado en Cumplimiento	Verificación contra estándares y políticas
Técnico/Práctico	Pruebas funcionales directas
5.2 Herramientas Utilizadas
Herramienta	Propósito
Docker & Docker Compose	Despliegue y verificación de contenedores
SQLite Browser	Inspección de base de datos
VS Code	Análisis y corrección de código
Chrome DevTools	Verificación de localStorage
Postman / cURL	Pruebas de API
🔍 6. HALLAZGOS Y OBSERVACIONES
6.1 Hallazgo N°1: Error de Montaje de Volumen en Docker Compose
Descripción
Durante el despliegue con docker-compose up --build, se produjo un error crítico:

text
Error: not a directory: Are you trying to mount a directory onto a file?
Causa
Montaje directo del archivo ./backend/tickets.db:/app/tickets.db en lugar del directorio contenedor.

Solución Implementada
yaml
# ANTES (INCORRECTO)
volumes:
  - ./backend/tickets.db:/app/tickets.db

# DESPUÉS (CORRECTO)  
volumes:
  - ./backend/db:/app/db
Criticidad: 🔴 ALTA | Estado: ✅ Corregido

6.2 Hallazgo N°2: Falta de Inicialización Dinámica de la Base de Datos
Descripción
El sistema no verificaba ni creaba automáticamente el directorio de la base de datos SQLite.

Causa
Falta de os.makedirs() en la inicialización y ruta definida sin subdirectorio.

Solución Implementada
python
# En database_setup.py
import os

DB_PATH = "db/tickets.db"

def setup_database():
    db_dir = os.path.dirname(DB_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
    # ... resto del código
Criticidad: 🟡 MEDIA | Estado: ✅ Corregido

6.3 Hallazgo N°3: Omisión del Historial de Chats en el Frontend
Descripción
La interfaz mostraba mensaje estático: "El historial de chats se ha omitido en esta versión."

Causa
Falta de implementación de persistencia con localStorage.

Solución Implementada
typescript
// En App.tsx
const [sessions, setSessions] = useState<ChatSession[]>(() => {
  const saved = localStorage.getItem('chatSessions');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('chatSessions', JSON.stringify(sessions));
}, [sessions]);
Criticidad: 🟢 BAJA | Estado: ✅ Corregido

⚠️ 7. ANÁLISIS DE RIESGOS
7.1 Matriz de Riesgos
Hallazgo	Riesgo Asociado	Impacto	Probabilidad	Nivel
H1	Indisponibilidad del sistema	Alto	Alta	🔴 CRÍTICO
H2	Pérdida de tickets de soporte	Medio	Alta	🟠 ALTO
H3	Pérdida de contexto en conversaciones	Bajo	Media	🟢 BAJO
7.2 Riesgos Adicionales
Riesgo	Impacto	Mitigación
Sin autenticación de usuarios	Alto	Implementar login básico
Sin respaldos de base de datos	Medio	Configurar backups automáticos
Dependencia de smollm:360m	Medio	Tener plan de contingencia
💡 8. RECOMENDACIONES
8.1 Recomendaciones Inmediatas
#	Recomendación	Hallazgo	Estado
1	Mantener configuración corregida en Docker Compose	H1	✅ Realizado
2	Mantener inicialización automática de base de datos	H2	✅ Realizado
3	Mantener historial de chats con localStorage	H3	✅ Realizado
8.2 Recomendaciones a Futuro
#	Recomendación	Plazo	Responsable
1	Implementar autenticación de usuarios	1 mes	Equipo FullStack
2	Configurar respaldos automáticos de SQLite	2 meses	Equipo DevOps
3	Crear documentación de usuario	1 mes	Equipo TI
4	Implementar pruebas automatizadas	2 meses	Equipo Desarrollo
✅ 9. CONCLUSIONES
9.1 Estado General
El sistema Corporate EPIS Pilot se encuentra en condiciones operativas y estables.

9.2 Cumplimiento de Objetivos
Objetivo	Estado
Corrección de Docker Compose	✅ Cumplido
Inicialización automática de base de datos	✅ Cumplido
Historial de chats persistente	✅ Cumplido
Sistema con smollm:360m	✅ Cumplido
9.3 Veredicto Final
✅ EL SISTEMA ESTÁ APROBADO

Los controles existentes son adecuados y eficaces, cumpliendo con la normativa aplicable en los aspectos evaluados.

📋 10. PLAN DE ACCIÓN Y SEGUIMIENTO
Hallazgo	Recomendación	Responsable	Fecha	Estado
H1 - Docker Compose	Mantener configuración corregida	DevOps	24/06/2026	✅ Completado
H2 - Base de datos	Mantener inicialización automática	Backend	24/06/2026	✅ Completado
H3 - Historial de chats	Mantener localStorage	Frontend	24/06/2026	✅ Completado
Mejora - Autenticación	Implementar login	FullStack	31/07/2026	⏳ Pendiente
Mejora - Respaldos	Configurar backups	DevOps	15/08/2026	⏳ Pendiente
📸 11. EVIDENCIAS
11.1 Estructura de Evidencias
text
📁 evidencias/
├── 📄 evidencia1.png        # Docker Compose funcionando
├── 📄 evidencia2.png        # Backend corriendo
├── 📄 evidencia3.png        # Frontend cargando
├── 📄 evidencia4.png        # Historial de chats
├── 📄 evidencia5.png        # localStorage
└── 📄 pagina.png            # Interfaz completa
11.2 Lista de Evidencias
Archivo	Descripción
evidencia1.png	Solución al error de montaje en Docker Compose
evidencia2.png	Inicialización dinámica de base de datos
evidencia3.png	Código corregido en main.py
evidencia4.png	Historial de chats funcionando
evidencia5.png	Persistencia en localStorage
pagina.png	Interfaz de usuario completa
📊 12. ESTADÍSTICAS
12.1 Resumen Final
Métrica	Valor
Hallazgos identificados	3
Hallazgos corregidos	3
Hallazgos pendientes	0
Riesgos críticos mitigados	2
Recomendaciones implementadas	3
12.2 Estado del Sistema
text
✅ Servicios funcionando:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000
   - Ollama: http://localhost:11434

✅ Modelo: smollm:360m cargado
✅ Base de datos: tickets.db creada
✅ Tickets: Persistencia verificada
✅ Historial: localStorage implementado
👤 13. FIRMAS Y APROBACIONES
Nombre	Cargo	Fecha	Firma
Cristian Aldair Quispe Levano	Auditor Responsable	24/06/2026	[Firma Digital]
[Responsable TI]	Jefe de TI	24/06/2026	[Firma Digital]
📎 14. ANEXOS
Anexo A: Comandos de Verificación
bash
# Verificar contenedores
docker ps

# Verificar backend
curl http://localhost:8000/health

# Verificar tickets
sqlite3 backend/db/tickets.db "SELECT * FROM tickets;"
Anexo B: Enlaces de Interés
Repositorio del Proyecto

Documentación de Docker

Documentación de Ollama

