import type {
  DocumentSummary,
  ExamQuestion,
  Flashcard,
  FileActivity,
  FileProgressMetric,
  LibraryDocument,
  McqContentItem,
  McqContentStat,
} from "@/types/auth";

export const libraryDocuments: LibraryDocument[] = [
  {
    id: "6260097",
    name: "Pride and Prejudice Literary Analysis",
    slug: "pride-and-prejudice-jane-austen,1",
    icon: "📚",
    pageCount: 515,
    questionCount: 40,
  },
];

export const fileActivities: FileActivity[] = [
  {
    title: "MCQs",
    description: "40 Questions",
    ctaLabel: "Practice",
    accent: "gradient",
    href: "/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/exam",
  },
  {
    title: "Flashcards",
    description: "30 Flashcards",
    ctaLabel: "Memorize",
    href: "/library/study-set/cd78ee55-9807-46e5-8352-d863a94d92c9/folder/6260097/learn",
  },
  {
    title: "Summaries",
    description: "1 Summary",
    ctaLabel: "Recap",
    href: "/library/files/6260097/summary",
  },
  {
    title: "Mind Maps",
    description: "",
    ctaLabel: "Coming Soon",
  },
];

export const fileProgressMetrics: FileProgressMetric[] = [
  {
    label: "MCQs",
    value: "23%",
    tone: "indigo",
  },
  {
    label: "Flashcards",
    value: "40%",
    tone: "blue",
  },
];

export const examQuestions: ExamQuestion[] = [
  {
    id: "focus",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Introduction to Pride and Prejudice",
    difficulty: "Easy",
    prompt: "What is the primary focus of 'Pride and Prejudice'?",
    choices: [
      { id: "a", label: "Political intrigue and warfare" },
      { id: "b", label: "Religious dogma and philosophy" },
      { id: "c", label: "Domestic life and human condition" },
      { id: "d", label: "Scientific discovery and progress" },
    ],
    hint: "Think about the Bennet family, marriage, and everyday social life rather than war or science.",
    source:
      "The novel centers on relationships, class, family life, and the social expectations surrounding marriage in Regency England.",
    correctChoiceId: "c",
    assistantTopic: "the novel's social and emotional center",
    explanationBullets: [
      "Austen stays focused on family life, courtship, class expectations, and everyday social behavior.",
      "The book is interested in how people judge one another, especially through marriage, reputation, and status.",
    ],
    wrongChoiceContrast:
      "while dramatic in tone, it pulls the novel away from Austen's real focus on relationships, manners, and domestic life.",
    correctReflection:
      "You recognized that Austen is more interested in marriage, family pressure, and human behavior than in war, religion, or science.",
    takeaway:
      "When a question asks about a novel's main focus, look for the broad social and emotional world the story keeps returning to.",
    followUpPrompt: "How do marriage and class expectations shape the decisions characters make in the novel?",
  },
  {
    id: "devices",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Introduction to Pride and Prejudice",
    difficulty: "Easy",
    prompt: "What literary devices are prominent in the book?",
    choices: [
      { id: "a", label: "Tragedy and melodrama" },
      { id: "b", label: "Fantasy and escapism" },
      { id: "c", label: "Satire and anti-romanticism" },
      { id: "d", label: "Allegory and symbolism" },
    ],
    hint: "Austen uses wit to critique social norms and romantic assumptions.",
    source:
      "Austen is known for satire, irony, and a sharp critique of manners rather than overt fantasy or melodrama.",
    correctChoiceId: "c",
    assistantTopic: "literary devices",
    explanationBullets: [
      "Austen uses satire and irony to expose the vanity, pride, and social performance of her characters.",
      "The novel undercuts romantic idealism by showing how first impressions, ego, and social pressure distort relationships.",
    ],
    wrongChoiceContrast:
      "while it can appear in literature more broadly, it is not the defining device that shapes Austen's critique in this book.",
    correctReflection:
      "You picked up on the fact that Austen's wit and anti-romantic edge drive the book's voice and social critique.",
    takeaway:
      "When identifying literary devices, focus on the techniques that shape the author's tone and message across the whole work.",
    followUpPrompt: "What is the primary purpose of using satire in literature?",
  },
  {
    id: "society",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Social Conventions and Marriage",
    difficulty: "Easy",
    prompt: "What societal aspect does the book humorously describe?",
    choices: [
      { id: "a", label: "Ancient Roman empire" },
      { id: "b", label: "Urban industrial revolution" },
      { id: "c", label: "Future dystopian societies" },
      { id: "d", label: "Rural Victorian England society" },
    ],
    hint: "Think about the marriage market, local assemblies, and the landed families the novel keeps returning to.",
    source:
      "The novel satirizes the manners and marriage-driven social world of country gentry society in England.",
    correctChoiceId: "d",
    assistantTopic: "the book's social setting",
    explanationBullets: [
      "The story revolves around local visits, balls, inheritance, marriage, and reputation among country families.",
      "Austen uses humor to comment on the habits and anxieties of English society rather than ancient or futuristic settings.",
    ],
    wrongChoiceContrast:
      "would place the novel in a completely different historical setting than the one Austen is satirizing.",
    correctReflection:
      "You caught the historical setting that gives Austen room to make fun of manners, status, and marriage expectations.",
    takeaway:
      "Pinning down the setting of a novel is often the fastest way to understand the kind of society it is critiquing.",
    followUpPrompt: "Why does Austen make local gatherings and social visits so important to the plot?",
  },
  {
    id: "mr-bennet",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Mr. Bennet's Character",
    difficulty: "Easy",
    prompt: "What is Mr. Bennet's personality described as?",
    choices: [
      { id: "a", label: "Sarcastic and reserved" },
      { id: "b", label: "Naive and reckless" },
      { id: "c", label: "Loud and sentimental" },
      { id: "d", label: "Heroic and impulsive" },
    ],
    hint: "He is witty, detached, and often amused by the chaos around him.",
    source:
      "Mr. Bennet is characterized by dry wit, emotional distance, and a tendency to observe family drama rather than manage it.",
    correctChoiceId: "a",
    assistantTopic: "Mr. Bennet's characterization",
    explanationBullets: [
      "Mr. Bennet often responds with dry humor and keeps an emotional distance from his family's drama.",
      "His sarcasm makes him entertaining, but his reserve also shows his failure to intervene responsibly at key moments.",
    ],
    wrongChoiceContrast:
      "doesn't match the cool, ironic way Mr. Bennet speaks and behaves throughout the novel.",
    correctReflection:
      "You matched his wit and detachment, which is exactly how Austen frames him in the household.",
    takeaway:
      "Character questions usually hinge on the traits that appear consistently in dialogue and repeated behavior.",
    followUpPrompt: "How does Mr. Bennet's sarcastic distance affect the Bennet family?",
  },
  {
    id: "mrs-bennet",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Sisterly Discussions",
    difficulty: "Easy",
    prompt: "What does Mrs. Bennet complain about frequently?",
    choices: [
      { id: "a", label: "The weather" },
      { id: "b", label: "Her nerves" },
      { id: "c", label: "The servants" },
      { id: "d", label: "Her carriage" },
    ],
    hint: "It is one of her most repeated phrases whenever she feels distressed or dramatic.",
    source:
      "Mrs. Bennet repeatedly invokes her 'poor nerves' as part of Austen's comic portrait of her exaggerated anxieties.",
    correctChoiceId: "b",
    assistantTopic: "Mrs. Bennet's comic habits",
    explanationBullets: [
      "Mrs. Bennet often dramatizes ordinary events by complaining about her nerves.",
      "Austen uses that repeated phrase to make her anxiety feel comic and recognizable.",
    ],
    wrongChoiceContrast:
      "misses the repeated line Austen uses to turn Mrs. Bennet's anxiety into a running joke.",
    correctReflection:
      "You picked the phrase Austen uses again and again to underline Mrs. Bennet's dramatic personality.",
    takeaway:
      "Repeated phrases are usually strong clues in literature questions because authors use them to define voice and personality.",
    followUpPrompt: "Why does Austen repeat the phrase 'my nerves' so often with Mrs. Bennet?",
  },
  {
    id: "assembly-count",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Social Gatherings and Interactions",
    difficulty: "Easy",
    prompt: "How many people did Mr. Bingley bring to the assembly?",
    choices: [
      { id: "a", label: "Three altogether" },
      { id: "b", label: "Five altogether" },
      { id: "c", label: "Seven altogether" },
      { id: "d", label: "Nine altogether" },
    ],
    hint: "Count Mr. Bingley, his sisters, his brother-in-law, and Mr. Darcy.",
    source:
      "At the assembly, Mr. Bingley arrives with a small party that includes his sisters, Mr. Darcy, and another companion.",
    correctChoiceId: "b",
    assistantTopic: "the assembly scene",
    explanationBullets: [
      "The novel introduces Bingley's social circle as a compact group arriving together at the public gathering.",
      "That number matters because it shapes first impressions and how quickly the Bennets start speculating about them.",
    ],
    wrongChoiceContrast:
      "doesn't match the clearly described size of Bingley's party at the assembly.",
    correctReflection:
      "You remembered the social setup of the assembly, which is exactly the kind of detail Austen uses to launch the novel's relationship dynamics.",
    takeaway:
      "Questions about opening social scenes often matter because they establish the relationships and rumors that drive the plot.",
    followUpPrompt: "Why is the assembly such an important turning point for first impressions in the novel?",
  },
  {
    id: "visit-bingley",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Mr. Bingley's Arrival",
    difficulty: "Easy",
    prompt: "Who does Mr. Bennet initially suggest should visit Mr. Bingley?",
    choices: [
      { id: "a", label: "Mrs. Bennet and the girls" },
      { id: "b", label: "Mr. Collins" },
      { id: "c", label: "Charlotte Lucas" },
      { id: "d", label: "Lady Catherine" },
    ],
    hint: "He teases the family by pretending he will not be the one to make the visit.",
    source:
      "Mr. Bennet jokes about sending Mrs. Bennet and the daughters instead, which fits his teasing style early in the novel.",
    correctChoiceId: "a",
    assistantTopic: "Mr. Bennet's teasing response",
    explanationBullets: [
      "Mr. Bennet uses irony to play with Mrs. Bennet's anxiety about meeting the new neighbor.",
      "His suggestion reinforces both his wit and his tendency to provoke rather than reassure his family.",
    ],
    wrongChoiceContrast:
      "would shift the moment away from the domestic family comedy Austen is staging in the opening chapters.",
    correctReflection:
      "You caught one of Mr. Bennet's early jokes, which is a strong clue to his detached and playful personality.",
    takeaway:
      "When a character is known for wit, early dialogue often becomes the best evidence for later personality questions.",
    followUpPrompt: "How does Mr. Bennet's humor affect the mood of the opening chapters?",
  },
  {
    id: "satire-purpose",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Introduction to Pride and Prejudice",
    difficulty: "Medium",
    prompt: "What is the primary purpose of satire in the novel?",
    choices: [
      { id: "a", label: "To glorify aristocratic behavior" },
      { id: "b", label: "To criticize social vanity and hypocrisy" },
      { id: "c", label: "To create supernatural suspense" },
      { id: "d", label: "To hide the plot from the reader" },
    ],
    hint: "Austen's humor usually exposes flaws instead of praising them.",
    source:
      "Satire in Austen is used to reveal the absurdity of vanity, pride, class anxiety, and performative manners.",
    correctChoiceId: "b",
    assistantTopic: "satire's role in Austen",
    explanationBullets: [
      "Austen's comic tone exposes how shallow pride, gossip, and class performance can be.",
      "The humor pushes readers to question social norms rather than simply admire them.",
    ],
    wrongChoiceContrast:
      "ignores the critical edge of Austen's humor, which is aimed at exposing social flaws rather than celebrating them.",
    correctReflection:
      "You identified satire as a tool of critique, which is the heart of how Austen shapes the reader's judgment.",
    takeaway:
      "When satire appears in a novel, ask what behavior or belief the author wants readers to see more clearly.",
    followUpPrompt: "Which characters are most often used by Austen to satirize social ambition?",
  },
  {
    id: "universal-truth",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Introduction to Pride and Prejudice",
    difficulty: "Easy",
    prompt: "What concept is universally acknowledged about a single man of good fortune?",
    choices: [
      { id: "a", label: "He must seek political office" },
      { id: "b", label: "He must travel the world" },
      { id: "c", label: "He must be in want of a wife" },
      { id: "d", label: "He must pursue scholarly work" },
    ],
    hint: "Think of the famous opening sentence of the novel.",
    source:
      "Austen opens the novel by declaring that a single man in possession of a good fortune must be in want of a wife.",
    correctChoiceId: "c",
    assistantTopic: "the novel's opening line",
    explanationBullets: [
      "This line introduces both the comic tone and the marriage-centered world of the novel.",
      "It is less a serious truth than a social assumption Austen is teasing from the very first sentence.",
    ],
    wrongChoiceContrast:
      "moves away from the marriage-market joke that defines the opening of the novel.",
    correctReflection:
      "You caught Austen's most famous setup line, which frames the whole social world the book explores.",
    takeaway:
      "The opening line of a novel often contains the central idea or tension the rest of the story will keep unpacking.",
    followUpPrompt: "Why is Austen's opening sentence both funny and critical at the same time?",
  },
  {
    id: "mrs-bennet-goal",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Social Conventions and Marriage",
    difficulty: "Easy",
    prompt: "What is Mrs. Bennet's main goal in life?",
    choices: [
      { id: "a", label: "To pursue intellectual endeavors" },
      { id: "b", label: "To get her daughters married" },
      { id: "c", label: "To achieve social prominence" },
      { id: "d", label: "To accumulate vast wealth" },
    ],
    hint: "Her priorities revolve around the futures of her daughters.",
    source:
      "Mrs. Bennet's dominant aim throughout the novel is to secure advantageous marriages for her daughters.",
    correctChoiceId: "b",
    assistantTopic: "Mrs. Bennet's motivation",
    explanationBullets: [
      "Her constant anxiety about suitors, visits, and social opportunities all point back to marriage.",
      "Austen uses that obsession to satirize the pressure families place on women in this society.",
    ],
    wrongChoiceContrast:
      "doesn't capture the single-minded marriage focus Austen repeatedly gives Mrs. Bennet.",
    correctReflection:
      "You picked the answer that best sums up Mrs. Bennet's energy, worries, and comic urgency across the book.",
    takeaway:
      "When a character's motivation is repeated again and again, the simplest formulation is often the right answer.",
    followUpPrompt: "How does Mrs. Bennet's fixation on marriage shape the atmosphere of the Bennet household?",
  },
  {
    id: "mr-bennet-pretend",
    title: "Pride and Prejudice Literary Analysis",
    current: 0,
    total: 40,
    topic: "Mr. Bingley's Arrival",
    difficulty: "Easy",
    prompt: "What does Mr. Bennet pretend about the arrival of the new tenant?",
    choices: [
      { id: "a", label: "He feigned complete ignorance" },
      { id: "b", label: "He had not heard about it" },
      { id: "c", label: "He expressed great excitement" },
      { id: "d", label: "He was already aware of it" },
    ],
    hint: "He plays coy to tease Mrs. Bennet before revealing what he knows.",
    source:
      "Mr. Bennet initially acts as though he does not know or care, which lets him tease his wife before revealing he has already visited Bingley.",
    correctChoiceId: "b",
    assistantTopic: "Mr. Bennet's teasing style",
    explanationBullets: [
      "He withholds his real knowledge to amuse himself at Mrs. Bennet's expense.",
      "That small domestic trick sets up the playful but unequal dynamic between them.",
    ],
    wrongChoiceContrast:
      "misses the quiet, ironic way Mr. Bennet stages the moment for comic effect.",
    correctReflection:
      "You recognized that his joke depends on pretending ignorance before revealing the truth later.",
    takeaway:
      "Mr. Bennet's humor often works by saying less than he knows and letting others expose their own anxieties.",
    followUpPrompt: "Why does Austen open with so much teasing dialogue between Mr. and Mrs. Bennet?",
  },
];

export const flashcardsDeck: Flashcard[] = [
  {
    id: "1",
    front: "What is a universally acknowledged truth regarding a single man of good fortune?",
    back: "He must be in want of a wife.",
    source:
      "Austen opens the novel by calling this assumption 'a truth universally acknowledged,' turning marriage pressure into satire from the first line.",
    explanation:
      "The flashcard points to Austen's famous opening sentence, which immediately links money, marriage, and social expectation.",
    mnemonic:
      "Fortune -> wife. Austen turns wealth into instant marriage speculation.",
    example:
      "Mrs. Bennet treats Mr. Bingley's arrival as social proof that one wealthy bachelor should become somebody's husband.",
  },
  {
    id: "2",
    front: "How is Mr. Darcy first perceived by Elizabeth and the local society?",
    back: "As proud, aloof, and difficult to like, which feeds Elizabeth's prejudice against him.",
    source:
      "Darcy's reserve at the Meryton assembly shapes the first major misunderstanding in the novel.",
    explanation:
      "Elizabeth and the neighborhood read Darcy's silence and pride as arrogance, which becomes the foundation for her early judgment.",
    mnemonic:
      "Darcy at the dance = distance, pride, prejudice.",
    example:
      "His refusal to dance with Elizabeth becomes a shorthand for the social tension between status and first impressions.",
  },
  {
    id: "3",
    front: "What literary tools does Austen use most often to critique social expectations?",
    back: "Satire, irony, and sharply observed dialogue about manners, status, and marriage.",
    source:
      "Austen relies on tone and dialogue more than dramatic action to expose vanity, pride, and class performance.",
    explanation:
      "The novel critiques society by letting conversations, social rituals, and irony reveal how absurd these expectations can be.",
    mnemonic:
      "Satire + irony + manners = Austen's critical toolkit.",
    example:
      "Mrs. Bennet's nerves and Mr. Collins's speeches are funny because Austen uses them to expose social pressure and self-importance.",
  },
  {
    id: "4",
    front: "What is Mrs. Bennet's primary concern for her daughters?",
    back: "Getting them married as advantageously as possible.",
    source:
      "Mrs. Bennet's energy is almost always directed toward visits, proposals, and securing matches for her daughters.",
    explanation:
      "Marriage is not a side issue in her mind; it is the measure of security, status, and success in the Bennet household.",
    mnemonic:
      "Mrs. Bennet hears 'future' and thinks 'marriage.'",
    example:
      "Every new social opportunity becomes a possible route to a husband in her view.",
  },
  {
    id: "5",
    front: "Why is the assembly scene so important in the novel?",
    back: "It launches the first impressions, judgments, and attractions that drive the story.",
    source:
      "The assembly introduces Bingley, Darcy, and the social reactions that shape the novel's earliest relationships.",
    explanation:
      "Austen uses one public gathering to set multiple emotional and social threads in motion at once.",
    mnemonic:
      "Assembly = first impressions in motion.",
    example:
      "Bingley seems warm and welcome, Darcy seems proud, and Elizabeth's first judgments start to harden there.",
  },
];

export const summaryResult: DocumentSummary = {
  title: "Pride and Prejudice Literary Analysis",
  readTime: "5 min read",
  language: "English (EN)",
  style: "Detailed and in-depth",
  overview:
    "This summary focuses on how Austen uses marriage, status, irony, and first impressions to examine social judgment and emotional growth in Pride and Prejudice.",
  keyPoints: [
    "Austen critiques social vanity and class performance through irony and satire.",
    "Elizabeth and Darcy's arc is driven by misjudgment, pride, and gradual self-correction.",
    "Marriage is treated as both a romantic question and a social-economic system.",
  ],
  sections: [
    {
      title: "Social Setting",
      body:
        "The novel is grounded in the world of local visits, inheritances, social rank, and marriage expectations. Austen shows how reputation and class shape almost every relationship in the story.",
    },
    {
      title: "Elizabeth and Darcy",
      body:
        "Their relationship develops through a cycle of bad first impressions, wounded pride, and deeper self-awareness. Austen makes emotional growth depend on learning to judge more honestly.",
    },
    {
      title: "Satire and Tone",
      body:
        "Much of the novel's force comes from Austen's wit. Comic dialogue and sharp narration expose absurd behavior without turning the story into broad parody.",
    },
    {
      title: "Marriage and Power",
      body:
        "Marriage is never just romance in the novel. It is tied to money, security, inheritance, and social standing, which is why so many characters approach it anxiously or strategically.",
    },
  ],
};

export const mcqContentStats: McqContentStat[] = [
  { label: "Remaining", value: 24 },
  { label: "Still Learning", value: 7 },
  { label: "Mastered", value: 9 },
  { label: "All", value: 40 },
];

export const mcqContentItems: McqContentItem[] = [
  {
    id: "1",
    question: "What is Mr. Bennet's personality described as?",
    answer: "Sarcastic and reserved",
    tag: "Sisterly Discussions",
    difficulty: "Easy",
    status: "Still Learning",
  },
  {
    id: "2",
    question: "What is the primary focus of 'Pride and Prejudice'?",
    answer: "Domestic life and human condition",
    tag: "Introduction to Pride and Prejudice",
    difficulty: "Easy",
    status: "Mastered",
  },
  {
    id: "3",
    question: "How many people did Mr. Bingley bring to the assembly?",
    answer: "Five altogether",
    tag: "Social Gatherings and Interactions",
    difficulty: "Easy",
    status: "Remaining",
  },
  {
    id: "4",
    question: "What literary devices are prominent in the book?",
    answer: "Satire and anti-romanticism",
    tag: "Introduction to Pride and Prejudice",
    difficulty: "Easy",
    status: "Mastered",
  },
  {
    id: "5",
    question: "Who does Mr. Bennet initially suggest should visit Mr. Bingley?",
    answer: "Mrs. Bennet and the girls",
    tag: "Mr. Bingley's Arrival",
    difficulty: "Easy",
    status: "Remaining",
  },
  {
    id: "6",
    question: "What does Mrs. Bennet complain about frequently?",
    answer: "Her nerves",
    tag: "Sisterly Discussions",
    difficulty: "Easy",
    status: "Still Learning",
  },
];
