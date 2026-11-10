# AI referral draft assistant

AI suggestions are off until the user enables **Automatically use AI suggestions for this referral** in the draft panel. After enabling, opening a referral draft or changing its format automatically requests suggested topics and a tailored draft. The preference is stored as a local on/off setting; the app sends no AI request while it is off. The generated text remains editable and is never sent to an office.

## Configure a preview

1. Create an OpenAI API key in the OpenAI Platform. API usage is billed separately from ChatGPT.
2. In Vercel, add `OPENAI_API_KEY` as an encrypted environment variable for the Preview environment and branch `v0.4.6-ai-draft-assist`. Do not add it as a `VITE_*` variable or commit it.
3. Ensure the preview serverless function can read `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The API route uses them to verify that the request belongs to a signed-in user.
4. Redeploy the preview branch. In the app, sign in, open a referral draft, and enable automatic AI suggestions once. Later drafts on that browser will generate automatically.

The API route `/api/script-assist` sends the selected referral's specialty, office names, and logged updates (source, dates, titles, details, and recorded outcomes), plus the current question, format, and language. It does not send the editable draft or a separate patient-name field. The route checks sign-in, limits the history and input sizes, and asks the model not to infer status or add facts. The OpenAI key stays on the server. Disable the checkbox at any time to stop AI requests from that browser.

## Data and safety

Turning on AI transmits the listed referral context to OpenAI to produce suggestions and draft text. Remove names, birth dates, record or member numbers, diagnoses, and other identifying health details from updates first. Do not use real patient information unless the organization has approved the service and its data arrangements. OpenAI API data handling and retention follow the account's API settings and applicable terms. The server does not persist the referral context.

The UI now reports safe, actionable error details (for example, invalid key, missing API billing/quota, or unavailable model) without returning the key or raw provider error. If the key is missing, the original editable template remains available.
