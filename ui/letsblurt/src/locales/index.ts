export default {
  'en-US': require('./en-US.json'),
  'ko-KR': require('./ko-KR.json'),
};

export type LOCALE = {
  locale: string;
  name: string;
};

export const SUPPORTED_LOCALES = [
  {locale: 'en-US', name: 'English'},
  {locale: 'ko-KR', name: '한국어'},
];
