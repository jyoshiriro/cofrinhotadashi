async function fetchBalance() {
  const response = await fetch('https://cofrinhotadashi-nodejs-serverless-f.vercel.app/api/balance');
  const data = await response.json();
  return data;
}
