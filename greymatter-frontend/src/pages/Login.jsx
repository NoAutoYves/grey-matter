import FuncHeader from "../components/functional-comps/FuncHeader";
import FuncFooter from "../components/functional-comps/FuncFooter";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import LoginForm from "../components/auth-components/LoginForm";
import '../styles/Auth/Login.css';

function Login() {
  return (
    <div className="login-page">
      <FuncHeader />

      <div className="login-wrapper">
        <div className="login-container">
          <h2 className="login-title">Login</h2>
          <p className="login-subtitle">Welcome back, please login to your account</p>

          <LoginForm />
        </div>
      </div>

      <SocialMedia />
      <FuncFooter />
    </div>
  );
}

export default Login;