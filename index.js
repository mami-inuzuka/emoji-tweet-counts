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
      throw new Error("To set environment variables on macOS or Linux, run the export command from the terminal: export BEARER_TOKEN='YOUR-TOKEN' \n")
    }
    showFirstMessage()
    getInfo()
  } catch (error) {
    console.log(chalk.red(error.message))
  }
}

function showFirstMessage () {
  console.log('\n' +
  ' -------------------------------------------------------- \n' +
  '|                                                        | \n' +
  '|    🐥Display tweet counts by emoji this past week!🐥   | \n' +
  '|                                                        | \n' +
  ' -------------------------------------------------------- \n' +
  '\n')
}

async function getInfo () {
  const question = [
    {
      type: 'text',
      name: 'emoji',
      message: 'Enter your favorite emoji.'
    },
    {
      type: 'text',
      name: 'targetUserName',
      message: 'Enter your screen name (except @).'
    }
  ]
  try {
    const response = await prompts(question)
    if (Object.keys(response).length === 0) {
      throw new Error('Program terminated.')
    }
    emoji = response.emoji
    targetUserName = response.targetUserName
    displayTweetCounts()
  } catch (error) {
    console.log(error.message)
  }
}

async function getRequest () {
  const params = {
    query: 'from:' + targetUserName,
    granularity: 'day'
  }
  try {
    const res = await needle('get', endpointUrl, params, {
      headers: {
        'User-Agent': 'v2RecentTweetCountsJS',
        authorization: `Bearer ${token}`
      }
    })
    if (res.body.data) {
      return res.body
    } else if (res.statusCode === 401) {
      throw new Error('Missing or incorrect authentication credentials. Please check your Bearer Token.')
    } else {
      throw new Error(res.body.errors[0].message)
    }
  } catch (error) {
    console.log(chalk.red(error.message))
  }
}

async function displayTweetCounts () {
  try {
    const response = await getRequest()
    if (response) {
      console.log('\n' + 'Tweet counts of ' + '@' + targetUserName + ' this past week.' + '\n')
      response.data.forEach(function (item) {
        const date = DateTime.fromISO(item.start).setLocale('ja').toISODate()
        const tweetCounts = item.tweet_count
        const tweetCountsSign = (tweetCounts === 0) ? '-' : emoji.repeat(tweetCounts)
        process.stdout.write(date + ' ')
        console.log(tweetCountsSign)
      })
      console.log('\n')
    }
  } catch (e) {
    console.log(e)
    process.exit(-1)
  }
  process.exit()
}

main()
