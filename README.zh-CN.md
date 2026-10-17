# ShipProof 中文说明

> AI 编程助手说“完成了”，让它拿出证据。

ShipProof 是一个本地运行、与模型无关的 AI 代码验收工具。它执行确定性的检查，记录真实发生的事情，识别常见的验证漏洞，并生成可分享的 HTML 和 JSON 证据报告。

无论代码来自 Codex、Claude Code、Cursor、Cline、Copilot 或人类，ShipProof 都能使用。它不调用大模型、不上传代码，并且没有运行时依赖。

[English](README.md)

## 它解决什么问题

AI 代理可能只运行一个测试就声称“全部通过”，也可能吞掉错误退出码、修改快照迎合错误结果，或者在最后一次测试通过后继续改源码。口头报告不等于证据。

ShipProof 会直接检查仓库：

- 运行项目真实的代码检查、类型检查、测试和构建命令
- 保存命令输出、退出码、耗时和超时记录
- 识别 `|| true` 等隐藏失败的写法
- 检测验证过程中源码、测试或策略文件是否发生变化
- 标记 CI、测试夹具和快照的修改
- 源码改变而测试没有变化时给出提醒
- 生成独立 HTML 报告和机器可读 JSON
- 关键验证失败时阻止 CI 继续通过

## 快速开始

```bash
npx --yes --package=github:xArsenn/ShipProof shipproof init
npx --yes --package=github:xArsenn/ShipProof shipproof verify
```

ShipProof 会自动识别常见的 npm、Python、Rust 和 Go 项目，并创建 `.shipproof.json`。建议检查后把它提交到仓库，让所有开发者和 AI 代理遵守同一份验收标准。

npm 包名已确定为 `shipproof-cli`；首次正式发布到 npm 之前，上面的命令会直接从公开 GitHub 仓库安装。

验证后会生成：

- `shipproof-report.html`：给人阅读和分享的证据报告
- `shipproof-report.json`：供 CI 和其他工具读取的结构化证据

## 三种结论

- `VERIFIED`：必要检查全部通过，没有发现完整性问题。
- `REVIEW`：检查通过，但存在需要人工确认的迹象。
- `FAILED`：必要检查失败、超时、隐藏退出码，或验证期间代码被改变。

ShipProof 提供可核查的证据，但不承诺软件在数学意义上绝对正确。

## 商业化方向

本地 CLI、基础规则和 GitHub Action 保持开源；团队策略、历史证据、合并门禁、审计记录、私有化部署和企业支持可以形成付费产品。

## 本地开发

```bash
npm install
npm test
node dist/cli.js verify --config examples/shipproof.json
```

需要 Node.js 20 或更新版本，使用 MIT 协议。
