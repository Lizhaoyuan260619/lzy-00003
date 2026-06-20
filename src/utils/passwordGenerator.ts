import type { GeneratorOptions, PasswordStrength } from '../types';
import { generateRandomBytes } from './crypto';

// 字符集常量
export const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
export const NUMBER_CHARS = '0123456789';
export const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// 易混淆字符（排除用）
export const AMBIGUOUS_CHARS = 'Il1O0o';

// 使用加密安全的随机数生成 0 ~ max-1 之间的整数
function secureRandomInt(max: number): number {
  if (max <= 0) throw new Error('max 必须大于 0');
  // 使用拒绝采样避免模运算偏差
  const range = 0xffffffff;
  const limit = range - (range % max);
  const bytes = generateRandomBytes(4);
  let value =
    (bytes[0] << 24) |
    (bytes[1] << 16) |
    (bytes[2] << 8) |
    bytes[3];
  value = value >>> 0; // 转为无符号整数
  while (value >= limit) {
    const b = generateRandomBytes(4);
    value =
      ((b[0] << 24) |
        (b[1] << 16) |
        (b[2] << 8) |
        b[3]) >>>
      0;
  }
  return value % max;
}

// 从字符串中移除指定字符
function removeChars(source: string, charsToRemove: string): string {
  let result = '';
  for (let i = 0; i < source.length; i++) {
    if (charsToRemove.indexOf(source[i]) === -1) {
      result += source[i];
    }
  }
  return result;
}

// 根据选项构建字符集
function buildCharset(opts: GeneratorOptions): {
  charset: string;
  requiredCharsets: string[];
} {
  const requiredCharsets: string[] = [];
  let charset = '';

  // 处理大写字母
  if (opts.uppercase) {
    const chars = opts.excludeAmbiguous
      ? removeChars(UPPERCASE_CHARS, AMBIGUOUS_CHARS)
      : UPPERCASE_CHARS;
    charset += chars;
    requiredCharsets.push(chars);
  }

  // 处理小写字母
  if (opts.lowercase) {
    const chars = opts.excludeAmbiguous
      ? removeChars(LOWERCASE_CHARS, AMBIGUOUS_CHARS)
      : LOWERCASE_CHARS;
    charset += chars;
    requiredCharsets.push(chars);
  }

  // 处理数字
  if (opts.numbers) {
    const chars = opts.excludeAmbiguous
      ? removeChars(NUMBER_CHARS, AMBIGUOUS_CHARS)
      : NUMBER_CHARS;
    charset += chars;
    requiredCharsets.push(chars);
  }

  // 处理符号
  if (opts.symbols) {
    charset += SYMBOL_CHARS;
    requiredCharsets.push(SYMBOL_CHARS);
  }

  return { charset, requiredCharsets };
}

// Fisher-Yates 洗牌算法（打乱数组）
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 生成密码
export function generatePassword(opts: GeneratorOptions): string {
  // 至少选择一种字符类型
  if (
    !opts.uppercase &&
    !opts.lowercase &&
    !opts.numbers &&
    !opts.symbols
  ) {
    throw new Error('至少需要选择一种字符类型');
  }

  // 长度至少为选择的字符类型数（保证每种至少出现一次）
  const minLength = Number(opts.uppercase) + Number(opts.lowercase) + Number(opts.numbers) + Number(opts.symbols);
  const length = Math.max(opts.length, minLength);

  const { charset, requiredCharsets } = buildCharset(opts);
  const chars: string[] = [];

  // 先从每个必选字符集中选取一个字符，保证每种字符至少出现一次
  for (const reqCharset of requiredCharsets) {
    const idx = secureRandomInt(reqCharset.length);
    chars.push(reqCharset[idx]);
  }

  // 剩余位置从完整字符集中随机选取
  for (let i = chars.length; i < length; i++) {
    const idx = secureRandomInt(charset.length);
    chars.push(charset[idx]);
  }

  // 打乱顺序避免前几个字符的字符类型固定
  const shuffled = shuffleArray(chars);

  return shuffled.join('');
}

// 计算密码熵值和强度
export function calculateStrength(password: string): {
  score: number;
  level: PasswordStrength;
  label: string;
  color: string;
} {
  if (!password) {
    return {
      score: 0,
      level: 'weak',
      label: '无',
      color: 'bg-gray-300',
    };
  }

  // 判断字符集大小
  let poolSize = 0;

  // 包含小写字母
  if (/[a-z]/.test(password)) poolSize += 26;

  // 包含大写字母
  if (/[A-Z]/.test(password)) poolSize += 26;

  // 包含数字
  if (/[0-9]/.test(password)) poolSize += 10;

  // 包含符号（常见符号集大小）
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += SYMBOL_CHARS.length;

  // 至少取 1 避免 log2(0)
  if (poolSize === 0) poolSize = 1;

  const length = password.length;

  // 熵值（比特） = 长度 * log2(字符集大小)
  const entropy = length * Math.log2(poolSize);

  // 基于常见字符序列降低分数
  let score = Math.min(entropy, 100); // 最高分限制为 100

  // 惩罚常见模式
  const lowerPwd = password.toLowerCase();

  // 连续相同字符（如 "aaaaa"）
  if (/(.)\1{2,}/.test(password)) {
    score *= 0.7;
  }

  // 连续键盘序列（如 "qwerty"、"12345"、"abcde"）
  const sequentialPatterns = [
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
    '1234567890',
    'abcdefghijklmnopqrstuvwxyz',
  ];
  for (const pattern of sequentialPatterns) {
    for (let len = 4; len <= pattern.length; len++) {
      for (let i = 0; i + len <= pattern.length; i++) {
        const sub = pattern.substring(i, i + len);
        if (lowerPwd.includes(sub) || lowerPwd.includes(sub.split('').reverse().join(''))) {
          score *= 0.85;
        }
      }
    }
  }

  // 常见字典词（小集合，作为额外惩罚）
  const commonWords = [
    'password',
    'passw0rd',
    '123456',
    'qwerty',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
    'master',
    'login',
    'abc123',
  ];
  for (const word of commonWords) {
    if (lowerPwd.includes(word)) {
      score *= 0.6;
    }
  }

  // 最终分数限制在 0~100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // 判断等级
  let level: PasswordStrength;
  let label: string;
  let color: string;

  if (score < 40) {
    level = 'weak';
    label = '弱';
    color = 'bg-red-500';
  } else if (score < 60) {
    level = 'medium';
    label = '中';
    color = 'bg-yellow-500';
  } else {
    level = 'strong';
    label = '强';
    color = 'bg-green-500';
  }

  return { score, level, label, color };
}
