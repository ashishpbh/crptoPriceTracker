# Interview Q&A — simple words you can say out loud

Read this like a script. Prefer short sentences. If a word feels fancy, we explain it in normal English.

Also see: [ARCHITECTURE.md](./ARCHITECTURE.md) · [README.md](./README.md)

---

## Tiny dictionary (say these in plain English)

| Fancy word | Say this instead |
| --- | --- |
| WebSocket / wire | the live connection to the server |
| Subscribe | tell the server “send me updates for this” |
| Unsubscribe | tell the server “stop sending this” |
| Ref-count | how many screens are using the same update |
| Buffer | a waiting box — messages sit here before the UI |
| Store / Zustand | the app’s shared memory for prices |
| Throttle | “update the screen at most this often” |
| rAF / requestAnimationFrame | “update with the next screen draw” (~60 times/sec) |
| Reconnect / backoff | if connection drops, wait longer each try, then try again |
| Grace period | wait a tiny bit before cancelling, in case we come right back |

---

## Q0 — The big walkthrough (practice this first)

> **Interviewer:** “Take one price update from the server to the screen. Where do you slow it down or skip updates — and why is that OK?”

### In simple words
The server can shout prices very fast. We do **not** redraw the whole app for every shout. We catch messages in a waiting box, keep the newest price, and update the screen on a calm schedule.

### What happens, step by step (ETH price)

1. Server sends a new ETH price.  
2. Connection code reads the message.  
3. Message goes into the **waiting box** (`marketBuffer`).  
4. If more ETH prices arrive soon, we keep only the **newest**. Old ones in that window are dropped on purpose.  
5. After ~300ms (for list prices), we apply that newest price into app memory (the store).  
6. Only the ETH row on screen redraws.  
7. You see the new number.

### Where we slow down or skip (and why OK)

| Place | What we do | Why it’s OK for a price list |
| --- | --- | --- |
| Waiting box | Keep newest price only | User cares about *now*, not every tiny step |
| 300ms calm rule | Don’t refresh list prices more often | List looks less jumpy |
| Next screen draw | Apply update with the display refresh | Smoother, less waste |
| “Same looking price?” | If number didn’t change, skip redraw | No useless work |
| One row at a time | Only ETH row updates | Rest of list stays still |

### What you say
> “Server speed and screen speed are separate on purpose. For the list I show the newest price every ~300ms. For the order book and trade list on detail, I update every screen frame so it feels live.”

---

## Q1 — Why a waiting box at all?

> **“Why not put every server message straight into app memory?”**

### What they want to know
Do you know that “message arrived” is not the same as “screen must update”?

### Simple picture
- Server = postman bringing letters every few milliseconds  
- Waiting box = mailbox  
- App memory / screen = bringing letters into the house  

You don’t run to the door for every letter.

### What we built
Messages go: **connection → waiting box → later → app memory → screen**.

### Why we chose this
- Practice server can send prices **very** fast (about 10–50ms)  
- Markets screen shows **many** coins  
- Fast redraws make the list feel nervous and burn the phone’s work  
- One waiting box lets us treat “list prices” and “detail book” differently  

### Good side / bad side

| Good | Bad |
| --- | --- |
| Fewer screen updates | You don’t see every tiny price step |
| App stays calmer under load | One extra step in the design |
| Easy to change “how often UI updates” | Slight delay before you see a new price |

### Other options we could have used
1. **Update memory on every message** — easiest; gets messy when server is fast  
2. **Slow down inside each row** — copy-paste logic; easy to mess up  
3. **Only “smart React” tricks** — help a bit, don’t stop the flood into memory  
4. **Heavy background processing** — for huge apps; too much for this homework  

### Extra that sounds senior
> “For a price *list*, newest-in-a-window is correct. For a *chart* that must record every trade, I would not overwrite — I’d store or aggregate. Same waiting box idea, different rule.”

---

## Q2 — Why calm list prices but live order book?

> **“Why two different update speeds? Isn’t that inconsistent?”**

### What they want to know
Was this an accident, or a product choice?

### Simple picture
- **Markets list** = glance at many coins → should feel steady  
- **Detail order book / trades** = you are watching closely → should feel alive  

### What we built

| Data | Rule | Feel |
| --- | --- | --- |
| List price (ticker) | At most about every 300ms, then with screen draw | Calm |
| Order book / trades | Newest within one screen frame, then draw | Live |

### Why we chose this
- Real trading apps feel this way  
- Order book is heavy; user still expects it to move  
- New trades should “pop” — waiting 300ms makes the tape feel late  

### Good side / bad side

| Good | Bad |
| --- | --- |
| Right feel per screen | Two rules to explain |
| Protects the list | Detail still works harder |
| Easy to tune (one number: 300ms) | Under “extreme” server speed, detail can still struggle |

### Other options
1. **Same slow rule for everything** — simpler; detail feels laggy  
2. **Slow down automatically when the phone is busy** — smart; more code  
3. **Only subscribe to coins you can see on screen** — best for hundreds of coins  
4. **Slow the order book a bit in stress mode** — good “if I had more time” answer  

### What you say
> “It’s not inconsistent — it’s intentional. List prefers calm. Detail prefers live. Same pipe, different rule.”

### Extra that sounds senior
> “I separate *when* I’m allowed to publish (the 300ms rule) from *how* I publish (with the next screen draw).”

---

## Q3 — Markets still listening while you’re on detail?

> **“You keep all list prices subscribed on the detail screen. Is that a bug / memory leak?”**

### What they want to know
Do you understand how phone navigation keeps the previous screen around?

### Simple picture
Think of two rooms. You walk into Detail, but Markets room’s light is often still on underneath. So Markets is still saying “send me all tickers.”

Detail adds: “also send ETH order book and ETH trades.”

### What we built
- **Feature for 6 coins**, not a leak  
- We count how many screens want the same data  
- Opening detail for ETH does **not** resend all tickers  
- Server log that still lists all tickers = “everything this phone is listening to right now,” not “we subscribed all over again”

### Why we chose this
- Only 6 symbols in the homework  
- Going back to Markets feels instant and still live  
- Counting users of each feed already handles overlap  

### Good side / bad side

| Good | Bad |
| --- | --- |
| Back button feels great | Phone still receives list prices off-screen |
| Simple: screen open = listen | Bad idea if you had 500 coins |
| Matches normal React Navigation | Uses a bit more network |

### Other options
1. **Listen only while the screen is focused** — cleaner; more subscribe/cancel when navigating  
2. **Fully unmount Markets when you open detail** — saves work; back may feel colder  
3. **A central “who needs what” manager** — best at large scale; more design  
4. **Pause updates for coins not on screen** — middle ground  

### What you say
> “Not a leak — retained interest. Markets is still mounted under the stack. Leak would mean we never clean up. When I leave detail, order book and trades stop after a short grace; we also cap how many trades we keep.”

### Extra that sounds senior
> “At hundreds of symbols I’d subscribe from what’s visible on screen, not the whole universe.”

---

## Q4 — One shared connection for the whole app?

> **“Why not give each screen its own connection?”**

### What they want to know
Can you share one resource cleanly?

### Simple picture
One phone line to the exchange. Many rooms can listen on that line. You don’t install a new phone line per room.

### What we built
- One live connection for the app  
- One door into it (`marketRepository`)  
- One shared memory for market data  
- Screens only ask hooks: “watch this” / “stop watching”

### Why we chose this
- Server thinks in “one client + its listen list”  
- If connection drops, we repair **once** and ask again for everything we still need  
- Two screens wanting ETH price = still **one** listen on the wire  

### Good side / bad side

| Good | Bad |
| --- | --- |
| One reconnect story | Shared thing is global (tests need care) |
| Less battery than many connections | Harder if you later need two accounts at once |
| Clear rule: UI never opens the connection | Lives for the whole app session |

### Other options
1. **New connection per screen** — isolated; wasteful; reconnect chaos  
2. **Pass the connection from the app root** — same idea; easier testing  
3. **Big data libraries** — fine for normal HTTP; you still need one live feed manager for this  

### What you say
> “One connection, many listeners. Screens declare interest; the transport merges that into one listen list.”

---

## Q5 — Why wait 100ms before cancelling a listen?

> **“Is that only to fix React Strict Mode in development?”**

### What they want to know
Do you understand mount/unmount noise vs real “user left”?

### Simple picture
In development, React may open a screen, close it, open it again very fast — on purpose — to catch bugs.  
Without a short wait, we tell the server: start → stop → start. Wasteful.

So when the **last** screen stops wanting data, we wait **100ms**. If someone wants it again quickly, we cancel the stop.

### What we built
- Count users of each feed  
- Only talk to the server when count goes 0→1 (start) or really stays 0 (stop)  
- 100ms soft wait on the final stop  

### Why we chose this
- Flapping the server is worse than 100ms of “maybe still listening”  
- Hooks stay normal: start on open, cleanup on close  
- Also helps when a user backs out and jumps back in quickly  

### Good side / bad side

| Good | Bad |
| --- | --- |
| Calm server traffic in dev | Up to 100ms before a real stop |
| Simple screen code | Briefly still receiving after leave |
| Helps fast navigation too | People may think cleanup is “fake” — it isn’t |

### Other options
1. **No wait** — pure; noisier in development  
2. **Manage listens outside React screens** — avoids the double open/close; more moving parts  
3. **Longer wait** — smoother navigation; slower real cancel  

### What you say
> “Cleanup still runs. The wait only softens the *last* cancel. It’s a transport courtesy, not a missing cleanup.”

### Extra that sounds senior
> “Strict Mode double-mount is a flashlight on bad cleanup. We still return cleanups; grace only avoids screaming at the server.”

---

## Q6 — Why “generation” on reconnect?

> **“What’s wrong with flipping a boolean when forcing reconnect?”**

### What they want to know
Do you know closes can finish **later**, not instantly?

### Simple picture
You hang up an old call and dial a new one.  
If the old call’s “call ended” beep arrives late, you must not treat it as “the new call died — dial again.”

So each connection gets a generation number (like a version). Old beeps with an old number are ignored.

### What we built
- When forcing reconnect (tap retry / app comes back):  
  - retire old connection (bump version, clear handlers, close)  
  - open a new one  
- Auto-retry still waits longer each time (`1s, 2s, 4s…` capped) using a small shared helper  

### Why we chose this
- Users can tap “retry” — that path must be safe  
- Late “closed” events are normal on phones  
- Same idea as: ignore a late network response when a newer request already started  

### Good side / bad side

| Good | Bad |
| --- | --- |
| No “ghost” second reconnect | One more idea to explain |
| Safe tap-retry | Must bump version whenever we retire a socket |
| Works with auto-wait + manual retry | — |

### Other options
1. **Keep “ignore close” true until that exact close finishes** — works; easy to get stuck  
2. **Never force-close; only wait** — safer; slower tap-retry  
3. **Use a reconnect library** — fine; less of your own story  

### What you say
> “Close is async. Generation means stale close events can’t start a fake reconnect after we already moved on.”

---

## Q7 — What breaks if the server goes crazy / 500 coins?

> **“Extreme mode. Hundreds of symbols. What fails first?”**

### What they want to know
Humility + next design step.

### Simple picture
Today the house has 6 doors. The design is for that.  
If you suddenly have 500 doors and the postman sprints, the hallway (phone CPU) gets crowded first.

### Honest order of pain
1. Phone main thread doing too much work  
2. Detail order book / trades updating every frame under extreme speed  
3. Listening to hundreds of coins you can’t even see  
4. Memory — less likely first, because we limit trades and book depth  

### Why today’s design is still right for the homework
- The brief gives a small fixed coin list  
- They care about clean start/stop and smooth normal use  
- We already say in README what we’d add with more time (stress controls)  

### Ways to scale (say these)

| Idea | Helps | Cost |
| --- | --- | --- |
| Only listen to coins on screen | Huge | More logic |
| Slow list prices more when busy | Calm UI | Slightly older prices |
| Slow order book a bit in stress mode | Detail CPU | Less “instant” |
| Heavier native/background parsing | More headroom | Big project |

### What you say
> “I’d keep the waiting box. Before micro-optimizing JSON, I’d shrink *how much we listen to* — visible coins first.”

### Extra that sounds senior
> “There are three speeds: how fast messages arrive, how often we write memory, how often we draw. Tune the right dial.”

---

## Q8 — Why both a red error screen and a connection badge?

> **“Isn’t that two systems for errors?”**

### What they want to know
Can you separate different kinds of failure?

### Simple picture
- **Connection died** → show “Reconnecting”, wait, let user tap retry  
- **Screen code crashed** → show “Something went wrong”, button to try the screen again  

Different problems. Different tools.

### What we built
- Connection problems → status badge / footer + auto wait + tap retry + resume when app opens  
- Screen crash → error boundary with Try again  

### Why we chose this
- Homework asks for disconnect handling  
- A white crashed screen is a different embarrassment  
- Easy story in an interview  

### Good side / bad side

| Good | Bad |
| --- | --- |
| Clear for users and interviewers | Two small UIs |
| Tap retry is something users can do | Crash screen can’t fix a dead server by itself |
| Crash screen stops a hard fail | It does **not** catch every kind of JS mistake (for example some async/event cases) |

### Other options
1. **Only a toast** — weak reconnect story  
2. **Only crash screen** — useless when Wi‑Fi dies  
3. **Crash screen per page** — finer; more wrapping  
4. **Crash reporting service** — production; still need these UX paths  

### What you say
> “Error boundary is for UI tree failures. Badge retry is for the live connection. React’s crash fence does not replace socket handling.”

### Extra that sounds senior (often surprises people)
> “A React error boundary does not catch errors inside WebSocket callbacks. Those must be handled in the connection layer.”

---

## 10 lines to memorize

1. Server speed and screen speed are separate on purpose.  
2. Waiting box keeps the newest price; list updates about every 300ms.  
3. Order book and trades update with the screen draw so detail feels live.  
4. Calm list / live detail is a product choice, not an accident.  
5. Markets under detail is “still listening,” not a memory leak.  
6. We count listeners so two screens share one server subscription.  
7. 100ms grace only softens the last cancel.  
8. Reconnect generation ignores late “closed” from an old socket.  
9. At scale, listen to less before you optimize parsing.  
10. Crash screen ≠ reconnect badge — two different failures.

---

## 60-second pitch (plain English)

> “Screens never open the live connection themselves. They say what they need through hooks. One shared connection merges that with a listener count. Fast messages land in a waiting box so we don’t update app memory on every tick — list prices stay calm, order book and trades stay live on the detail screen. If the connection drops, we wait longer each try, allow tap-to-retry, and ignore late close events from old sockets. If the UI crashes, a separate safety screen lets you try again. That’s the whole system.”
