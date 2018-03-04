#!/usr/bin/env node

const program = require('commander')
  .version(require('../package.json').version)
  .command('disallow <patterns...>')
  .parse(process.argv)

const debug = require('debug')('disallow')
const globby = require('globby')
const chalk = require('chalk')
const fs = require('fs')

let patterns = program.args
if (!patterns) {
  try {
    patterns = fs.readFileSync('.disallow', 'utf8').split('\n').map(x => x.trim()).filter(Boolean)
  } catch (_) {}
}
debug('patterns: %o', patterns)

if (!patterns.length) {
  console.error(chalk.red('No patterns passed to `disallow` and no `.disallow` found in current working directory!'))
  process.exit(1)
}

let ignorePatterns = []
try {
  ignorePatterns = fs.readFileSync('.disallowignore', 'utf8').split('\n').map(x => x.trim()).filter(Boolean)
} catch (_) {}
debug('ignore patterns: %o', ignorePatterns)

const files = globby.sync(patterns.concat(ignorePatterns.map(x => '!' + x)), {
  gitignore: true
})

if (files.length) {
  console.error(chalk.red('The following disallowed files were found:'))
  files.forEach((file) => {
    console.error(chalk.red(` - ${file}`))
  })
  process.exit(1)
}
