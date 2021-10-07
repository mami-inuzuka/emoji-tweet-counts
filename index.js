const needle = require('needle')
const { DateTime } = require('luxon')

const token = process.env.BEARER_TOKEN
const endpointUrl = 'https://api.twitter.com/2/tweets/counts/recent'

const targetUserName = 'TwitterJP'
const emoji = '🐥'

async function getRequest () {
  const params = {
    query: 'from:' + targetUserName,
    granularity: 'day'
  }
  const res = await needle('get', endpointUrl, params, {
    headers: {
      'User-Agent': 'v2RecentTweetCountsJS',
      authorization: `Bearer ${token}`
    }
  })
  if (res.body) {
    return res.body
  } else {
    throw new Error('Unsuccessful request')
  }
}

(async () => {
  try {
    const response = await getRequest()
    console.log('\n' + '@' + targetUserName + 'のツイート数' + '\n')
    for (let i = 0; i < response.data.length; i++) {
      const tweetCounts = response.data[i].tweet_count
      const date = DateTime.fromISO(response.data[i].start).setLocale('ja').toISODate()
      const tweetCountsSign = (tweetCounts === 0) ? '-' : emoji.repeat(tweetCounts)
      process.stdout.write(date + ' ')
      console.log(tweetCountsSign)
    }
  } catch (e) {
    console.log(e)
    process.exit(-1)
  }
  process.exit()
})()
