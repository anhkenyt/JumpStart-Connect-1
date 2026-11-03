const base = import.meta.env.BASE_URL;

export default function Jumpstart() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-primary deck-body">
      <header className="absolute left-[4vw] right-[4vw] top-[4vh] flex h-[6vh] items-start justify-between border-b border-[#E2E8F0]">
        <div className="flex items-center gap-[1vw]">
          <span className="h-[2vw] w-[2vw] rounded-[0.4vw] bg-accent" />
          <p className="text-[1.5vw] font-semibold">Jumpstart</p>
        </div>
        <p className="text-[1.5vw] text-muted">Project overview</p>
      </header>

      <main className="absolute left-[4vw] right-[4vw] top-[14vh] bottom-[13vh] grid grid-cols-[3fr_2fr] gap-[4vw]">
        <section className="flex flex-col justify-center">
          <h1 className="font-display text-[6vw] font-extrabold leading-[1.05]">Jumpstart</h1>
          <p className="mt-[2vh] max-w-[49vw] text-[2.25vw] leading-[1.25] text-[#475569]">A nearby helping hand for a car that won’t start.</p>
          <p className="mt-[3vh] text-[2vw] text-[#475569]">Connect stranded drivers with nearby people equipped to help</p>
          <div className="mt-[4vh] grid grid-cols-2 gap-[2vw]">
            <div className="deck-card p-[1.6vw]">
              <p className="text-[2vw] leading-[1.3]"><span className="font-semibold text-accent">Two roles:</span> request a jump-start or offer one</p>
            </div>
            <div className="deck-card p-[1.6vw]">
              <p className="text-[2vw] leading-[1.3]">Working web demo with <span className="font-semibold text-accent">five switchable test users</span></p>
            </div>
          </div>
        </section>

        <section className="deck-card flex min-h-0 flex-col p-[2.4vw]">
          <p className="text-[2vw] font-semibold leading-[1.3]">Test payments only; no real money charged</p>
          <div className="mt-[4vh] min-h-0 flex-1 overflow-hidden rounded-[0.6vw] border border-[#E2E8F0]">
            <img src={`${base}jumpstart-demo.jpg`} crossOrigin="anonymous" alt="Jumpstart demo map showing four nearby helpers around Downtown Dubai" className="h-full w-full object-cover object-[65%_center]" />
          </div>
        </section>
      </main>

      <footer className="absolute bottom-[3vh] left-[4vw] right-[4vw] flex h-[5vh] items-end justify-between border-t border-[#E2E8F0] text-[1.5vw] text-muted">
        <p>Jumpstart</p>
        <p>01 / 06</p>
      </footer>
    </div>
  );
}
