"use client";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import FacebookSignInButton from "@/components/FacebookSignInButton";
import GitHubSignInButton from "@/components/GitHubSignInButton";
import styles from './page.module.css';

export default function Login() {
  const router = useRouter();

  const handleSocialLogin = async (provider) => {
    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/dashboard"
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      console.error(`${provider} login failed:`, err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginWrapper}>
        <div className={styles.formSection}>
          <LoginForm />
        </div>

        <div className={styles.divider}>
          <span>或使用以下方式登录</span>
        </div>

        <div className={styles.socialButtons}>
          <GoogleSignInButton onClick={() => handleSocialLogin('google')} />
          <FacebookSignInButton onClick={() => handleSocialLogin('facebook')} />
          <GitHubSignInButton onClick={() => handleSocialLogin('github')} />
        </div>

        <p className={styles.registerPrompt}>
          还没有账号？{' '}
          <Link href="/register" className={styles.registerLink}>
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}