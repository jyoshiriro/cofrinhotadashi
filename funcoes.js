// ATENÇÃO: este script deve ser executado no contexto de https://www.ether.fi
// (console do browser, bookmarklet ou userscript). Não funciona de file:// local
// por restrição de CORS. Os cookies são enviados automaticamente pelo browser.

let exchangeRate = null;
let balanceInUSD = null;

const COMMON_HEADERS = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-US,en;q=0.9,es-AR;q=0.8,es;q=0.7,pt-BR;q=0.6,pt;q=0.5',
  'baggage': 'sentry-environment=prod,sentry-release=1.144.0,sentry-public_key=1fcc69b11a8ba98d7f8cbb16ced27008,sentry-trace_id=985c8866fa094d72a9284d963882d2d7,sentry-org_id=4507663483928576,sentry-sampled=false,sentry-sample_rand=0.1285501351858256,sentry-sample_rate=0.1',
  'cache-control': 'no-cache',
  'pragma': 'no-cache',
  'priority': 'u=1, i',
  'referer': 'https://www.ether.fi/app/cash/safe',
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
  'x-active-user': '4c4213f7-6d58-4ab2-ab1f-62484917d799',
  'x-sardine-session': '4ab25ffe-3ac6-43f4-98e7-31a686a8a148',
};

async function fetchExchangeRate() {
  const response = await fetch(
    'https://www.ether.fi/app/cash/api/due/a9bf8b7b-a00b-4b47-ae04-875ef24b1ff5/brl-virtual-account',
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        ...COMMON_HEADERS,
        'sentry-trace': '985c8866fa094d72a9284d963882d2d7-85c3f14dc3f08198-0',
      },
    }
  );

  const data = await response.json();
  exchangeRate = data.exchangeRate;
  console.log('exchangeRate:', exchangeRate);
  return exchangeRate;
}

async function fetchAccountDetails() {
  const response = await fetch(
    'https://www.ether.fi/app/cash/api/v2/account-safe/b4f31b6f-8074-4cd6-bc7e-b9b5da8ff381/details',
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...COMMON_HEADERS,
        'sentry-trace': '985c8866fa094d72a9284d963882d2d7-b0ebee273fe60665-0',
      },
    }
  );

  const data = await response.json();
  const totalBalance = data.totalBalance;
  balanceInUSD = totalBalance / exchangeRate;
  console.log('totalBalance:', totalBalance);
  console.log('balanceInUSD (totalBalance / exchangeRate):', balanceInUSD);
  return balanceInUSD;
}

async function main() {
  await fetchExchangeRate();
  await fetchAccountDetails();
}
