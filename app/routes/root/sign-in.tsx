import { ButtonComponent } from '@syncfusion/ej2-react-buttons'
import React, { useEffect } from 'react'
import { Link, redirect, useNavigate } from 'react-router'
import { loginWithGoogle } from '~/appwrite/auth'
import { account } from '~/appwrite/client';


export const clientLoader = async () => {
  try {
    const user = await account.get();
    // ✅ User already logged in → redirect away
    return redirect("/dashboard");
  } catch (err) {
    // ❌ No session → this is normal
    console.log("No active session, staying on sign-in page");
    return null;
  }
};


const SignIn = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const user = await account.get();
        if (user) navigate("/dashboard");
      } catch {
        // user is not logged in (401) → stay here
      }
    })();
  }, [navigate]);

  return (
    <main className="auth">
      <section className="size-full glassmorphism flex-center px-6">
        <div className="sign-in-card">
          <header className="header">
            <Link to="/">
              <img
                src="/assets/icons/logo.svg"
                alt="logo"
                className="size-[30px]"
              />
            </Link>
            <h1 className="p-28-bold">Travel Agency AI</h1>
            <article>
              <h2 className="p-28-bold text-dark-100 text-center">
                Start Your Travel Journey
              </h2>
              <p className="p-18-regular text-center text-gray-100 !leading-7">
                Sign in with Google to manage destinations, itineraries, and user activity with ease.
              </p>
            </article>
            <ButtonComponent
              type="button"
              iconCss="e-search-icon"
              className="button-class !h-11 !w-full"
              onClick={loginWithGoogle}
            >
              <img
                src="/assets/icons/google.svg"
                className="size-5"
                alt="google"
              />
              <span className="p-18-semibold">Sign in with Google</span>
            </ButtonComponent>
          </header>
        </div>
      </section>
    </main>
  );
};

export default SignIn;