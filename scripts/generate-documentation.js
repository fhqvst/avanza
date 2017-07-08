let documentation = require('documentation')
let path = require('path')
let fs = require('fs')
let Avanza = require('../lib/index.js')

require('dotenv').config({ path: path.join(process.cwd(), '.env') })

const avanza = new Avanza()
const filename = path.join(process.cwd(), 'lib', 'index.js')
const calls = {
  getPositions: () => avanza.getPositions(),
  getOverview: () => avanza.getOverview()
}
const notes = {}

/**
 * Traverse through all functions inside in the wrapper and build Markdown tables
 * describing each endpoint return value.
 */
async function buildMarkdown() {

  const docs = await documentation.build([filename], { shallow: true })
  const functions = docs[0].members.instance.filter(x => x.kind === 'function')

  for (let fn of functions) {

    if (typeof calls[fn.name] === 'function') {

      const res = await calls[fn.name]()
      const tables = buildReturnTables(res, `${fn.name}()`)

      for (let table of tables) {

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

  const markdown = await documentation.formats.md(docs, {})
  fs.writeFileSync(path.join(process.cwd(), 'API.md'), markdown)
  process.exit()
}

/**
 * Recursive function which builds an array of data about the endpoint return value.
 * The information is then used to build Markdown tables.
 *
 * @param {Object|Array} res The value returned from the API endpoint.
 * @param {String} name The name/header of the table to be built.
 * @return {Array} An array of information about the endpoint return value.
 */
function buildReturnTables(res, name) {
  const keys = Object.keys(res).map(k => ({
    name: k,
    type: res[k].constructor.name
  }))
  let tables = []

  tables.push({ name, keys })

  keys.filter(key => Array.isArray(res[key.name])).forEach(key => {
    if (res[key.name].length) {
      tables = [...tables, ...buildReturnTables(
        res[key.name][0],
        `${name}.${key.name}[i]`
      )]
    }
  })

  return tables
}

/**
 * Run the generator
 */
avanza.authenticate({
  username: process.env.USERNAME,
  password: process.env.PASSWORD
}).then(buildMarkdown)
