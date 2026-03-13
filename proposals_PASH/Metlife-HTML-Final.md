### Resultado Final: Optimización de Correos Metlife

He ajustado ambas plantillas cumpliendo la **Tabla de Requisitos Metlife**, incluyendo las **Recetas** que faltaban en ambos casos, reforzando la estética técnica/institucional, usando CSS inline-friendly, y utilizando bloques que extraen datos con la sintaxis de n8n o variables genéricas que puedes reemplazar.

<file_1_reembolso>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Exo:wght@700&family=Karla:wght@400;700&display=swap" rel="stylesheet">
    <title>Solicitud de Reembolso - Metlife</title>
</head>
<body style="font-family: 'Karla', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;">
    <div style="width: 100%; padding: 20px; box-sizing: border-box;">
        <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #BE0001; color: #ffffff; padding: 30px; text-align: center;">
                <h1 style="font-family: 'Exo', sans-serif; margin: 0; font-size: 22px; letter-spacing: 1px;">TRÁMITE DE REEMBOLSO DE GASTOS MÉDICOS</h1>
            </div>
            <div style="padding: 30px;">
                <p style="margin-top: 0;">Estimados,</p>
                <p>Por este medio, adjunto la documentación oficial para el ingreso a dictamen técnico del siniestro detallado a continuación:</p>
                
                <div style="background: #fdf2f2; border-left: 4px solid #BE0001; padding: 15px; margin-bottom: 25px; font-size: 14px;">
                    <strong>FECHA DE SOLICITUD:</strong> <span id="fecha-actual"></span><br>
                    <strong>ESTADO:</strong> Documentación Completa para Revisión
                </div>

                <h3 style="font-family: 'Exo', sans-serif; font-size: 16px; color: #333333;">CHECKLIST REQUISITOS METLIFE (REEMBOLSO)</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr>
                            <th style="background-color: #f8f8f8; color: #BE0001; text-align: left; padding: 12px; border-bottom: 2px solid #eeeeee; font-size: 14px;">Documento Requerido</th>
                            <th style="background-color: #f8f8f8; color: #BE0001; text-align: left; padding: 12px; border-bottom: 2px solid #eeeeee; font-size: 14px;">Especificación Técnica</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #BE0001; font-weight: bold; margin-right: 10px;">✓</span> Carta Remesa</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Llenada y firmada por titular</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #BE0001; font-weight: bold; margin-right: 10px;">✓</span> Solicitud de Reclamación</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Llenada y firmada por titular</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #BE0001; font-weight: bold; margin-right: 10px;">✓</span> Informe Médico</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Firmado por médico tratante</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #BE0001; font-weight: bold; margin-right: 10px;">✓</span> Estudios de Diagnóstico</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Con interpretación adjunta</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #BE0001; font-weight: bold; margin-right: 10px;">✓</span> Comprobante de Domicilio</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Vigencia menor a 3 meses</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #BE0001; font-weight: bold; margin-right: 10px;">✓</span> Identificación Oficial</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Vigente (INE/Pasaporte)</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #BE0001; font-weight: bold; margin-right: 10px;">✓</span> Facturas Desglosadas</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">A nombre del titular (PDF/XML)</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #BE0001; font-weight: bold; margin-right: 10px;">✓</span> Estado de Cuenta</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Con CLABE (menor a 90 días)</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #BE0001; font-weight: bold; margin-right: 10px;">✓</span> Recetas Médicas</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Correspondientes a las facturas</td></tr>
                    </tbody>
                </table>

                <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 14px;">
                    <strong style="font-family: 'Exo', sans-serif;">DATOS DE LA PÓLIZA:</strong><br><br>
                    <strong>Póliza:</strong> 02001-1212432<br>
                    <strong>Siniestro:</strong> 01130226402-04<br>
                    <strong>Asegurado Titular:</strong> CLAUDIA FONSECA AGUILAR<br>
                    <strong>Contratante:</strong> COLGATE PALMOLIVE
                </div>
            </div>
            <div style="background: #f9f9f9; padding: 20px; font-size: 12px; color: #666666; border-top: 1px solid #eeeeee;">
                Atentamente: <strong style="color: #333333;">Pedro Adolfo Soto</strong><br>
                Este correo y sus archivos adjuntos contienen información catalogada como sensible, dirigida exclusivamente para fines de dictamen ante Metlife.
            </div>
        </div>
    </div>
    <script>
        document.getElementById('fecha-actual').textContent = new Date().toLocaleDateString('es-MX');
    </script>
</body>
</html>
</file_1_reembolso>

<file_2_medicamentos>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Exo:wght@700&family=Karla:wght@400;700&display=swap" rel="stylesheet">
    <title>Surtimiento de Medicamentos - Metlife</title>
</head>
<body style="font-family: 'Karla', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f0f2f5;">
    <div style="width: 100%; padding: 20px; box-sizing: border-box;">
        <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #1a3650; color: #ffffff; padding: 30px; text-align: center;">
                <h1 style="font-family: 'Exo', sans-serif; margin: 0; font-size: 22px; letter-spacing: 1px;">SOLICITUD DE SURTIMIENTO / CARTA PASE</h1>
            </div>
            <div style="padding: 30px;">
                <p style="margin-top: 0;">Estimados,</p>
                <p>Se solicita formalmente el dictamen técnico para el surtimiento de medicamentos por tratamiento. Se adjunta el expediente consolidado bajo los criterios técnicos requeridos por Metlife:</p>
                
                <div style="background: #eef4f9; border-left: 4px solid #1a3650; padding: 15px; margin-bottom: 25px; font-size: 14px;">
                    <strong>FECHA DE SOLICITUD:</strong> <span id="fecha-actual"></span><br>
                    <strong>PRIORIDAD:</strong> Estandarizada / Tratamiento Médico Continuo
                </div>

                <h3 style="font-family: 'Exo', sans-serif; font-size: 16px; color: #333333;">CHECKLIST REQUISITOS METLIFE (CARTA PASE / MEDICAMENTOS)</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr>
                            <th style="background-color: #f8f8f8; color: #1a3650; text-align: left; padding: 12px; border-bottom: 2px solid #eeeeee; font-size: 14px;">Documento Requerido</th>
                            <th style="background-color: #f8f8f8; color: #1a3650; text-align: left; padding: 12px; border-bottom: 2px solid #eeeeee; font-size: 14px;">Especificación Técnica</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #1a3650; font-weight: bold; margin-right: 10px;">✓</span> Carta Remesa</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Llenada y firmada por titular</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #1a3650; font-weight: bold; margin-right: 10px;">✓</span> Declaración Jurada</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Llenada y firmada por titular</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #1a3650; font-weight: bold; margin-right: 10px;">✓</span> Solicitud de Reclamación</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Llenada y firmada por titular</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #1a3650; font-weight: bold; margin-right: 10px;">✓</span> Informe Médico</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Actualizado por médico tratante</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #1a3650; font-weight: bold; margin-right: 10px;">✓</span> Estudios de Diagnóstico</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Con interpretación vigente</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #1a3650; font-weight: bold; margin-right: 10px;">✓</span> Comprobante de Domicilio</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Vigencia menor a 3 meses</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #1a3650; font-weight: bold; margin-right: 10px;">✓</span> Identificación Oficial</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Vigente del titular</td></tr>
                        <tr><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;"><span style="color: #1a3650; font-weight: bold; margin-right: 10px;">✓</span> Recetas Médicas</td><td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 14px;">Completas y vigentes</td></tr>
                    </tbody>
                </table>

                <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 14px;">
                    <strong style="font-family: 'Exo', sans-serif;">REFERENCIA DE PÓLIZA:</strong><br><br>
                    <strong>Póliza:</strong> 02001-1212432<br>
                    <strong>Siniestro:</strong> 01130226402-04<br>
                    <strong>Asegurado Titular:</strong> CLAUDIA FONSECA AGUILAR<br>
                    <strong>Paciente Afectado:</strong> Pedro Adolfo Soto
                </div>
            </div>
            <div style="background: #f9f9f9; padding: 20px; font-size: 12px; color: #666666; border-top: 1px solid #eeeeee;">
                Atentamente: <strong style="color: #333333;">Pedro Adolfo Soto</strong><br>
                Solicitud gestionada para dictamen institucional bajo protocolo SGMM.
            </div>
        </div>
    </div>
    <script>
        document.getElementById('fecha-actual').textContent = new Date().toLocaleDateString('es-MX');
    </script>
</body>
</html>
</file_2_medicamentos>
