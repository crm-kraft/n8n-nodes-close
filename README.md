# n8n-nodes-close — Close CRM Integration for n8n

[![npm version](https://img.shields.io/npm/v/@crm-kraft/n8n-nodes-close.svg)](https://www.npmjs.com/package/@crm-kraft/n8n-nodes-close)
[![npm downloads](https://img.shields.io/npm/dm/@crm-kraft/n8n-nodes-close.svg)](https://www.npmjs.com/package/@crm-kraft/n8n-nodes-close)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Maintained by CRM Kraft](https://img.shields.io/badge/Maintained%20by-CRM%20Kraft-blue)](https://crm-kraft.com)

The most complete and actively maintained **Close CRM** community node for [n8n](https://n8n.io). Supports 87+ operations across 19 resources. Built and maintained by [CRM Kraft](https://crm-kraft.com) — a specialist Close CRM consultancy with 5+ years of experience and 130+ Close CRM implementations.

---

## Features

- **Full Action Node** — Create, read, update, and delete all major Close CRM resources directly from your n8n workflows
- **Comprehensive Trigger Node** — React to any Close CRM event in real time via webhooks, covering every trigger that Zapier supports and more
- **Published Custom Activity Trigger** — A uniquely powerful trigger that fires precisely when a custom activity is published, using Close's server-side filtering for reliability
- **Actively maintained** — Kept up to date with every Close CRM API change by a dedicated engineering team

---

## Installation

In your n8n instance, go to **Settings → Community Nodes → Install** and enter:

```
@crm-kraft/n8n-nodes-close
```

Or install via npm:

```bash
npm install @crm-kraft/n8n-nodes-close
```

---

## Credentials

This node uses **Close CRM API Key** authentication.

1. In Close CRM, go to **Settings → API Keys** and create a new API key
2. In n8n, create a new **Close API** credential and paste your API key

---

## Nodes

### Close CRM (Action Node)

Perform operations on all major Close CRM resources.

| Resource | Operations |
|---|---|
| **Lead** | Create, Get, Get All, Update, Delete, Search |
| **Contact** | Create, Get, Get All, Update, Delete |
| **Opportunity** | Create, Get, Get All, Update, Delete |
| **Task** | Create, Get, Get All, Update, Delete |
| **Note** | Create, Get, Get All, Update, Delete |
| **Call** | Create, Get, Get All, Update, Delete |
| **Email** | Create, Get, Get All, Update, Delete |
| **SMS** | Create, Get, Get All |
| **Pipeline** | Get, Get All |
| **Lead Status** | Get, Get All |
| **Opportunity Status** | Get, Get All |
| **Custom Field** | Get Many |
| **Smart View** | Get Many, Get Leads |
| **Email Template** | Get, Get Many |
| **Integration Link** | Create, Get, Get Many, Update, Delete |
| **Custom Activity** | Create, Get, Get All, Update, Delete |
| **Custom Activity Type** | Get, Get All |
| **Comment** | Create, Get, Get All, Update, Delete |
| **User** | Get, Get All |

---

### Close CRM Trigger (Webhook Node)

Starts a workflow automatically when a selected event occurs in Close CRM. The node automatically registers and deregisters the webhook subscription in Close CRM when the workflow is activated or deactivated.

#### Available Trigger Events

| Category | Events |
|---|---|
| **Lead** | Created, Updated, Deleted, Merged |
| **Contact** | Created, Updated, Deleted |
| **Opportunity** | Created, Updated, Deleted |
| **Task** | Created, Updated, Deleted, Completed |
| **Note** | Created, Updated, Deleted |
| **Call** | Created, Updated, Deleted, Completed |
| **Email** | Created, Updated, Deleted, Sent |
| **SMS** | Created, Updated, Deleted, Sent |
| **Meeting** | Created, Updated, Deleted, Scheduled, Started, Completed, Canceled |
| **Custom Activity** | Created, Updated, Deleted |
| **On Custom Activity Published** ⭐ | Fires when a custom activity is published (created as published or status changed to published) |
| **Lead Status Changed** | — |
| **Opportunity Status Changed** | — |
| **Form Submission Created** | — |
| **Email Unsubscribed / Resubscribed** | — |

#### On Custom Activity Published ⭐

This trigger uses Close CRM's server-side `extra_filter` to fire **only** when a custom activity is genuinely published — either created directly as published, or when a draft activity's status changes to published. It requires you to select a specific **Custom Activity Type** and registers two webhook events in a single subscription:

- `updated` with filter: `status == published AND changed_fields contains "status"`
- `created` with filter: `status == published`

This matches the behaviour of Zapier's "Published Custom Activity" trigger and is the most precise way to detect publishing events in Close CRM.

---

## Example Use Cases

- **Lead Created → Enrich & Notify** — When a new lead is created in Close, enrich it with data from Clearbit and send a Slack notification to the sales team
- **Opportunity Won → Onboarding** — When an opportunity status changes to "Won", automatically create an onboarding task, send a welcome email, and add the contact to a Mailchimp list
- **Published Custom Activity → CRM Update** — When a sales rep publishes a custom activity (e.g. a demo feedback form), automatically update the lead score and trigger a follow-up sequence
- **Task Completed → Invoice** — When a task is marked complete, create an invoice in your billing system

---

## About CRM Kraft

[CRM Kraft](https://crm-kraft.com) is a specialist CRM automation consultancy based in Germany. We have been implementing Close CRM solutions for B2B companies for over 5 years, with more than 130 successful projects delivered. Our team of 11, including full-time programmers, builds and maintains automation infrastructure on top of Close CRM and n8n for clients across Europe and beyond.

We built this node because we use it ourselves — every day, across every client project. That means it is always kept up to date, thoroughly tested in production, and built with a deep understanding of how Close CRM actually works.

**Website:** [https://crm-kraft.com](https://crm-kraft.com)  
**Contact:** justus@crm-kraft.de  
**GitHub:** [https://github.com/crm-kraft/n8n-nodes-close](https://github.com/crm-kraft/n8n-nodes-close)

---

## Contributing

Issues and pull requests are welcome. Please open an issue on GitHub before submitting a pull request for significant changes.

---

## License

[MIT](LICENSE)

---

## Related Packages

Other n8n community nodes maintained by CRM Kraft:

- [`n8n-nodes-calendly`](https://www.npmjs.com/package/n8n-nodes-calendly) — Calendly integration for n8n
- [`n8n-nodes-youcanbookme`](https://www.npmjs.com/package/n8n-nodes-youcanbookme) — YouCanBookMe integration for n8n
- [`n8n-nodes-ablefy`](https://www.npmjs.com/package/n8n-nodes-ablefy) — Ablefy integration for n8n
