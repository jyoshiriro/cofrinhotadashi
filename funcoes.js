let balanceInBRL = null;

async function fetchBalance() {
  const response = await fetch('https://cofrinhotadashi-nodejs-serverless-f.vercel.app/api/balance');
  const data = await response.json();
  balanceInBRL = data.balance;
  return balanceInBRL;
}

async function main() {
  await fetchBalance();
}
