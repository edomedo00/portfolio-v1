import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
import {createImageUrlBuilder} from '@sanity/image-url'
import ts from 'typescript'

const source = readFileSync(new URL('../src/content/image-presentation.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
}).outputText
const api = {}
runInNewContext(compiled, {exports: api, URL})
const {getContentImageAspectRatio, sanityImageLoader} = api
const builder = createImageUrlBuilder({projectId: 'test1234', dataset: 'production'})
const image = {asset: {_ref: 'image-abc-2880x1800-png', _type: 'reference'}}

assert.equal(getContentImageAspectRatio(image), 8 / 5, '2x exports retain their 8:5 frame')
assert.equal(getContentImageAspectRatio({asset: {_ref: 'image-abc-900x1440-png'}}), 5 / 8, 'Portrait images retain their own frame')
assert.equal(getContentImageAspectRatio({src: '/placeholder.svg'}), 8 / 5, 'Local placeholders have a stable fallback frame')

const cropImage = {...image, crop: {left: 0.125, right: 0.125, top: 0.1, bottom: 0.1}}
assert.equal(getContentImageAspectRatio(cropImage), 2160 / 1440, 'Editorial crop and frame stay in sync')
for (const asset of [image, cropImage]) {
  const originalUrl = builder.image(asset).url()
  for (const width of [640, 1200, 1920, 3840]) {
    const url = new URL(sanityImageLoader({src: originalUrl, width}))
    assert.equal(url.searchParams.get('w'), String(width), 'Responsive candidates are not capped at 1600px')
    assert.equal(url.searchParams.get('h'), null, 'No forced height or aspect-ratio crop')
    assert.equal(url.searchParams.get('fit'), 'max', 'The CDN must never upscale beyond the source')
    assert.equal(url.searchParams.get('q'), '85')
    assert.equal(url.searchParams.get('auto'), 'format')
    assert.equal(url.searchParams.get('rect'), new URL(originalUrl).searchParams.get('rect'), 'Preserve only the editorial crop')
  }
}
assert.equal(new URL(sanityImageLoader({src: builder.image(image).url(), width: 800, quality: 90})).searchParams.get('q'), '90')
console.log('Image presentation checks passed: native ratios, editorial crops, responsive widths, quality, and no upscaling.')
