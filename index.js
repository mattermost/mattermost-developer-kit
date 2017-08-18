#!/usr/bin/env node --harmony

var program = require('commander');

program
  .command('init', 'Initialize an integration or plugin template')
  .parse(process.argv);
