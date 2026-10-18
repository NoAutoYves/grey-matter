import { useState, useEffect } from "react";
import FuncHeader from "../components/functional-comps/FuncHeader";
import FuncFooter from "../components/functional-comps/FuncFooter";
import { Helmet } from "react-helmet";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import { api } from "../utils/api";

import SubjectsSkeleton from "../components/subjects/SubjectsSkeleton";
import SubjectsHero from "../components/subjects/SubjectsHero";
// import SubjectCareerSkills from "../components/subjects/SubjectCareerSkills";
import SubjectCarousel from "../components/subjects/SubjectCarousel";
import SubjectsGrid from "../components/subjects/SubjectsGrid";
import SubjectsWhyPractice from "../components/subjects/SubjectsWhyPractice";
import SubjectsSuccessGuide from "../components/subjects/SubjectsSuccessGuide";

import '../styles/subjects/Subjects.css';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get('/api/exercises/batch/subject-stats');
        const data = await response.json();

        if (response.ok) {
          setSubjects(data.subjects || []);
        } else {
          console.error("Failed to fetch subjects:", data.error || response.status);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return <SubjectsSkeleton />;
  }

  return (
    <>
      <Helmet htmlAttributes={{ lang: "en-ZA" }}>
        <title>All Subjects | Grey Matter</title>
        <meta
          name="description"
          content="Browse all 8 subjects on Grey Matter: Accounting, Business, Economics, Geography, Life Science, Physical Sciences, Maths Literacy and Mathematics. Free interactive exercises for Grades 10, 11 and 12 with instant feedback."
        />
        <meta name="theme-color" content="#6846ff" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://greymatterschool.co.za/subjects/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "All Subjects | Grey Matter",
            "url": "https://greymatterschool.co.za/subjects/",
            "description": "All 8 CAPS-aligned subjects for Grades 10 to 12.",
            "inLanguage": "en-ZA",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Grey Matter",
              "url": "https://greymatterschool.co.za/"
            }
          })}
        </script>
      </Helmet>
      
      <div className="subject-page">
        <FuncHeader />

        <section className="subjects-container">
          <SubjectsHero />
          {/* <SubjectCareerSkills /> */}
          <SubjectCarousel subjects={subjects} />
          <SubjectsGrid subjects={subjects} />
          <SubjectsWhyPractice />
          <SubjectsSuccessGuide />
        </section>

        <SocialMedia />
        <FuncFooter />
      </div>
    </>
  );
}

export default Subjects;