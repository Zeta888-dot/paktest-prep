export type Subject = {
  name: string
  weightage: string
  topics: string[]
}

export type TestSyllabus = {
  testName: string
  subjects: Subject[]
}

export const syllabi: TestSyllabus[] = [
  {
    testName: "Police Constable (KPK / Islamabad)",
    subjects: [
      {
        name: "English",
        weightage: "15 Marks",
        topics: [
          "Tenses",
          "Parts of Speech",
          "Synonyms & Antonyms",
          "Correct Use of Articles",
          "Prepositions",
          "Conjunctions",
          "Sentence Correction",
          "Active & Passive Voice",
          "Direct & Indirect Speech",
          "Vocabulary",
          "Proverbs & Meanings",
          "Idioms & Phrases",
          "Comprehension",
          "Translation of Sentences (English to Urdu)",
        ],
      },
      {
        name: "Urdu",
        weightage: "15 Marks",
        topics: [
          "Grammar",
          "Synonyms & Antonyms",
          "Singular & Plural",
          "Masculine & Feminine",
          "Idioms (Mahawarat)",
          "Proverbs (Zarb-ul-Amsal)",
          "Correct Spelling (Durust Imla)",
          "Comprehension (Fahm-e-Ibarat)",
          "Important Literary Information",
          "Sentence Formation",
        ],
      },
      {
        name: "Islamiyat",
        weightage: "15 Marks",
        topics: [
          "Basic Beliefs of Islam",
          "Arkan-e-Islam",
          "Seerat-un-Nabi (PBUH)",
          "Quranic Knowledge",
          "Ahadith",
          "Islamic History",
          "Khulafa-e-Rashideen",
          "Islamic Months & Events",
          "Namaz, Roza, Zakat & Hajj",
          "Islamic Teachings & Ethics",
          "Prophets of Allah",
          "General Islamic Knowledge",
        ],
      },
      {
        name: "General Knowledge (incl. Pak Studies)",
        weightage: "20 Marks",
        topics: [
          "World Geography",
          "Countries, Capitals & Currencies",
          "World Organizations",
          "International Borders",
          "Rivers, Mountains, Seas & Oceans",
          "Science & Technology",
          "Everyday Science",
          "National & International Days",
          "Famous Personalities",
          "Important Inventions",
          "Sports",
          "Books & Authors",
          "World History",
          "Current Affairs of Pakistan",
          "Government Institutions",
          "National Leadership",
          "Pakistan's Economy",
          "International Relations",
          "Ideology of Pakistan",
          "Pakistan Movement",
          "Quaid-e-Azam & Allama Iqbal",
          "Creation of Pakistan (1947)",
          "Constitution of Pakistan",
          "Geography of Pakistan",
          "Provinces, Capitals & Cities",
          "National Symbols",
          "Important Historical Events",
          "Natural Resources of Pakistan",
        ],
      },
      {
        name: "Mathematics",
        weightage: "15 Marks",
        topics: [
          "BODMAS Rule & Fractions",
          "LCM & HCF",
          "Percentage",
          "Profit & Loss",
          "Ratio & Proportion",
          "Averages & Age Problems",
          "Algebraic Formulas",
          "Linear Equations",
          "Exponents & Powers",
          "Square Roots & Cube Roots",
          "Basic Shapes (Geometry)",
          "Area & Perimeter",
          "Angles",
          "Operations on Sets (Union, Intersection, Complement)",
          "Types of Sets (Empty, Finite, Infinite, Subset)",
        ],
      },
    ],
  },
]

export function getSyllabus(testName: string): TestSyllabus | undefined {
  return syllabi.find((s) => s.testName === testName)
}