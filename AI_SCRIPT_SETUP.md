# AI draft assist setup

This feature is optional and only runs when a signed-in user presses **Improve with AI**. It sends the current draft, format, and language to OpenAI's API for a rewrite. The app does not automatically send or save the result; the user can edit and review it.

## Configure a preview

1. Create an OpenAI API key in the OpenAI Platform. API usage is billed separately from ChatGPT.
2. In Vercel, add `OPENAI_API_KEY` as an encrypted environment variable for the preview branch `v0.4.6-ai-draft-assist`. Do not add it as a `VITE_*` variable and do not commit it.
3. Ensure the preview serverless function can read the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values. The API route uses these to verify that the request belongs to a signed-in user.
4. Redeploy the preview branch, sign in, open a draft, and click **Improve with AI**.

The API route is `/api/script-assist`. It enforces sign-in, accepts only the three draft formats and five app languages, limits input to 5,000 characters, and asks the model to preserve meaning without inventing facts. The OpenAI key stays on the server.

## Data and safety

The user-facing app warns that the draft is sent to OpenAI and asks users to remove names, birth dates, record or member numbers, diagnosis details, and other identifying health information first. The server does not persist the draft. OpenAI API data handling and retention are governed by the account's API settings and applicable terms; do not use real patient information unless the organization has approved the service and its data arrangements.

If the OpenAI key or Supabase server environment values are missing, the endpoint returns a setup message and the original editable template remains available.
