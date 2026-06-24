# PLAN DE AUDITORÍA - SISTEMA CORPORATE EPIS PILOT

**Auditor Encargado:** Quispe  
**Repositorio del Proyecto:** [-AUDITORIA_EXAMEN_3_QUISPE](https://github.com/toallin/-AUDITORIA_EXAMEN_3_QUISPE.git)  
**Fecha:** 24 de Junio de 2026  

---

## 1. OBJETIVO GENERAL

* **Evaluar la resiliencia en la persistencia de datos, la configuración del despliegue en contenedores Docker y la usabilidad de la interfaz de usuario en el sistema de asistencia virtual "Corporate EPIS Pilot", aplicando correcciones técnicas necesarias para garantizar la integridad operativa y la continuidad del historial de conversaciones.**

## 2. OBJETIVOS ESPECÍFICOS (SECUNDARIOS)

1. **Auditar y corregir la configuración del volumen de base de datos en Docker Compose**, eliminando los fallos de inicialización y montaje cruzado en Windows causados por la asignación directa de archivos inexistentes en el host.
2. **Reestructurar la inicialización dinámica de la base de datos SQLite (tickets.db)**, asegurando la existencia automática del directorio de base de datos a nivel de backend tanto en la fase de compilación como en tiempo de ejecución de los contenedores.
3. **Analizar la usabilidad del panel lateral del frontend y habilitar la persistencia del historial de chats**, sustituyendo el mensaje estático de omisión por un sistema local basado en `localStorage` capaz de almacenar, seleccionar y eliminar conversaciones individuales.
4. **Validar el flujo de comunicaciones internas en la arquitectura de contenedores**, garantizando la correcta resolución de peticiones a través de Nginx y la comunicación fluida del backend hacia servicios de inteligencia artificial locales.

---

## 3. RESUMEN DE CORRECCIONES EN EL CÓDIGO

A continuación se detallan las partes del código que fueron corregidas para cumplir con los objetivos del plan de auditoría:

### A. Configuración de Volúmenes en Docker Compose
* **Archivo:** [docker-compose.yml](file:///c:/Users/HP/Downloads/123123/-AUDITORIA_EXAMEN_3_QUISPE/docker-compose.yml)
* **Corrección:** Se cambió el montaje directo del archivo `./backend/tickets.db:/app/tickets.db` por el montaje de la carpeta `./backend/db:/app/db`.
* **Evidencia:**anexo A


### B. Inicialización Dinámica de la Base de Datos
* **Archivo:** [backend/database_setup.py](file:///c:/Users/HP/Downloads/123123/-AUDITORIA_EXAMEN_3_QUISPE/backend/database_setup.py)
* **Corrección:** Se actualizó `DB_PATH = "db/tickets.db"` y se agregó la librería `os` para validar y crear el directorio mediante `os.makedirs(db_dir, exist_ok=True)` antes de conectar SQLite.
* **Motivo:** Evita errores al compilar la imagen si el directorio `db/` no existe en el contexto del Dockerfile.
* **Archivo:** [backend/main.py](file:///c:/Users/HP/Downloads/123123/-AUDITORIA_EXAMEN_3_QUISPE/backend/main.py)
* **Corrección:** Se actualizó `DB_PATH = "db/tickets.db"` y se importó `setup_database` para ejecutarlo inmediatamente al inicializar el servidor FastAPI.
* **Motivo:** Garantiza que las tablas de la base de datos se creen de forma automática e inmediata al levantar el contenedor de Docker por primera vez.

### C. Persistencia Local del Historial de Chats en Frontend
* **Archivo:** [frontend/src/App.tsx](file:///c:/Users/HP/Downloads/123123/-AUDITORIA_EXAMEN_3_QUISPE/frontend/src/App.tsx)
* **Corrección:** Se reemplazó el estado simple de mensajes individuales por una estructura de sesiones (`ChatSession[]`) guardadas de forma persistente en `localStorage`. Se programaron funciones de añadir, borrar e interactuar con cada chat.
* **Archivo:** [frontend/src/components/ChatLayout.tsx](file:///c:/Users/HP/Downloads/123123/-AUDITORIA_EXAMEN_3_QUISPE/frontend/src/components/ChatLayout.tsx)
* **Corrección:** Se eliminó el texto estático *"El historial de chats se ha omitido en esta versión."* y se sustituyó por una barra lateral dinámica que recorre las sesiones guardadas, permitiendo al usuario cambiar de conversación o eliminarlas a voluntad.

---

## 4. ANEXOS (EVIDENCIAS DE LA CORRECCIÓN)


### Anexo a: Solución al Error de Montaje en Docker Compose
*Aquí se muestra la terminal con la correcta ejecución de `docker-compose up --build` después de cambiar el volumen:*  
![Anexo  a - Docker Compose](./evidencias/evidencia1r.png)

### Evidencia 2: Creación Dinámica del Directorio de Base de Datos
*Aquí se muestra la lógica aplicada en `database_setup.py` y `main.py` para levantar SQLite:*  
![Evidencia 2 - Código Backend SQLite](./evidencias/evidencia_2_backend.png)

### Evidencia 3: Visualización del Historial de Chats en Funcionamiento
*Aquí se muestra la barra lateral del Frontend mostrando múltiples chats y la opción de borrarlos:*  
![Evidencia 3 - Interfaz de Chats en Frontend](./evidencias/evidencia_3_frontend.png)

### Evidencia 4: Persistencia tras la Recarga de la Página
*Aquí se evidencia cómo al recargar la página Web, los chats almacenados se cargan correctamente de `localStorage`:*  
![Evidencia 4 - LocalStorage del Navegador](./evidencias/evidencia_4_localstorage.png)
