"use client";

import { useEffect, useMemo, useState } from "react";

type Position = {
  id: number;
  market: string;
  side: "Rise" | "Fall";
  stake: number;
  entry: number;
  pnl: number;
};

const markets = [
  { symbol: "Volatility 75 Index", code: "R_75", price: 63842.25, change: 1.84 },
  { symbol: "Volatility 100 Index", code: "R_100", price: 9148.72, change: -0.63 },
  { symbol: "Boom 1000 Index", code: "BOOM1000", price: 12420.18, change: 2.21 },
  { symbol: "Crash 1000 Index", code: "CRASH1000", price: 8216.44, change: -1.12 }
];

export default function Home() {
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState(markets[0]);
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [notice, setNotice] = useState("Scanner ready");
  const [tradeMode, setTradeMode] = useState<"paper" | "live">("paper");
  const [stake, setStake] = useState(25);

  const chart = useMemo(() => {
    const seed = selected.price;
    return Array.from({ length: 32 }, (_, index) =>
      seed + Math.sin(index * 0.72) * seed * 0.003 + Math.cos(index * 0.31) * seed * 0.001
    );
  }, [selected]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setPositions((current) => {
        if (current.length >= 4) return current;
        const side: "Rise" | "Fall" = Math.random() > 0.45 ? "Rise" : "Fall";
        const entry = selected.price + (Math.random() - 0.5) * 8;
        setNotice(`Paper signal: ${side.toUpperCase()} on ${selected.symbol}`);
        return [
          ...current,
          {
            id: Date.now(),
            market: selected.symbol,
            side,
            stake,
            entry,
            pnl: (Math.random() - 0.38) * stake
          }
        ];
      });
    }, 4500);
    return () => window.clearInterval(timer);
  }, [running, selected, stake]);

  function closePosition(id: number) {
    setPositions((current) => {
      const position = current.find((item) => item.id === id);
      if (position) setBalance((value) => value + position.pnl);
      return current.filter((item) => item.id !== id);
    });
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">P</span><span>Pulse Trade</span></div>
        <nav>
          <button className="active">⌁ <span>Overview</span></button>
          <button>◫ <span>Market scanner</span></button>
          <button>◎ <span>Trading bot</span></button>
          <button>▤ <span>Positions</span></button>
        </nav>
        <div className="statusCard">
          <div><i /> System status</div>
          <strong>All systems online</strong>
        </div>
      </aside>

      <section className="content">
        <header>
          <div>
            <p className="eyebrow">MARKET OVERVIEW</p>
            <h1>Good morning, Trader</h1>
          </div>
          <div className="headerActions">
            <button className="iconButton" aria-label="Notifications">♢</button>
            <div className="avatar">VK</div>
          </div>
        </header>

        <div className="stats">
          <article>
            <p>Account balance</p>
            <h2>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            <span className="positive">+2.4% this week</span>
          </article>
          <article>
            <p>Open positions</p>
            <h2>{positions.length}</h2>
            <span>{running ? "Bot is monitoring" : "Bot is idle"}</span>
          </article>
          <article>
            <p>Scanner signal</p>
            <h2>Strong Buy</h2>
            <span className="positive">82% confidence</span>
          </article>
        </div>

        <div className="grid">
          <section className="panel chartPanel">
            <div className="panelTitle">
              <div>
                <p>SELECTED MARKET</p>
                <h3>{selected.symbol} <span>· {selected.code}</span></h3>
              </div>
              <div className="price">
                <strong>{selected.price.toFixed(2)}</strong>
                <span className={selected.change >= 0 ? "positive" : "negative"}>
                  {selected.change >= 0 ? "+" : ""}{selected.change}%
                </span>
              </div>
            </div>

            <div className="chart">
              {chart.map((value, index) => {
                const height = 28 + ((value - selected.price) / selected.price + 0.004) * 9000;
                return <i key={index} style={{ height: `${Math.max(18, Math.min(92, height))}%` }} />;
              })}
              <div className="chartLine" />
            </div>

            <div className="timeRange">
              <button>1H</button><button className="selected">4H</button><button>1D</button><button>1W</button>
            </div>
          </section>

          <section className="panel controlPanel">
            <div className="panelTitle"><h3>Bot control</h3><span className={running ? "liveDot" : "idleDot"}>{running ? "Running" : "Stopped"}</span></div>
            <label>Trading mode</label>
            <div className="modeSwitch">
              <button className={tradeMode === "paper" ? "selected" : ""} onClick={() => setTradeMode("paper")}>Paper</button>
              <button className={tradeMode === "live" ? "selected" : ""} onClick={() => setTradeMode("live")}>Live</button>
            </div>
            {tradeMode === "live" && (
              <p className="warning">Live mode is locked until a Deriv API token is connected through secure environment variables.</p>
            )}
            <label>Market</label>
            <select value={selected.code} onChange={(event) => setSelected(markets.find((market) => market.code === event.target.value) ?? markets[0])}>
              {markets.map((market) => <option key={market.code} value={market.code}>{market.symbol}</option>)}
            </select>
            <label>Stake per trade</label>
            <div className="stakeInput"><span>$</span><input type="number" min="1" value={stake} onChange={(event) => setStake(Number(event.target.value))} /></div>
            <button
              className={running ? "stopButton" : "startButton"}
              onClick={() => {
                if (tradeMode === "live") return;
                setRunning((value) => !value);
                setNotice(running ? "Bot stopped" : "Bot started in paper mode");
              }}
            >
              {running ? "Stop bot" : "Start bot"}
            </button>
            <p className="notice">{notice}</p>
          </section>
        </div>

        <div className="grid lower">
          <section className="panel">
            <div className="panelTitle"><h3>AI market scanner</h3><button className="textButton">View all</button></div>
            <div className="scanner">
              {markets.map((market) => (
                <button key={market.code} className={selected.code === market.code ? "scannerRow activeRow" : "scannerRow"} onClick={() => setSelected(market)}>
                  <span className="marketIcon">{market.code.slice(0, 1)}</span>
                  <span className="marketName"><strong>{market.symbol}</strong><small>{market.code}</small></span>
                  <span className="marketPrice"><strong>{market.price.toLocaleString()}</strong><small className={market.change >= 0 ? "positive" : "negative"}>{market.change >= 0 ? "+" : ""}{market.change}%</small></span>
                  <b>{market.change >= 0 ? "BUY" : "SELL"}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="panel positionsPanel">
            <div className="panelTitle"><h3>Paper positions</h3><span>{positions.length} open</span></div>
            {positions.length === 0 ? (
              <div className="empty"><span>◎</span><strong>No open positions</strong><small>Start the paper bot to generate signals</small></div>
            ) : (
              positions.map((position) => (
                <div className="position" key={position.id}>
                  <div><strong>{position.market}</strong><small>{position.side} · entry {position.entry.toFixed(2)}</small></div>
                  <b className={position.pnl >= 0 ? "positive" : "negative"}>{position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}</b>
                  <button onClick={() => closePosition(position.id)}>Close</button>
                </div>
              ))
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
