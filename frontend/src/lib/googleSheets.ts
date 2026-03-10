import { google } from "googleapis";

export async function getGoogleSheetsClient() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Algunas veces las variables de entorno en Pases PaaS escapan los saltos de línea del PEM
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!email || !privateKey) {
        throw new Error("VULNERABILIDAD/CONFIGURACIÓN: Credenciales de Google Service Account (Email o Key) ausentes en el entorno (.env).");
    }

    // Se inicia la autenticación Oficial
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: email,
            private_key: privateKey,
        },
        // Solo requerimos permisos de lectura y escritura para el Sheet
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    // @ts-ignore - Ignoramos error de tipado temporal de JSONClient a JWTClient en googleapis
    const sheets = google.sheets({ version: "v4", auth: client });

    return sheets;
}
