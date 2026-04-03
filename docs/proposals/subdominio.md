dejarte las 3 rutas, pero para hacerlo bien necesito confirmar dónde corre cada app (host:puerto o URL interna) y qué proxy usarás.

Envíame esto (uno por app):

n8n → http://127.0.0.1:5678 (¿es ese?)
Balance → http://IP:PUERTO o http://127.0.0.1:PUERTO
GastosMedicos → http://IP:PUERTO o http://127.0.0.1:PUERTO
y confirma si tu VPS es 193.43.134.161.
Mientras, aquí tienes una plantilla lista para Nginx (pega y solo cambiamos los puertos/hosts); esto crea:

pash.uno/n8n
pash.uno/Balance
pash.uno/GastosMedicos
server {
 server_name pash.uno;


 # Balance
 location ^~ /Balance/ {
 proxy_set_header Host $host;
 proxy_set_header X-Real-IP $remote_addr;
 proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 proxy_set_header X-Forwarded-Proto $scheme;
 rewrite ^/Balance/(.*)$ /$1 break;
 proxy_pass http://127.0.0.1:3001/;
 }

 # gmm.pash.uno
 location ^~ /gmm/ {
 proxy_set_header Host $host;
 proxy_set_header X-Real-IP $remote_addr;
 proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 proxy_set_header X-Forwarded-Proto $scheme;
 rewrite ^/gmm/(.*)$ /$1 break;
 proxy_pass http://127.0.0.1:3002/;
 }
}
Nota rápida: n8n detrás de subruta a veces requiere ajustar variables (por ejemplo N8N_PATH=/n8n y WEBHOOK_URL=https://pash.uno/n8n/). Si me confirmas los puertos y si ya tienes Nginx instalado, te dejo la configuración exacta para tu setup.