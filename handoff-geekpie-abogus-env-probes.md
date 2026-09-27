# Handoff: a_bogus 环境探针，还差两处没对齐

下一会话继续把本地签名做成和这个 Chrome 里的 `bdms` 逐字节相同。先读本文，再读仓库里的上一份交接。不要把 cookie、`uifid`、`msToken`、`verifyFp`、`fp`、webid、session 打进回复或新文件。

## 下一会话要做什么

用户要的是：同一条被哈希的查询串、同一个 `Date.now`、同一个 `Math.random`，本地跑出来的 `a_bogus` 和真实浏览器逐字节相同。

已经证明：只把 `userAgent`、屏幕、窗口尺寸对上，不够。环境位和 `L38` 还没对上。这两处一对上，UA 摘要和两个校验字节会跟着对齐；随机数钉成常数时，噪声字节不依赖抽取次数。

下一会话只做这两处，做完再做一次同输入逐字节对比。对比通过之前，不要改仓库里的 `get_ab.js`、`code.js`、`env.js`，不要交评测。

## 仓库和已有文档

- 仓库：`C:\Users\lzytechtip\Documents\proj\geekpie-2026-S-a1a31d69a00c2d8865cb5c401e79c0d470fac306`
- 题面：`README.md`。入口 `get_ab(url, { uifid })`。评测 https://judge.honahec.cc/ 只回过或不过，提交 `code.js` 和 `get_ab.js`，环境由平台替换。7 个隐藏用例，Usercert 是 32 位十六进制。
- 上一份交接：仓库根目录 `handoff-geekpie-abogus-chrome-devtools.md`。淘汰表：`docs/abogus-mismatch-directions.md`。不要把那两份再抄一遍。
- 当前 `get_ab.js` 仍是：写 cookie，`open("GET")` + `send(null)`，`new URL(xhr.url).searchParams.get("a_bogus")`。
- `code.js` 末尾仍是 `window.bdms.init({aid:6383,pageId:6241,paths:["/"]})`。真机解码确认 `page_id` 6241、`aid` 6383。
- 页面脚本 `https://p-pc-weboff.byteimg.com/tos-cn-i-9r5gewecjs/bdms_1.0.1.19_fix.js` 和仓库 `bdms_1.0.1.19_fix.js` 只有 CRLF / LF 之差。`code.js` 是 LF 版加上 init 那一行。
- 解码器：`C:\Users\lzytechtip\AppData\Local\Temp\abogus-debug\abogus.py` 的 `decode()`。配套 `sm3.py`。不要把抓包令牌从 `cases.json` 打出来。

## 已经钉死的调用和读回

- 签名发生在 `XMLHttpRequest.open` / `send` 里。签完的地址是传给原生 `open` 的 URL 参数。
- 这个 Chrome 的 XHR 没有 `.url`。`_url` 在 `open` 时就写上，但一直不含 `a_bogus`。`responseURL` 要等请求结束才有，而且是 `%2F` / `%3D`。
- 附件 `env.js` 的 `open()` 把参数写进 `this.url`。`searchParams.get` 返回解码形态，保留 `/` 和 `=`。这是评测环境能看见的读回通道。浏览器主机对象和附件环境不是同一个读回属性。
- 提交文件里的 `bdms` 只追加 `a_bogus`。页面另一层 SDK 会在签名前加上 `verifyFp`、`fp`、`msToken`。手动 XHR 的被哈希查询串是原参数加上这三个，没有 `uifid`。
- `uifid` 写进 cookie 不改变签名。钉死随机数后，两个不同 cookie 值得到同一串。
- 时钟是 `Date.now`。钉在 `1700000000000` 时，解出的 `now_ms` 就是这个数，`ink = now_ms - 1`。`Math.random` 钉成 `() => 0.25` 后，同一环境连续两次逐字节相同。
- 屏幕串公式：`innerWidth|innerHeight|outerWidth|outerHeight|screen.width|screen.height|availWidth|availHeight|platform`。这次页面是 `1039|863|1053|1014|1646|1029|1646|1029|Win32`。对上这些之后，`browser_info` 与真机一致。
- 用「`a_bogus` 及其后的参数去掉之后的原始查询串」做本地重签，查询摘要前两字节 `L48`/`L49` 与真机一致。用题目那种未加 `verifyFp`/`fp`/`msToken` 的 URL，前两字节对不上。
- `L40` 是可信 `mousemove` 计数。合成 `dispatchEvent` 推不动。这次自动化 Chrome 里 `navigator.webdriver === true`。真机 `detect_flags` 会随交互变：鼠标前 `14`，第一次可信鼠标后 `8`，稍后一次签名是 `4`。这些是请求当时的状态，不是写死进 `get_ab.js` 的常数。

同输入、钉死熵、屏幕串已对齐时，五十个字段里只剩环境位、`L38`，以及它们带出来的 UA 摘要（`L56`/`L57`/`L59`）和校验字节（`L51`/`L55`）。

## 环境位：程序 699，初始化时算一次

`code.js` 里 `function J` 在文件偏移 91684。字节码解释器在 base64 blob 结束之后。字符串表是临时目录的 `vm_Z.json`。程序表可从已加载的 `z` 数组拿到；临时目录里有 `prog-bytes.json`、`disasm.py`、`detectors.txt`。

初始化顺序，来自 `code.js` 里 `J(728` 那段：

- `J(728)` 存进 `tt`：程序 730，toString 标签。这是门闩。失败则环境位或上 `128`，不再跑下面六个。
- `J(731)` 存进 `ot`：程序 733。校验和里左移 1，位值 `2`。
- `J(734)` 存进 `ut`：程序 735，UA 和 `platform` 是否同一系统。左移 6，位值 `64`。
- `J(736)` 存进 `ct`：程序 737，location。左移 5，位值 `32`。
- `J(738)` 存进 `ft`：程序 742，Node。左移 4，位值 `16`。
- `J(743)` 存进 `pt`：程序 744。左移 3，位值 `8`。
- `J(745)` 存进 `Zt`：程序 748 所在的 webdriver 套件。左移 2，位值 `4`。
- `J(698)` 调程序 699，结果写入 `vt`。解码字段 `L35` 就是这个数。后面没有第二处 `vt=`。

程序 699 的字节码：先放 `1`，再按上表或上探测器返回值。`call slot 2,0` 为假则跳到 `1 << 7`。

实测台阶，都在 `C:\Users\lzytechtip\AppData\Local\Temp\abogus-debug\env_lab.js` 加补丁、`run_lab.py` 重签得到：

| 补丁 | 环境位 |
| --- | --- |
| 附件 `env.js` 原样 | 129 |
| `history` 加 `Symbol.toStringTag`，以及 navigator/document/location/screen 的标签 | 51 |
| 再隐藏 `process` / `global` | 35 |
| 再让 `navigator.webdriver` 这个属性存在（`true` 和 `false` 都一样） | 39 |
| 再让 `document.location === window.location`，且 `connection.rtt` 不是 0 | 7 |

`webdriver === true` 或属性存在，都会让程序 748 返回 true。属性不存在才是 false。这个 Chrome 是 `true`，所以位值 `4` 两边都有。`env.js` 里的 `connection.rtt` 默认是 `0`，程序 749 会因此命中；套件仍因 748 为 true。把 rtt 改成 `50` 只让 749 变 false，不单独改校验和。

这个 Chrome 解出来的环境位是 `5`，也就是 `1 + 4`。本地最好结果是 `7`，也就是 `1 + 2 + 4`。多出来的就是位值 `2`。

## 没对齐的第一处：程序 733，位值 2

程序 733 是 `J(731)` 存进 `ot` 的那个探测器。程序 699 把它左移 1。它返回 true 时，环境位多 `2`。仪表化进程里它返回 true，校验和是 `7`。Chrome 的校验和是 `5`，所以 Chrome 初始化时这次调用返回了 false。

字节码要点，异常表是 `[[0, 29, 34, 34]]`，捕获后走 `push true; return`：

1. `document.createElement("canvas")`，再取 `toDataURL` 并调用。
2. 返回值真，直接 `return true`。
3. 返回值假，跳过这段，再调 `navigator.toString`，然后查 `PluginArray` / `MSPluginsCollection`。
4. `createElement` 或 `toDataURL` 抛错，也被捕获成 `return true`。

本地已经试过，733 仍是 true：

- 没有 `toDataURL`：抛错，捕获后 true。
- `toDataURL` 抛错：true。
- `toDataURL` 返回 `""`：调用确实发生了（计数为 1），`createElement("canvas")` 被调了 2 次，733 仍 true。假返回值走了后面的分支，后面的分支也返回 true。
- 同时把 `navigator.toString` 改成返回 `""`，并让 `navigator.plugins instanceof PluginArray` 为 true：733 仍 true。

Chrome 上同一页测到的是：

- `document.createElement` 仍是 native。
- `canvas.toDataURL()` 对 `undefined`、`null`、`{}`、`""`、`"image/png"` 都返回长度 2118 的 data URL，为真。
- `typeof PluginArray === "function"`，`navigator.plugins.constructor.name === "PluginArray"`，`plugins.length === 5`。

这里有一个还没解开的矛盾：按字节码，真的 `toDataURL` 应让 733 在 Chrome 里也返回 true，环境位就该带上 `2`，变成至少 `7`。解出来却是 `5`。下一会话要先判定：Chrome 初始化那一次，733 到底返回了什么；若真是 false，假值是从哪条分支来的。不要再假设「把 toDataURL 改成空串就会 false」，这条已经测过。

下一会话的通过标准：同一套补丁下，日志里 `733=false`，并且解出的环境位从 `7` 变成 `5`。然后再和 Chrome 的 `5` 对齐，而不是只改数字。

## L38：程序 697

`L38` 也是初始化时的位图。`frames = window` 把 `79` 打到 `15`（清掉 `64`，程序 727：`window.frames !== window` 等）。把 `Error` 换成 stack 里没有 `Module._compile`、localhost、IP 的构造器，再打到 `11`（清掉 `4`，程序 704）。目标是 Chrome 的 `1`。`11 = 1 + 2 + 8`，还多两位。

仪表化时，L38 汇总期间返回 true 的程序有：

- 716：`document.all`。见下一节。
- 724 / 725 / 726：`window.screen` 的属性描述符和键集合。允许的键是 `availHeight`、`availLeft`、`availTop`、`availWidth`、`colorDepth`、`height`、`isExtended`、`onchange`、`orientation`、`pixelDepth`、`width`。`some` 用来发现不在这张表里的键，再滤原型上的键。本地 `screen` 对不上，所以 724 返回 true。
- 719 返回一个对象，比较 `outerWidth - innerWidth > 400` 和 `outerHeight - innerHeight > 300`。按位或会把对象当成 `0`，它本身不一定占位。不要把它当成已经证实的位。

`704=false`、`727=false` 之后，`L38` 仍是 `11`。所以剩下的位来自 716，以及 724 这一组，不是 frames 和 Error.stack。

把 `screen` 换成空原型对象后，签名阶段 `Object.keys` 抛了 `Cannot convert undefined or null to object`。那次实验作废，不要沿用那个 `screen` 对象。

## 没对齐的第二处：程序 716，`document.all`

程序 716 把五个比较放进数组，滤掉假值，`length > 0` 就返回 true。五个比较是：

1. `document.all != undefined`
2. `document.all === undefined`
3. `document.all.__proto__ !== HTMLAllCollection.prototype`
4. `document.all.toString() !== "[object HTMLAllCollection]"`
5. `document.all !== document.all`

这个 Chrome 上五项全是假，所以 716 返回 false，不占 `L38` 的位。实测：

- `typeof document.all` 是 `"undefined"`
- `document.all != undefined` 是 false
- `document.all === undefined` 是 false
- `document.all != null` 是 false
- `document.all !== document.all` 是 false
- `__proto__` 就是 `HTMLAllCollection.prototype`
- `toString()` 就是 `[object HTMLAllCollection]`
- `length` 是 2145，`item` 是函数

Node 里没有这个对象时，`document.all` 是真正的 `undefined`。第 2 项 `=== undefined` 为真，716 返回 true。换成普通对象，第 1 项 `!= undefined` 又会为真。宽松等于 undefined、严格不等于 undefined、同时还能读原型和 `toString`，只有浏览器的 `HTMLAllCollection` 做得到。

下一会话要决定的是：用能提供这种 `document.all` 的宿主（例如带这个 exotic 对象的浏览器上下文或 jsdom，若它的比较结果和上面五项一致）来签，还是证明 716 只占 `L38` 的其中一位、另一位单独来自 724。通过标准是解出的 `L38` 从 `11` 变成 `1`，并且 716 的日志是 false。

## 下一会话的操作顺序

1. 用现有 `log-programs.js` 的补丁基线：标签、`history`、隐藏 Node 全局、`webdriver` 属性、`document.location === location`、`connection.rtt = 50`、`frames = window`、浏览器形态的 `Error.stack`。先确认环境位仍是 `7`、`L38` 仍是 `11`。临时目录里的 `code-logged.js` 是插过日志的副本，最后一次 `screen` 实验可能让签名抛错；抛错就从仓库 `code.js` 重新打一份日志副本，不要改仓库文件。
2. 把程序 733 的返回值做成 false，并看到环境位变成 `5`。先单步它在 `toDataURL` 返回假之后的字节码，不要再重复「空串 / 抛错 / 缺少 toDataURL」这三种已经失败的改法。
3. 把程序 716 做成 false，或换一个五项比较与 Chrome 一致的 `document.all`。同时处理 724 的 `screen` 键，但不要用空原型把 `Object.keys` 打崩。目标是 `L38 = 1`。
4. 两边都变成环境位 `5`、`L38` `1` 之后，钉住 `Date.now = 1700000000000` 和 `Math.random = () => 0.25`，用同一条去掉 `a_bogus` 及其后参数的查询串各签一次。解码全部 `FIELD_ORDER`。通过标准是字符串相同，而不只是这两个字段相同。
5. Chrome DevTools MCP 已接上。先 `search_tool` 再调用，不要猜参数。页面若回到 `about:blank` 或出现「登录」，让用户在这个 DevTools 浏览器里登录。不要打印 cookie 或令牌。

## 不要做的事

- 不要把屏幕、UA、`L40`、环境位、`L38` 写进 `get_ab.js`。评测换的是平台的 `env.js`，写死浏览器探针会和评测环境不一致。
- 不要改 `6383` / `6241`。
- 不要追加 `uifid`，不要在 `get_ab` 里编 body。
- 不要交评测。用户没给 Usercert，也没要求提交。
- 不要把 `C:\Users\lzytechtip\AppData\Local\Temp\abogus-debug\cases.json` 或任何含令牌的抓包打进对话。

## Suggested skills

下一会话开始时读取：

- `diagnosing-bugs`：`C:\Users\lzytechtip\Documents\proj\geekpie-2026-S-a1a31d69a00c2d8865cb5c401e79c0d470fac306\.agents\skills\diagnosing-bugs\SKILL.md`。把「程序 733 仍返回 true」和「程序 716 / 724 让 L38 停在 11」当成两个缺陷。每改一处就重签并解码，看到 `733=false` 且环境位 `5`，以及 `716=false` 且 `L38 = 1`，再做逐字节对比。
- Chrome DevTools 是 MCP，不是 skill。用 `search_tool` 发现工具后再调用。
