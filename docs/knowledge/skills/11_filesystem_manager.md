# SKILL: FileSystem Manager (MCP)

## Descripción
Habilita al agente para interactuar con el sistema de archivos local de forma segura y estandarizada utilizando el protocolo MCP (Model Context Protocol).

## Capacidades
- **Lectura/Escritura**: Acceso a archivos locales mediante el servidor `filesystem`.
- **Navegación**: Exploración de directorios y obtención de árboles de archivos.
- **Seguridad**: Validación de rutas para prevenir escapes de directorio.

## Configuración MCP
Para usar este servidor en el orquestador:
```python
# Definición en el orquestador
tools = [
    {
        "name": "filesystem",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/pash/Documents/350_APP_PASH/Gastos-Medicos"]
    }
]
```

## Prompt de Uso
"Usa la herramienta `filesystem` para leer el contenido de `PROJECT-PLAN.MD` y listar los archivos en la carpeta `src`."
