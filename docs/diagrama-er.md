# Diagrama Entidad-Relación — Kembron Gestión de Obras

Modelo de datos completo del sistema, con sus 10 entidades y relaciones.

```mermaid
erDiagram
  USUARIO ||--o{ ASIGNACION_OBRA_SUPERVISOR : tiene
  OBRA ||--o{ ASIGNACION_OBRA_SUPERVISOR : tiene
  OBRA ||--o{ TITULO : contiene
  TITULO ||--o{ ITEM : contiene
  UNIDAD ||--o{ ITEM : mide
  ITEM ||--o{ ADICIONAL_DEDUCTIVO : ajusta
  ITEM ||--o{ GASTO : imputa
  ITEM ||--o{ PROGRAMACION_SEMANAL : programa
  ITEM ||--o{ REGISTRO_AVANCE : avanza
  USUARIO ||--o{ GASTO : registra
  USUARIO ||--o{ REGISTRO_AVANCE : registra

  USUARIO {
    string id PK
    string nombre
    string email
    string password
    enum rol "ADMIN | SUPERVISOR"
  }
  OBRA {
    string id PK
    string nombre
    string ubicacion
    string cliente
    enum estado "EN_EJECUCION | FINALIZADA | PAUSADA"
    boolean activa
    date fechaInicio
    date fechaFinTeorica
  }
  ASIGNACION_OBRA_SUPERVISOR {
    string id PK
    string usuarioId FK
    string obraId FK
  }
  TITULO {
    string id PK
    string obraId FK
    string nombre
    int orden
  }
  ITEM {
    string id PK
    string tituloId FK
    string unidadId FK
    string nombre
    decimal cantidad
    decimal valorUnitario
    int orden
  }
  UNIDAD {
    string id PK
    string nombre "m2, m3, kg, etc."
  }
  ADICIONAL_DEDUCTIVO {
    string id PK
    string itemId FK
    enum tipo "ADICIONAL | DEDUCTIVO"
    string nombre
    decimal monto
  }
  GASTO {
    string id PK
    string itemId FK
    string usuarioId FK
    string descripcion
    enum categoria "MANO_DE_OBRA | MATERIAL | EQUIPO | SUBCONTRATO | OTROS"
    date fecha
    decimal monto
  }
  PROGRAMACION_SEMANAL {
    string id PK
    string itemId FK
    int numeroSemana
    decimal cantidadProgramada
  }
  REGISTRO_AVANCE {
    string id PK
    string itemId FK
    string usuarioId FK
    decimal cantidad
    date fecha
  }
```

## Notas del modelo

- **Usuario** tiene rol `ADMIN` o `SUPERVISOR`. Un supervisor puede estar asignado a varias obras, y una obra puede tener varios supervisores (relación muchos a muchos vía `AsignacionObraSupervisor`).
- **Obra → Título → Ítem** es una jerarquía de 3 niveles: una obra tiene varios títulos (etapas), cada título tiene varios ítems (tareas ejecutables).
- **Unidad** es una entidad propia (no un enum fijo) para poder agregar nuevas unidades de medida sin tocar código.
- **AdicionalDeductivo**, **Gasto**, **ProgramacionSemanal** y **RegistroAvance** cuelgan todos de un **Ítem** — son los cuatro tipos de eventos/ajustes que se registran sobre una tarea ejecutable.
- **Gasto** y **RegistroAvance** también se relacionan con **Usuario**, para saber quién cargó cada dato.
- Todas las relaciones desde `Obra` hacia abajo (Título → Ítem → AdicionalDeductivo/Gasto/ProgramacionSemanal/RegistroAvance) son `onDelete: Cascade` — si se borra una obra, se borra toda su información asociada.
- Las relaciones hacia `Usuario` y `Unidad` son `onDelete: Restrict` — no se puede borrar un usuario o unidad que ya esté en uso, para no perder historial.
