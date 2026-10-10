import { Helmet } from "react-helmet";

import LandingNav from "../components/landing-components/LandingNav";
import LandingHeader from "../components/landing-components/LandingHeader";
import HeroSection from "../components/landing-components/HeroSection";
import FeaturesGrid from "../components/landing-components/FeaturesGrid";
import SubjectShowcase from "../components/landing-components/SubjectShowcase";
import TrustSection from "../components/landing-components/TrustSection";
import WhyGreymatter from "../components/landing-components/WhyGreymatter";
import LandingFooter from "../components/landing-components/LandingFooter";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";

import "../styles/landing-css/LandingPage.css";

function LandingPage() {
  return (
    <>
      <Helmet>
        <title>Grey Matter | Free High School Practice for Grades 10–12</title>
        <meta
          name="description"
          content="Free interactive practice for South African high school students. 1,300+ exercises across Accounting, Business, Economics, Geography, Life Science, Physics, Maths Literacy and Mathematics - with instant feedback and progress tracking."
          
        />
        <link rel="canonical" href="https://greymatterschool.co.za/" />
      </Helmet>

      <div className="index-page">
        <LandingNav />
        <LandingHeader />
        <HeroSection />
        <FeaturesGrid />
        <SubjectShowcase />
        <TrustSection />
        <WhyGreymatter />
        <SocialMedia />
        <LandingFooter />
      </div>
    </>
  );
}

export default LandingPage;