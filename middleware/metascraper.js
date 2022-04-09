import { got } from "got";
import createMetascraper from "metascraper";
import metascraperDescription from "metascraper-description";
import metascraperImage from "metascraper-image";
import metascraperLogo from "metascraper-logo";
import metascraperPublisher from "metascraper-publisher";
import metascraperTitle from "metascraper-title";
import metascraperTitleUrl from "metascraper-url";

const metascraper = createMetascraper([
  metascraperTitle(),
  metascraperImage(),
  metascraperDescription(),
  metascraperPublisher(),
  metascraperLogo(),
  metascraperTitleUrl(),
]);

// const targetUrl = "https://www.youtube.com/watch?v=3HNyXCPDQ7Q";

export const scrape = async (targetUrl) => {
  try {
    const { body: html, url } = await got(targetUrl, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "accept-encoding": "gzip, deflate, br",
        "accept-language":
          "en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3",
        "cache-control": "max-age=0",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
      },
    });
    const metadata = await metascraper({ html, url });
    // console.log(metadata);
    return metadata;
  } catch (error) {
    console.log(error);
  }
};
