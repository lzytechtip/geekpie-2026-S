# Handoff: GeekPie 2026 a_bogus，下一阶段用 Chrome DevTools

下一会话在真实浏览器里操作，回答本地 Node 回答不了的读回和字段来源问题。不要再拆这 8 条抓包去追毫秒，也不要交评测。

## 用户本阶段要做什么

用户会启用 Chrome DevTools MCP，希望在浏览器 DevTools 里直接操作。他们认为这能带来质的飞跃。飞跃的范围是：真实页面上的钩子写到哪里、环境位和 `L40` 从哪来。飞跃不到的是：评测不传毫秒和随机序列，抓包串仍然不能从 `(url, uifid)` 逐字节生成。

## 仓库和已有文档

- 仓库：`C:\Users\lzytechtip\Documents\proj\geekpie-2026-S-a1a31d69a00c2d8865cb5c401e79c0d470fac306`
- 题面：`README.md`。入口 `get_ab(url, { uifid })`。评测 https://judge.honahec.cc/ 只回过或不过，要提交 `code.js` 和 `get_ab.js`，环境由平台替换。
- 上一份交接：`handoff-geekpie-abogus-real-requests.md`。淘汰表：`docs/abogus-mismatch-directions.md`。不要把那两份再抄一遍。
- 当前 `get_ab.js` 是原始写法：写 cookie，`open("GET")` + `send(null)`，`new URL(xhr.url).searchParams.get("a_bogus")`。不要改，直到浏览器里看到读回或钩子绑定和这个写法不同。
- `code.js` 末尾仍是 `window.bdms.init({aid:6383,pageId:6241,paths:["/"]})`。8 条真机都解出 `page_id` 6241、`aid` 6383。没有新证据之前不要改这两个数。
- `env.js` 不改、不提交。
- 抓包在 `real_requests/1.txt` 到 `8.txt`。不要把 cookie、`uifid`、`msToken`、`verifyFp`、`fp`、webid 写进回复或新文档。临时目录里的 `abogus-debug\cases.json` 含这些令牌，不要打印，不要拷进仓库。

## 这一会话已经钉死的结论

解码器用的是 Evil0ctal 的 `decode()`：https://github.com/Evil0ctal/Douyin_TikTok_Download_API/blob/main/src/dtk/signing/native/abogus.py 。本地对比时把 `Date.now` 钉在解出的 `now_ms` 上，`Math.random` 钉死。

- 文件实际是 4 个 GET（1、3、4、5）和 4 个 POST（2、6、7、8）。2 和 8 有 body，6 和 7 是空 body 的 POST。复制的 fetch 没有 User-Agent。
- 8 条查询摘要前两字节都和「`a_bogus` 及其后的参数去掉之后的原始查询串」一致。第三个字节本地是失败标记 `11`。不要改查询串，不要再追加 `uifid`。
- 空 body 的摘要前两字节一致。2 和 8 的真机 body 摘要对得上抓包原文，本地 `send(null)` 对不上。函数没有 body 参数，不要编 body。
- 时钟就是 `Date.now`。钉住之后 `now_ms` 和 `ink = now_ms - 1` 都对。`performance.now` 换值，签名不变。同进程第二次签名，在随机数也钉死时与第一次相同。`boe` / `ddrt` / `ic` 不改变签名。
- 8 条真机环境位都是 `1`，`L38` 是 `1`，`detect_flags` 是 `12`。屏幕串都是 `606|944|1646|1029|1646|1029|1646|1029|Win32`。UA 摘要在用真机环境位当密钥时，对得上 Edge 154 的 Windows UA。本地附件环境是环境位 `129`、`L38` `79`、`detect_flags` `14`、屏幕串 `1920|1080|...|MacIntel`。
- `L40` 八条分别是 `3, 3, 45, 46, 46, 49, 46, 49`。不随 URL、`Date.now`、`Math.random`、`performance.now`、`history.length` 变化。本地包固定写 `0`。鼠标事件也没推动它。
- 补环境的最好结果：`history` 加 `toStringTag` 把环境位从 `129` 打到 `35`；`frames = window` 把 `L38` 从 `79` 打到 `15`；替换 `Error` 构造器再打到 `11`。`detect_flags` 仍是 `14`，`L40` 仍是 `0`。`webdriver: false` 把环境位抬到 `39`。这和已经交过并失败的那类补丁同一条路。不要再写进 `get_ab.js`，不要写死屏幕和 UA。
- 8 条 URL 都没有 `timestamp` 查询参数。毫秒只存在于已经签好的 `a_bogus` 里。用户确认拿不到这个毫秒，因此不能百分百复刻抓包路径。随机序列同样不在请求里。
- 附件 XHR 的自有属性里有 `url`，没有 `_url`。`send` 之后 `xhr.url` 含 `a_bogus`。同一条本地签名，`searchParams.get` 是 196 字符，URL 里的查询分量原文是 200 字符，差在 `/` 和 `=` 的百分号编码。相对路径在这份附件环境里 `new URL` 没有抛。

## 评测怎么理解

平台替换 `env.js`。若标准答案是在那份环境里、用同一份 `bdms`、读同一个 `Date.now` 和 `Math.random` 签出来的，当前 `get_ab` 的调用方式已经和 8 条的查询摘要一致，不该再改查询或环境。上次失败的提交是追加 `uifid`，以及环境补丁。干净文件这一会话没有交。用户选择先上 DevTools，不交。

若标准答案是某次浏览器抓包，而平台不注入那一毫秒和随机序列，`(url, uifid)` 没有合法输入能逐字节复刻。DevTools 改变不了这一点。

## 下一会话要做的事

先 `search_tool` 拿 Chrome DevTools MCP 的真实参数，再调用。不要猜 schema。用户还没在本会话里启用它。

在已打开的抖音页面里做，不要把 cookie 或令牌贴进对话：

1. 钩住页面当前的 `XMLHttpRequest.prototype.open` / `send`（以及 `fetch`，如果页面走的是 fetch）。发一条会被签的请求。记录签完的地址在 `.url`、`._url`，还是两边都有；`a_bogus` 是解码形态还是 `%2F` / `%3D`。这是附件环境证伪不了的读回问题。
2. 在同一次页面里钉住 `Date.now` 和 `Math.random`，签一条，用解码器拆字段。再在仓库里用当前 `get_ab`、同一毫秒、同一随机数签同一条去掉 `a_bogus` 的 URL。差集就是真实页面和附件 `env.js` 的差，不要再用补丁去猜。
3. 同一次钉死的签名里看 `L40` 的写入从哪个页面值来。候选已经排除：URL、`Date.now`、`Math.random`、`performance.now`、`history.length`、派发鼠标事件。浏览器里还能看调用计数、`bdms` 自己装上的对象、以及签名瞬间读过的属性。
4. 看到读回属性或编码形态和 `get_ab.js` 不一致，再改 `get_ab.js` 一处。只读 `.url`、解码返回，在附件环境里是工作的；改之前要有浏览器证据。
5. 没有这条浏览器证据之前，不要交评测，不要补环境，不要写死屏幕和 UA，不要改 `6383` / `6241`。

## Suggested skills

下一会话开始时读取：

- `diagnosing-bugs`：`C:\Users\lzytechtip\Documents\proj\geekpie-2026-S-a1a31d69a00c2d8865cb5c401e79c0d470fac306\.agents\skills\diagnosing-bugs\SKILL.md`。把「浏览器里的读回或 `L40` 来源和当前 `get_ab` 不一致」当成缺陷。先做成可重复的页面内对比，再改代码。
- `research`：`C:\Users\lzytechtip\Documents\proj\geekpie-2026-S-a1a31d69a00c2d8865cb5c401e79c0d470fac306\.agents\skills\research\SKILL.md`。只有浏览器轨迹仍然解释不了 `L40` 或环境位时才用。不要把查表法写进提交文件。

Chrome DevTools 是 MCP，不是 skill。用 `search_tool` 发现工具后再 `use_tool`。
