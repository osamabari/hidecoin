'use strict'

const blessed = require('blessed')
const R = require('ramda')
const _ = require('lodash')

const storage = require('./Storage')

class Interface {

  constructor() {
    this.stat = {
      hps: 0,
      rps: 0,
      blk: 0
    }
    
    this.screen = blessed.screen({
      smartCSR: true
    })
    this.screen.title = 'XHD Core'
    this.boxes = {
      header: blessed.box({
        parent: this.screen,
        top: 0,
        left: 0,
        width: '100%',
        bottom: this.screen.height - 1,
        content: '{bold}HPS    0 RPS    0 BLK        0{/bold}',
        tags: true,
        style: {
          fg: 'white',
          bg: 'cyan',
        }
      }),
      console: blessed.box({
        parent: this.screen,
        top: 1,
        left: 0,
        width: '100%',
        bottom: 1,
        tags: true,
        style: {
          fg: 'white',
          bg: 'black',
        }
      }),
      blocks: blessed.box({
        parent: this.screen,
        top: 1,
        left: 0,
        width: '100%',
        bottom: 1,
        content: 'Block Explorer',
        tags: true,
        style: {
          fg: 'white',
          bg: 'black',
        }
      }),
      footer: blessed.box({
        parent: this.screen,
        top: this.screen.height - 1,
        left: 0,
        width: '100%',
        bottom: 0,
        content: 'F1 Cnsl F10 Quit',
        tags: true,
        style: {
          fg: 'white',
          bg: 'blue',
        }
      })
    }
    this.boxes.console.setFront()
    this.screen.render()
    
    this.screen.on('resize', () => {
      this.boxes.header.bottom = this.screen.height - 1
      this.boxes.footer.top = this.screen.height - 1
      this.boxes.footer.bottom = 0
      this.screen.render()
    })
    
    this.screen.key('f1', () => {
      this.boxes.console.setFront()
      this.screen.render()
    })
    
    this.screen.key('f2', () => {
      this.boxes.blocks.setFront()
      this.screen.render()
    })
    
    storage.on('log', (...data) => {
      this.logConsole(R.join(' ', R.map((line) => {
        return typeof line === 'object' ? JSON.stringify(line) : line
      }, data)))
    })
    
    storage.on('stat', (data) => {
      if (data.hps) {
        this.stat.hps = data.hps
      }
      if (data.rps) {
        this.stat.rps = data.rps
      }
      if (data.blk) {
        this.stat.blk = data.blk
      }
      this.boxes.header.setLine(0, '{bold}HPS ' + _.padStart(this.stat.hps, 4) + ' RPS ' + _.padStart(this.stat.rps, 4) + ' BLK ' + _.padStart(this.stat.blk, 8) + '{/bold}')
      this.screen.render()
    })
  }
  
  key(...args) {
    this.screen.key(...args)
  }
  
  close() {
    this.screen.destroy()
  }
  
  logConsole(...data) {
    R.forEach((line) => {
      this.boxes.console.pushLine(line)
    }, data)
    const extraLines = this.boxes.console.getScreenLines().length - this.screen.height + 2
    if (extraLines > 0) {
      for (let i = 0; i < extraLines; i++) {
        this.boxes.console.shiftLine(0)
      }
    }
    this.screen.render()
  }
}

const ifc = new Interface()
module.exports = ifc