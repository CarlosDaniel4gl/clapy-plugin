import { MainRouter } from "./routes/MainRouter";
import { ForecourtProvider } from "./context/ForecourtContext.tsx/ForecourtProvider";

export const App = () => {
  // function handleVisible(this: Document, ev: Event) {
  //   if (!(ev.target as any)?.hidden) return;
  //   // window.location.replace(window.location.href);
  // }

  // useEffect(() => {
  //   document.addEventListener("visibilitychange", handleVisible, false);
  //   return () =>
  //     document.removeEventListener("visibilitychange", handleVisible, false);
  // }, []);

  // return <DevProvider>
  //   <ForecourtProvider>
  //     <MainRouter />
  //   </ForecourtProvider>
  // </DevProvider>

  return <ForecourtProvider>
    <MainRouter />
  </ForecourtProvider>
}