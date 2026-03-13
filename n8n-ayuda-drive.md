# Configurar Google Drive en n8n (Convert to File)

Si el nodo "Convert to File" te muestra esas opciones extrañas en lugar de simplemente "JSON to Binary", es porque n8n actualizó ese nodo en sus versiones recientes. 

**Haz lo siguiente para solucionarlo:**

1. **Borra el nodo "Google Drive" amarillo que tienes actualmente.**
2. Agrega un Nuevo Nodo y busca `Convert to/from Binary Data` (o simplemente busca `Binary`). A veces se llama **"Move Binary Data"** o **"Extract from File"**.
3. **El Camino Más Fácil (Para tu versión de n8n):**
   Ya no necesitas convertirlo tú. Vamos a configurar directamente el nodo **Google Drive**:
   
   - Añade el nodo **Google Drive**.
   - **Operation:** `Upload File`
   - **Input Binary Field:** Apaga este switch rojo/gris.
   - En su lugar, el nodo te preguntará por el **File Content**. 
   - Vas a cambiar el selector de "Expression" a "Fixed" o usarás el engranaje para poner: `{{ $json.body.documentoBase64 }}`
   - *Nota Importante:* Si aún te exige un archivo binario forzosamente, entonces agrega el nodo que en tu captura se llama **"Move base64 string to file"** (es el último de la lista). Ese nodo tomará el string y lo convertirá en el binario que Drive acepta.

## Opción 2: El Nodo Exacto ("Move base64 string to file")
En la segunda captura que me mandaste, hasta abajo aparece la opción **"Move base64 string to file"**. 
Selecciona esa opción. 
- **Set Data Property:** Escribe `data`
- **Source Property:** Escribe `body.documentoBase64`

Luego, en el nodo de **Google Drive**, enciende el switch de **Binary File**, y asegúrate que donde dice **Input Binary Field** diga `data`.
