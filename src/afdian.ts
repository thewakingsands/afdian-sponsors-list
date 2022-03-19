import { createHash } from 'crypto'
import { $fetch } from 'ohmyfetch'

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const importDynamic = new Function('modulePath', 'return import(modulePath)')

function getSign(token: string, params: string, ts: number, userId: string) {
  const md5 = createHash('md5')
    .update(`${token}params${params}ts${ts}user_id${userId}`)
    .digest('hex')
    .toLowerCase()
  return md5
}

function buildRequestPayload(
  token: string,
  userId: string,
  body: Record<any, any>,
) {
  const ts = Math.floor(Date.now() / 1000)
  const params = JSON.stringify(body)
  const sign = getSign(token, params, ts, userId)
  return {
    user_id: userId,
    params,
    ts,
    sign,
  }
}

interface AfdianBasic<T = Record<string, any>> {
  ec: number
  em: string
  data: T
}

interface AfdianSponsorList {
  total_count: number
  total_page: number
  list: AfdianSponsor[]
}

interface AfdianSponsorPlan {
  plan_id: string
  rank: number
  user_id: string
  status: number
  name: string
  pic: string
  desc: string
  price: string
  update_time: number
  pay_month: number
  show_price: string
  independent: number
  permanent: number
  can_buy_hide: number
  need_address: number
  product_type: number
  sale_limit_count: number
  need_invite_code: boolean
  expire_time: number
  sku_processed: any[]
  rankType: number
}

interface AfdianSponsor {
  sponsor_plans: AfdianSponsorPlan[]
  current_plan: {
    name: string
  }
  all_sum_amount: string
  create_time: number
  last_pay_time: number
  user: {
    user_id: string
    name: string
    avatar: string
  }
}

export class Afdian {
  public constructor(
    private userId: string,
    private token: string,
    private baseUrl = 'https://afdian.net/api/open',
  ) {}

  public async getSponsors(page: number) {
    const payload = this.buildRequestPayload({
      page,
    })
    const response = await $fetch<AfdianBasic<AfdianSponsorList>>(
      '/query-sponsor',
      {
        baseURL: this.baseUrl,
        method: 'POST',
        body: payload,
      },
    )

    if (response.ec !== 200) {
      const { InternalServerError } = await importDynamic(
        'http-errors-enhanced',
      )
      throw new InternalServerError(response.em)
    }

    return {
      pages: response.data.total_page,
      data: response.data.list.map((s) => ({
        sponsor: s.user?.name,
        avatar: s.user?.avatar,
      })),
    }
  }

  private buildRequestPayload(params: Record<any, any>) {
    return buildRequestPayload(this.token, this.userId, params)
  }
}
