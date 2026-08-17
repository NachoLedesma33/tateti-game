const DIFF_COLORS = {
  easy: 'text-emerald-300 border-emerald-300/60',
  medium: 'text-amber-300 border-amber-300/60',
  hard: 'text-rose-300 border-rose-300/60',
}

function Segmented({ label, options, value, onChange, colors = null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-pixel text-[8px] tracking-wider text-purple-300/80 uppercase">
        {label}
      </span>
      <div className="flex gap-1.5">
        {options.map((opt) => {
          const active = opt.value === value
          const color = colors?.[opt.value]?.split(' ')[0] || 'text-cyan-200'
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded border px-2.5 py-1.5 font-pixel text-[9px] tracking-wider transition-all ${
                active
                  ? `border-current bg-white/10 shadow-[0_0_12px_currentColor] ${color}`
                  : 'border-white/15 text-slate-400 hover:border-white/30 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ActionButton({ label, onClick, variant }) {
  const styles = {
    coin: 'border-yellow-300/70 text-yellow-200 shadow-[0_0_14px_#facc1577] hover:bg-yellow-300/15',
    restart:
      'border-cyan-300/60 text-cyan-200 shadow-[0_0_12px_#22d3ee55] hover:bg-cyan-300/15',
    sound:
      'border-slate-400/60 text-slate-200 shadow-[0_0_10px_#94a3b877] hover:bg-white/10',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border bg-black/30 px-3 py-2 font-pixel text-[9px] tracking-wider transition-all active:scale-95 ${styles[variant]}`}
    >
      {label}
    </button>
  )
}

function ArcadeHUD({
  size,
  mode,
  difficulty,
  scores,
  status,
  statusTone,
  muted,
  gameMode,
  phase,
  pool,
  onToggleSound,
  onSize,
  onGameMode,
  onMode,
  onDifficulty,
  onRestart,
  onInsertCoin,
}) {
  return (
    <>
      <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 text-center">
        <h1 className="font-pixel text-base text-cyan-300 uppercase drop-shadow-[0_0_14px_#22d3ee] sm:text-xl">
          Tateti Arcade
        </h1>
        <p
          className={`mt-3 font-pixel text-[10px] uppercase drop-shadow-[0_0_10px_currentColor] ${statusTone}`}
        >
          {status}
        </p>
        {gameMode === 'classic' && (
          <p className="mt-1 font-pixel text-[8px] text-purple-300/60">
            {phase === 'placement'
              ? `PLACING · X:${'●'.repeat(pool.X)}${'○'.repeat(size - pool.X)} O:${'●'.repeat(pool.O)}${'○'.repeat(size - pool.O)}`
              : 'MOVEMENT PHASE'}
          </p>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 w-[min(96vw,760px)] -translate-x-1/2">
        <div className="rounded-lg border border-white/15 bg-black/45 px-5 py-4 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-center gap-6">
            <span className="font-pixel text-[9px] text-purple-300">Score</span>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] text-fuchsia-400">X</span>
              <span className="font-pixel text-sm text-fuchsia-300 drop-shadow-[0_0_8px_#ec4899]">
                {scores.X}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] text-cyan-400">O</span>
              <span className="font-pixel text-sm text-cyan-300 drop-shadow-[0_0_8px_#22d3ee]">
                {scores.O}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] text-slate-500">TIE</span>
              <span className="font-pixel text-sm text-slate-300">{scores.ties}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-center gap-5">
            <Segmented
              label="Game"
              options={[
                { value: 'standard', label: 'ESTÁNDAR' },
                { value: 'classic', label: 'CLÁSICO' },
              ]}
              value={gameMode}
              onChange={onGameMode}
            />
            <Segmented
              label="Mode"
              options={[
                { value: 'pvp', label: 'PvP' },
                { value: 'pve', label: 'VS AI' },
              ]}
              value={mode}
              onChange={onMode}
            />
            {mode === 'pve' && (
              <Segmented
                label="Difficulty"
                options={[
                  { value: 'easy', label: 'EASY' },
                  { value: 'medium', label: 'MED' },
                  { value: 'hard', label: 'HARD' },
                ]}
                value={difficulty}
                onChange={onDifficulty}
                colors={DIFF_COLORS}
              />
            )}
            <Segmented
              label="Board"
              options={[
                { value: 3, label: '3x3' },
                { value: 4, label: '4x4' },
                { value: 6, label: '6x6' },
              ]}
              value={size}
              onChange={onSize}
            />
            <div className="flex gap-2">
              <ActionButton
                label={muted ? 'SOUND OFF' : 'SOUND ON'}
                variant="sound"
                onClick={onToggleSound}
              />
              <ActionButton label="INSERT COIN" variant="coin" onClick={onInsertCoin} />
              <ActionButton label="RESTART" variant="restart" onClick={onRestart} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ArcadeHUD
