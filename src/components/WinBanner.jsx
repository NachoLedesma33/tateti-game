const STYLES = {
  x: {
    title: 'PLAYER X WINS',
    titleClass: 'text-fuchsia-300',
    glow: 'border-fuchsia-400/70 shadow-[0_0_45px_rgba(236,72,153,0.45)]',
  },
  o: {
    title: 'PLAYER O WINS',
    titleClass: 'text-cyan-300',
    glow: 'border-cyan-400/70 shadow-[0_0_45px_rgba(34,211,238,0.45)]',
  },
  lose: {
    title: 'GAME OVER',
    titleClass: 'text-rose-400',
    glow: 'border-rose-500/70 shadow-[0_0_45px_rgba(244,63,94,0.5)]',
  },
  draw: {
    title: 'DRAW',
    titleClass: 'text-purple-300',
    glow: 'border-purple-400/70 shadow-[0_0_45px_rgba(168,85,247,0.45)]',
  },
}

function WinBanner({ kind, scores, onRestart }) {
  const s = STYLES[kind]
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
      <div
        className={`banner-pop pointer-events-auto relative rounded-xl border bg-black/75 px-8 py-8 text-center backdrop-blur-md sm:px-14 sm:py-10 ${s.glow}`}
      >
        <p className="font-pixel text-[9px] tracking-widest text-slate-300 uppercase">
          Tateti Arcade
        </p>
        <h2
          className={`mt-3 font-pixel text-2xl tracking-wider uppercase sm:text-4xl ${s.titleClass}`}
        >
          {s.title}
        </h2>
        <div className="mt-5 flex items-center justify-center gap-4 font-pixel text-[10px]">
          <span className="text-fuchsia-300">X {scores.X}</span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-300">O {scores.O}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">TIE {scores.ties}</span>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 rounded border border-cyan-300/60 bg-black/40 px-5 py-2.5 font-pixel text-[10px] tracking-wider text-cyan-200 shadow-[0_0_12px_#22d3ee55] transition-all hover:bg-cyan-300/15 active:scale-95"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  )
}

export default WinBanner
