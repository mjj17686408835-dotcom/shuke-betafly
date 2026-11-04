# 部署到 GitHub Pages（照着做，大约 10 分钟）

前提：你的电脑上没有 git，所以我们**全程用 GitHub 网页操作**，不需要装任何东西。

> 压缩包 `shuke-betafly.zip`（4.5 MB，48 个文件）里**没有** `images/pool/` 那批源图——
> 它们只在你以后想重新生成机场卡片图时才用得上，平时网站跑起来完全不需要。
> 想要的话单独告诉我，我再打一个。

---

## 第 1 步：注册 / 登录 GitHub

打开 <https://github.com>，有账号就登录，没有就点 `Sign up` 注册（邮箱 + 密码，免费）。

---

## 第 2 步：新建一个仓库

1. 登录后点右上角 `+` → `New repository`
2. 填写：
   - **Repository name**：`shuke-betafly`（想叫别的也行，只能用小写字母、数字、连字符）
   - **Description**：随便写，比如 `模拟飞行群的信息站`
   - 选 **Public**（必须公开，Pages 免费版只支持公开仓库）
   - 下面三个勾选（Add README / .gitignore / license）**都不要勾**
3. 点 `Create repository`

---

## 第 3 步：把文件传上去

1. 把 `shuke-betafly.zip` 解压，得到一堆文件和文件夹（`index.html`、`css`、`js`、`images`、`scripts`、`.github`、`README.md` 等）
2. 在刚建好的仓库页面，点 `Add file` → `Upload files`
3. 打开解压出来的那个文件夹，**全选里面的所有内容**（Ctrl+A），拖进网页的虚线框里

   > ⚠️ 拖的是文件夹**里面的东西**，不要把最外层那个文件夹一起拖进去。
   > 拖对了的话，网页上会显示 `index.html` 在根目录，而不是 `flight-club/index.html`。

4. 等进度条走完，下面的提交框写点什么（比如 `init`），点绿色的 `Commit changes`

### 关于 `.github` 这个文件夹

里面有 4 个自动更新用的配置文件（每天早上 6 点挑机场、8 点抓天气、每周换机场图、每天抓地景）。

Windows 资源管理器里以 `.` 开头的文件夹**不是隐藏的**，正常拖拽就会带上。传完可以在仓库首页确认一下 `.github/workflows/` 在不在。

如果没传上去（有些浏览器会跳过点开头的文件夹），手动补：

1. `Add file` → `Create new file`
2. 文件名填 `.github/workflows/update-today.yml`（斜杠会自动建文件夹）
3. 把本地那个文件的内容粘进去，提交
4. 其余 3 个同理
5. 嫌麻烦也可以不管——网站照样能看，只是「每天自动更新」不会发生，得手动跑脚本

---

## 第 4 步：打开 GitHub Pages

1. 进仓库的 `Settings`（顶部标签，不是右上角头像那个）
2. 左边栏点 `Pages`
3. **Source** 选 `Deploy from a branch`
4. **Branch** 选 `main`，右边目录选 `/ (root)`
5. 点 `Save`

等 1–2 分钟，刷新这个页面，顶部会出现一行绿色的：

> Your site is live at `https://你的用户名.github.io/shuke-betafly/`

点进去就是你的网站。

---

## 第 5 步：让自动更新能提交（重要）

自动更新的脚本跑完要往仓库里写文件，默认没这个权限，会报 `403`。

1. `Settings` → 左边栏 `Actions` → `General`
2. 拉到最下面 **Workflow permissions**
3. 选 **Read and write permissions**
4. 点 `Save`

然后去 `Actions` 标签页，左边能看到 4 个工作流：

| 工作流 | 什么时候跑 | 干什么 |
|---|---|---|
| 每日机场 | 每天 06:00（北京） | 按当天各地天气挑一座当首屏 |
| 机场天气快照 | 每天 08:00（北京） | 抓 METAR，更新卡片上的天气 |
| 机场卡片图 | 每周二 06:00（北京） | 从 Wikimedia 换一批机场实景图 |
| 地景索引 | 每天 06:00（北京） | 从 SceneryAddons 抓新的地景 |

想立刻试一次：点进某个工作流 → 右边 `Run workflow` → `Run workflow`。跑完刷新网页就能看到变化。

---

## 常见问题

**打开是 404 / 白屏**
- 确认 `index.html` 在仓库**根目录**，不是 `flight-club/index.html`
- Pages 设置里 Branch 选的是 `main` + `/ (root)`
- 刚开启要等 1–2 分钟

**首屏背景是黑的**
- `images/` 文件夹大概率没传上去。仓库里点开 `images` 看有没有 5 张 `pexels-*.jpg`

**图片全裂**
- 同上，`images/airports/` 里应该有 17 张 `XXXX.jpg`

**Actions 跑失败了，报 403**
- 回到第 5 步，把 Workflow permissions 改成 Read and write

**国内访问 `github.io` 慢或者打不开**
- 这是 DNS 污染，不是网站的问题
- 备选：把同一个仓库连到 **Cloudflare Pages**（免费，国内一般能开）
  - 打开 <https://pages.cloudflare.com> → 用 GitHub 登录 → `Create a project` → `Connect Git` → 选这个仓库
  - Build command 留空，Build output directory 填 `/`
  - 之后你会拿到一个 `xxx.pages.dev` 的域名

---

## 以后想改内容怎么办

直接在 GitHub 网页上点开文件 → 右上角铅笔图标 → 改 → 提交。等一分钟 Pages 会自己重新发布。

改数据的地方：

- `js/data.js` — 机场、机型、航线
- `js/backgrounds.js` — 首屏背景图清单
- `index.html` — 文案、标题
- `css/style.css` — 样式
