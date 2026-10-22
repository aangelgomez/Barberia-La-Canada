# Barbería La Cañada: proyecto de portafolio

Sitio web con reserva de turnos para una barbería **ficticia** del barrio Alberdi, Córdoba.

**Problema que resuelve:** la barbería daba turnos por mensaje directo de Instagram y por teléfono, perdía tiempo respondiendo siempre las mismas preguntas (precios, horarios, disponibilidad) y a veces se superponían los turnos. Necesitaba una web donde el cliente viera los servicios y precios, eligiera barbero, día y horario libre, y enviara el pedido de turno ya armado por WhatsApp.

## Pantallas
- `index.html` (Inicio): portada, aviso de abierto/cerrado según el horario, lista de servicios con precios y duración, barberos y horarios de la semana.
- `turnos.html` (Turnos): reserva en 4 pasos (servicio, barbero, día y horario). Los horarios ocupados aparecen tachados, se tiene en cuenta la duración del servicio y al final se genera el mensaje de WhatsApp con el resumen.

## Tecnologías
HTML, CSS y JavaScript, sin frameworks. Diseño responsive y modo oscuro automático.

## Publicarlo en GitHub Pages
1. Crear un repositorio público y subir estos archivos.
2. Ir a Settings → Pages → Branch `main`, carpeta `/ (root)` → Save.

Para usarlo con un local real, poner su número de WhatsApp en la constante `WHATSAPP` de `script.js`.

Autor: Angel
