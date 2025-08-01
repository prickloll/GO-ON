import { Scenario } from '../types';

export const scenarios: Scenario[] = [
  {
    id: '1',
    title: 'Restaurant Order',
    description: 'Practice ordering food and drinks at a restaurant',
    category: 'Dining',
    difficulty: 'beginner',
    duration: 10,
    situations: 3,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop',
    phrases: [
      {
        id: '1',
        english: "I'd like to see the menu, please.",
        translations: {
          es: 'Me gustaría ver el menú, por favor.',
          fr: 'Je voudrais voir le menu, s\'il vous plaît.',
          de: 'Ich hätte gerne die Speisekarte, bitte.',
          it: 'Vorrei vedere il menu, per favore.',
          pt: 'Gostaria de ver o menu, por favor.',
          ja: 'メニューを見せてください。'
        },
        context: 'When you first sit down at a restaurant'
      },
      {
        id: '2',
        english: "What do you recommend?",
        translations: {
          es: '¿Qué me recomienda?',
          fr: 'Que me recommandez-vous?',
          de: 'Was empfehlen Sie?',
          it: 'Cosa mi consiglia?',
          pt: 'O que você recomenda?',
          ja: '何がおすすめですか？'
        },
        context: 'Asking the waiter for suggestions'
      }
    ]
  },
  {
    id: '2',
    title: 'Hotel Check-in',
    description: 'Learn how to check into a hotel and ask about amenities',
    category: 'Travel',
    difficulty: 'intermediate',
    duration: 15,
    situations: 4,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop',
    phrases: [
      {
        id: '1',
        english: "I have a reservation under the name Smith.",
        translations: {
          es: 'Tengo una reserva a nombre de Smith.',
          fr: 'J\'ai une réservation au nom de Smith.',
          de: 'Ich habe eine Reservierung unter dem Namen Smith.',
          it: 'Ho una prenotazione a nome Smith.',
          pt: 'Tenho uma reserva em nome de Smith.',
          ja: 'スミスの名前で予約をしています。'
        },
        context: 'When arriving at the hotel reception'
      }
    ]
  },
  {
    id: '3',
    title: 'Job Interview',
    description: 'Prepare for common job interview questions and responses',
    category: 'Professional',
    difficulty: 'advanced',
    duration: 25,
    situations: 6,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
    phrases: [
      {
        id: '1',
        english: "Tell me about yourself.",
        translations: {
          es: 'Háblame de ti.',
          fr: 'Parlez-moi de vous.',
          de: 'Erzählen Sie mir von sich.',
          it: 'Mi parli di lei.',
          pt: 'Fale-me sobre você.',
          ja: '自己紹介をしてください。'
        },
        context: 'Common opening question in interviews'
      }
    ]
  },
  {
    id: '4',
    title: 'Shopping Experience',
    description: 'Navigate shopping situations and make purchases confidently',
    category: 'Shopping',
    difficulty: 'beginner',
    duration: 12,
    situations: 4,
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop',
    phrases: [
      {
        id: '1',
        english: "How much does this cost?",
        translations: {
          es: '¿Cuánto cuesta esto?',
          fr: 'Combien ça coûte?',
          de: 'Wie viel kostet das?',
          it: 'Quanto costa questo?',
          pt: 'Quanto custa isto?',
          ja: 'これはいくらですか？'
        },
        context: 'When asking about price in a store'
      }
    ]
  },
  {
    id: '5',
    title: 'Public Transportation',
    description: 'Master using trains, buses, and other public transport',
    category: 'Travel',
    difficulty: 'intermediate',
    duration: 18,
    situations: 5,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop',
    phrases: [
      {
        id: '1',
        english: "Which platform for Tokyo Station?",
        translations: {
          es: '¿Qué andén para la Estación de Tokio?',
          fr: 'Quel quai pour la gare de Tokyo?',
          de: 'Welcher Bahnsteig für den Bahnhof Tokyo?',
          it: 'Quale binario per la stazione di Tokyo?',
          pt: 'Qual plataforma para a Estação de Tóquio?',
          ja: '東京駅は何番線ですか？'
        },
        context: 'Asking for directions at a train station'
      }
    ]
  },
  {
    id: '6',
    title: 'Medical Appointment',
    description: 'Communicate effectively during medical visits and emergencies',
    category: 'Healthcare',
    difficulty: 'advanced',
    duration: 20,
    situations: 4,
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
    phrases: [
      {
        id: '1',
        english: "I don't feel well.",
        translations: {
          es: 'No me siento bien.',
          fr: 'Je ne me sens pas bien.',
          de: 'Mir geht es nicht gut.',
          it: 'Non mi sento bene.',
          pt: 'Não me sinto bem.',
          ja: '体調が悪いです。'
        },
        context: 'Explaining symptoms to a doctor'
      }
    ]
  }
];
