```txt
# Cloudflare Agent Demo

![CI](https://img.shields.io/github/actions/workflow/status/calpaliu/cloudflare-agent-demo/ci.yml?style=flat-square&logo=github)
![License](https://img.shields.io/github/license/calpaliu/cloudflare-agent-demo?style=flat-square)
![Yarn](https://img.shields.io/badge/package%20manager-yarn-2ea44f?logo=yarn&style=flat-square)

🚀 **Cloudflare Agent Demo** is a backend-only AI service built on [Cloudflare Workers](https://developers.cloudflare.com/workers/), designed for scalable, fast, and serverless AI-powered APIs. The frontend is maintained in a separate repository.

---

## ✨ Features
- ⚡ Serverless backend powered by Cloudflare Workers
- 🤖 AI chat agent and tool integration
- 🔌 Easy API extension and customization
- 🛡️ Modern TypeScript codebase
- 📦 Yarn-first dependency management

---

## 🚀 Quickstart

### 1. Clone the repository
```sh
git clone https://github.com/calpaliu/cloudflare-agent-demo.git
cd cloudflare-agent-demo
```

### 2. Install dependencies
```sh
yarn install
```

### 3. Development mode
```sh
yarn dev
```

### 4. Deploy to Cloudflare Workers
```sh
yarn deploy
```

### 5. Generate/synchronize Worker types
[Official documentation](https://developers.cloudflare.com/workers/wrangler/commands/#types)
```sh
yarn cf-typegen
```

---

## ⚙️ Configuration
- All configuration is managed via [wrangler](https://developers.cloudflare.com/workers/wrangler/) and Cloudflare environment bindings.
- To set environment variables, use the `.dev.vars` file for local development or configure them in your Cloudflare dashboard for production.

Example `.dev.vars`:
```env
AI=your-cloudflare-ai-binding
```

---

## 📚 Usage Example

### Hono type binding
When creating a Hono instance, pass `CloudflareBindings` as a generic:
```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

### Calling the API
You can interact with the backend by sending HTTP requests to the deployed Worker endpoint. Example (replace `<your-endpoint>`):
```sh
curl -X POST https://<your-endpoint>/chat -H 'Content-Type: application/json' -d '{"message": "Hello!"}'
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open a pull request or issue.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 📢 Notes
- Please use **Yarn** as the package manager.
- The frontend project is maintained separately.
- PRs and Issues are welcome!

## 📄 Others
- Please use Yarn as the package manager.
- The frontend project is in another repository.
- PRs and Issues are welcome!

