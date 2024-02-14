import GameBoard from "./components/GameBoard";
import Header from "./components/Header";

function App() {
  return (
    <div className="max-w-[1440px] font-inter mx-auto">
      <Header />
      <GameBoard />
    </div>
  );
}

export default App;
