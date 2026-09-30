import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import "../styles/greymatter.css";
import "../styles/HowItWorks.css";

function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: "Browse without an account",
      paragraphs: [
        "You can look at anything on Grey Matter before creating an account. The subjects list, every subject's topics, every exercise title, and the number of exercises per subject are all visible. Nothing is hidden behind a login wall.",
        "You only need an account when you want to take an exercise and save your progress. Browsing, exploring, and reading about a subject are open to anyone.",
      ],
    },
    {
      num: 2,
      title: "Pick a subject, then a topic",
      paragraphs: [
        "From the Subjects page, choose one of eight subjects: Accounting, Business Studies, Economics, Geography, Life Science, Physical Sciences, Mathematical Literacy, or Mathematics.",
        "Each subject page lists its topics grouped by grade. Grade 10 topics first, then Grade 11, then Grade 12. Click a topic and you will see the exercises under it. Every exercise shows whether you have taken it, and if you have, your score and whether you can retake it or view your previous results.",
      ],
    },
    {
      num: 3,
      title: "Take a 10-question exercise",
      paragraphs: [
        "Each exercise is 10 multiple-choice questions. You answer A, B, C, or D.",
        "As soon as you click an answer, you see whether it is correct. Green for right, red for wrong, and the correct answer is highlighted so you learn from the mistake right away. You cannot change your answer once submitted. The next question loads automatically after a second, or you can move between questions using the Prev and Next buttons at the bottom.",
      ],
    },
    {
      num: 4,
      title: "Read the chapter notes as you go",
      paragraphs: [
        "Every exercise has a Chapter Notes panel next to it. These are topic summaries written for revision: definitions, key concepts, and the relationships between them. If the notes are long, you will see a preview with a Read More button.",
        "You can also write your own notes in the same panel while you work through the questions. Your notes are saved to your account and are accessible again later from your profile.",
      ],
    },
    {
      num: 5,
      title: "See your results",
      paragraphs: [
        "When you have answered all 10 questions, the exercise submits automatically. The results page shows your final score, your percentage, and how long you took.",
        "Below the summary is a full breakdown of every question: the question itself, what you chose, what the correct answer was, and whether you got it right. You can scroll through the whole breakdown to see exactly where the marks were lost.",
      ],
    },
    {
      num: 6,
      title: "Come back later. Everything is saved.",
      paragraphs: [
        "Every exercise you complete is saved to your account. If you close your browser and come back the next day, your history is there.",
        "Your profile shows all the exercises you have taken, grouped by subject, with your score on each one. You can reread your own notes, review past results, and see how many times you have retaken a particular exercise.",
      ],
    },
    {
      num: 7,
      title: "Retake any exercise, as many times as you want",
      paragraphs: [
        "You can retake any exercise. Your best score is kept, and the number of retakes is tracked. Many learners use this to check whether a topic has genuinely sunk in after revising it.",
      ],
    },
    {
      num: 8,
      title: "It is free, and it stays free",
      paragraphs: [
        "Grey Matter is free. There is no subscription, no trial period, and no premium tier. Every subject and every exercise is available without paying anything.",
      ],
    },
  ];

  const faqs = [
    {
      q: "Do I need an account to use Grey Matter?",
      a: "You need an account to take an exercise and save progress. You can browse subjects, topics, and exercise listings without one.",
    },
    {
      q: "What grades and subjects are covered?",
      a: "Grades 10, 11, and 12. Eight subjects: Accounting, Business Studies, Economics, Geography, Life Science, Physical Sciences, Mathematical Literacy, and Mathematics.",
    },
    {
      q: "How long does an exercise take?",
      a: "Most learners take 5 to 10 minutes per exercise. There is no time limit and no penalty for taking longer.",
    },
    {
      q: "What if I answer a few questions and then close the page?",
      a: "Your progress on that exercise is saved in your browser. When you return to the same exercise on the same device, you can carry on from where you stopped. Progress saves to your account once you have answered all 10 questions.",
    },
    {
      q: "Does it work on my phone?",
      a: "Yes. Grey Matter works on any modern phone, tablet, or computer with a web browser. The platform is built to work on low-bandwidth connections and is light on data.",
    },
    {
      q: "What if I get a question wrong?",
      a: "You see the correct answer straight away. At the end, the results page gives you a full breakdown of every question with what you chose and what the correct answer was.",
    },
    {
      q: "Can I use Grey Matter for a class?",
      a: "Yes. Teachers are welcome to use Grey Matter with their classes. There is no per-user fee and no restriction on how many students from one school can use it.",
    },
  ];

  return (
    <div className="info-page">
      <Helmet>
        <title>How It Works | Grey Matter</title>
        <meta
          name="description"
          content="How Grey Matter works, step by step: browse subjects and topics, take 10-question exercises, get instant feedback, read chapter notes, and track your progress over time. Free for Grades 10 to 12."
        />
      </Helmet>

      <FuncHeader />

      <div className="info-container">
        <div className="hiw-hero">
          <h1>How Grey Matter works</h1>
          <p>
            Grey Matter is a free practice platform for South African high school learners in Grades 10, 11, and 12. Here is exactly what happens from the moment you open the site to the moment you see your results.
          </p>
        </div>

        <div className="hiw-steps">
          {steps.map((step) => (
            <div key={step.num} className="hiw-step">
              <div className="hiw-step-num">{step.num}</div>
              <div className="hiw-step-content">
                <h2>{step.title}</h2>
                {step.paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 className="hiw-faq-heading">Frequently asked</h2>

        <div className="faq-section">
          {faqs.map((faq, index) => (
            <details key={index} className="faq-item">
              <summary className="faq-question">
                {faq.q}
                <span className="hiw-faq-toggle">+</span>
              </summary>
              <div className="faq-answer">{faq.a}</div>
            </details>
          ))}
        </div>

        <div className="hiw-cta">
          <p>Ready to try it? Everything is free.</p>
          <Link to="/subjects" className="hiw-cta-btn">
            Browse subjects →
          </Link>
        </div>
      </div>

      <FuncFooter />
    </div>
  );
}

export default HowItWorks;