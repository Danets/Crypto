const API_KEY =
  "aca3bfad1cd1066f8a7b1f4c4dd69a882765f14429ecf5c2c32968fcf811f223";

const tickersHandlers = new Map();

const fetchTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys(),
    ].join(",")}&tsyms=USDapi_key=${API_KEY}`
  )
    .then((res) => res.json())
    .then((crypto) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(crypto).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};

export const subsTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) ?? [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubsTicker = (ticker) => {
  tickersHandlers.delete(ticker);
};

setInterval(fetchTickers, 5000);
