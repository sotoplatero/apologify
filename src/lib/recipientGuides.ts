// Editorial guides shown above the letter grid on /examples/[recipient].
// One entry per recipient hub we want to rank (the grid alone is thin content).

export type RecipientGuide = {
  title: string; // <title>; `{n}` is replaced with the letter count
  description: string;
  h1: string;
  intro: string;
  steps: { h: string; p: string }[];
  samples: { situation: string; body: string[] }[];
  tips: string[];
  faqs: { q: string; a: string }[];
};

const guides: Record<string, RecipientGuide> = {
  teacher: {
    title: "Apology Letter to a Teacher: How to Write It + {n} Examples",
    description:
      "How to write an apology letter to a teacher for misbehavior, disrespect, late work or using your phone in class — with sample letters a student can adapt, and {n} real examples.",
    h1: "Apology letter to a teacher",
    intro:
      "A teacher reads an apology letter for one thing: proof that you understand what you did and won't repeat it. Keep it short, specific and respectful — a few honest sentences beat a page of “I'm so sorry.”",
    steps: [
      { h: "Use a respectful greeting", p: "“Dear Ms. Carter,” or “Dear Mr. Lee,” — the name you use in class. No “Hey.”" },
      { h: "Name what you did, and when", p: "“On Tuesday I talked back when you asked me to stop talking.” Specific beats “sorry for my behavior.”" },
      { h: "Say how it affected the class", p: "It interrupted the lesson, was unfair to classmates, or disrespected you in front of everyone." },
      { h: "Promise one concrete change", p: "“I'll sit away from my friends during instruction” is believable. “It will never happen again” isn't." },
      { h: "Close formally and sign your full name", p: "“Sincerely,” or “Respectfully,” then your first and last name — and your class period if they teach several." },
    ],
    samples: [
      {
        situation: "For misbehaving in class",
        body: [
          "Dear Mr. Thompson,",
          "I apologize for my behavior in your class on Monday. I was throwing paper at my friends while you were teaching, and when you asked me to stop, I kept going.",
          "That distracted the whole class and made it harder for everyone to learn, and it wasn't fair to you.",
          "From now on I will stay in my seat and focus during lessons. I understand if there are consequences, and I accept them.",
          "Sincerely,",
          "Jayden Brooks, 3rd period",
        ],
      },
      {
        situation: "For being disrespectful",
        body: [
          "Dear Ms. Alvarez,",
          "I'm sorry for the way I spoke to you yesterday. When you returned my essay, I rolled my eyes and said the grade was unfair, loud enough for the class to hear.",
          "That was disrespectful, especially after the time you spent giving me feedback.",
          "If I disagree with a grade in the future, I'll ask to talk with you after class instead. I'd also like to go over the essay with you if you have time.",
          "Respectfully,",
          "Emma Walsh",
        ],
      },
      {
        situation: "For late or missing homework",
        body: [
          "Dear Mrs. Patel,",
          "I apologize for not turning in my lab report on Friday. I didn't plan my time well and left it until the night before.",
          "I know deadlines matter so you can grade fairly for everyone.",
          "I've attached the finished report, and I've started using a planner so this doesn't happen again.",
          "Thank you for your patience,",
          "Noah Kim",
        ],
      },
      {
        situation: "For using my phone in class",
        body: [
          "Dear Mr. Okafor,",
          "I'm sorry for using my phone during your lesson today after you had asked the class to put phones away. I was texting and missed the instructions for the project.",
          "It was disrespectful to you and I fell behind because of it.",
          "From now on I'll keep my phone in my bag during class.",
          "Sincerely,",
          "Lily Chen",
        ],
      },
    ],
    tips: [
      "Write it yourself, in your own words. Teachers can tell when a letter was copied.",
      "Keep it under a page — 100 to 200 words is plenty.",
      "Don't blame classmates, even if they were involved.",
      "Handwritten or email both work; hand it over in person if you can.",
      "Follow through. The letter only counts if the next lesson looks different.",
    ],
    faqs: [
      {
        q: "How do you write an apology letter to a teacher for misbehavior?",
        a: "Greet them formally, say exactly what you did and when, acknowledge how it affected the class and the teacher, promise one specific change, and close with “Sincerely” and your full name. Keep it to a few short paragraphs.",
      },
      {
        q: "How long should an apology letter to a teacher be?",
        a: "Short: about 100–200 words, or three to five short paragraphs. Teachers value a specific, honest letter over a long one.",
      },
      {
        q: "Should a parent also write to the teacher?",
        a: "For younger students or serious incidents, a short note from a parent saying they've discussed it at home helps. The student's own letter should still come from the student.",
      },
      {
        q: "Can I email my apology to a teacher?",
        a: "Yes. Use a clear subject like “Apology for my behavior in class on Tuesday,” keep the same formal structure, and offer to talk in person.",
      },
    ],
  },
};

export function recipientGuide(recipient: string): RecipientGuide | undefined {
  return guides[recipient];
}
