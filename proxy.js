// Proxy local para contornar CORS ao chamar a API do ether.fi
// Uso: node proxy.js
// Requer apenas módulos nativos do Node.js (sem npm install)

const http  = require('http');
const https = require('https');

const PORT = 3001;

// Cole aqui os cookies atualizados do ether.fi quando expirarem
const COOKIES = 'sync_id=0000zgmgvs; EtherFiGDPR=%7B%22functionalEnabled%22%3Atrue%2C%22analyticsEnabled%22%3Atrue%7D; _ga=GA1.1.1994025659.1782160031; intercom-id-qk5kuu8r=30f81762-0dab-476b-88ba-4716593dd0c2; intercom-device-id-qk5kuu8r=11769116-515b-4760-a8b9-496cdb843731; session_4c4213f7-6d58-4ab2-ab1f-62484917d799=ec141872-c10c-43dd-a5ba-364166a88f89; _gcl_au=1.1.1701300182.1782160031.806008223.1786120674.1786120715.494834256.1786120674.1786120715; sync_sid=1786548118805; intercom-session-qk5kuu8r=VlZZd2pMaUplMzVoYkkva1ZTSjQrZXI1WGxnWkJna2YrUVp6WHdVbWNsNFkwNzJVZTRWRGFDT0x1bkIzVm9SbmNBRnJER21ETFZxOG15Q1JnRUlUU0I3Z1VNVmFpRGt1bGxDdUJPaEcwNmhnRG83VG8yQTkxRkJsaWhzVVdwamZCeGdhVFBMU0l0TFFsN04zYmlreHByeHRKcVBaWnlVd1EvRDlWYmt0Y2R3THlOanU2dnhhcEo3dzdqWW1kVmpycENWdUw3a1hzNVFyK3N4dzl4NEVtZz09LS0yYkxETmRnem53TC9TN0VpdHhDUjd3PT0=--26625c2a703631a449dcb9ebdcd4a9d1750d0e24; _ga_81KRQ4C8KB=GS2.1.s1786548120$o27$g1$t1786548633$j22$l0$h0';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Responde ao preflight do CORS imediatamente
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const options = {
    hostname: 'www.ether.fi',
    port: 443,
    path: req.url,
    method: req.method,
    headers: {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'cookie': COOKIES,
      'origin': 'https://www.ether.fi',
      'referer': 'https://www.ether.fi/app/cash/safe',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
      'x-active-user': req.headers['x-active-user'] || '',
      'x-sardine-session': req.headers['x-sardine-session'] || '',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', (chunk) => { body += chunk; });
    proxyRes.on('end', () => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(body);
    });
  });

  proxyReq.on('error', (err) => {
    console.error('Erro ao encaminhar requisição:', err.message);
    res.writeHead(502);
    res.end(JSON.stringify({ error: err.message }));
  });

  proxyReq.end();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Proxy rodando em http://127.0.0.1:${PORT}`);
  console.log('Mantenha este terminal aberto enquanto usa a página.');
});
