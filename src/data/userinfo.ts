// 用户信息数据结构 — 对应 /api/v1/auth/userInfo 接口返回

export interface UserInfo {
  userId: string
  username: string
  nickName: string
  deptId: string | null
  lastLoginTime: string
  type: number
  tokenName: string | null
  tokenValue: string | null
  customOptions: {
    logo: string | null
    banner: string | null
    name: string | null
    showManual: boolean
  }
  cloudAgent: number
}

export interface UserInfoResponse {
  code: number
  msg: string | null
  data: UserInfo
}

const MOCK_USER_INFO: UserInfo = {
  userId: '2013154978665840641',
  username: 'admin',
  nickName: 'admin',
  deptId: null,
  lastLoginTime: '2026-05-07 14:46:49',
  type: 1,
  tokenName: null,
  tokenValue: null,
  customOptions: {
    logo: null,
    banner: null,
    name: null,
    showManual: true,
  },
  cloudAgent: 0,
}

export async function fetchUserInfo(): Promise<UserInfo> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_USER_INFO)
    }, 300)
  })
}
