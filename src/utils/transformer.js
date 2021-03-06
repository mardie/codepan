// eslint-disable import/no-mutable-exports
import progress from 'nprogress'
import loadjs from 'loadjs'

class Transformers {
  constructor() {
    this.map = {}
  }

  set(k, v) {
    this.map[k] = v
  }

  get(k) {
    return this.map[k]
  }
}

const transformers = new Transformers()

async function loadBabel() {
  if (!transformers.get('babel')) {
    progress.start()
    const [babel, VuePreset, VueJSXMergeProps, FlowPreset] = await Promise.all([
      import(/* webpackChunkName: "babel-stuffs" */ 'babel-standalone'),
      import(/* webpackChunkName: "babel-stuffs" */ 'babel-preset-vue/dist/babel-preset-vue'), // use umd bundle since we don't want to parse `require`
      import(/* webpackChunkName: "babel-stuffs" */ '!raw-loader!./vue-jsx-merge-props'),
      import(/* webpackChunkName: "babel-stuffs" */ 'babel-preset-flow')
    ])
    transformers.set('babel', babel)
    transformers.set('VuePreset', VuePreset)
    transformers.set('VueJSXMergeProps', VueJSXMergeProps)
    transformers.set('FlowPreset', FlowPreset)
    progress.done()
  }
}

async function loadPug() {
  if (!transformers.get('pug')) {
    progress.start()
    const res = await Promise.all([
      import('browserified-pug'),
      import(/* webpackChunkName: "codemirror-mode-pug" */ 'codemirror/mode/pug/pug')
    ])
    transformers.set('pug', res[0])
    progress.done()
  }
}

async function loadMarkdown() {
  if (!transformers.get('markdown')) {
    progress.start()
    const [marked] = await Promise.all([
      import('marked3').then(m => m.default),
      import('codemirror/mode/markdown/markdown')
    ])
    transformers.set('markdown', marked)
    progress.done()
  }
}

async function loadSvelte() {
  if (!transformers.get('svelte')) {
    progress.start()
    const svelte = await import('svelte')
    transformers.set('svelte', svelte)
    progress.done()
  }
}

async function loadReason() {
  return new Promise((resolve, reject) => {
    if (loadjs.isDefined('reason')) {
      resolve()
    } else {
      progress.start()
      loadjs([
        'https://reasonml.github.io/bs.js',
        'https://reasonml.github.io/refmt.js'
      ], 'reason', {
        success() {
          progress.done()
          resolve()
        },
        error() {
          reject(new Error('network error'))
        }
      })
    }
  })
}

export { loadBabel, loadPug, loadMarkdown, transformers, loadSvelte, loadReason }
