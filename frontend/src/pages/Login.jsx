import GoogleSignInButton from '../components/auth/GoogleSignInButton';

export default function LoginPage() {
  return (
    <div className="login-container">
      <h2>Login with Google</h2>
      <GoogleSignInButton />
    </div>
  );
}