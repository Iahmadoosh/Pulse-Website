// Academy curriculum for the SPY Options Trainer. Every lesson ends with a
// quiz; passing all quizzes unlocks the $300 challenge.

export type LessonWidget =
  | "payoff-call"
  | "payoff-put"
  | "live-contract"
  | "moneyness"
  | "greeks-lab"
  | "theta-decay"
  | "expected-move"
  | "order-fill"
  | "tier-calculator";

export interface LessonStep {
  title: string;
  /** Markdown paragraphs. */
  body: string;
  widget?: LessonWidget;
  /** Glossary ids highlighted under the step. */
  terms?: string[];
  callout?: { tone: "tip" | "warning"; text: string };
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  steps: LessonStep[];
  quiz: QuizQuestion[];
}

export const LESSONS: Lesson[] = [
  {
    id: "basics",
    title: "Options 101: Calls, Puts & SPY",
    summary: "What an option is, why SPY, and how calls and puts make or lose money.",
    minutes: 8,
    steps: [
      {
        title: "What is an option?",
        body:
          "An **option** is a contract that gives the buyer the **right, but not the obligation**, to buy or sell an underlying asset at a fixed price (the **strike**) on or before a set date (the **expiration**).\n\n" +
          "The buyer pays the seller a price for that right, called the **premium**. Once you pay it, the premium is the most you can lose as a buyer.",
        terms: ["option", "underlying", "strike", "expiration", "premium"],
      },
      {
        title: "Why trade SPY options?",
        body:
          "**SPY** (the SPDR S&P 500 ETF Trust) holds the 500 stocks of the S&P 500 and trades at roughly one-tenth of the index level.\n\n" +
          "SPY options are among the most actively traded options in the world:\n\n" +
          "- **Tight bid/ask spreads** and huge volume, so it's cheap to get in and out.\n" +
          "- **Expirations every trading day** (Monday through Friday), plus weekly, monthly and long-dated (LEAPS) contracts.\n" +
          "- **American-style:** the holder can exercise on any trading day before expiration.\n" +
          "- **Physically settled:** exercising a call delivers 100 SPY shares. (SPX index options, by contrast, are European-style and settle in cash.)",
        terms: ["spy", "etf", "american-style", "zero-dte"],
      },
      {
        title: "One contract = 100 shares",
        body:
          "Option prices are quoted **per share**, but one standard contract covers **100 shares**. That 100 is the **contract multiplier**.\n\n" +
          "A premium quoted at **$1.25** costs **$125** for one contract, plus commission. With a $300 account, any option quoted above about **$2.99** is out of reach for even one contract, which is why small accounts usually trade short-dated or out-of-the-money contracts.",
        terms: ["multiplier", "premium"],
        callout: { tone: "tip", text: "Multiply every quote by 100 before deciding whether a trade fits your account." },
      },
      {
        title: "Calls: the right to buy",
        body:
          "A **call** gains value when SPY rises. At expiration a call is worth **max(SPY − strike, 0)** per share.\n\n" +
          "Your profit at expiration is that value minus the premium you paid, so you only make money if SPY finishes above **strike + premium** (the break-even). Drag the sliders to see the payoff.",
        widget: "payoff-call",
        terms: ["call", "break-even"],
      },
      {
        title: "Puts: the right to sell",
        body:
          "A **put** gains value when SPY falls. At expiration a put is worth **max(strike − SPY, 0)** per share.\n\n" +
          "You profit at expiration only if SPY finishes below **strike − premium**. Buying puts is a way to bet on a decline, or to hedge shares you own, with a loss capped at the premium.",
        widget: "payoff-put",
        terms: ["put", "break-even"],
      },
      {
        title: "Buyers vs. sellers",
        body:
          "Every option trade has a buyer and a seller (the **writer**).\n\n" +
          "- **Buyer (long):** pays the premium, holds the right, and can lose at most the premium.\n" +
          "- **Seller (short):** collects the premium but takes on the obligation. Losses can be far larger than the premium, so selling requires margin approval.\n\n" +
          "This challenge simulates a **cash account**: you can **buy to open** and **sell to close** calls and puts. Your worst case on any trade is the premium plus commissions.",
        terms: ["long", "short", "buy-to-open", "sell-to-close", "cash-account"],
      },
    ],
    quiz: [
      {
        id: "basics-1",
        prompt: "A SPY call is quoted at $2.10. What does one contract cost before commission?",
        choices: ["$2.10", "$21.00", "$210.00", "$2,100.00"],
        answer: 2,
        explanation: "Quotes are per share and one contract covers 100 shares: $2.10 × 100 = $210.",
      },
      {
        id: "basics-2",
        prompt: "You expect SPY to fall over the next week. Which option benefits from that move?",
        choices: ["A call", "A put", "Both equally", "Neither"],
        answer: 1,
        explanation: "A put's value at expiration is max(strike − SPY, 0), so it gains as SPY falls.",
      },
      {
        id: "basics-3",
        prompt: "What is the most you can lose when you BUY an option?",
        choices: [
          "Unlimited",
          "The strike price × 100",
          "The premium paid plus commissions",
          "The current SPY share price",
        ],
        answer: 2,
        explanation: "A long option can expire worthless, so the most you can lose is what you paid for it.",
      },
    ],
  },
  {
    id: "chain",
    title: "Reading the Option Chain",
    summary: "Bid, ask, spread, volume, open interest, moneyness and break-even, using live SPY quotes.",
    minutes: 10,
    steps: [
      {
        title: "How a chain is laid out",
        body:
          "An **option chain** lists every contract for one expiration. **Calls are on the left, puts on the right**, and **strikes run down the middle**.\n\n" +
          "Each expiration shows its **DTE** (days to expiration). **0DTE** means the contract expires at today's close. On the Trading Desk, rows in the money are shaded and a marker shows where SPY is trading.",
        terms: ["option-chain", "dte", "zero-dte"],
      },
      {
        title: "Bid, ask & the spread",
        body:
          "- **Bid:** the highest price a buyer will pay right now. A market order to **sell** fills here.\n" +
          "- **Ask:** the lowest price a seller will accept. A market order to **buy** fills here.\n" +
          "- **Bid size / ask size:** how many contracts are available at those prices.\n" +
          "- **Spread** = ask − bid; **mid** = (bid + ask) ÷ 2.\n\n" +
          "The spread is a hidden cost: if you buy at the ask and immediately sell at the bid, you lose the spread. Here is a real SPY contract from the current chain:",
        widget: "live-contract",
        terms: ["bid", "ask", "bid-size", "spread", "mid"],
      },
      {
        title: "Last price & change",
        body:
          "**Last** is the price of the most recent trade, and **change** compares it to the previous close.\n\n" +
          "The last trade may have happened minutes or hours ago, so it can be far from where the contract trades now. **Always price your order off the current bid and ask, not the last trade.**",
        terms: ["last", "change"],
      },
      {
        title: "Volume vs. open interest",
        body:
          "- **Volume:** contracts traded **today**. It resets to zero every morning.\n" +
          "- **Open interest (OI):** contracts that are **still open**, not yet closed or exercised. The OCC updates it **once per day**, so it doesn't change during the session.\n\n" +
          "High volume, high open interest and a tight spread together mean a **liquid** contract that's easy to enter and exit near the mid.",
        terms: ["volume", "open-interest", "liquidity"],
        callout: {
          tone: "warning",
          text: "A contract with 0 volume and a wide spread can be hard to sell at a fair price. Check liquidity before you buy.",
        },
      },
      {
        title: "Moneyness: ITM, ATM, OTM",
        body:
          "- **In the money (ITM):** a call with strike **below** SPY, or a put with strike **above** SPY.\n" +
          "- **At the money (ATM):** the strike closest to SPY's price.\n" +
          "- **Out of the money (OTM):** no intrinsic value yet (call strike above SPY, put strike below).\n\n" +
          "Move SPY's price below to see how the same strikes change category.",
        widget: "moneyness",
        terms: ["itm", "atm", "otm"],
      },
      {
        title: "Intrinsic vs. extrinsic value",
        body:
          "**Premium = intrinsic value + extrinsic value.**\n\n" +
          "- **Intrinsic:** what the option would be worth if exercised now. Call: max(SPY − strike, 0). Put: max(strike − SPY, 0).\n" +
          "- **Extrinsic (time value):** everything else. It pays for time and volatility and **decays to zero by expiration**.\n\n" +
          "Example: SPY at $580 and the 575 call at $7.20. Intrinsic is $5.00 and extrinsic is $2.20. Out-of-the-money options are 100% extrinsic.",
        terms: ["intrinsic-value", "extrinsic-value"],
      },
      {
        title: "Break-even at expiration",
        body:
          "- **Call break-even** = strike + premium paid.\n" +
          "- **Put break-even** = strike − premium paid.\n\n" +
          "Before expiration an option can be profitable before SPY reaches break-even, because it still has time value. At expiration only intrinsic value remains.",
        terms: ["break-even"],
      },
    ],
    quiz: [
      {
        id: "chain-1",
        prompt: "A call is quoted 1.42 × 1.45 (bid × ask). You BUY with a market order. What price do you most likely pay?",
        choices: ["$1.42 (the bid)", "$1.435 (the mid)", "$1.45 (the ask)", "The last trade price"],
        answer: 2,
        explanation: "Market buy orders take the best offer, which is the ask.",
      },
      {
        id: "chain-2",
        prompt: "Which statement about open interest is true?",
        choices: [
          "It resets to zero every morning",
          "It counts contracts still open and is updated once per day",
          "It is the same as today's volume",
          "It is the number of SPY shares traded",
        ],
        answer: 1,
        explanation: "Open interest is the number of outstanding contracts, published once per day. Volume is what resets daily.",
      },
      {
        id: "chain-3",
        prompt: "SPY is at $580. The 575 call costs $7.20. What is its extrinsic value?",
        choices: ["$5.00", "$2.20", "$7.20", "$0.00"],
        answer: 1,
        explanation: "Intrinsic = 580 − 575 = $5.00, so extrinsic = 7.20 − 5.00 = $2.20.",
      },
      {
        id: "chain-4",
        prompt: "You buy the 585 put for $3.00. What is the break-even at expiration?",
        choices: ["$588.00", "$582.00", "$585.00", "$3.00"],
        answer: 1,
        explanation: "Put break-even = strike − premium = 585 − 3 = $582.",
      },
    ],
  },
  {
    id: "greeks",
    title: "The Greeks",
    summary: "Delta, gamma, theta, vega and rho: how an option's price reacts to SPY, time, volatility and rates.",
    minutes: 12,
    steps: [
      {
        title: "Why the Greeks matter",
        body:
          "The **Greeks** estimate how an option's price changes when one input changes and everything else stays the same. They come from a pricing model and change constantly.\n\n" +
          "Greeks are quoted **per share**. Multiply by **100** to get the effect on one contract.",
        terms: ["greeks"],
      },
      {
        title: "Delta (Δ): direction",
        body:
          "**Delta** is the expected change in the option's price for a **$1 move in SPY**.\n\n" +
          "- Calls range from **0 to +1**; puts from **−1 to 0**.\n" +
          "- At the money ≈ ±0.50; deep ITM → ±1; far OTM → 0.\n" +
          "- Traders often read |delta| as a rough probability that the option finishes in the money.\n\n" +
          "**Position delta** = delta × 100 × contracts. It's your exposure in SPY share-equivalents. A 0.40-delta call gains about $0.40 per share ($40 per contract) when SPY rises $1.",
        terms: ["delta"],
      },
      {
        title: "Gamma (Γ): how fast delta changes",
        body:
          "**Gamma** is how much delta changes for a $1 SPY move. It is **highest for at-the-money options close to expiration**.\n\n" +
          "High gamma is why **0DTE** options can go from nearly worthless to a big gain, or the reverse, within minutes: delta swings quickly as SPY moves.",
        terms: ["gamma", "zero-dte"],
      },
      {
        title: "Theta (Θ): time decay",
        body:
          "**Theta** is how much value the option loses **per day** if nothing else changes. For option buyers it is **negative**.\n\n" +
          "Decay is slow for long-dated options and **accelerates in the final days**, especially at the money. A theta of −0.15 means one contract loses about **$15 per day**.",
        widget: "theta-decay",
        terms: ["theta", "extrinsic-value"],
      },
      {
        title: "Vega (ν): volatility sensitivity",
        body:
          "**Vega** is the change in price for a **1 percentage-point change in implied volatility**.\n\n" +
          "Long calls and long puts both **gain when IV rises** and **lose when IV falls**. Longer-dated options carry more vega than short-dated ones.",
        terms: ["vega", "implied-volatility"],
      },
      {
        title: "Rho (ρ): interest rates",
        body:
          "**Rho** is the change in price for a **1 percentage-point change in interest rates**. Calls have positive rho and puts negative.\n\n" +
          "For short-dated SPY options rho is tiny, so day traders usually ignore it. It matters more for LEAPS.",
        terms: ["rho"],
      },
      {
        title: "Greeks lab",
        body:
          "Experiment with the Black-Scholes model that underlies most Greek calculations. Change SPY's price, days to expiration and volatility, and watch the price and Greeks respond.",
        widget: "greeks-lab",
        terms: ["black-scholes"],
      },
    ],
    quiz: [
      {
        id: "greeks-1",
        prompt: "A call has a delta of 0.40. SPY rises $2. Ignoring other Greeks, about how much does ONE contract gain?",
        choices: ["$0.80", "$8", "$80", "$200"],
        answer: 2,
        explanation: "0.40 × $2 = $0.80 per share, × 100 shares = $80 per contract.",
      },
      {
        id: "greeks-2",
        prompt: "Your put has a theta of −0.12. If nothing else changes, one contract after one day is worth about…",
        choices: ["$12 less", "$1.20 less", "$0.12 more", "The same"],
        answer: 0,
        explanation: "Theta is per share per day: −0.12 × 100 = −$12 per contract per day.",
      },
      {
        id: "greeks-3",
        prompt: "Which Greek measures sensitivity to implied volatility?",
        choices: ["Delta", "Gamma", "Vega", "Rho"],
        answer: 2,
        explanation: "Vega is the price change per 1-point change in implied volatility.",
      },
      {
        id: "greeks-4",
        prompt: "When is gamma highest?",
        choices: [
          "Deep in the money with months to go",
          "At the money, close to expiration",
          "Far out of the money with months to go",
          "Gamma never changes",
        ],
        answer: 1,
        explanation: "At-the-money options near expiration have the fastest-changing delta, which is the highest gamma.",
      },
    ],
  },
  {
    id: "volatility",
    title: "Implied Volatility & Time",
    summary: "What IV means, the expected move, the VIX, IV crush and 0DTE decay.",
    minutes: 8,
    steps: [
      {
        title: "Implied volatility (IV)",
        body:
          "**Implied volatility** is the annualized volatility that, plugged into a pricing model, reproduces an option's market price. It is the market's estimate of how much SPY will move.\n\n" +
          "**Higher IV means more expensive options**; lower IV means cheaper ones. The chain shows IV for every contract.",
        terms: ["implied-volatility", "historical-volatility"],
      },
      {
        title: "The expected move",
        body:
          "A common rule of thumb for the **one-standard-deviation expected move** is:\n\n" +
          "**SPY × IV × √(days ÷ 365)**\n\n" +
          "Under the model's assumptions, SPY finishes inside ± that range about 68% of the time. Here it is with live SPY data:",
        widget: "expected-move",
        terms: ["expected-move"],
      },
      {
        title: "The VIX",
        body:
          "The **Cboe Volatility Index (VIX)** measures the 30-day implied volatility of S&P 500 (SPX) options. When the VIX rises, SPY option premiums generally rise too.\n\n" +
          "The VIX tends to jump when stocks fall sharply, which is why puts can gain from both the drop and the rise in IV.",
        terms: ["vix"],
      },
      {
        title: "IV crush",
        body:
          "Before scheduled events such as CPI reports, Fed (FOMC) decisions and jobs reports, IV often rises. Once the news is out, IV **collapses**.\n\n" +
          "That **IV crush** can make a long option lose value even when SPY moves your way, because the vega loss outweighs the delta gain.",
        terms: ["iv-crush", "vega"],
        callout: { tone: "warning", text: "Check the economic calendar. Buying options right before a big announcement means paying for inflated IV." },
      },
      {
        title: "Time decay & 0DTE",
        body:
          "Extrinsic value decays slowly at first and **very quickly in the last days and hours**.\n\n" +
          "**0DTE** options are cheap because only hours remain, so SPY has to move fast for them to pay off. They teach gamma well and punish you through theta.",
        terms: ["zero-dte", "theta"],
      },
    ],
    quiz: [
      {
        id: "vol-1",
        prompt: "SPY is $600, ATM IV is 15% and 30 days remain. What is the approximate one-standard-deviation expected move?",
        choices: ["$9", "$26", "$90", "$150"],
        answer: 1,
        explanation: "600 × 0.15 × √(30/365) ≈ 600 × 0.15 × 0.287 ≈ $25.8.",
      },
      {
        id: "vol-2",
        prompt: "You buy calls just before an FOMC announcement. SPY rises slightly afterward, but your calls lose value. Most likely reason?",
        choices: [
          "Delta turned negative",
          "IV crush reduced the option's extrinsic value",
          "Open interest fell",
          "The bid/ask spread became zero",
        ],
        answer: 1,
        explanation: "IV usually drops after a scheduled event, and the vega loss can outweigh a small delta gain.",
      },
      {
        id: "vol-3",
        prompt: "For an at-the-money option, time decay is fastest…",
        choices: ["Months before expiration", "In the final days before expiration", "At a constant rate", "Only for puts"],
        answer: 1,
        explanation: "Theta accelerates as expiration approaches, especially for at-the-money options.",
      },
    ],
  },
  {
    id: "orders",
    title: "Placing Orders & Expiration",
    summary: "Opening and closing, market vs. limit orders, costs, trading hours and what happens at expiration.",
    minutes: 9,
    steps: [
      {
        title: "Opening and closing",
        body:
          "- **Buy to open (BTO):** starts a long call or put position.\n" +
          "- **Sell to close (STC):** exits a position you own.\n\n" +
          "Sell to open and buy to close are for option sellers and aren't available in this cash-account challenge.",
        terms: ["buy-to-open", "sell-to-close"],
      },
      {
        title: "Market vs. limit orders",
        body:
          "- **Market order:** fills right away at the best available price. You **buy at the ask** and **sell at the bid**.\n" +
          "- **Limit order:** you set the most you'll pay (buy) or the least you'll accept (sell). It fills only if the market reaches your price.\n\n" +
          "A limit at the mid often saves money but may not fill. In the simulator, a working buy limit fills when the ask drops to your price, and a sell limit fills when the bid rises to it.",
        widget: "order-fill",
        terms: ["market-order", "limit-order", "slippage"],
      },
      {
        title: "Commissions & trading costs",
        body:
          "Many brokers charge around **$0.65 per contract** each way, plus small regulatory fees. A round trip on one contract costs about **$1.30**.\n\n" +
          "On a $0.20 option ($20 per contract) that is 6.5% of the trade before the spread. **The spread plus commissions is the cost of every trade.**",
        terms: ["commission"],
      },
      {
        title: "Trading hours",
        body:
          "SPY options trade **9:30 AM–4:00 PM Eastern** on market days, and close at **1:00 PM** on early-close days such as the day after Thanksgiving.\n\n" +
          "Quotes outside the session are stale, so the simulator only accepts orders while the market is open.",
        terms: ["market-hours"],
      },
      {
        title: "Expiration & exercise",
        body:
          "Contracts stop trading at the close on expiration day. The OCC **automatically exercises** equity options that are **$0.01 or more in the money** at expiration.\n\n" +
          "For SPY that means a long call becomes **100 shares bought at the strike**, which takes tens of thousands of dollars. Brokers often close small accounts' positions before that happens.\n\n" +
          "**In this simulator**, expiring options settle to cash at intrinsic value using SPY's official closing price, and out-of-the-money options expire worthless. The best habit is to close before expiration.",
        terms: ["exercise", "assignment", "auto-exercise", "settlement"],
        callout: {
          tone: "warning",
          text: "Holding a 0DTE option into the close is all-or-nothing. If it finishes out of the money, the whole premium is gone.",
        },
      },
      {
        title: "Account rules worth knowing",
        body:
          "- **Settlement:** option trades settle **T+1** (one business day). In a real cash account, buying with unsettled proceeds and selling before they settle is a **good-faith violation**. The simulator lets you reuse proceeds right away.\n" +
          "- **Pattern day trader (PDT):** for years FINRA required $25,000 in a margin account to make four or more day trades in five business days. FINRA has proposed replacing that rule, so check your broker's current policy. Cash accounts aren't subject to PDT but must respect settlement.",
        terms: ["settlement-cycle", "good-faith-violation", "pdt"],
      },
    ],
    quiz: [
      {
        id: "orders-1",
        prompt: "A put is quoted 0.85 × 0.88. You SELL TO CLOSE with a market order. What is the expected fill?",
        choices: ["$0.85", "$0.865", "$0.88", "$0.00"],
        answer: 0,
        explanation: "Market sell orders fill at the bid.",
      },
      {
        id: "orders-2",
        prompt: "You place a BUY limit at $1.10 while the ask is $1.15. When does it fill?",
        choices: [
          "Immediately at $1.15",
          "When the ask falls to $1.10 or lower",
          "Automatically at the close",
          "Never, because limit orders aren't allowed",
        ],
        answer: 1,
        explanation: "A buy limit only fills at your price or better, so the ask has to come down to $1.10.",
      },
      {
        id: "orders-3",
        prompt: "In this simulator, you hold a 590 call at expiration and SPY closes at $592.40. What happens?",
        choices: [
          "It expires worthless",
          "It settles at $2.40 per share ($240 per contract)",
          "It converts into 100 SPY shares",
          "It settles at the last traded premium",
        ],
        answer: 1,
        explanation: "Intrinsic value = 592.40 − 590 = $2.40 per share, settled to cash in the simulator.",
      },
    ],
  },
  {
    id: "risk",
    title: "Risk Management & Challenge Rules",
    summary: "How the $300 challenge works, how to size trades to your loss limit, and habits that keep you in the game.",
    minutes: 7,
    steps: [
      {
        title: "The $300 challenge",
        body:
          "You start with **$300 in cash**. Pick a difficulty tier:\n\n" +
          "- **Hard:** the challenge ends at a 10% loss (equity of **$270**).\n" +
          "- **Medium:** ends at a 25% loss (**$225**).\n" +
          "- **Easy:** ends at a 50% loss (**$150**).\n\n" +
          "**Equity** = cash + open positions marked at the mid. When equity touches the floor, the challenge ends and open positions are sold at the bid.",
        widget: "tier-calculator",
        terms: ["equity", "mark", "drawdown"],
      },
      {
        title: "Size trades to your loss buffer",
        body:
          "Your **loss buffer** is equity minus the floor. Any long option can go to zero, so a single position's premium should be a fraction of that buffer.\n\n" +
          "On Hard the buffer starts at only **$30**: one option priced at $0.31 ($31) could end the challenge if it expires worthless. The order ticket warns you when a trade risks more than your buffer.",
        terms: ["position-sizing", "risk-per-trade"],
      },
      {
        title: "Plan every trade",
        body:
          "Before you click buy, write down:\n\n" +
          "1. **Thesis:** direction and timing. Why should SPY move, and by when?\n" +
          "2. **Entry:** a limit price you're willing to pay.\n" +
          "3. **Profit target** and **exit point**, in option price or SPY level.\n" +
          "4. **Time stop:** when you'll exit if nothing happens, since theta keeps eating.\n\n" +
          "Then follow the plan. Trade journals beat gut feelings.",
        terms: ["trading-plan"],
      },
      {
        title: "Leverage cuts both ways",
        body:
          "Options magnify percentage moves. A 0.5% move in SPY can double or halve a short-dated out-of-the-money option.\n\n" +
          "That leverage is what lets a $300 account participate, and also why it can disappear quickly.",
        terms: ["leverage"],
      },
      {
        title: "Common beginner mistakes",
        body:
          "- Buying far out-of-the-money \"lottery tickets\" with deltas near zero.\n" +
          "- Ignoring the spread and using market orders on illiquid contracts.\n" +
          "- Holding losers into expiration hoping for a comeback.\n" +
          "- Averaging down on a losing option.\n" +
          "- Revenge trading after a loss, or over-trading until commissions eat the account.",
      },
      {
        title: "The data you trade with",
        body:
          "Prices come from real SPY market data. With the default free feed (Cboe), **option quotes are delayed 15 minutes**. With a Tradier API token configured on the server they are **real-time**. The badge on the Trading Desk always shows which feed is active and how old the quotes are.\n\n" +
          "Fills use the feed's actual bid and ask, so your results reflect real spreads and liquidity.",
        terms: ["real-time-data", "delayed-data"],
      },
    ],
    quiz: [
      {
        id: "risk-1",
        prompt: "On the Medium tier, at what equity does the challenge end?",
        choices: ["$270", "$225", "$150", "$0"],
        answer: 1,
        explanation: "Medium allows a 25% loss: $300 × 0.75 = $225.",
      },
      {
        id: "risk-2",
        prompt: "On Hard with $300 equity, how large is your loss buffer?",
        choices: ["$10", "$30", "$75", "$150"],
        answer: 1,
        explanation: "Hard ends at $270, so the buffer is $300 − $270 = $30.",
      },
      {
        id: "risk-3",
        prompt: "Which habit is best before entering a trade?",
        choices: [
          "Use market orders on illiquid contracts to get filled fast",
          "Define the entry, profit target and exit before you buy",
          "Plan to average down if it moves against you",
          "Hold every option to expiration",
        ],
        answer: 1,
        explanation: "A written plan with an entry, target and exit keeps emotion out of the decision.",
      },
    ],
  },
];

export interface GlossaryTerm {
  id: string;
  term: string;
  category: "Basics" | "Quotes & Chain" | "Greeks" | "Volatility" | "Orders" | "Expiration" | "Risk & Account";
  definition: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { id: "option", term: "Option", category: "Basics", definition: "A contract giving the buyer the right, but not the obligation, to buy (call) or sell (put) 100 shares of an underlying at the strike price on or before expiration." },
  { id: "underlying", term: "Underlying", category: "Basics", definition: "The asset an option is based on. Here that's SPY, the SPDR S&P 500 ETF Trust." },
  { id: "spy", term: "SPY", category: "Basics", definition: "The SPDR S&P 500 ETF Trust, an exchange-traded fund tracking the S&P 500 at about 1/10 of the index level. Its options are among the most liquid in the world." },
  { id: "etf", term: "ETF", category: "Basics", definition: "Exchange-traded fund: a basket of securities that trades on an exchange like a single stock." },
  { id: "call", term: "Call", category: "Basics", definition: "The right to buy the underlying at the strike. Gains value as the underlying rises. Value at expiration = max(price − strike, 0)." },
  { id: "put", term: "Put", category: "Basics", definition: "The right to sell the underlying at the strike. Gains value as the underlying falls. Value at expiration = max(strike − price, 0)." },
  { id: "strike", term: "Strike price", category: "Basics", definition: "The fixed price at which the option holder may buy (call) or sell (put) the underlying." },
  { id: "expiration", term: "Expiration", category: "Basics", definition: "The last day the option exists. SPY options stop trading at 4:00 PM ET on expiration day (1:00 PM on early-close days)." },
  { id: "premium", term: "Premium", category: "Basics", definition: "The price of an option, quoted per share. Multiply by 100 for the cost of one contract." },
  { id: "multiplier", term: "Contract multiplier", category: "Basics", definition: "The number of shares one contract controls: 100 for standard SPY options." },
  { id: "long", term: "Long", category: "Basics", definition: "Owning a position. A long option holder paid the premium and holds the right." },
  { id: "short", term: "Short / writer", category: "Basics", definition: "The seller of an option. Collects the premium and takes on the obligation to deliver or receive shares if assigned." },
  { id: "american-style", term: "American-style", category: "Basics", definition: "An option that can be exercised on any business day up to expiration. SPY options are American-style; SPX options are European-style (exercise only at expiration)." },
  { id: "option-chain", term: "Option chain", category: "Quotes & Chain", definition: "A table of every call and put for an underlying and expiration, organized by strike." },
  { id: "bid", term: "Bid", category: "Quotes & Chain", definition: "The highest price a buyer is currently willing to pay. Market sell orders fill at the bid." },
  { id: "ask", term: "Ask (offer)", category: "Quotes & Chain", definition: "The lowest price a seller is currently willing to accept. Market buy orders fill at the ask." },
  { id: "bid-size", term: "Bid size / ask size", category: "Quotes & Chain", definition: "The number of contracts available at the current bid or ask." },
  { id: "spread", term: "Bid/ask spread", category: "Quotes & Chain", definition: "Ask minus bid. A cost you pay crossing the market; tighter spreads mean more liquid contracts." },
  { id: "mid", term: "Mid (midpoint)", category: "Quotes & Chain", definition: "(Bid + ask) ÷ 2. Often used to mark positions and as a starting limit price." },
  { id: "last", term: "Last", category: "Quotes & Chain", definition: "The price of the most recent trade. It can be stale, so trade off the bid/ask." },
  { id: "change", term: "Change", category: "Quotes & Chain", definition: "Difference between the last trade and the previous session's closing price." },
  { id: "volume", term: "Volume", category: "Quotes & Chain", definition: "Number of contracts traded today. Resets to zero each session." },
  { id: "open-interest", term: "Open interest (OI)", category: "Quotes & Chain", definition: "Number of contracts outstanding (not yet closed or exercised). Published once per day by the OCC." },
  { id: "liquidity", term: "Liquidity", category: "Quotes & Chain", definition: "How easily a contract can be bought or sold near its fair price. Look for high volume, high open interest and a tight spread." },
  { id: "dte", term: "DTE", category: "Quotes & Chain", definition: "Days to expiration: calendar days until the contract expires." },
  { id: "zero-dte", term: "0DTE", category: "Quotes & Chain", definition: "Options expiring today. Very cheap, with extreme gamma and theta." },
  { id: "itm", term: "In the money (ITM)", category: "Quotes & Chain", definition: "An option with intrinsic value: a call with strike below SPY, or a put with strike above SPY." },
  { id: "atm", term: "At the money (ATM)", category: "Quotes & Chain", definition: "The strike closest to the underlying's current price." },
  { id: "otm", term: "Out of the money (OTM)", category: "Quotes & Chain", definition: "An option with no intrinsic value: a call with strike above SPY, or a put with strike below SPY." },
  { id: "intrinsic-value", term: "Intrinsic value", category: "Quotes & Chain", definition: "The value if exercised now. Call: max(SPY − strike, 0). Put: max(strike − SPY, 0)." },
  { id: "extrinsic-value", term: "Extrinsic (time) value", category: "Quotes & Chain", definition: "Premium minus intrinsic value. Reflects time and volatility and decays to zero at expiration." },
  { id: "break-even", term: "Break-even", category: "Quotes & Chain", definition: "SPY price at expiration where a long option neither gains nor loses. Call: strike + premium. Put: strike − premium." },
  { id: "greeks", term: "The Greeks", category: "Greeks", definition: "Model-based sensitivities of an option's price to the underlying (delta, gamma), time (theta), volatility (vega) and rates (rho)." },
  { id: "delta", term: "Delta (Δ)", category: "Greeks", definition: "Change in option price per $1 move in the underlying. Calls 0 to 1, puts −1 to 0. Also a rough probability of finishing ITM." },
  { id: "gamma", term: "Gamma (Γ)", category: "Greeks", definition: "Change in delta per $1 move in the underlying. Highest at the money near expiration." },
  { id: "theta", term: "Theta (Θ)", category: "Greeks", definition: "Change in option price per day from the passage of time. Negative for long options and accelerates near expiration." },
  { id: "vega", term: "Vega (ν)", category: "Greeks", definition: "Change in option price per 1 percentage-point change in implied volatility." },
  { id: "rho", term: "Rho (ρ)", category: "Greeks", definition: "Change in option price per 1 percentage-point change in interest rates. Small for short-dated options." },
  { id: "black-scholes", term: "Black-Scholes model", category: "Greeks", definition: "The classic option-pricing formula using price, strike, time, volatility, rates and dividends. The basis for most quoted Greeks." },
  { id: "implied-volatility", term: "Implied volatility (IV)", category: "Volatility", definition: "The volatility implied by an option's market price; the market's forecast of future movement, annualized." },
  { id: "historical-volatility", term: "Historical volatility", category: "Volatility", definition: "How much the underlying actually moved in the past, annualized. Compare it with IV to judge whether options are rich or cheap." },
  { id: "expected-move", term: "Expected move", category: "Volatility", definition: "Approximate one-standard-deviation range: price × IV × √(days ÷ 365)." },
  { id: "vix", term: "VIX", category: "Volatility", definition: "Cboe Volatility Index: 30-day implied volatility of S&P 500 index options. Often called the market's \"fear gauge\"." },
  { id: "iv-crush", term: "IV crush", category: "Volatility", definition: "A sharp drop in implied volatility after a scheduled event that cuts option prices even if the underlying moves." },
  { id: "buy-to-open", term: "Buy to open (BTO)", category: "Orders", definition: "An order that opens a new long option position." },
  { id: "sell-to-close", term: "Sell to close (STC)", category: "Orders", definition: "An order that exits an option you own." },
  { id: "market-order", term: "Market order", category: "Orders", definition: "Executes immediately at the best available price: buys at the ask, sells at the bid." },
  { id: "limit-order", term: "Limit order", category: "Orders", definition: "Executes only at your price or better. May not fill." },
  { id: "slippage", term: "Slippage", category: "Orders", definition: "The difference between the price you expected and the price you got, usually from crossing the spread or fast markets." },
  { id: "commission", term: "Commission", category: "Orders", definition: "Broker fee per contract, commonly about $0.65 per contract each way." },
  { id: "market-hours", term: "Market hours", category: "Orders", definition: "SPY options trade 9:30 AM–4:00 PM ET on market days, closing at 1:00 PM ET on early-close days." },
  { id: "exercise", term: "Exercise", category: "Expiration", definition: "Using the option's right: buying (call) or selling (put) 100 shares at the strike." },
  { id: "assignment", term: "Assignment", category: "Expiration", definition: "When an option seller is required to fulfill the contract after a holder exercises." },
  { id: "auto-exercise", term: "Automatic exercise", category: "Expiration", definition: "The OCC exercises equity options $0.01 or more in the money at expiration unless the holder instructs otherwise." },
  { id: "settlement", term: "Settlement", category: "Expiration", definition: "How an option is fulfilled. SPY options settle in shares (physical); SPX options settle in cash. This simulator settles expiring options to cash at intrinsic value." },
  { id: "settlement-cycle", term: "T+1 settlement", category: "Risk & Account", definition: "Option trades settle one business day after the trade date." },
  { id: "good-faith-violation", term: "Good-faith violation", category: "Risk & Account", definition: "In a cash account, buying with unsettled funds and selling before those funds settle." },
  { id: "pdt", term: "Pattern day trader (PDT)", category: "Risk & Account", definition: "A FINRA margin-account rule that for years required $25,000 equity to make 4+ day trades in 5 business days. FINRA has proposed replacing it; check your broker's current policy." },
  { id: "cash-account", term: "Cash account", category: "Risk & Account", definition: "An account where every purchase is paid in full with settled cash. No margin and no naked option selling." },
  { id: "equity", term: "Equity", category: "Risk & Account", definition: "Cash plus the current market value of open positions." },
  { id: "mark", term: "Mark", category: "Risk & Account", definition: "The price used to value a position. Brokers usually mark options at the bid/ask midpoint." },
  { id: "drawdown", term: "Drawdown", category: "Risk & Account", definition: "Decline in equity from its peak, in dollars or percent." },
  { id: "position-sizing", term: "Position sizing", category: "Risk & Account", definition: "Choosing how many contracts to trade so that a loss stays within your risk limits." },
  { id: "risk-per-trade", term: "Risk per trade", category: "Risk & Account", definition: "The most you're willing to lose on a single trade, often a small percentage of equity or of your loss buffer." },
  { id: "trading-plan", term: "Trading plan", category: "Risk & Account", definition: "A written thesis, entry, profit target, exit and time stop decided before entering a trade." },
  { id: "leverage", term: "Leverage", category: "Risk & Account", definition: "Controlling a larger exposure with less capital. Options move more in percentage terms than the underlying, both up and down." },
  { id: "real-time-data", term: "Real-time data", category: "Risk & Account", definition: "Quotes delivered as they happen. Real-time options data (OPRA) is licensed and usually comes through a broker API." },
  { id: "delayed-data", term: "Delayed data", category: "Risk & Account", definition: "Quotes published after a delay, typically 15 minutes for free US options data." },
];

export const GLOSSARY_BY_ID: Record<string, GlossaryTerm> = Object.fromEntries(
  GLOSSARY.map((term) => [term.id, term]),
);
