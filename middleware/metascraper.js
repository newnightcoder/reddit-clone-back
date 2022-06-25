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
  console.log("URL!!!", targetUrl);

  try {
    const data = await getContent(targetUrl);
    const metadata = await metascraper(data);
    if (metadata) {
      console.log("ARTICLE METADATA:", metadata);
      return { article: metadata };
    }
  } catch (err) {
    console.log(err);
    return { error: "scrape" };
  }
  // finally {
  //   process.exit();
  // }
};

// export const scrape = async (targetUrl) => {
//   try {
//     const { body: html, url } = await got(targetUrl, {
//       headers: {
//         accept:
//           "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
//         "accept-encoding": "gzip, deflate, br",
//         "accept-language":
//           "en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3",
//         "cache-control": "max-age=0",
//         "upgrade-insecure-requests": "1",
//         "user-agent":
//           "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
//       },
//     });
//     const metadata = await metascraper({ html, url });
//     console.log("ARTICLE METADATA:", metadata);
//     return { article: metadata };
//   } catch (err) {
//     console.log(err);
//     return { error: "scrape" };
//   }
// };
