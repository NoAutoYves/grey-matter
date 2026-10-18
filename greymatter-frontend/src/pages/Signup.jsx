import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import SignupForm from "../components/auth-components/SignupForm";
import '../styles/Auth/Signup.css';
import { Helmet } from "react-helmet";

function Signup() {
  return (
    <div className="signup-page">
      <Helmet htmlAttributes={{ lang: "en-ZA" }}>
        <title>Sign Up | Grey Matter</title>
        <meta name="description" content="Create a free Grey Matter account and start tracking your progress." />
        <meta name="theme-color" content="#6846ff" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://greymatterschool.co.za/signup" />
      </Helmet>
      
      <FuncHeader />

      <div className="signup-wrapper">
        <div className="signup-container">
          <h2 className="signup-title">Sign Up</h2>
          <p className="signup-subtitle">Create your account, please sign up today</p>

          <SignupForm />
        </div>
      </div>

      <SocialMedia />
      <FuncFooter />
    </div>
  );
}

export default Signup;