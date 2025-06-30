import LeftPanel from "./components/LeftPanel/LeftPanel";
import RightPanel from "./components/RightPanel/RightPanel";
import style from "./App.module.css";

const App = () => {
  return (
    <div className={style.app}>
      <LeftPanel />
      <RightPanel />
    </div>
  );
};

export default App;
