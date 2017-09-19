#!/usr/bin/env node --harmony

var program = require('commander');

program
    .version('0.0.4')
    .command('init', 'Initialize an integration or plugin template')
    .parse(process.argv);
