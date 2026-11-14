# Portfolio analytics

The portfolio sends events to a Cloudflare Worker on the free plan. The Worker adds the UTC timestamp and approximate country and region, then appends a row to the private Google Sheet. Page URLs are reduced to their paths and referrers to their hostnames. Device, browser and OS are estimates. The device model is included only when the browser supplies one.

## Set up the Worker

1. In Cloudflare, open **Workers & Pages** and choose **Create application**. If you see **Start with Hello World!**, choose it and name the Worker `portfolio-analytics`. Keep the `workers.dev` address Cloudflare assigns. [Cloudflare dashboard guide](https://developers.cloudflare.com/d1/get-started/#1-create-a-worker)
2. Open the Worker, choose **Edit code**, and replace the starter code with the contents of `worker.js` in this folder. Deploy the code.
3. In **Settings → Variables and Secrets**, add the three settings below and deploy. [Cloudflare secrets guide](https://developers.cloudflare.com/workers/configuration/secrets/#via-the-dashboard)

| Name | Type | Value |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | Text | `https://opeyemiadetifa.com` for the live site. Add `http://127.0.0.1:5173` for local testing. Separate multiple origins with commas and omit trailing slashes. |
| `GOOGLE_SHEET_ID` | Text | The part of the test Sheet URL between `/d/` and `/edit`. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Secret | The contents of the Google service account key JSON. Paste it directly into Cloudflare and keep the file outside the portfolio folder. |

Enable the Google Sheets API in the service account's Google Cloud project and share the Sheet with the service account as **Editor**. If you still need the JSON key, open the service account in Google Cloud and go to **Keys → Add key → Create new key → JSON**. Keep the tab named `Events` and the headers in this order. [Google service account key guide](https://cloud.google.com/iam/docs/keys-create-delete#creating)

`Timestamp`, `Event`, `Page`, `Referring site`, `Country`, `Region`, `Device type`, `Browser`, `Operating system`, `Device model`

## Test before activating

1. In the portfolio folder, create `.env.development.local` with the Worker address and `/events` path. This file applies only to local development and is ignored by Git. The endpoint is public. The Google credential belongs in the Cloudflare secret only.

   ```dotenv
   VITE_ANALYTICS_ENDPOINT=https://portfolio-analytics.YOUR-SUBDOMAIN.workers.dev/events
   ```

2. Restart the dev server with `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` and open `http://127.0.0.1:5173`. From the homepage, open a case study, then click **Contact**.
3. In the Sheet, check for `page_view` for `/`, `case_study_open` for the case study, `contact_click` with the source page, and `page_view` for `/contact-me.html`. In the browser's Network tab, an `/events` response of `204` means the Worker wrote the row. A `502` response reports a failed Google request when its HTTP status is available.

## Live site

GitHub Pages serves the source JavaScript directly. The client uses the public Worker URL in `client.js` on `https://opeyemiadetifa.com`. Add that origin to the Worker's `ALLOWED_ORIGINS` to accept events. Other origins, including local previews, need `VITE_ANALYTICS_ENDPOINT` to turn on the client.
