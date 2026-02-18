这是本站的后端代码，部署在 Cloudflare Page Functions 上。

如您要自己部署，您需要做：
1. 在 Cloudflare 上创建一个 Page 项目
2. 将此项目部署到 Cloudflare Page 项目
3. 在 Cloudflare 上创建一个 KV 命名空间
4. 修改 wrangler.toml，将您创建的 KV 命名空间绑定到此项目
