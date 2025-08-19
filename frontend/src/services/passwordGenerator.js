export const CHARACTER_SETS = {
  lowercase: 'abcdefghijkmnpqrstuvwxyz',
  uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ', 
  numbers: '23456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?~',
  extendedSymbols: '¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿',
  unicode: '∀∂∃∄∅∆∇∈∉∊∋∌∍∎∏∐∑−∓∔∕∖∗∘∙√∛∜∝∞∟∠∡∢∣∤∥∦∧∨∩∪∫∬∭∮∯∰∱∲∳'
};

export const POPULAR_WEBSITES = [
  { name: 'Google', url: 'google.com' },
  { name: 'Facebook', url: 'facebook.com' },
  { name: 'Twitter', url: 'twitter.com' },
  { name: 'Instagram', url: 'instagram.com' },
  { name: 'LinkedIn', url: 'linkedin.com' },
  { name: 'GitHub', url: 'github.com' },
  { name: 'Netflix', url: 'netflix.com' },
  { name: 'Amazon', url: 'amazon.com' },
];

export const CHARACTER_TYPE_OPTIONS = [
  { key: 'uppercase', label: 'Uppercase Letters', example: 'ABCDEF', icon: 'Aa', color: 'blue' },
  { key: 'lowercase', label: 'Lowercase Letters', example: 'abcdef', icon: 'aa', color: 'green' },
  { key: 'numbers', label: 'Numbers', example: '123456', icon: '123', color: 'purple' },
  { key: 'symbols', label: 'Special Characters', example: '!@#$%^', icon: '!@#', color: 'orange' },
  { key: 'extendedSymbols', label: 'Extended Symbols', example: '¡¢£¤¥¦', icon: '¡¢£', color: 'cyan' }
];

export const SEPARATOR_OPTIONS = [
  { value: '-', label: 'Hyphen', symbol: '-', desc: 'word-word' },
  { value: '_', label: 'Underscore', symbol: '_', desc: 'word_word' },
  { value: '.', label: 'Period', symbol: '•', desc: 'word.word' },
  { value: ' ', label: 'Space', symbol: '⎵', desc: 'word word' },
  { value: '', label: 'None', symbol: '∅', desc: 'wordword' }
];

export const WORD_LIST = [
  'apple', 'bridge', 'castle', 'dragon', 'eagle', 'forest', 'guitar', 'harbor',
  'island', 'jungle', 'knight', 'ladder', 'mountain', 'ocean', 'palace', 'queen',
  'river', 'sunset', 'tower', 'umbrella', 'valley', 'wizard', 'yellow', 'zebra',
  'anchor', 'balloon', 'candle', 'diamond', 'elephant', 'falcon', 'garden', 'hammer',
  'igloo', 'jacket', 'kitten', 'lemon', 'marble', 'notebook', 'orange', 'penguin'
];

export const DEFAULT_OPTIONS = {
  type: 'random',
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  extendedSymbols: true,
  wordCount: 4,
  separator: '-',
  capitalize: true
};