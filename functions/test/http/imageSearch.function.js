const functions = require('firebase-functions')
const axios = require('axios')

const ID_UNSPLASH =
  'cf758c425a3fb41422f213728fc6bb6411994446f700c32b1ae70e3639d1effd'
const ID_PEXELS = '563492ad6f91700001000001afd9c86217454e1a8f42c752d0179a74'
const PER_PAGE = 20

exports = module.exports = functions.https.onRequest(async (req, res) => {
  try {
    const search = req.query.search

    // Unsplash
    const promise_unsplash = axios.get(
      'https://api.unsplash.com/search/photos/',
      {
        params: { query: 'dog', per_page: PER_PAGE, page: 0 },
        headers: { Authorization: `Client-ID ${ID_UNSPLASH}` }
      }
    )

    // Pexels
    const promise_pexels = axios.get('https://api.pexels.com/v1/search', {
      params: { query: search, per_page: PER_PAGE, page: 0 },
      headers: { Authorization: ID_PEXELS }
    })

    // response ALL to Promise ALL
    const [response_unsplash, response_pexels] = await Promise.all([
      promise_unsplash,
      promise_pexels
    ])

    const result_unsplash = response_unsplash.data.results
    const result_pexels = response_pexels.data.photos

    // Map Array
    const unsplash = result_unsplash.map((picture) => {
      return {
        id: picture.id,
        width: picture.width,
        height: picture.height,
        urls: {
          thumb: picture.urls.thumb,
          full: picture.urls.full
        }
      }
    })

    const pexels = result_pexels.map((picture) => {
      return {
        id: picture.id,
        width: picture.width,
        height: picture.height,
        urls: {
          thumb: picture.src.small,
          full: picture.src.original
        }
      }
    })

    const pictures = [...unsplash, ...pexels]

    res.send(pictures)
  } catch (err) {
    console.log(err.message)
  }
})
