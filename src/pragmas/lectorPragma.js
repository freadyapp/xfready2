import { Pragma, html, _e, util, block } from "pragmajs"
import { Xfready } from "./xfready"
import Mousetrap from "mousetrap"
import { Readability } from '@mozilla/readability'
import { injectStyle } from "../.build_assets/index";
import { Lector, helpers } from "lectorjs"
import { ShadowPragma } from "../misc/shadowPragma"

const wfy = helpers.wfy
window.Mousetrap = Mousetrap

let popper = block`
<div xfready id=lector class='fade-onload'>
    <div id='exit' class='button'> Exit </div>
    <div id='reader-rapper'> 
        <div id='reader' class='article'> 
        </div>
    </div>
</div>
`

export class LectorPragma extends ShadowPragma {
    constructor() {
        console.time('lector construction')
        super()

        this.as(_e(`div.`))
            .shadow.append(popper)

        globalThis.pragmaSpace.integrateMousetrap(Mousetrap)
        window.Mousetrap = Mousetrap

        this.injectStyles("sanitized_elements", "syntax_highlight", "lector")

        this.createEvents('load', 'load article', 'parse article', 'render', 'destroy')

        // document.body.appendChild(element)


        this.shadow.find('#exit').listenTo('click', () => {
            this.exit()
        })

        this.reader = this.shadow.find("#reader")
                       .addClass("loading")

        console.timeEnd('lector construction')
        // this.element.find("#reader").html(article.content)
    }

    async loadArticle(reload=false) {
        if (!reload && this.article) return this
        var article = new Readability(document.cloneNode(true)).parse()
        this.article = article
        this.triggerEvent('load article', article)
        return this
    }

    async parseArticle() {
        if (this._parsed) return true
        
        console.log('article is', this.article)

        this.reader.html(this.article.content)
                   .removeClass('collapsed')

        await wfy(this.reader)

        this.article.content = this.reader.html()
        console.log('triggering event with', this.article)
        this.triggerEvent('parse article', this.article)
        this._parsed = true
    }

    load() {
        console.time('loading lec....')
        if (this.loaded) return console.warn('lec already loaded')

        setTimeout(async () => {
            this.loadArticle()
            await this.parseArticle()
            // console.log(article)

            // this.reader.appendTo('html')
            this.lec = (await Lector(this.reader, {
                wfy: false,
                onboarding: false,
                scaler: true,
                experimental: true,

                fullStyles: true,
                defaultStyles: true,
                settings: true,

                styleInjector: (style, name) => {
                    this._injectCSS(name, style)
                }

            })).run(function() {
                this.mark.addClass('billion-z-index')
            }).run(() => {
                this.shadow.find('#reader').removeClass('loading')
                console.log("lec: ", this.lec)
                this.loaded = true
                this.triggerEvent('load', this.lec)
                console.timeEnd('loading lec....')
            })

            // let clone = _e(this.lec.mark.element.cloneNode(true)).appendTo(this.reader)
            // this.lec.mark.element.destroy()
            // this.lec.mark.element.replaceWith(clone)
            // clone.replaceWith(this.lec.mark.element)

            

        }, 0)
        return this
    }

    render() {
        console.time('RENDERING')

        this.ogBody = _e('body').clone()

        _e('body').html('')
                  .append(this)
        // this.shadow.show()

        setTimeout(() => {
            this.reader.findAll('code').forEach(code => {
                console.log("PARSE:", code.html())
                window.bridge.request({ parse: code.textContent }).then(_html => {
                    console.log("parsed", code)
                    code.html(Xfready.sanitizeHtml(_html))
                    // console.log("parsed", code)
                    // code.html('ue')
                })
                // .appendTo(this.reader)
            })
            this.triggerEvent('render')
            console.timeEnd('RENDERING')
        // _e('body').destroy()

        }, 10)
        // window.bridge.request({ parse: this.element.html() }).then(_html => {
            // console.log('html', _html)
            // this.reader.html(' ')

            // Xfready.sanitizeHtml(_html)
            // html`<div>
            // <h1> READING </h1> <div>${_html}</div></div>`.prependTo(this.reader)

            // this.element.find("#reader").html()
            // this.html(html.value)
        // })
            // hljs.highlightAll()

        return this
    }

    exit() {
        // this.lec.destroy()
        
        console.log('og body is', this.ogBody)

        _e('body').replaceWith(this.ogBody)
        this.element.destroy()
        // _e('html').append(this.ogBody)
        // this.ogBody.appendTo(_e('html'))
                    // .removeClass(`xfready-lector-open`)
        this.triggerEvent('destroy')
        return this
    }
}

// let injected = false
export function _lector() {
    // if (!injected) {
        // let styles = [ ]
        // styles.forEach(s => injectStyle(s))
        // console.log("injecting", styles)
        // injectStyle("sanitized_elements")
        // injectStyle("syntax_highlight")
        // injectStyle("lector")
        // injected = true
    // }

    return new LectorPragma()
}
