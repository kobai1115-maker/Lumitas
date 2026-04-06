import { calculateTenure } from '../src/lib/utils/date';

const testCases = [
  { input: '2020-01-01', expected: '6年3ヶ月' }, // Assuming today is 2026-04-06
  { input: '2026-03-01', expected: '1ヶ月' },
  { input: '2026-04-01', expected: '0ヶ月' },
  { input: '2026-04-06', expected: '0ヶ月' },
  { input: '2026-05-01', expected: '入社前' },
  { input: null, expected: '未登録' },
  { input: '', expected: '' },
  { input: 'invalid', expected: '' },
];

console.log('Testing calculateTenure:');
testCases.forEach(({ input, expected }) => {
  const result = calculateTenure(input);
  console.log(`Input: ${input} -> Result: ${result} (Expected: ${expected})`);
});
