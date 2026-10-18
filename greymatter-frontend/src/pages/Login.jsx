import FuncHeader from "../components/functional-comps/FuncHeader";
import FuncFooter from "../components/functional-comps/FuncFooter";
import SocialMedia from "../components/functional-comps/LandingSocialMedia";
import LoginForm from "../components/auth-components/LoginForm";
import '../styles/Auth/Login.css';
import { Helmet } from "react-helmet";

function Login() {
  return (
    <div className="login-page">
      <Helmet htmlAttributes={{ lang: "en-ZA" }}>
        <title>Login | Grey Matter</title>
        <meta name="description" content="Log in to your Grey Matter account to track your progress." />
        <meta name="theme-color" content="#6846ff" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://greymatterschool.co.za/login" />
      </Helmet>

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