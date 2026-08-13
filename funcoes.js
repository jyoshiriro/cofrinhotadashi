async function fetchBalance() {
  const response = await fetch('https://cofrinhotadashi-nodejs-serverless-f.vercel.app/api/balance');
  const data = await response.json();
  return data;
}



/**
 * Calcula o checksum CRC16 (CCITT-FALSE) exigido pelo padrão Pix/EMV
 */
function calcularCRC16(payload) {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    let b = payload.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      let bit = ((b >> (7 - j)) & 1) === 1;
      let c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 ^ bit) crc ^= polynomial;
    }
  }
  crc &= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formata um campo no padrão TLV (Tag-Length-Value)
 */
function formatarTLV(id, valor) {
  const tamanho = valor.length.toString().padStart(2, '0');
  return `${id}${tamanho}${valor}`;
}

/**
 * Gera e retorna apenas a string Pix Copia e Cola
 */
function gerarPixCopiaECola({ chave, nome = "Felipe Tadashi", cidade, valor, txid = '***' }) {
  // Limpeza de acentos e caracteres especiais
  const nomeLimpo = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 25);
  const cidadeLimpa = cidade.normalize('NFD').replace(/[\u0300-\u036f]/g, '').substring(0, 15);
  
  // Estruturação das tags EMV
  const payloadFormatIndicator = formatarTLV('00', '01');
  const merchantAccountInfo = formatarTLV('26', 
    formatarTLV('00', 'br.gov.bcb.pix') +
    formatarTLV('01', chave)
  );
  const merchantCategoryCode = formatarTLV('52', '0000');
  const transactionCurrency = formatarTLV('53', '986'); // BRL
  const transactionAmount = valor ? formatarTLV('54', Number(valor).toFixed(2)) : '';
  const countryCode = formatarTLV('58', 'BR');
  const merchantName = formatarTLV('59', nomeLimpo);
  const merchantCity = formatarTLV('60', cidadeLimpa);
  const additionalDataField = formatarTLV('62', formatarTLV('05', txid));

  // Concatenação de todas as partes
  const payloadSemCRC = 
    payloadFormatIndicator +
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalDataField +
    '6304';

  // Anexa o checksum final
  return payloadSemCRC + calcularCRC16(payloadSemCRC);
}