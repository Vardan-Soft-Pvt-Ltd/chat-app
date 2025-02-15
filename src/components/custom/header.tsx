import { GoogleLogin } from "@react-oauth/google";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/context/AuthContext";


export const Header = () => {
  const { jwtToken, login } = useAuth();


  return (
    <>
      <header className="flex items-center justify-between px-2 sm:px-4 py-2 bg-background text-black dark:text-white w-full">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <ThemeToggle />
        </div>
        <div>{
          jwtToken == null && (<GoogleLogin
            type="icon"
            theme="outline"
            shape="circle"
            useOneTap
            onSuccess={credentialResponse => {
              credentialResponse.credential && login(credentialResponse.credential);
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />
          )
        }
          {/* {<span className="blink_me"></span>} */}
        </div>
      </header>
    </>);
};