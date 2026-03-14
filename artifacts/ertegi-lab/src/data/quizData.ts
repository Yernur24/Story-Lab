export type QuizType = 'multiple-choice' | 'character-match' | 'continue-story' | 'image-match';

export interface QuizQuestion {
  type: QuizType;
  question: string;
  options?: string[];
  correctIndex?: number;
  snippet?: string;
  hint?: string;
}

const QUIZ_BY_TITLE: Record<string, QuizQuestion[]> = {
  'Алтын Балық': [
    {
      type: 'multiple-choice',
      question: 'Ертегіде шал теңізге не тастайды?',
      options: ['Аудан', 'Тор', 'Тас', 'Нан'],
      correctIndex: 1,
    },
    {
      type: 'multiple-choice',
      question: 'Алтын балық не уәде береді?',
      options: ['Алтын беруді', 'Тілекті орындауды', 'Бірге жүруді', 'Ән айтуды'],
      correctIndex: 1,
    },
    {
      type: 'character-match',
      question: 'Бұл ертегіде кімнің тілегі бітпейді?',
      options: ['Шалдың', 'Кемпірдің', 'Балықтың', 'Патшаның'],
      correctIndex: 1,
      hint: 'Ол барған сайын көбірек сұрайды',
    },
    {
      type: 'multiple-choice',
      question: 'Ертегі бізге не туралы үйретеді?',
      options: ['Жүзу керектігін', 'Ашкөздіктің жаман екенін', 'Балық ұстауды', 'Теңізге бармауды'],
      correctIndex: 1,
    },
    {
      type: 'continue-story',
      snippet: 'Шал балықты теңізге жіберіп жіберді. Кемпір болса жаңа шөміш сұрады...',
      question: 'Одан кейін не болды деп ойлайсың? Жалғастыр!',
    },
  ],

  'Батыр Ер Тостик': [
    {
      type: 'multiple-choice',
      question: 'Ер Тостик кімді іздеуге жолға шығады?',
      options: ['Жылқыны', 'Алтын балықты', 'Ауылдың балаларын', 'Ханды'],
      correctIndex: 2,
    },
    {
      type: 'character-match',
      question: 'Ер Тостикке жол жүруге кім көмектесті?',
      options: ['Мыстан кемпір', 'Тайбурыл жылқы', 'Алтын балық', 'Аю'],
      correctIndex: 1,
      hint: 'Ол сиқырлы жылқы',
    },
    {
      type: 'multiple-choice',
      question: 'Ертегідегі жауыз кім?',
      options: ['Тайбурыл', 'Мыстан кемпір', 'Ер Тостик', 'Ханзада'],
      correctIndex: 1,
    },
    {
      type: 'multiple-choice',
      question: 'Ер Тостик ең соңында не жасады?',
      options: ['Қашып кетті', 'Ұйықтап қалды', 'Балаларды азат етті', 'Жылқыны сатты'],
      correctIndex: 2,
    },
    {
      type: 'continue-story',
      snippet: 'Ер Тостик мыстан кемпірмен айқасып, балаларды азат етті. Ел оны қарсы алды...',
      question: 'Сен батыр болсаң одан кейін не жасар едің? Жалғастыр!',
    },
  ],

  'Сиқырлы Орман': [
    {
      type: 'multiple-choice',
      question: 'Қыз орманда не теруге барды?',
      options: ['Саңырауқұлақ', 'Гүл', 'Жидек', 'Жапырақ'],
      correctIndex: 2,
    },
    {
      type: 'character-match',
      question: 'Орманда қызға алғаш кім жолықты?',
      options: ['Түлкі', 'Ақ қоян', 'Аю', 'Бұлан'],
      correctIndex: 1,
      hint: 'Ол секіріп жүрген кішкентай жануар',
    },
    {
      type: 'multiple-choice',
      question: 'Орманда ағаштар не жасап жүрді?',
      options: ['Ұйықтап жатыр', 'Ән салып жатыр', 'Жүгіріп жатыр', 'Жылап жатыр'],
      correctIndex: 1,
    },
    {
      type: 'continue-story',
      snippet: 'Бір ғажайып алаңқайда ағаштар ән салып, гүлдер билеп жүр екен...',
      question: 'Сен сол орманда не кездестірер едің? Жалғастыр!',
    },
  ],

  'Маша мен Аю': [
    {
      type: 'multiple-choice',
      question: 'Маша кімнің үйіне жиі барады?',
      options: ['Жолбарыстың', 'Аюдың', 'Қасқырдың', 'Пілдің'],
      correctIndex: 1,
    },
    {
      type: 'character-match',
      question: 'Маша қандай қыз?',
      options: ['Тыныш және ұйқышыл', 'Қуатты және тентек', 'Мұңлы және жалғыз', 'Үнемі ауру'],
      correctIndex: 1,
      hint: 'Аю одан кейде шаршайды',
    },
    {
      type: 'multiple-choice',
      question: 'Маша Аюдың үйінде не жейді?',
      options: ['Тек қана бал', 'Оның тамақтарын', 'Өз тамақтарын', 'Ештеңе жемейді'],
      correctIndex: 1,
    },
    {
      type: 'continue-story',
      snippet: 'Маша Аюдың үйіне кіріп, тамақтарын жеп болды. Аю үйге оралды...',
      question: 'Аю Машаны үйде тауып алса не айтар еді? Жалғастыр!',
    },
  ],

  'Пеппа Шошқа': [
    {
      type: 'multiple-choice',
      question: 'Пеппаның ағасының аты кім?',
      options: ['Том', 'Жорж', 'Генри', 'Алекс'],
      correctIndex: 1,
    },
    {
      type: 'multiple-choice',
      question: 'Пеппаның ең ұнататын ісі не?',
      options: ['Ұшу', 'Лас шұңқырда секіру', 'Жүзу', 'Тау шығу'],
      correctIndex: 1,
    },
    {
      type: 'character-match',
      question: 'Отбасында кім бар?',
      options: ['Тек Пеппа мен Жорж', 'Пеппа, Жорж, Мама, Папа', 'Пеппа мен Мама', 'Пеппа жалғыз'],
      correctIndex: 1,
      hint: 'Олар бірге үйде тұрады',
    },
    {
      type: 'continue-story',
      snippet: 'Пеппа лас шұңқырда секіріп жатыр. Мамасы терезеден қарады...',
      question: 'Мамасы не айтады деп ойлайсың? Жалғастыр!',
    },
  ],

  'Робокар Поли': [
    {
      type: 'multiple-choice',
      question: 'Поли не машина?',
      options: ['Жедел жәрдем', 'Полиция машинасы', 'Өрт сөндіруші', 'Мектеп автобусы'],
      correctIndex: 1,
    },
    {
      type: 'character-match',
      question: 'Рой кім?',
      options: ['Ұшқыш', 'Жылдам жедел жәрдем', 'Полиция', 'Мұғалім'],
      correctIndex: 1,
      hint: 'Ол ауру адамдарға барады',
    },
    {
      type: 'multiple-choice',
      question: 'Роботтар не үшін жасалған?',
      options: ['Ойнау үшін', 'Адамдарға көмек ету үшін', 'Жарыс үшін', 'Тамақ пісіру үшін'],
      correctIndex: 1,
    },
    {
      type: 'continue-story',
      snippet: 'Поли қалада тәртіп сақтап жүр. Кенеттен үлкен апат болды...',
      question: 'Поли не жасайды деп ойлайсың? Жалғастыр!',
    },
  ],

  'Батыр Ер мен Айдаһар': [
    {
      type: 'multiple-choice',
      question: 'Айдаһар қандай түсті?',
      options: ['Жасыл', 'Сары', 'Қызыл', 'Көк'],
      correctIndex: 2,
    },
    {
      type: 'character-match',
      question: 'Батыр Арман жолда кімді кездестірді?',
      options: ['Аюды', 'Садақшыны', 'Балықшыны', 'Сиқыршыны'],
      correctIndex: 1,
      hint: 'Оның сиқырлы жебесі бар',
    },
    {
      type: 'multiple-choice',
      question: 'Арман не алып жолға шықты?',
      options: ['Садақ', 'Қылыш', 'Балта', 'Таяқ'],
      correctIndex: 1,
    },
    {
      type: 'continue-story',
      snippet: 'Арман айдаһарға қарсы тұрды. Оның қолында тек қылышы ғана бар...',
      question: 'Арман жеңу үшін қандай айла ойластырды? Жалғастыр!',
    },
  ],

  'Ғарышкер Аспан': [
    {
      type: 'multiple-choice',
      question: 'Аспан нешеде?',
      options: ['6', '7', '8', '10'],
      correctIndex: 2,
    },
    {
      type: 'multiple-choice',
      question: 'Аспанның ракетасы неден жасалған?',
      options: ['Темірден', 'Ескі теңге қорабынан', 'Ағаштан', 'Мұздан'],
      correctIndex: 1,
    },
    {
      type: 'character-match',
      question: 'Жолда Аспан кімдерді кездестірді?',
      options: ['Ғарышкерлерді', 'Жасыл инопланетяндарды', 'Роботтарды', 'Жұлдыз адамдарды'],
      correctIndex: 1,
      hint: 'Олар кішкентай және жасыл',
    },
    {
      type: 'multiple-choice',
      question: 'Аспан бен инопланетяндар қалай тіл табысты?',
      options: ['Жазып', 'Күлкімен', 'Ишаратпен', 'Сурет арқылы'],
      correctIndex: 1,
    },
    {
      type: 'continue-story',
      snippet: 'Аспан жасыл инопланетяндарды кездестірді. Екеуі де бір-бірінің тілін білмейді...',
      question: 'Сен олардың орнында болсаң қалай байланысар едің? Жалғастыр!',
    },
  ],
};

export function getQuizForStory(title: string): QuizQuestion[] {
  return QUIZ_BY_TITLE[title] || [];
}

export function generateImageMatchQuestions(allStories: { title: string; coverEmoji: string; id: string }[]): QuizQuestion[] {
  if (allStories.length < 3) return [];

  return allStories.slice(0, 4).map(story => {
    const others = allStories.filter(s => s.id !== story.id);
    const distractors = others.slice(0, 3).map(s => s.title);
    const options = [story.title, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(story.title);

    return {
      type: 'image-match' as QuizType,
      question: `Бұл ${story.coverEmoji} белгісі қай ертегіге тиесілі?`,
      options,
      correctIndex,
      hint: story.coverEmoji,
    };
  });
}
