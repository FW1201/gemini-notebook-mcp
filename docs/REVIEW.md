# Review preparation

## Development acceptance

1. Use an operator-owned Google Cloud project and a Google OAuth web client. Enable the Notebook API, add the Notebook scope, configure personal test users, and register the exact ChatGPT callback. Keep credentials in the connection UI.
2. Install the development candidate in ChatGPT and trigger a tool. Verify OAuth discovery or the provided-client flow, token refresh and tool discovery. If direct connection fails, capture only the sanitized failure. A conforming hosted MCP implementation may be necessary if the failure concerns OAuth discovery, Google protocol handling, or project routing.
3. Create two personal test accounts with sample notebooks. With account A, list notebooks, create Review Sandbox, add a URL, add Markdown and check source status. Use account B to confirm account A's private notebook is unavailable. Revoke access and verify the affected account has to reconnect. Run the remaining cases in plugin.json, including duplicate names and unsupported requests.
4. Record successful flows with the intended ChatGPT client and sample data. Use a dedicated reviewer account that signs in without inaccessible verification. Add a verified recording URL and reviewer sign-in details in the appropriate places.

## Directory submission

Use Plugin Creator's submission workflow and the OpenAI developer portal. Choose a verified publisher, publish the actual privacy policy and terms, confirm country availability, then scan tools under With MCP. All included test cases are planned expectations until exercised in the live connection. No credentials belong in the repository or ZIP. OpenAI reviews third-party connectors under its public directory guidelines.

- [Google MCP setup](https://developers.google.com/notebook/docs/mcp)
- [OpenAI authentication requirements](https://developers.openai.com/plugins/build/auth)
- [OpenAI plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines#35-third-party-content-and-integrations)
- [OpenAI submission process](https://developers.openai.com/plugins/deploy/submission)
