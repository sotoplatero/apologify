// Editorial guides shown above the letter grid on /examples/[recipient].
// One entry per recipient hub we want to rank (the grid alone is thin content).
import study from "../data/apology-study.json";

const friendTop = study.groups.friend.top;
const friendPct = (key: string) => friendTop.find((c) => c.key === key)?.pct ?? 0;

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
  friend: {
    title: "Apology Letter to a Friend: How to Write It + {n} Examples",
    description:
      "How to write an apology letter to a friend or best friend — what to say after hurtful words, a broken secret or going silent, with sample letters, a short text version and {n} real examples.",
    h1: "Apology letter to a friend",
    intro: `Friendships rarely end over one mistake; they end over the apology that never came. In our study of ${study.groups.friend.n} real apologies to friends, the top reasons were saying something hurtful (${friendPct("hurtful_words")}%), lying or breaking trust (${friendPct("dishonesty")}%) and going silent (${friendPct("silence")}%). Here's how to write yours.`,
    steps: [
      { h: "Talk like yourself", p: "Use the voice you use with them. A stiff, formal letter reads as distance." },
      { h: "Name the moment", p: "“What I said about your job at Sara's party” — not “everything that happened.”" },
      { h: "Say what it cost them", p: "Embarrassment, feeling betrayed, feeling dropped. Show you see it from their side." },
      { h: "Own it, no “but”", p: "One line of context is fine. Turning it into their fault is not." },
      { h: "Offer a next step", p: "Coffee, a call, a promise you can keep. Then give them room to answer." },
    ],
    samples: [
      {
        situation: "For saying something hurtful",
        body: [
          "Hey Priya,",
          "I'm sorry for what I said at Jake's on Saturday. Joking that you'd “never actually finish” your degree in front of everyone wasn't a joke — it was mean, and it touched exactly what you'd told me you were worried about.",
          "You trusted me with that, and I used it to get a laugh.",
          "I'm proud of how hard you're working, and I should have said that instead. Can I take you for coffee this week?",
          "Mia",
        ],
      },
      {
        situation: "For sharing a secret",
        body: [
          "Dear Ben,",
          "I told Chris about your interview before you were ready to tell anyone. I'm sorry. You asked me to keep it between us and I didn't.",
          "I know that made you feel like you can't tell me things, and I understand why.",
          "From now on, what you tell me stays with me. I'll prove that over time, not just in this letter.",
          "Sam",
        ],
      },
      {
        situation: "For disappearing when they needed me",
        body: [
          "Hi Taylor,",
          "I'm sorry I went quiet after your breakup. You reached out three times and I kept saying “I'll call you tomorrow.”",
          "I was overwhelmed with my own stuff, but you needed a friend and I wasn't there. That must have felt lonely.",
          "I'm here now, and I'd love to see you this weekend if you're up for it.",
          "Jordan",
        ],
      },
      {
        situation: "Short version to text a best friend",
        body: [
          "Hey, I've been thinking about Friday. I'm really sorry for snapping at you in front of everyone — you didn't deserve that. Can we talk tonight? ❤️",
        ],
      },
    ],
    tips: [
      "Send it soon — a day or two after, not a month.",
      "If it was big, write it down; if it was small, a text and a call is enough.",
      "Don't list the things they did wrong too. That's a different conversation.",
      "Let them reply in their own time. Pushing for an answer undoes the apology.",
      "Then show up. The next time you see them matters more than the letter.",
    ],
    faqs: [
      {
        q: "How do you write an apology letter to a friend?",
        a: "Write the way you talk to them. Say exactly what you did, acknowledge how it made them feel, take responsibility without “but,” and offer a next step like a call or coffee. Keep it to a few short paragraphs.",
      },
      {
        q: "How do I apologize to my best friend after a big fight?",
        a: "Give it a day so you're calm, then apologize for your part specifically — what you said or did — rather than for “the fight.” A letter works well when talking feels too heated; follow it with an offer to meet.",
      },
      {
        q: "Should I text or write a letter to apologize to a friend?",
        a: "For small things, a sincere text and a call is enough. For something that hurt them — a betrayed secret, cruel words, disappearing — a letter shows you took the time to think it through.",
      },
      {
        q: "What if my friend doesn't reply to my apology?",
        a: "Give them time. You can send one gentle follow-up after a week or two, but don't keep pushing. A real apology doesn't come with a deadline for forgiveness.",
      },
    ],
  },
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
