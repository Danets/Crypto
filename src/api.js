const API_KEY =
  "f17d6703ffd5f48ffbe5b7b168794e37c959463811af64e1838e7f42c4d67581";

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

function sendMessage(message) {
  const messageSerialize = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(messageSerialize);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(messageSerialize);
    },
    { once: true }
  );
}

function subsTickerViaWS(ticker) {
  sendMessage({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubsTickerViaWS(ticker) {
  sendMessage({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

export const subsTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) ?? [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subsTickerViaWS(ticker);
};

export const unsubsTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubsTickerViaWS(ticker);
};

window.tickers = tickersHandlers;

// setInterval(fetchTickers, 5000);
