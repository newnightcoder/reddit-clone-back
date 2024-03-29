import createBrowserless from "browserless";
import getHTML from "html-get";
import createMetascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperLogo from "metascraper-logo";
import metascraperLogoFavicon from "metascraper-logo-favicon";
import metascraperPublisher from "metascraper-publisher";
import metascraperTitle from "metascraper-title";
import metascraperTitleUrl from "metascraper-url";

// Spawn Chromium process once
const browserlessFactory = createBrowserless();

// Kill the process when Node.js exit
process.on("exit", () => {
  console.log("closing resources!");
  browserlessFactory.close();
});

const getContent = async (targetUrl) => {
  // create a browser context inside Chromium process
  const browserContext = browserlessFactory.createContext();
  const getBrowserless = () => browserContext;
  const result = await getHTML(targetUrl, { getBrowserless });
  // close the browser context after it's used
  await getBrowserless((browser) => browser.destroyContext());
  return result;
};

const metascraper = createMetascraper([
  metascraperTitle(),
  metascraperImage(),
  metascraperDescription(),
  metascraperPublisher(),
  metascraperLogo(),
  metascraperLogoFavicon(),
  metascraperTitleUrl(),
]);

export const scrape = async (targetUrl) => {
  const checkMetadata = (data) => {
    for (const property in data) {
      if (
        data[property] === null ||
        data[property].length === 0 ||
        data[property].includes("href")
      ) {
        data[property] = null;
      } else {
        data[property] = data[property];
      }
    }
    return data;
  };

  try {
    const data = await getContent(targetUrl);
    const metadata = await metascraper(data);
    if (metadata) {
      const article = checkMetadata(metadata);
      return { article };
    }
  } catch (err) {
    console.log(err);
    return { error: "scrape" };
  }
};
