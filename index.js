#!/usr/bin/env node

const chalk = require('chalk')
const { DateTime } = require('luxon')
const needle = require('needle')
const prompts = require('prompts')

const endpointUrl = 'https://api.twitter.com/2/tweets/counts/recent'
const token = process.env.BEARER_TOKEN

let targetUserName = ''
let emoji = ''

function main () {
  try {
    if (!process.env.BEARER_TOKEN) {
      throw new Error("ターミナルで export BEARER_TOKEN='YOUR-TOKEN' を実行しBearer Tokenを設定してください\n")
    }
    showFirstMessage()
    getInfo()
  } catch (error) {
    console.log(chalk.red(error.message))
  }
}

function showFirstMessage () {
  console.log('\n' +
  'ーーーーーーーーーーーーーーーーーーーーーーーーーーーー \n' +
  '| 　　　　　　　　　　　　　　　　　　　　　　　　　　 | \n' +
  '|　　🐥直近一週間のツイート数を絵文字で表示します🐥　　| \n' +
  '| 　　　　　　　　　　　　　　　　　　　　　　　　　　 | \n' +
  'ーーーーーーーーーーーーーーーーーーーーーーーーーーーー \n' +
  '\n')
}

async function getInfo () {
  const question = [
    {
      type: 'text',
      name: 'emoji',
      message: '好きな絵文字を入力してね'
    },
    {
      type: 'text',
      name: 'targetUserName',
      message: '表示したいアカウント名を入力してね（@は不要です）'
    }
  ]
  const response = await prompts(question)
  emoji = response.emoji
  targetUserName = response.targetUserName
  displayTweetCounts()
}

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
  if (res.body.data) {
    return res.body
  } else {
    throw new Error(chalk.red('Bearer Tokenが正しくないか、存在しないユーザー名のためツイート数を取得できませんでした。'))
  }
}

async function displayTweetCounts () {
  try {
    const response = await getRequest()
    console.log('\n' + '@' + targetUserName + ' の直近一週間のツイート数' + '\n')
    for (let i = 0; i < response.data.length; i++) {
      const date = DateTime.fromISO(response.data[i].start).setLocale('ja').toISODate()
      const tweetCounts = response.data[i].tweet_count
      const tweetCountsSign = (tweetCounts === 0) ? '-' : emoji.repeat(tweetCounts)
      process.stdout.write(date + ' ')
      console.log(tweetCountsSign)
    }
    console.log('\n')
  } catch (e) {
    console.log(e)
    process.exit(-1)
  }
  process.exit()
}

main()
