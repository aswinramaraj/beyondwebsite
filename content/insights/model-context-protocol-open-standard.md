---
title: MCP, the plug standard for AI agents, now belongs to everyone
subtitle: The Model Context Protocol moved to a neutral foundation under the Linux Foundation. What MCP is, why it matters, and how to use it without opening security holes.
date: 2026-10-30
topic: AI
cover: /img/insight-mcp.webp
coverAlt: An assistant connected through a central MCP hub to Files, Calendar and Database tool cards
---

An AI model on its own can only talk. To be useful at work it needs to *do* things: read a file, check a calendar, query a database, open a ticket. For a long time every AI product connected to every tool in its own way, which meant endless one-off integrations.

The **Model Context Protocol (MCP)** set out to fix that, and in the past year it has become the closest thing the industry has to a standard plug for AI tools.

## From one company's project to shared infrastructure

Anthropic introduced MCP as an open protocol in late 2024. Adoption spread quickly across AI apps, coding tools and developer platforms. On **9 December 2025**, MCP was donated to the new **Agentic AI Foundation**, under the Linux Foundation, which was co-founded by Anthropic, Block and OpenAI, with support from Google, Microsoft, AWS, Cloudflare and Bloomberg.

That move matters more than it might seem. Companies are much more willing to build on a standard that no single competitor controls. Neutral governance is what turned HTTP, Linux and Kubernetes into foundations everyone builds on. MCP's 2026 roadmap focuses on exactly what large organisations ask for: enterprise readiness, including authorisation, security and governance.

## How MCP works

MCP uses a simple client–server model.

- An **MCP server** wraps a tool or data source, such as a file system, a calendar, a CRM or an internal API, and describes what it offers in a standard format.
- An **MCP client** lives inside an AI application, such as a chat assistant, a coding tool or an agent framework. It discovers what servers offer and passes those capabilities to the model.

Servers can offer three main kinds of thing:

1. **Tools**: actions the model can call, like `create_ticket` or `search_orders`, each with a described set of inputs.
2. **Resources**: data the application can read, like files, records or documents.
3. **Prompts**: reusable templates for common tasks.

Servers can run locally on your machine or remotely over HTTP, with standard authorisation for remote access. The big win is reuse: write one MCP server for your system, and any MCP-compatible assistant or agent can use it.

## Why builders care

- **Build once, connect everywhere.** One integration works across many AI clients instead of one per vendor.
- **Swap models freely.** Because tools sit behind a standard interface, changing the model or the app doesn't mean rewriting integrations.
- **Clear boundaries.** Each server exposes a defined set of actions, which is easier to review and secure than a model with broad API access.

## The security side

Every new standard that gains adoption quickly attracts attackers, and MCP is no exception. Security researchers reported **more than 30 MCP-related vulnerabilities (CVEs) in January and February 2026 alone**, mostly in individual server implementations rather than the protocol itself.

The main risks to understand:

- **Prompt injection through data.** A document, web page or email that a tool returns can contain hidden instructions. If the model treats them as commands, it may take actions the user never asked for.
- **Tool poisoning.** A malicious or compromised server can describe its tools misleadingly, or change their behaviour after installation.
- **Over-broad permissions.** A server with full access to a mailbox or a production database turns any mistake into a serious incident.
- **Token handling.** Servers that store or pass on credentials carelessly can leak access to other systems.
- **Untrusted code.** Installing a random local server is running someone else's code on your machine.

## A safe-use checklist

If you are building or adopting MCP servers, a few rules go a long way:

1. **Install servers only from sources you trust**, and pin their versions.
2. **Grant the least access possible.** Prefer read-only tools; scope write tools narrowly.
3. **Require confirmation for sensitive actions** like sending, deleting, paying or changing permissions.
4. **Treat tool output as data, never as instructions.** Design your client and prompts with that boundary in mind.
5. **Use proper authorisation for remote servers**, with short-lived, scoped tokens.
6. **Log every tool call**, its inputs and its result, so you can audit what an agent did.
7. **Keep servers patched**, just like any other dependency.

## The takeaway

MCP solved a real and boring problem, connecting AI to the tools people already use, and that is why it spread so quickly. Moving to a neutral foundation makes it a safer long-term bet. For builders, the opportunity is to expose your product or internal systems through well-designed, tightly scoped MCP servers. The responsibility is to treat every one of them as the security boundary it is.

## Sources

- [MCP joins the Agentic AI Foundation](https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/) – Model Context Protocol blog
- [MCP joins the Linux Foundation: what this means for developers](https://github.blog/open-source/mcp-joins-the-linux-foundation-what-this-means-for-developers-building-the-next-era-of-ai-tools-and-agents/) – GitHub Blog
- [The state of MCP: everything that changed in H1 2026](https://serpapi.com/blog/the-state-of-mcp-everything-that-changed-in-h1-2026/) – SerpApi
