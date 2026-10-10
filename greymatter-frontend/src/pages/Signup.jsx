import FuncFooter from "../components/functional-comps/FuncFooter";
import FuncHeader from "../components/functional-comps/FuncHeader";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import SignupForm from "../components/auth-components/SignupForm";
import '../styles/Auth/Signup.css';

function Signup() {
  return (
    <div className="signup-page">
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