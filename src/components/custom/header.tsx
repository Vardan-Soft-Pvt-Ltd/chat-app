import { GoogleLogin } from "@react-oauth/google";
import { ThemeToggle } from "./theme-toggle";
import { BASE_URL } from "@/lib/utils";

export const Header = () => {
  async function handleGoogleSignIn(id_token: string) {
    try {
      const response = await fetch(BASE_URL + '/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: id_token }),
      });
      if (response.ok) {
        console.log('Login successful!');
      } else {
        console.error('Login failed:');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  return (
    <>
      <header className="flex items-center justify-between px-2 sm:px-4 py-2 bg-background text-black dark:text-white w-full">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <ThemeToggle />
        </div>
        <div>
          <GoogleLogin
            type="icon"
            theme="outline"
            shape="circle"
            useOneTap
            onSuccess={credentialResponse => {
              credentialResponse.credential && handleGoogleSignIn(credentialResponse.credential);
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />
          {/* {<span className="blink_me"></span>} */}
        </div>
      </header>
    </>);
};