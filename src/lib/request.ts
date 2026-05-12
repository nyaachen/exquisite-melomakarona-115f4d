// 从 userdata/userinfo.js 中提取的凭证配置
const BASE_URL = "http://example/"
const SATOKEN = "TOKEN"
const AUTHORIZATION = `Bearer ${SATOKEN}`

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>
}

/**
 * 封装的网络请求函数。
 * 自动为每个请求添加 satoken / authorization header，并将 path 拼接在 base_url 之后。
 *
 * @param path    - API 路径，例如 "api/v1/auth/userInfo"
 * @param options - 标准 fetch 选项，headers 使用普通对象
 * @returns fetch 返回的 Response
 */
export function request(path: string, options: RequestOptions = {}): Promise<Response> {
  const { headers = {}, ...rest } = options

  return fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "accept": "application/json, text/plain, */*",
      "authorization": AUTHORIZATION,
      "satoken": SATOKEN,
      ...headers,
    },
    credentials: "include",
  })
}

/**
 * 便捷方法：发起请求并直接解析 JSON，同时做基本的 code 校验。
 * 返回的 data 已通过 UserInfoResponse 的 code === 200 检查。
 */
export async function requestJson<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await request(path, options)
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status} ${res.statusText}`)
  }
  const json = await res.json()
  if (json.code != null && json.code !== 200) {
    throw new Error(json.msg || `接口返回错误码: ${json.code}`)
  }
  return json as T
}
