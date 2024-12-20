import felineStoriesLogo from './assets/feline-stories.webp';

function App() {
  return (
    <>
      <div className="max-w-7xl mx-auto p-8 flex flex-col items-center justify-center gap-4">
        <img className="h-[400px]" src={felineStoriesLogo} alt="logo" />
        <h1 className="text-felineGreen-dark text-[6rem] font-cursive text-gradient-animation">
          Kocie Opowieści
        </h1>
      </div>
    </>
  );
}

export default App;
