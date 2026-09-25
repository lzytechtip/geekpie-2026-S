/**
 * 根据评测传入的完整 URL 生成并返回 a_bogus 字符串。
 *
 * 注意：请不要在本文件中使用 global, require 关键字
 *
 * @param {string} url 完整且未经改写的请求 URL
 * @param {{uifid: string}} context 本组请求上下文
 * @returns {string | Promise<string>} 对应的 a_bogus
 */
function get_ab(url, context) {
  const uifid = context && context.uifid ? context.uifid : "";
  if (uifid) {
    if (typeof document !== "undefined") {
      document.cookie = "uifid=" + uifid;
    }
    if (!url.includes("uifid=")) {
      url += (url.includes("?") ? "&" : "?") + "uifid=" + uifid;
    }
  }

  if (typeof window !== "undefined" && window.bdms && typeof window.bdms.init === "function" && !window._bdms_inited) {
    try {
      window.bdms.init({ aid: 6383, pageId: 6241, paths: ["/"] });
      window._bdms_inited = true;
    } catch (e) {}
  }

  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.send(null);

  const match = xhr.url.match(/[?&]a_bogus=([^&#]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = get_ab;
}
