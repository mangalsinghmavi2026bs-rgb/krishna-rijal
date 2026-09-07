/**
 * Nepali Date & Number Utilities for School Accounting Software
 */

export const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export const NEPALI_MONTHS_BS = [
  'वैशाख (Baishakh)',
  'जेठ (Jestha)',
  'असार (Ashadh)',
  'साउन (Shrawan)',
  'भदौ (Bhadra)',
  'असोज (Ashwin)',
  'कात्तिक (Kartik)',
  'मङ्सिर (Mangsir)',
  'पुस (Poush)',
  'माघ (Magh)',
  'फागुन (Falgun)',
  'चैत (Chaitra)'
];

export const NEPALI_MONTHS_SHORT = [
  'वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मङ्सिर', 'पुस', 'माघ', 'फागुन', 'चैत'
];

/**
 * Converts English digits to Nepali Devanagari digits
 */
export function toNepaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '०';
  const str = num.toString();
  return str.replace(/[0-9]/g, (digit) => NEPALI_DIGITS[parseInt(digit, 10)]);
}

/**
 * Formats a currency amount into Nepali comma separated format
 * e.g. 1540200 -> "15,40,200" or Nepali digits "१५,४०,२००"
 */
export function formatNepaliCurrency(
  amount: number,
  options?: { inNepaliDigits?: boolean; prefix?: boolean }
): string {
  const { inNepaliDigits = true, prefix = true } = options || {};
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  const str = absAmount.toString();
  let result = '';

  if (str.length <= 3) {
    result = str;
  } else {
    // Nepali / South Asian numbering: last 3 digits, then pairs of 2 digits
    const lastThree = str.substring(str.length - 3);
    const otherDigits = str.substring(0, str.length - 3);
    const withCommas = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${withCommas},${lastThree}`;
  }

  if (inNepaliDigits) {
    result = toNepaliNumber(result);
  }

  const sign = isNegative ? '-' : '';
  const currPrefix = prefix ? (inNepaliDigits ? 'रु. ' : 'Rs. ') : '';

  return `${currPrefix}${sign}${result}`;
}

const ONES_NEPALI: { [key: number]: string } = {
  0: 'शून्य', 1: 'एक', 2: 'दुई', 3: 'तीन', 4: 'चार', 5: 'पाँच',
  6: 'छ', 7: 'सात', 8: 'आठ', 9: 'नौ', 10: 'दस',
  11: 'एघार', 12: 'बाह्र', 13: 'तेह्र', 14: 'चौध', 15: 'पन्ध्र',
  16: 'सोह्र', 17: 'सत्र', 18: 'अठार', 19: 'उन्नाइस', 20: 'बीस',
  21: 'एक्काइस', 22: 'बाइस', 23: 'तेइस', 24: 'चौबीस', 25: 'पच्चीस',
  26: 'छब्बीस', 27: 'सत्ताइस', 28: 'अठ्ठाइस', 29: 'उनन्तिस', 30: 'तीस',
  31: 'एकत्तिस', 32: 'बत्तिस', 33: 'तेत्तिस', 34: 'चौंत्तिस', 35: 'पैंतीस',
  36: 'छत्तीस', 37: 'सैंतीस', 38: 'अठतीस', 39: 'उनन्चालीस', 40: 'चालीस',
  41: 'एकचालीस', 42: 'बयालीस', 43: 'त्रियालीस', 44: 'चवालीस', 45: 'पैंतालीस',
  46: 'छयालीस', 47: 'सतचालीस', 48: 'अठचालीस', 49: 'उनन्चास', 50: 'पचास',
  51: 'एकाउन्न', 52: 'बाउन्न', 53: 'त्रिपन्न', 54: 'चौन्न', 55: 'पचपन्न',
  56: 'छपन्न', 57: 'सन्ताउन्न', 58: 'अन्ठाउन्न', 59: 'उनन्साठी', 60: 'साठी',
  61: 'एकसट्ठी', 62: 'बाइसट्ठी', 63: 'त्रिसट्ठी', 64: 'चौंसट्ठी', 65: 'पैंसट्ठी',
  66: 'छयसट्ठी', 67: 'सर्चसट्ठी', 68: 'अठसट्ठी', 69: 'उनन्सत्तरी', 70: 'सत्तरी',
  71: 'एकहत्तर', 72: 'बहत्तर', 73: 'त्रिहत्तर', 74: 'चौहत्तर', 75: 'पचहत्तर',
  76: 'छयहत्तर', 77: 'सतहत्तर', 78: 'अठहत्तर', 79: 'उनासी', 80: 'असी',
  81: 'एकासी', 82: 'बयासी', 83: 'त्रियासी', 84: 'चौरासी', 85: 'पचासी',
  86: 'छयासी', 87: 'सतासी', 88: 'अठासी', 89: 'उनान्नब्बे', 90: 'नब्बे',
  91: 'एकान्नब्बे', 92: 'बयान्नब्बे', 93: 'त्रियान्नब्बे', 94: 'चौरान्नब्बे', 95: 'पन्चान्नब्बे',
  96: 'छयान्नब्बे', 97: 'सन्तान्नब्बे', 98: 'अन्ठान्नब्बे', 99: 'उनान्सय'
};

/**
 * Converts numbers into formal Nepali words for official bills and receipts
 * e.g. 15000 -> "पन्ध्र हजार रुपैयाँ मात्र"
 */
export function numberToNepaliWords(num: number): string {
  if (num === 0) return 'शून्य रुपैयाँ मात्र';
  const n = Math.abs(Math.floor(num));

  function convertTwoDigits(val: number): string {
    return ONES_NEPALI[val] || '';
  }

  let words = '';

  const crore = Math.floor(n / 10000000);
  let remainder = n % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;

  const hundred = Math.floor(remainder / 100);
  remainder %= 100;

  if (crore > 0) {
    words += `${convertTwoDigits(crore)} करोड `;
  }
  if (lakh > 0) {
    words += `${convertTwoDigits(lakh)} लाख `;
  }
  if (thousand > 0) {
    words += `${convertTwoDigits(thousand)} हजार `;
  }
  if (hundred > 0) {
    words += `${convertTwoDigits(hundred)} सय `;
  }
  if (remainder > 0) {
    words += `${convertTwoDigits(remainder)} `;
  }

  return `${words.trim()} रुपैयाँ मात्र`;
}

/**
 * Generates an official Nepali Receipt number
 */
export function generateReceiptNo(seq: number): string {
  const pad = seq.toString().padStart(4, '0');
  return `रसिद-२०८१-${pad}`;
}

/**
 * Generates an official Nepali Payroll Voucher number
 */
export function generateVoucherNo(seq: number): string {
  const pad = seq.toString().padStart(4, '0');
  return `भौचर-२०८१-${pad}`;
}

/**
 * Generates an official Nepali Expense number
 */
export function generateExpenseNo(seq: number): string {
  const pad = seq.toString().padStart(4, '0');
  return `खर्च-२०८१-${pad}`;
}
