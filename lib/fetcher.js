export const fetcher = url =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(r.status)
    return r.json()
  })
