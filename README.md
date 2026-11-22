# Gemini Notebook MCP

Notebook Source Desk is an independent plugin development package for Google's official [Gemini Notebook MCP](https://developers.google.com/notebook/docs/mcp). It supports listing and creating notebooks, adding URL or Markdown sources, and checking source processing. Google currently requires a personal Google account that has signed in to [Gemini Notebook](https://notebook.google.com) at least once.

**Status:** The portable plugin is packaged for development. Local tests use mocked responses. Live Google authentication in ChatGPT and public directory review are pending.

## 本機驗證

需要 Node.js 22+ 與 Google Cloud CLI。選用已啟用 Gemini Notebook API 的 Google Cloud 專案，先用唯讀權限驗證 REST。命令只輸出成功狀態與筆記本數量，不列印 token 或筆記本名稱。

```sh
gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/notebook.readonly
node scripts/probe.mjs rest YOUR_GOOGLE_CLOUD_PROJECT_ID
```

官方 MCP 指南使用讀寫 scope。以下探測只列出工具，不會建立筆記本或來源。

```sh
gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/notebook
node scripts/probe.mjs mcp YOUR_GOOGLE_CLOUD_PROJECT_ID
node --test scripts/probe.test.mjs
```

## ChatGPT 開發連線

Upload the portable plugin only as a development candidate after configuring your own Google OAuth web client. Enable `notebook.googleapis.com` in the client's project, configure the consent screen, register the exact redirect URI shown by the ChatGPT connection setup, and enter the client ID and secret through that setup. The source package intentionally contains no client credentials. The REST probe uses a project header for ADC. Verify separately that the direct ChatGPT connection works with its production OAuth client and that tool scanning succeeds.

See [review and verification](docs/REVIEW.md) for the live tests and review inputs. Use [GitHub Issues](https://github.com/FW1201/gemini-notebook-mcp/issues) for reproducible reports using sample data.
