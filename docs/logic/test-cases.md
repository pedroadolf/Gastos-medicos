# Test Cases Críticos - Gastos Médicos

Este documento define la base fundamental de aseguramiento de calidad (Quality Assurance) para el proyecto. Todos los agentes, procesos de CI/CD y desarrollos futuros **deben** respetar y validar estos escenarios antes de ser considerados estables.

## 🔐 Auth & Acceso
- [ ] **Aislamiento de inquilinos (Tenant Isolation):** Un usuario sin permisos administrativos no puede consultar, modificar ni listar gastos médicos pertenecientes a otros usuarios.
- [ ] **Validación de Sesión:** Solicitudes al API con un token JWT expirado, revocado o mal formado son rechazadas inmediatamente con un código HTTP 401.
- [ ] **Permisos de Roles:** Un usuario regular no puede realizar acciones reservadas para administradores (ej. aprobar un reembolso).

## 🧮 Lógica de Reembolsos
- [ ] **Monto menor al deducible:** Si el total del gasto médico acumulado es `<` al deducible contratado, el reembolso calculado será `$0`.
- [ ] **Cálculo de Reembolso Estándar:** Si el gasto es `>=` al deducible, el sistema calcula correctamente el monto a pagar.
  - *Ejemplo:* Gasto = $1,000 | Deducible = $500 | Coaseguro/Cobertura = 80%.
  - *Operación:* ($1,000 - $500) * 0.80 = $400 de reembolso.
- [ ] **Límite de Suma Asegurada (Tope Anual):** El sistema no debe procesar ni autorizar reembolsos que excedan el límite anual contratado (Suma Asegurada Máxima) para el usuario/póliza.
- [ ] **Prevención de Duplicados:** Intentos de registrar un gasto médico idéntico (misma factura/UUID, monto y proveedor) son detectados y rechazados automáticamente.

## 🚧 Edge Cases (Casos Límite)
- [ ] **Conversión de Divisas (Moneda Mixta):** Facturas presentadas en USD son convertidas correctamente a MXN (o moneda base de la póliza) utilizando el tipo de cambio oficial de la fecha de la factura.
- [ ] **Fechas Inválidas:** Los gastos con una fecha de emisión en el futuro o anterior a la fecha de inicio de vigencia de la póliza son rechazados con un mensaje descriptivo.
- [ ] **Validación de Archivos:** La carga de documentos adjuntos (comprobantes) que no correspondan a un formato válido (solo se permite PDF, JPG, PNG) falla devolviendo un error claro al usuario.
- [ ] **Inconsistencia de XML (Facturas MX):** Si se sube un XML del SAT donde el RFC del receptor no coincide con el del asegurado, el sistema levanta un flag de revisión manual o rechaza el gasto.
