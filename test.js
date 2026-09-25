require("./env.js");
require("./code.js");
const _get_ab = require("./get_ab.js");
const get_ab = _get_ab.default || _get_ab;

console.log("=== 开始运行 a_bogus 离线测试套件 ===\n");

// 1. 验证基础调用与签名生成
console.log(">> 1. 验证基础签名生成...");
const sampleUifid =
  "8a94356f87650fa0412c61e664858f589013fe72dff3760b5026535a4ef20fec5bc5bfbd8bcd665e938357ddcfbdd7d363a2a7bf501074cfcd6c0a58facc13ce04f804294a53c69cd7b5167e182e0dc55eb8bd78da53d0997519a5cc2ceed0cd8f5a4bddb6b82f5c0f8081163657362ba8fc942df60683253a78f2139f99812f7b31f0466598069fa96060546af30bbd11e97dd7f20ae017d87aeabbe84c793d";
const sampleUrl =
  "https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1";

const sig1 = get_ab(sampleUrl, { uifid: sampleUifid });
console.log("   生成签名:", sig1);
console.log("   签名长度:", sig1.length);
if (typeof sig1 !== "string" || sig1.length === 0) {
  throw new Error("get_ab 未能生成有效签名！");
}
console.log("   [PASS] 基础签名成功生成！\n");

// 2. 验证确定性 (固定时间戳与随机数)
console.log(">> 2. 验证确定性 (固定时间戳与随机数)...");
const originalNow = Date.now;
const originalRandom = Math.random;
Date.now = () => 1790217175534;
Math.random = () => 0.3125;

try {
  const baseline = get_ab(sampleUrl, { uifid: sampleUifid });
  const repeated = get_ab(sampleUrl, { uifid: sampleUifid });
  const changed = get_ab(
    sampleUrl.replace("detail_list=1", "detail_list=0"),
    { uifid: sampleUifid }
  );

  console.log("   基准签名:", baseline);
  console.log("   重复签名:", repeated);
  if (baseline !== repeated) {
    throw new Error("在固定时间和随机数下，相同 URL 输出不一致！");
  }
  console.log("   [PASS] 重复调用一致性验证通过！");

  if (baseline === changed) {
    throw new Error("URL 参数发生变化时，签名未能随之改变！");
  }
  console.log("   [PASS] 参数敏感性验证通过！\n");
} finally {
  Date.now = originalNow;
  Math.random = originalRandom;
}

// 3. 验证 uifid 注入
console.log(">> 3. 验证 uifid 注入与 Cookie 同步...");
get_ab(sampleUrl, { uifid: "custom_test_uifid_123" });
if (!document.cookie.includes("custom_test_uifid_123")) {
  throw new Error("document.cookie 未能同步包含 uifid！");
}
console.log("   [PASS] document.cookie 同步验证通过！\n");

// 4. 高频调用性能测试
console.log(">> 4. 连续 20 次签名性能基准测试...");
const t0 = performance.now();
for (let i = 0; i < 20; i++) {
  const res = get_ab(sampleUrl + "&i=" + i, { uifid: sampleUifid });
  if (!res) throw new Error("第 " + (i + 1) + " 次调用返回空签名");
}
const elapsed = performance.now() - t0;
console.log("   20 次连续调用完成，总耗时:", elapsed.toFixed(2), "ms (平均每次", (elapsed / 20).toFixed(2), "ms)");
console.log("   [PASS] 性能基准测试通过！\n");

console.log("=== 所有本地测试项全部通过！ ===");
process.exit(0);
