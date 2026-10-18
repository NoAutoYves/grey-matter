import { Link } from "react-router-dom";
import FuncHeader from "../../components/functional-comps/FuncHeader";
import FuncFooter from "../../components/functional-comps/FuncFooter";
import { Helmet } from "react-helmet";
import "../../styles/notes/NotesLanding.css";

const SUBJECTS = [
  { id: 1, name: "Accounting",            slug: "accounting",      blurb: "Financial statements, depreciation, ledgers, and reconciliations." },
  { id: 2, name: "Business",              slug: "business",        blurb: "Business environments, operations, ventures, and roles." },
  { id: 3, name: "Economics",             slug: "economics",       blurb: "Circular flow, business cycles, markets, and macro policy." },
  { id: 4, name: "Geography",             slug: "geography",       blurb: "Climatology, geomorphology, settlement, and GIS." },
  { id: 5, name: "Life Science",          slug: "life_science",    blurb: "Cells, genetics, evolution, human systems, and ecology." },
  { id: 6, name: "Physics",               slug: "physics",         blurb: "Mechanics, waves, electricity, magnetism, and modern physics." },
  { id: 7, name: "Mathematics",           slug: "mathematics",     blurb: "Algebra, calculus, trigonometry, sequences, and geometry." },
  { id: 8, name: "Mathematical Literacy", slug: "maths_literacy",  blurb: "Finance, measurement, data handling, maps, plans, and probability." },
];

function NotesLanding() {
  return (
    <div className="notes-landing-page">
      <Helmet htmlAttributes={{ lang: "en-ZA" }}>
        <title>Notes | Grey Matter</title>
        <meta
          name="description"
          content="Full CAPS-aligned chapter notes for every topic across all 8 subjects in Grades 10, 11, and 12. Free to read."
        />
        <meta name="theme-color" content="#6846ff" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://greymatterschool.co.za/notes/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Notes | Grey Matter",
            "url": "https://greymatterschool.co.za/notes/",
            "description": "Full chapter notes for every topic, Grades 10 to 12.",
            "inLanguage": "en-ZA",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Grey Matter",
              "url": "https://greymatterschool.co.za/"
            }
          })}
        </script>
      </Helmet>

      <FuncHeader />

      <main className="notes-landing-main">
        <header className="notes-landing-hero">
          <h1 className="notes-landing-title">Notes</h1>
          <p className="notes-landing-subtitle">
            Full chapter notes for every topic in Grades 10 through 12. All CAPS aligned.
          </p>
        </header>

        <div className="notes-landing-grid">
          {SUBJECTS.map((s) => (
            <Link
              key={s.id}
              to={`/notes/${s.slug}/`}
              className="notes-landing-card"
            >
              <h2 className="notes-landing-card-title">{s.name}</h2>
              <p className="notes-landing-card-blurb">{s.blurb}</p>
              <span className="notes-landing-card-cta">Browse notes </span>
            </Link>
          ))}
        </div>
      </main>

      <FuncFooter />
    </div>
  );
}

export default NotesLanding;