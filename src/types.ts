export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Phrase {
  id: string;
  english: string;
  translations: {
    es: string;
    fr: string;
    de: string;
    it: string;
    pt: string;
    ja: string;
  };
  context: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  situations: number;
  imageUrl: string;
  phrases: Phrase[];
}
