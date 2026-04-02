import { PrismaClient, UserRole, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log("🌱 Starting seed...\n");

  // Clear existing data
  await prisma.review.deleteMany({});
  await prisma.topicMastery.deleteMany({});
  await prisma.attemptAnswer.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await hashPassword("password123");

  // Create Teachers
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Dr. Sarah Chen",
        email: "sarah@quizflow.dev",
        password: hashedPassword,
        role: UserRole.TEACHER,
        image: "https://avatars.githubusercontent.com/u/1",
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: "Prof. James Wright",
        email: "james@quizflow.dev",
        password: hashedPassword,
        role: UserRole.TEACHER,
        image: "https://avatars.githubusercontent.com/u/2",
        emailVerified: new Date(),
      },
    }),
  ]);

  // Create Students
  const studentData = [
    { name: "Alex Morgan", email: "alex@student.quizflow.dev" },
    { name: "Priya Patel", email: "priya@student.quizflow.dev" },
    { name: "Marcus Johnson", email: "marcus@student.quizflow.dev" },
    { name: "Yuki Tanaka", email: "yuki@student.quizflow.dev" },
    { name: "Lena Rodriguez", email: "lena@student.quizflow.dev" },
  ];

  const students = await Promise.all(
    studentData.map((data) =>
      prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
          role: UserRole.STUDENT,
          image: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100)}`,
          emailVerified: new Date(),
        },
      })
    )
  );

  // Quiz and Question Data
  const quizzes = [
    {
      subject: "Mathematics",
      title: "Algebra Fundamentals",
      description: "Master the basics of algebraic equations and quadratics",
      creatorId: teachers[0].id,
      questions: [
        {
          text: "Solve for x: 2x + 5 = 13",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "x = 4" }, { id: "2", text: "x = 9" }, { id: "3", text: "x = -4" }, { id: "4", text: "x = 3" }] },
          correctAnswer: "x = 4",
          explanation: "Subtract 5 from both sides: 2x = 8. Divide by 2: x = 4",
          difficulty: 1,
        },
        {
          text: "What is the quadratic formula?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "x = -b ± √(b² - 4ac) / 2a" }, { id: "2", text: "x = b ± √(b² + 4ac) / 2a" }, { id: "3", text: "x = -b / 2a" }, { id: "4", text: "x = a ± √b / c" }] },
          correctAnswer: "x = -b ± √(b² - 4ac) / 2a",
          explanation: "The quadratic formula is used to solve equations of the form ax² + bx + c = 0",
          difficulty: 2,
        },
        {
          text: "Factor: x² - 9",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "(x - 3)(x + 3)" }, { id: "2", text: "(x - 9)(x + 1)" }, { id: "3", text: "(x - 3)(x - 3)" }, { id: "4", text: "(x + 3)(x + 3)" }] },
          correctAnswer: "(x - 3)(x + 3)",
          explanation: "This is a difference of squares: a² - b² = (a - b)(a + b)",
          difficulty: 2,
        },
        {
          text: "Solve: 3(x - 2) = 12",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "x = 6" }, { id: "2", text: "x = 4" }, { id: "3", text: "x = 8" }, { id: "4", text: "x = 2" }] },
          correctAnswer: "x = 6",
          explanation: "Divide both sides by 3: x - 2 = 4. Add 2: x = 6",
          difficulty: 1,
        },
        {
          text: "What is the vertex form of a quadratic?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "y = a(x - h)² + k" }, { id: "2", text: "y = ax² + bx + c" }, { id: "3", text: "y = mx + b" }, { id: "4", text: "y = a(x + h) + k" }] },
          correctAnswer: "y = a(x - h)² + k",
          explanation: "Vertex form makes it easy to identify the vertex (h, k) of the parabola",
          difficulty: 3,
        },
        {
          text: "Expand: (x + 3)²",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "x² + 6x + 9" }, { id: "2", text: "x² + 9" }, { id: "3", text: "x² + 3x + 9" }, { id: "4", text: "x² - 6x + 9" }] },
          correctAnswer: "x² + 6x + 9",
          explanation: "(x + 3)² = x² + 2(3)x + 3² = x² + 6x + 9",
          difficulty: 2,
        },
        {
          text: "Solve: x² - 5x + 6 = 0",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "x = 2 or x = 3" }, { id: "2", text: "x = 1 or x = 6" }, { id: "3", text: "x = -2 or x = -3" }, { id: "4", text: "x = 0" }] },
          correctAnswer: "x = 2 or x = 3",
          explanation: "Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3",
          difficulty: 2,
        },
        {
          text: "If f(x) = 2x + 1, what is f(5)?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "11" }, { id: "2", text: "10" }, { id: "3", text: "12" }, { id: "4", text: "6" }] },
          correctAnswer: "11",
          explanation: "f(5) = 2(5) + 1 = 10 + 1 = 11",
          difficulty: 1,
        },
        {
          text: "Complete the square: x² + 6x + ?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "9" }, { id: "2", text: "3" }, { id: "3", text: "36" }, { id: "4", text: "6" }] },
          correctAnswer: "9",
          explanation: "Take half of 6 (which is 3) and square it: 3² = 9",
          difficulty: 3,
        },
        {
          text: "Solve: |x - 3| = 5",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "x = 8 or x = -2" }, { id: "2", text: "x = 5" }, { id: "3", text: "x = 3" }, { id: "4", text: "x = 2" }] },
          correctAnswer: "x = 8 or x = -2",
          explanation: "Absolute value gives two cases: x - 3 = 5 (x = 8) or x - 3 = -5 (x = -2)",
          difficulty: 3,
        },
      ],
    },
    {
      subject: "Biology",
      title: "Cell Biology Basics",
      description: "Understand the structure and function of cells",
      creatorId: teachers[1].id,
      questions: [
        {
          text: "What is the powerhouse of the cell?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Mitochondrion" }, { id: "2", text: "Nucleus" }, { id: "3", text: "Ribosome" }, { id: "4", text: "Golgi apparatus" }] },
          correctAnswer: "Mitochondrion",
          explanation: "Mitochondria are responsible for ATP production through cellular respiration",
          difficulty: 1,
        },
        {
          text: "Which organelle synthesizes proteins?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Ribosome" }, { id: "2", text: "Lysosome" }, { id: "3", text: "Peroxisome" }, { id: "4", text: "Centriole" }] },
          correctAnswer: "Ribosome",
          explanation: "Ribosomes are the sites of protein synthesis using mRNA",
          difficulty: 1,
        },
        {
          text: "What controls cell activity and heredity?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Nucleus" }, { id: "2", text: "Chloroplast" }, { id: "3", text: "Vacuole" }, { id: "4", text: "Cytoplasm" }] },
          correctAnswer: "Nucleus",
          explanation: "The nucleus contains DNA and controls all cell activities",
          difficulty: 1,
        },
        {
          text: "Which organelle breaks down waste materials?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Lysosome" }, { id: "2", text: "Plastid" }, { id: "3", text: "Ribosome" }, { id: "4", text: "Centrosome" }] },
          correctAnswer: "Lysosome",
          explanation: "Lysosomes contain enzymes that digest waste and cellular debris",
          difficulty: 2,
        },
        {
          text: "What is the function of the Golgi apparatus?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Protein packaging and transport" }, { id: "2", text: "Energy production" }, { id: "3", text: "DNA replication" }, { id: "4", text: "Lipid synthesis" }] },
          correctAnswer: "Protein packaging and transport",
          explanation: "The Golgi apparatus modifies, packages, and ships proteins and lipids",
          difficulty: 2,
        },
        {
          text: "Where does photosynthesis occur in plant cells?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Chloroplast" }, { id: "2", text: "Mitochondrion" }, { id: "3", text: "Ribosome" }, { id: "4", text: "Vacuole" }] },
          correctAnswer: "Chloroplast",
          explanation: "Chloroplasts contain chlorophyll and are where photosynthesis occurs",
          difficulty: 1,
        },
        {
          text: "What is the difference between prokaryotic and eukaryotic cells?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Eukaryotic cells have a nucleus; prokaryotic cells do not" }, { id: "2", text: "Prokaryotic cells have a nucleus; eukaryotic cells do not" }, { id: "3", text: "Both have the same structure" }, { id: "4", text: "Prokaryotic cells are larger" }] },
          correctAnswer: "Eukaryotic cells have a nucleus; prokaryotic cells do not",
          explanation: "The key difference is the presence of a membrane-bound nucleus",
          difficulty: 2,
        },
        {
          text: "What is the function of the cell membrane?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Control what enters and exits the cell" }, { id: "2", text: "Produce energy" }, { id: "3", text: "Store genetic material" }, { id: "4", text: "Break down waste" }] },
          correctAnswer: "Control what enters and exits the cell",
          explanation: "The cell membrane is selectively permeable and regulates transport",
          difficulty: 1,
        },
        {
          text: "Which organelle stores water, minerals, and nutrients?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Vacuole" }, { id: "2", text: "Lysosome" }, { id: "3", text: "Centriole" }, { id: "4", text: "Thylakoid" }] },
          correctAnswer: "Vacuole",
          explanation: "Vacuoles store various substances and maintain cell turgor in plants",
          difficulty: 1,
        },
        {
          text: "What is the role of ribosomes in translation?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Read mRNA and synthesize proteins" }, { id: "2", text: "Replicate DNA" }, { id: "3", text: "Transport proteins" }, { id: "4", text: "Break down proteins" }] },
          correctAnswer: "Read mRNA and synthesize proteins",
          explanation: "Ribosomes interpret the genetic code and assemble amino acids into proteins",
          difficulty: 2,
        },
      ],
    },
    {
      subject: "History",
      title: "World War II",
      description: "Explore key events and impacts of World War II",
      creatorId: teachers[0].id,
      questions: [
        {
          text: "In what year did World War II begin?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "1939" }, { id: "2", text: "1941" }, { id: "3", text: "1937" }, { id: "4", text: "1945" }] },
          correctAnswer: "1939",
          explanation: "Germany invaded Poland on September 1, 1939, marking the start of WWII",
          difficulty: 1,
        },
        {
          text: "Who were the main Axis powers?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Germany, Italy, Japan" }, { id: "2", text: "USA, UK, USSR" }, { id: "3", text: "France, Poland, UK" }, { id: "4", text: "China, Korea, Japan" }] },
          correctAnswer: "Germany, Italy, Japan",
          explanation: "These three nations formed the primary military alliance during WWII",
          difficulty: 1,
        },
        {
          text: "What was Operation Barbarossa?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Germany's invasion of the Soviet Union" }, { id: "2", text: "The D-Day invasion of France" }, { id: "3", text: "Japan's attack on Pearl Harbor" }, { id: "4", text: "Italy's invasion of Greece" }] },
          correctAnswer: "Germany's invasion of the Soviet Union",
          explanation: "Launched in 1941, this was the largest military invasion in history",
          difficulty: 2,
        },
        {
          text: "When did the United States enter World War II?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "1941" }, { id: "2", text: "1939" }, { id: "3", text: "1942" }, { id: "4", text: "1943" }] },
          correctAnswer: "1941",
          explanation: "The US entered after Japan's attack on Pearl Harbor on December 7, 1941",
          difficulty: 1,
        },
        {
          text: "What event did NOT directly contribute to US entry into WWII?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Germany's invasion of Poland" }, { id: "2", text: "Japan's attack on Pearl Harbor" }, { id: "3", text: "Japanese aggression in China" }, { id: "4", text: "Italy's invasion of Ethiopia" }] },
          correctAnswer: "Germany's invasion of Poland",
          explanation: "While significant in Europe, Poland's invasion didn't directly cause US entry; Pearl Harbor did",
          difficulty: 3,
        },
        {
          text: "What year did World War II end?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "1945" }, { id: "2", text: "1944" }, { id: "3", text: "1946" }, { id: "4", text: "1947" }] },
          correctAnswer: "1945",
          explanation: "Germany surrendered in May 1945, and Japan surrendered in August 1945",
          difficulty: 1,
        },
        {
          text: "Describe the Holocaust and explain its significance.",
          type: QuestionType.SHORT_ANSWER,
          options: null,
          correctAnswer: "The systematic genocide of six million Jews by Nazi Germany during WWII",
          explanation: "The Holocaust is remembered as one of history's darkest chapters and led to international commitment to prevent genocide",
          difficulty: 4,
        },
        {
          text: "What was the atomic bombing's impact on Japan?",
          type: QuestionType.SHORT_ANSWER,
          options: null,
          correctAnswer: "Led to Japan's surrender and ended WWII",
          explanation: "Atomic bombs were dropped on Hiroshima and Nagasaki in August 1945, causing massive casualties and leading to Japan's unconditional surrender",
          difficulty: 3,
        },
      ],
    },
    {
      subject: "Physics",
      title: "Newton's Laws",
      description: "Understand the fundamental laws of motion and gravity",
      creatorId: teachers[1].id,
      questions: [
        {
          text: "What is Newton's First Law of Motion?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "An object in motion stays in motion unless acted upon by external force" }, { id: "2", text: "Force equals mass times acceleration" }, { id: "3", text: "For every action there is an equal and opposite reaction" }, { id: "4", text: "Objects fall at the same rate" }] },
          correctAnswer: "An object in motion stays in motion unless acted upon by external force",
          explanation: "This describes the concept of inertia and momentum conservation",
          difficulty: 1,
        },
        {
          text: "What is the formula for Newton's Second Law?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "F = ma" }, { id: "2", text: "v = at" }, { id: "3", text: "p = mv" }, { id: "4", text: "KE = ½mv²" }] },
          correctAnswer: "F = ma",
          explanation: "Force equals mass multiplied by acceleration",
          difficulty: 1,
        },
        {
          text: "State Newton's Third Law of Motion.",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "For every action there is an equal and opposite reaction" }, { id: "2", text: "Objects resist change in motion" }, { id: "3", text: "Acceleration is inversely proportional to mass" }, { id: "4", text: "Energy is conserved" }] },
          correctAnswer: "For every action there is an equal and opposite reaction",
          explanation: "Action-reaction pairs act on different objects",
          difficulty: 1,
        },
        {
          text: "If a 10 kg object accelerates at 5 m/s², what is the force?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "50 N" }, { id: "2", text: "5 N" }, { id: "3", text: "100 N" }, { id: "4", text: "2 N" }] },
          correctAnswer: "50 N",
          explanation: "F = ma = 10 kg × 5 m/s² = 50 N",
          difficulty: 1,
        },
        {
          text: "What is gravitational force between two objects?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "F = G(m₁m₂)/r²" }, { id: "2", text: "F = ma" }, { id: "3", text: "F = kx" }, { id: "4", text: "F = μN" }] },
          correctAnswer: "F = G(m₁m₂)/r²",
          explanation: "This is Newton's Law of Universal Gravitation",
          difficulty: 2,
        },
        {
          text: "What is the SI unit of force?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Newton (N)" }, { id: "2", text: "Joule (J)" }, { id: "3", text: "Watt (W)" }, { id: "4", text: "Pascal (Pa)" }] },
          correctAnswer: "Newton (N)",
          explanation: "1 Newton = 1 kg·m/s²",
          difficulty: 1,
        },
        {
          text: "What happens to acceleration if you double the force?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Acceleration doubles" }, { id: "2", text: "Acceleration halves" }, { id: "3", text: "Acceleration stays the same" }, { id: "4", text: "Acceleration decreases by half" }] },
          correctAnswer: "Acceleration doubles",
          explanation: "According to F = ma, acceleration is proportional to force",
          difficulty: 2,
        },
        {
          text: "If mass doubles and force stays constant, what happens to acceleration?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Acceleration is halved" }, { id: "2", text: "Acceleration doubles" }, { id: "3", text: "Acceleration stays the same" }, { id: "4", text: "Acceleration increases" }] },
          correctAnswer: "Acceleration is halved",
          explanation: "a = F/m, so doubling m halves a",
          difficulty: 2,
        },
        {
          text: "What is friction?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "A force that opposes motion" }, { id: "2", text: "A force that causes motion" }, { id: "3", text: "A measure of inertia" }, { id: "4", text: "Gravitational attraction" }] },
          correctAnswer: "A force that opposes motion",
          explanation: "Friction acts opposite to the direction of motion",
          difficulty: 1,
        },
        {
          text: "Calculate momentum of a 2 kg object moving at 3 m/s.",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "6 kg·m/s" }, { id: "2", text: "1 kg·m/s" }, { id: "3", text: "12 kg·m/s" }, { id: "4", text: "0.67 kg·m/s" }] },
          correctAnswer: "6 kg·m/s",
          explanation: "p = mv = 2 kg × 3 m/s = 6 kg·m/s",
          difficulty: 1,
        },
      ],
    },
    {
      subject: "English",
      title: "Grammar Essentials",
      description: "Master the fundamentals of English grammar",
      creatorId: teachers[0].id,
      questions: [
        {
          text: "Which sentence is grammatically correct?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "She go to the store every day." }, { id: "2", text: "She goes to the store every day." }, { id: "3", text: "She going to the store every day." }, { id: "4", text: "She gone to the store every day." }] },
          correctAnswer: "She goes to the store every day.",
          explanation: "Third person singular requires 'goes' instead of 'go'",
          difficulty: 1,
        },
        {
          text: "What is the correct form of the verb?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "I has been studying" }, { id: "2", text: "I have been studying" }, { id: "3", text: "I am be studying" }, { id: "4", text: "I does study" }] },
          correctAnswer: "I have been studying",
          explanation: "Present perfect continuous uses 'have' + 'been' + present participle",
          difficulty: 1,
        },
        {
          text: "Which sentence uses proper subject-verb agreement?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "The team are playing well." }, { id: "2", text: "The team is playing well." }, { id: "3", text: "The team play well." }, { id: "4", text: "The teams is playing well." }] },
          correctAnswer: "The team is playing well.",
          explanation: "'Team' is a collective noun and requires singular verb 'is'",
          difficulty: 2,
        },
        {
          text: "Identify the correct pronoun usage.",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Between you and I, I think she should apologize." }, { id: "2", text: "Between you and me, I think she should apologize." }, { id: "3", text: "Between you and me, I think she should apologizes." }, { id: "4", text: "Between you and he, I think she should apologize." }] },
          correctAnswer: "Between you and me, I think she should apologize.",
          explanation: "Object pronouns are used after prepositions; 'me' is correct after 'between'",
          difficulty: 2,
        },
        {
          text: "Which sentence has correct parallel structure?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "She likes to swim, cycling, and to run." }, { id: "2", text: "She likes swimming, cycling, and running." }, { id: "3", text: "She likes to swim, to cycle, and running." }, { id: "4", text: "She like to swim, cycle, and running." }] },
          correctAnswer: "She likes swimming, cycling, and running.",
          explanation: "All items in a list should have the same grammatical form",
          difficulty: 3,
        },
        {
          text: "What is the correct form of the irregular verb?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "She bringed the book yesterday." }, { id: "2", text: "She brought the book yesterday." }, { id: "3", text: "She brung the book yesterday." }, { id: "4", text: "She bring the book yesterday." }] },
          correctAnswer: "She brought the book yesterday.",
          explanation: "'Brought' is the past tense of 'bring'",
          difficulty: 1,
        },
        {
          text: "Which punctuation is correct?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "However, the weather was nice." }, { id: "2", text: "However the weather was nice." }, { id: "3", text: "However, the weather was nice," }, { id: "4", text: "However, the weather was nice;" }] },
          correctAnswer: "However, the weather was nice.",
          explanation: "Introductory transitional words are followed by commas",
          difficulty: 2,
        },
        {
          text: "Identify the misplaced modifier.",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "Running quickly, the squirrel escaped the cat." }, { id: "2", text: "The squirrel, running quickly, escaped the cat." }, { id: "3", text: "Running quickly, the cat escaped the squirrel." }, { id: "4", text: "The squirrel escaped the cat, running quickly." }] },
          correctAnswer: "Running quickly, the cat escaped the squirrel.",
          explanation: "The modifying phrase should refer to the squirrel, not the cat",
          difficulty: 3,
        },
        {
          text: "What is the correct use of 'its' vs 'it's'?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "The cat licked it's paws." }, { id: "2", text: "The cat licked its paws." }, { id: "3", text: "Its a beautiful day." }, { id: "4", text: "Its been raining." }] },
          correctAnswer: "The cat licked its paws.",
          explanation: "'Its' is possessive; 'it's' is the contraction of 'it is'",
          difficulty: 1,
        },
        {
          text: "Which sentence is punctuated correctly?",
          type: QuestionType.MCQ,
          options: { choices: [{ id: "1", text: "I need: apples, oranges, and bananas." }, { id: "2", text: "I need apples, oranges, and bananas." }, { id: "3", text: "I need; apples, oranges, and bananas." }, { id: "4", text: "I need, apples, oranges, and bananas." }] },
          correctAnswer: "I need apples, oranges, and bananas.",
          explanation: "A simple list doesn't require a colon unless introducing the list formally",
          difficulty: 1,
        },
      ],
    },
  ];

  // Create Quizzes and Questions
  const createdQuizzes = [];
  for (const quizData of quizzes) {
    const quiz = await prisma.quiz.create({
      data: {
        title: quizData.title,
        subject: quizData.subject,
        description: quizData.description,
        creatorId: quizData.creatorId,
        isPublished: true,
        difficulty: 3,
        tags: [quizData.subject.toLowerCase()],
        estimatedMinutes: 30,
      },
    });

    const questionsWithOrder = quizData.questions.map((q, idx) => ({
      ...q,
      order: idx,
      quizId: quiz.id,
    }));

    await prisma.question.createMany({
      data: questionsWithOrder,
    });

    createdQuizzes.push({ ...quiz, questions: quizData.questions });
  }

  // Create Attempts, AttemptAnswers, and update XP/Streak
  const subjects = ["Mathematics", "Biology", "History", "Physics", "English"];
  let totalAttempts = 0;
  let totalAttemptAnswers = 0;

  for (const student of students) {
    let studentXP = 0;
    let studentStreak = 0;

    // 2-4 attempts per student
    const attemptCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < attemptCount; i++) {
      const randomQuiz = createdQuizzes[Math.floor(Math.random() * createdQuizzes.length)];
      const questionsForQuiz = randomQuiz.questions;

      const attempt = await prisma.attempt.create({
        data: {
          userId: student.id,
          quizId: randomQuiz.id,
          totalQuestions: questionsForQuiz.length,
          startedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          completedAt: new Date(),
        },
      });

      let correctCount = 0;
      const questionIds = (await prisma.question.findMany({
        where: { quizId: randomQuiz.id },
        select: { id: true, correctAnswer: true },
      }));

      for (const question of questionIds) {
        const isCorrect = Math.random() > 0.4; // 60% chance of being correct
        if (isCorrect) correctCount++;

        await prisma.attemptAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: question.id,
            userAnswer: question.correctAnswer,
            isCorrect,
            timeSpentSeconds: Math.floor(Math.random() * 120) + 10,
          },
        });
        totalAttemptAnswers++;
      }

      const score = (correctCount / questionsForQuiz.length) * 100;
      await prisma.attempt.update({
        where: { id: attempt.id },
        data: {
          correctCount,
          score,
        },
      });

      // Award XP
      const xpEarned = Math.floor(score / 10) * 10;
      studentXP += xpEarned;
      studentStreak += 1;

      totalAttempts++;
    }

    // Update student XP and streak
    await prisma.user.update({
      where: { id: student.id },
      data: {
        xp: studentXP,
        streak: studentStreak,
        lastActiveAt: new Date(),
      },
    });
  }

  // Create TopicMastery records for each student across all subjects
  let totalMasteries = 0;
  for (const student of students) {
    for (const subject of subjects) {
      const masteryScore = Math.floor(Math.random() * 71) + 20; // 20-90

      await prisma.topicMastery.create({
        data: {
          userId: student.id,
          subject,
          mastery: masteryScore / 100,
          easeFactor: 2.5 + Math.random() * 1,
          intervalDays: Math.floor(Math.random() * 30) + 1,
          reviewCount: Math.floor(Math.random() * 10),
          nextReviewDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });
      totalMasteries++;
    }
  }

  // Create Review records
  let totalReviews = 0;
  for (const student of students) {
    const reviewCount = Math.floor(Math.random() * 3) + 3; // 3-5 reviews per student

    for (let i = 0; i < reviewCount; i++) {
      const randomQuestion = await prisma.question.findFirst({
        skip: Math.floor(Math.random() * 50),
      });

      if (randomQuestion) {
        await prisma.review.create({
          data: {
            userId: student.id,
            questionId: randomQuestion.id,
            scheduledAt: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
            grade: Math.floor(Math.random() * 5),
            easeFactor: 2.5,
            intervalDays: 1,
          },
        });
        totalReviews++;
      }
    }
  }

  // Log counts
  console.log("✅ Seed completed successfully!\n");
  console.log("📊 Created records:");
  console.log(`   • Teachers: 2`);
  console.log(`   • Students: 5`);
  console.log(`   • Quizzes: 5`);
  console.log(`   • Questions: ${createdQuizzes.reduce((acc, q) => acc + q.questions.length, 0)}`);
  console.log(`   • Attempts: ${totalAttempts}`);
  console.log(`   • AttemptAnswers: ${totalAttemptAnswers}`);
  console.log(`   • TopicMasteries: ${totalMasteries}`);
  console.log(`   • Reviews: ${totalReviews}`);
  console.log("\n🚀 Database is ready for development!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
