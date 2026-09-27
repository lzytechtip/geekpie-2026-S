/**
 * @param {string} url 完整且未经改写的请求 URL
 * @param {{uifid?: string, method?: string, body?: *, headers?: Object}} context 请求上下文；body 必须是实际发送的原始内容
 * @returns {string} 签名 URL 中保持原始百分号编码的 a_bogus 参数值
 */
function get_ab(url, context = {}) {
  const { uifid, body = null, headers } = context;
  if (uifid !== undefined) document.cookie = "uifid=" + uifid;
  const xhr = new XMLHttpRequest();
  const method = context.method || (body === null ? "GET" : "POST");
  xhr.open(method, url, true);
  if (headers) {
    if (Array.isArray(headers)) {
      headers.forEach(([name, value]) => xhr.setRequestHeader(name, value));
    } else if (typeof headers.forEach === "function") {
      headers.forEach((value, name) => xhr.setRequestHeader(name, value));
    } else {
      Object.keys(headers).forEach((name) => xhr.setRequestHeader(name, headers[name]));
    }
  }
  xhr.send(body);
  const opened = xhr._xhr_open_args;
  const signed = [xhr.url, xhr._url, xhr.responseURL, opened && opened.url].find((value) => {
    return typeof value === "string" && value.indexOf("a_bogus=") !== -1;
  });
  if (!signed) return null;
  return signed.slice(signed.indexOf("a_bogus=") + 8).split("&")[0];
}
