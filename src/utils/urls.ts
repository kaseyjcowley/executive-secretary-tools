const getSiteUrl = () => {
  switch (process.env.VERCEL_ENV) {
    case "development":
      return "http://localhost:3000";
    default:
      return process.env.VERCEL_URL;
  }
};

export const SITE_URL = getSiteUrl();
