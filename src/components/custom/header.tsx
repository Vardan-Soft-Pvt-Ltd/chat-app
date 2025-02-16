import { ThemeToggle } from "./theme-toggle";


export const Header = ({ connected }: { connected: boolean }) => {
  // const { logged_in, login, logout } = useAuth();


  return (
    <>
      <header className="flex items-center justify-between px-2 sm:px-4 py-2 bg-background text-black dark:text-white w-full">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <ThemeToggle />
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 p-2">
          {connected && <span className="blink_me w-4 h-4 bg-red-500 rounded-full"></span>}
{/* 
          {logged_in ? (
            <button onClick={logout} className="px-2 py-1 bg-blue-500 text-white rounded text-sm">
              Logout
            </button>
          ) : (
            <GoogleLogin
              type="icon"
              theme="outline"
              shape="circle"
              useOneTap
              onSuccess={(credentialResponse) => {
                credentialResponse.credential && login(credentialResponse.credential);
              }}
              onError={() => {
                console.log('Login Failed');
              }}
            />
          )} */}
        </div>

      </header>
    </>);
};