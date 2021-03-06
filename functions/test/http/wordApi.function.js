const functions = require('firebase-functions')
const axios = require('axios')
const SPECS = {
  timeoutSeconds: 30,
  memory: '256MB'
}

exports = module.exports = functions
  .runWith(SPECS)
  .https.onRequest(async (req, res) => {
    const ID_API = '4e2d6b7ecfmsh040d36b67dfc940p12acabjsnf88bb7542868'
    const query = req.query.query
    const action = req.query.action
    console.log([query, action])

    const promise_word = await axios.get(
      `https://wordsapiv1.p.rapidapi.com/words/${query}/${action}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
          'x-rapidapi-key': ID_API
        }
      }
    )
    
    const response_word = promise_word.data
    console.log("hello") 
    if (action === 'synonyms'){ 
      response_action = response_word.synonyms
    } else if (action === 'rhymes') {
      response_action = response_word.rhymes.all
    } else if (action === 'antonyms'){
      response_action = response_word.antonyms
    }
    //  else if (action === 'definitions'){
    //   response_action_definitions = response_word.definitions
    // } 
  
    const result_small_word = response_action.filter((word) => {
      return word.length <= 4
    })
    const result_medium_word = response_action.filter((word) => {
      return word.length > 3 && word.length <= 5
    })
    const result_large_word = response_action.filter((word) => {
      return word.length > 5 && word.length <= 7
    })
    const result_xl_word = response_action.filter((word) => {
      return word.length > 7
    })
    res.send([
      ...result_small_word,
      ...result_medium_word,
      ...result_large_word,
      ...result_xl_word
    ])
  })

