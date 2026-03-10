import { PDFDocument } from "pdf-lib";

/**
 * Motor para llenado de plantillas PDF institucionales GMM (Ej: Formato Aseguradora).
 */
export async function llenarFormatoGMM(
    plantillaBuffer: Uint8Array | ArrayBuffer,
    datosExtraidos: Record<string, any>
): Promise<Uint8Array> {
    // 1. Cargamos el PDF plantilla en memoria
    const pdfDoc = await PDFDocument.load(plantillaBuffer);
    const form = pdfDoc.getForm();

    // 2. Extraemos todos los campos disponibles (útil para debuggear si la plantilla cambia)
    // const fields = form.getFields();
    // fields.forEach((f) => console.log("Campo detectado en PDF:", f.getName()));

    // 3. Mapeo e Inyección Segura de Datos
    const setFieldText = (fieldName: string, text: string) => {
        try {
            if (!text) return;
            const field = form.getTextField(fieldName);
            if (field) {
                field.setText(text);
            }
        } catch (e) {
            // Ignorar si el campo temporalmente no existe
        }
    };

    const setCheckbox = (fieldName: string, check: boolean) => {
        try {
            const field = form.getCheckBox(fieldName);
            if (field) {
                if (check) field.check();
                else field.uncheck();
            }
        } catch (e) {
            // Ignorar
        }
    };

    // ----- MAPEO UNIVERSAL: TEXT BOXES -----
    // El motor intentará inyectar el dato si el PDF lo requiere, sino, lo ignorará silenciosamente.

    // 1. Datos del Asegurado / Titular
    setFieldText("txtNombre", datosExtraidos.asegurado?.nombre || "");
    setFieldText("txtApellidoPaterno", datosExtraidos.asegurado?.apellidoP || "");
    setFieldText("txtApellidoMaterno", datosExtraidos.asegurado?.apellidoM || "");
    setFieldText("txtNombresAfectado", datosExtraidos.asegurado?.nombre || "");
    setFieldText("txtApellidoPaternoAfectado", datosExtraidos.asegurado?.apellidoP || "");
    setFieldText("txtApellidoMaternoAfectado", datosExtraidos.asegurado?.apellidoM || "");
    setFieldText("txtNombreAseguradoAfectado", `${datosExtraidos.asegurado?.nombre || ""} ${datosExtraidos.asegurado?.apellidoP || ""}`.trim());

    setFieldText("txtNombresTitular", datosExtraidos.asegurado?.titularNombre || datosExtraidos.asegurado?.nombre || "");
    setFieldText("txtApellidoPaternoTitular", datosExtraidos.asegurado?.titularApellidoP || datosExtraidos.asegurado?.apellidoP || "");
    setFieldText("txtApellidoMaternoTitular", datosExtraidos.asegurado?.titularApellidoM || datosExtraidos.asegurado?.apellidoM || "");
    setFieldText("txtNombreTitular", `${datosExtraidos.asegurado?.titularNombre || ""} ${datosExtraidos.asegurado?.titularApellidoP || ""}`.trim());
    setFieldText("txtNombreFirmaTitular", `${datosExtraidos.asegurado?.titularNombre || ""} ${datosExtraidos.asegurado?.titularApellidoP || ""}`.trim());

    setFieldText("txtParentesco", datosExtraidos.asegurado?.parentesco || "Titular");
    setFieldText("txtRFCTitular", datosExtraidos.asegurado?.rfc || "");
    setFieldText("txtOcupacionTitular", datosExtraidos.asegurado?.ocupacion || "");
    setFieldText("txtOcupacionAfectado", datosExtraidos.asegurado?.ocupacion || "");
    setFieldText("txtNacionalidadesTitular", datosExtraidos.asegurado?.nacionalidad || "Mexicana");
    setFieldText("txtPaisNacimientoTitular", datosExtraidos.asegurado?.paisNac || "México");
    setFieldText("txtPaisNacimientoAfectado", datosExtraidos.asegurado?.paisNac || "México");
    setFieldText("txtFechaNacimientoAfectado", datosExtraidos.asegurado?.fechaNac || "");
    setFieldText("txtCorreoElectronico", datosExtraidos.asegurado?.email || "");

    // NUEVOS CAMPOS (Plantillas MetLife 2026)
    setFieldText("Nombre del titular", `${datosExtraidos.asegurado?.nombre || ""} ${datosExtraidos.asegurado?.apellidoP || ""}`.trim());
    setFieldText("Nombre del asegurado afectado", `${datosExtraidos.asegurado?.nombre || ""} ${datosExtraidos.asegurado?.apellidoP || ""}`.trim());
    setFieldText("Nombres", datosExtraidos.asegurado?.nombre || "");
    setFieldText("Apellido paterno", datosExtraidos.asegurado?.apellidoP || "");
    setFieldText("Apellido materno", datosExtraidos.asegurado?.apellidoM || "");
    setFieldText("Nombres_2", datosExtraidos.asegurado?.nombre || "");
    setFieldText("Apellido paterno_2", datosExtraidos.asegurado?.apellidoP || "");
    setFieldText("Apellido materno_2", datosExtraidos.asegurado?.apellidoM || "");
    setFieldText("Registro Federal de Contribuyentes RFC", datosExtraidos.asegurado?.rfc || "");
    setFieldText("Ocupación", datosExtraidos.asegurado?.ocupacion || "");
    setFieldText("Nacionalidades", datosExtraidos.asegurado?.nacionalidad || "Mexicana");
    setFieldText("País de nacimiento", datosExtraidos.asegurado?.paisNac || "México");
    setFieldText("Fecha de nacimiento afectado", datosExtraidos.asegurado?.fechaNac || "");

    // 2. Datos de Contacto y Dirección
    setFieldText("txtCP", datosExtraidos.asegurado?.cp || "");
    setFieldText("txtCodigoPostal", datosExtraidos.asegurado?.cp || "");
    setFieldText("txtEstado", datosExtraidos.asegurado?.estado || "CDMX");
    setFieldText("txtEstadoProvincia", datosExtraidos.asegurado?.estado || "CDMX");
    setFieldText("txtAlcaldiaMunicipio", datosExtraidos.asegurado?.municipio || "");
    setFieldText("txtMunicipioAlcaldia", datosExtraidos.asegurado?.municipio || "");
    setFieldText("txtColonia", datosExtraidos.asegurado?.colonia || "");
    setFieldText("txtColoniaBarrio", datosExtraidos.asegurado?.colonia || "");
    setFieldText("txtCalleNo", datosExtraidos.asegurado?.calle || "");
    setFieldText("txtCalleAvenida", datosExtraidos.asegurado?.calle || "");
    setFieldText("txtExterior", datosExtraidos.asegurado?.noExt || "");
    setFieldText("txtInterior", datosExtraidos.asegurado?.noInt || "");
    setFieldText("txtCiudadPoblacion", datosExtraidos.asegurado?.ciudad || "CDMX");
    setFieldText("txtPaisContacto", datosExtraidos.asegurado?.paisContacto || "México");
    setFieldText("txtTelefono", datosExtraidos.asegurado?.telefono || "");
    setFieldText("txtCelular", datosExtraidos.asegurado?.telefono || "");
    setFieldText("txtEntreCalles", datosExtraidos.asegurado?.entreCalles || "");
    setFieldText("txtFamiliarResponsable", datosExtraidos.asegurado?.familiarResponsable || "");

    setFieldText("Calle  Avenida", datosExtraidos.asegurado?.calle || "");
    setFieldText("Exterior", datosExtraidos.asegurado?.noExt || "");
    setFieldText("Interior", datosExtraidos.asegurado?.noInt || "");
    setFieldText("Código postal", datosExtraidos.asegurado?.cp || "");
    setFieldText("Colonia  Barrio", datosExtraidos.asegurado?.colonia || "");
    setFieldText("Municipio  Alcaldía", datosExtraidos.asegurado?.municipio || "");
    setFieldText("Ciudad  Población", datosExtraidos.asegurado?.ciudad || "CDMX");
    setFieldText("Estado  Provincia", datosExtraidos.asegurado?.estado || "CDMX");
    setFieldText("País", datosExtraidos.asegurado?.paisContacto || "México");
    setFieldText("Celular", datosExtraidos.asegurado?.telefono || "");

    // 3. Datos de la Póliza y Empresa
    setFieldText("txtPoliza", datosExtraidos.poliza?.numero || "POL-STANDBY");
    setFieldText("txtNoPoliza", datosExtraidos.poliza?.numero || "POL-STANDBY");
    setFieldText("txtNumeroCertificado", datosExtraidos.poliza?.certificado || "");
    setFieldText("txtEmpresa", datosExtraidos.asegurado?.empresa || "PASH");
    setFieldText("txtAseguradora", datosExtraidos.asegurado?.aseguradora || "MetLife");
    setFieldText("txtNombreContratante", datosExtraidos.asegurado?.empresa || "PASH S.A. de C.V.");
    setFieldText("txtContratante", datosExtraidos.asegurado?.empresa || "PASH");

    setFieldText("Empresa", datosExtraidos.asegurado?.empresa || "PASH");
    setFieldText("Nombre del Contratante o razón social", datosExtraidos.asegurado?.empresa || "PASH S.A. de C.V.");
    setFieldText("Aseguradora", datosExtraidos.asegurado?.aseguradora || "MetLife");
    setFieldText("No de póliza", datosExtraidos.poliza?.numero || "POL-STANDBY");
    setFieldText("Póliza", datosExtraidos.poliza?.numero || "POL-STANDBY");
    setFieldText("Número de certificado", datosExtraidos.poliza?.certificado || "");

    // 4. Datos del Siniestro / Evento Médico
    setFieldText("txtNumeroSiniestro", datosExtraidos.siniestro?.numeroSiniestro || "");
    setFieldText("txtNoSiniestro", datosExtraidos.siniestro?.numeroSiniestro || "");
    setFieldText("txtNumeroSiniestroSubsecuente", datosExtraidos.siniestro?.numeroSiniestro || "");
    setFieldText("txtSiniestro", datosExtraidos.siniestro?.numeroSiniestro || "");
    setFieldText("txtPadecimiento", datosExtraidos.siniestro?.diagnostico || "");
    setFieldText("txtDescripcion", datosExtraidos.siniestro?.diagnostico || "");
    setFieldText("txtObservaciones", datosExtraidos.siniestro?.observaciones || "");
    setFieldText("txtComentarios", "");
    setFieldText("txtComentariosAdicionales", "");
    setFieldText("txtFechaInicioSintomas", datosExtraidos.siniestro?.fechaSintomas || "");
    setFieldText("txtFechaPrimerAtencion", datosExtraidos.siniestro?.fechaAtencion || "");
    setFieldText("txtFechaIntervencion", datosExtraidos.siniestro?.fechaIntervencion || "");
    setFieldText("txtHospital", datosExtraidos.siniestro?.hospital || "");
    setFieldText("txtResultadosEstudios", datosExtraidos.siniestro?.estudios || "Estudios adjuntos en expediente");

    setFieldText("No siniestro", datosExtraidos.siniestro?.numeroSiniestro || "");
    setFieldText("Padecimiento", datosExtraidos.siniestro?.diagnostico || "");
    setFieldText("Hospital", datosExtraidos.siniestro?.hospital || "");
    setFieldText("Fecha de intervención", datosExtraidos.siniestro?.fechaIntervencion || "");
    setFieldText("Observaciones 1", datosExtraidos.siniestro?.observaciones || "");
    setFieldText("c Detalla estudios que presentas campo obligatorio", datosExtraidos.siniestro?.estudios || "Estudios adjuntos en expediente");

    // 5. Datos Económicos y Reclamación
    const monto = datosExtraidos.reclamacion?.monto || datosExtraidos.totales?.montoCalculado || "0.00";
    const cantidadFact = datosExtraidos.reclamacion?.cantidadFacturas || datosExtraidos.totales?.cantidadFacturas || "1";

    setFieldText("txtNoFacturasReclamar", cantidadFact);
    setFieldText("txtMontoTotalFacturas", monto);
    setFieldText("txtTotalReclamado", monto);
    setFieldText("txtImporte", monto);
    setFieldText("txtConcepto", "Gastos Medicos Mayores");
    setFieldText("txtNumeroFactura", datosExtraidos.factura?.numero || "Múltiples / Anexas");
    setFieldText("txtInstitucionBancaria", datosExtraidos.asegurado?.banco || "BBVA");
    setFieldText("txtCLABE", datosExtraidos.asegurado?.clabe || "");

    setFieldText("No de facturas a reclamar", cantidadFact);
    setFieldText("Monto total en facturas a reclamar", monto);
    setFieldText("Total reclamado", monto);
    setFieldText("ImporteRow1", monto);
    setFieldText("ConceptoRow1", "Gastos Medicos Mayores");
    setFieldText("Número Factura  ReciboRow1", datosExtraidos.factura?.numero || "Múltiples / Anexas");
    setFieldText("Nombre de la institución bancaria", datosExtraidos.asegurado?.banco || "BBVA");
    setFieldText("CLABE 1 Clave Bancaria Estandarizada", datosExtraidos.asegurado?.clabe || "");

    // ----- MAPEO UNIVERSAL: CHECKBOXES Y LOGICA DE ESTADO (DECLARACIONES / SRGMM) -----

    const isInicial = (datosExtraidos.reclamacion?.tipoTramite || "").toLowerCase() === "inicial";
    setCheckbox("chkInicial", isInicial);
    setCheckbox("chkPrimeraReclamacion", isInicial);

    const isComplemento = (datosExtraidos.reclamacion?.tipoTramite || "").toLowerCase() === "complemento";
    setCheckbox("chkComplemento", isComplemento);
    setCheckbox("chkReclamacionSubsecuente", isComplemento);

    const isReembolso = (datosExtraidos.reclamacion?.tipoPago || "").toLowerCase() === "reembolso";
    setCheckbox("chkReembolso", isReembolso);
    setCheckbox("chkTransferenciaElectronica", isReembolso); // Asumimos transferencia en reembolso

    const isEnfermedad = (datosExtraidos.reclamacion?.naturaleza || "").toLowerCase() === "enfermedad";
    const isAccidente = (datosExtraidos.reclamacion?.naturaleza || "").toLowerCase() === "accidente";
    setCheckbox("chkEnfermedad", isEnfermedad);
    setCheckbox("chkAccidente", isAccidente);

    // Nuevos Checkboxes
    setCheckbox("REMBOLSO", isReembolso);
    setCheckbox("transferencia", isReembolso);
    setCheckbox("PRIMERA", isInicial);
    setCheckbox("SUBSECUENTE", isComplemento);
    setCheckbox("ENF", isEnfermedad);
    setCheckbox("ACC", isAccidente);
    setCheckbox("INDI", true); // Default individual para MetLife a menos que sea PASH
    setCheckbox("COLECTIVA", datosExtraidos.poliza?.tipo === "Colectiva");

    // CARTA SINIESTRALIDAD
    const isPrivado = (datosExtraidos.reclamacion?.sector || "").toLowerCase() === "privado";
    setCheckbox("chkPrivado", isPrivado);
    setCheckbox("chkGobierno", !isPrivado && !!datosExtraidos.reclamacion?.sector); // Si hay sector pero no es privado

    const mostrarPad = (datosExtraidos.reclamacion?.mostrarPadecimiento || "").toUpperCase() === "SI";
    setCheckbox("chkSi", mostrarPad);
    setCheckbox("chkNo", (datosExtraidos.reclamacion?.mostrarPadecimiento || "").toUpperCase() === "NO");

    // DECLARACION JURADA
    const hospPropio = (datosExtraidos.declaracion?.hospPropio || "").toUpperCase();
    setCheckbox("chkSi1", hospPropio === "SI");
    setCheckbox("chkNo1", hospPropio === "NO");
    setFieldText("txtEspecificar1", datosExtraidos.declaracion?.detalleHosp || "");

    const medPropio = (datosExtraidos.declaracion?.medPropio || "").toUpperCase();
    setCheckbox("chkSi2", medPropio === "SI");
    setCheckbox("chkNo2", medPropio === "NO");
    setFieldText("txtEspecificar2", datosExtraidos.declaracion?.detalleMed || "");

    const huboAsesoria = (datosExtraidos.declaracion?.huboAsesoria || "").toUpperCase();
    setCheckbox("chkSi3", huboAsesoria === "SI");
    setCheckbox("chkNo3", huboAsesoria === "NO");
    setFieldText("txtEspecificar3", datosExtraidos.declaracion?.detalleAsesoria || "");

    const huboDescuento = (datosExtraidos.declaracion?.huboDescuento || "").toUpperCase();
    setCheckbox("chkSi4", huboDescuento === "SI");
    setCheckbox("chkNo4", huboDescuento === "NO");
    setFieldText("txtEspecificar4", datosExtraidos.declaracion?.detalleDescuento || "");

    // CONSENTIMIENTO PRIVACIDAD GENERIICO
    setCheckbox("chkConsentimientoPrivacidad", true);

    // 6. Fechas y Firmas Automáticas
    const fechaActual = new Date().toLocaleDateString('es-MX');
    setFieldText("txtFecha", fechaActual);
    setFieldText("txtLugarFecha", `${datosExtraidos.asegurado?.ciudad || "CDMX"}, ${fechaActual}`);
    setFieldText("txtDiaMesAno", fechaActual);
    setFieldText("txtFechaSolicitud", fechaActual);
    setFieldText("txtFechaPrivacidad", fechaActual);
    setFieldText("txtNombreTitularDatos", `${datosExtraidos.asegurado?.nombre || ""} ${datosExtraidos.asegurado?.apellidoP || ""}`.trim());
    setFieldText("txtFirmaNombreFecha", `${datosExtraidos.asegurado?.nombre || ""} / ${fechaActual}`);

    setFieldText("Fecha", fechaActual);
    setFieldText("Nombre del Titular de los datos", `${datosExtraidos.asegurado?.nombre || ""} ${datosExtraidos.asegurado?.apellidoP || ""}`.trim());
    setFieldText("nombreyfirma3p", `${datosExtraidos.asegurado?.nombre || ""} ${datosExtraidos.asegurado?.apellidoP || ""}`.trim());

    // Desglose de Fecha para SRGMM (D1, M1, A1, DIAASEG, MESASEG, AASEG)
    const [dia, mes, anio] = fechaActual.split('/');
    setFieldText("D1", dia || "");
    setFieldText("M1", mes || "");
    setFieldText("A1", anio || "");
    setFieldText("DIAASEG", dia || "");
    setFieldText("MESASEG", mes || "");
    setFieldText("AASEG", anio || "");

    // 4. Aplanar el PDF (Lock)
    // Opcional: Aplanamos para que el PDF final ya no sea editable por el usuario y sea inmutable.
    form.flatten();

    // 5. Guardar y Exportar Bytes
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
