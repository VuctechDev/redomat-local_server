const url = 'http://192.168.1.13:2302/api'

const post = async (path: string, data: any): Promise<any> => {
  return await fetch(`${url}${path}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

const get = async (path: string): Promise<any> => {
  const response = await fetch(`${url}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return await response.json()
}

export const http = {
  post,
  get,
}
