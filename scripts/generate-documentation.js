const documentation = require('documentation')
const path = require('path')
const fs = require('fs')
const Avanza = require('../dist/index.js')

require('dotenv').config({ path: path.join(process.cwd(), '.env') })

const avanza = new Avanza()
const filename = path.join(process.cwd(), 'lib', 'index.js')
const calls = {
  getPositions: () => avanza.getPositions(),
  getOverview: () => avanza.getOverview(),
  getAccountOverview: () => avanza.getAccountOverview(process.env.AVANZA_ACCOUNT),
  getDealsAndOrders: () => avanza.getDealsAndOrders(),
  getTransactions: () => avanza.getTransactions(process.env.AVANZA_ACCOUNT, { from: '2017-01-01', to: '2019-01-01' }),
  getWatchlists: () => avanza.getWatchlists(),
  getInstrument: () => avanza.getInstrument(Avanza.STOCK, process.env.AVANZA_STOCK),
  getOrderbook: () => avanza.getOrderbook(Avanza.STOCK, process.env.AVANZA_STOCK),
  getOrderbooks: () => avanza.getOrderbooks([process.env.AVANZA_STOCK, process.env.AVANZA_STOCK2]),
  getChartdata: () => avanza.getChartdata(process.env.AVANZA_STOCK, Avanza.ONE_MONTH),
  getInspirationLists: () => avanza.getInspirationLists(),
  getInspirationList: () => avanza.getInspirationList(Avanza.HIGHEST_RATED_FUNDS),
  search: () => avanza.search('om')
}
const notes = {}

/**
 * Recursive function which builds an array of data about the endpoint return value.
 * The information is then used to build Markdown tables.
 *
 * @param {Object|Array} res The value returned from the API endpoint.
 * @param {String} name The name/header of the table to be built.
 * @return {Array} An array of information about the endpoint return value.
 */
function buildReturnTables(res, name) {
  let tables = []

  if (Array.isArray(res)) {
    if (res.length && res[0]) {
      tables = buildReturnTables(res[0], `${name}[i]`)
    }
  } else {
    const keys = Object.keys(res).map(k => ({
      name: k,
      type: res[k].constructor.name
    })).sort((a, b) => a.name.localeCompare(b.name))

    tables.push({ name, keys })

    keys.filter(key => Array.isArray(res[key.name])).forEach((key) => {
      if (res[key.name].length) {
        tables = [...tables, ...buildReturnTables(
          res[key.name][0],
          `${name}.${key.name}[i]`
        )]
      }
    })
  }

  return tables
}

/**
 * Traverse through all functions inside in the wrapper and build Markdown tables
 * describing each endpoint return value.
 */
async function buildMarkdown() {
  const docs = await documentation.build([filename], { shallow: true })
  const functions = docs[0].members.instance.filter(x => x.kind === 'function')

  for (const fn of functions) {
    if (typeof calls[fn.name] === 'function') {
      const res = await calls[fn.name]()
      const tables = buildReturnTables(res, `${fn.name}()`)

      fn.description.children.push({
        type: 'paragraph',
        children: [
          {
            type: 'strong',
            children: [
              {
                type: 'text',
                value: 'Returns'
              }
            ]
          }
        ]
      })

      for (const table of tables) {
        // Add table title
        fn.description.children.push({
          type: 'paragraph',
          children: [
            {
              type: 'inlineCode',
              value: table.name
            }
          ]
        })

        // Add table
        fn.description.children.push({
          type: 'table',
          align: ['left', 'left'],
          children: [{
            type: 'tableRow',
            children: [
              {
                type: 'tableCell',
                children: [{
                  type: 'text',
                  value: 'Property'
                }]
              },
              {
                type: 'tableCell',
                children: [{
                  type: 'text',
                  value: 'Type'
                }]
              },
              {
                type: 'tableCell',
                children: [{
                  type: 'text',
                  value: 'Note'
                }]
              }
            ]
          }, ...table.keys.map(key => ({
            type: 'tableRow',
            children: [
              {
                type: 'tableCell',
                children: [{
                  type: 'inlineCode',
                  value: key.name
                }]
              },
              {
                type: 'tableCell',
                children: [{
                  type: 'text',
                  value: key.type
                }]
              },
              {
                type: 'tableCell',
                children: [{
                  type: 'text',
                  value: notes[key.name] || ''
                }]
              }
            ]
          }))]
        })
      }
    }
  }

  const markdown = await documentation.formats.md(docs, { markdownToc: true })
  fs.writeFileSync(path.join(process.cwd(), 'API.md'), markdown)
  process.exit()
}

/**
 * Run the generator
 */
avanza.authenticate({
  username: process.env.AVANZA_USERNAME,
  password: process.env.AVANZA_PASSWORD,
  totpSecret: process.env.AVANZA_TOTP_SECRET
})
  .then(buildMarkdown)
  .catch((e) => console.error(e))
