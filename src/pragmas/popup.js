import { Pragma, html, _e, block } from "pragmajs"
import { SVG, styles } from "../.build_assets/index"
import { _lector } from "./lectorPragma"
import { Xfready } from "./xfready"
import { ShadowPragma } from "../misc/shadowPragma"

let panel = block`
    <div class='article-panel'>
        <div class='time-url'>
            <h3 class='time blue no-select' id='time'>15'</h3>
            <p class='url' id='url'>en.wikipedia.org</p>
        </div>
        <h3 class='title' id='title'>
            Legality of bitcoin by country or territory
            and the legality of marijuana by country and yeeters
        </h3>
        <div class='save-read'>
            <div class='button-gray' id='exit'>${SVG('empty-heart-icon')} Save </div>
            <div class='button-gray' id='read'>${SVG('read-icon')} Read </div>
        </div>
    </div>
`.define({
    title: "#title",
    url: "#url",
    eta: "#time"
})

let template = html`
        <div xfready id=popup class='fade-onload'>
            <div class='article-panel'>
            </div>
            <div class='upload-dash'>
                <div class='hyperbutton upload'>${SVG('upload-icon')}Upload PDF</div>
                <div class='hyperbutton dashboard'>${SVG('home-icon')}Dashboard</div>
            </div>
            <div class='xfready-footer'>
                ${SVG('logo')}
                <div class='hyperbutton visibility'>
                    <div class="checkbox">
                        ${SVG('checked-checkbox')} 
                        ${SVG('empty-checkbox')}
                    </div>
                    Show on websites
                </div>
            </div>
        </div>
    `

export class Popup extends ShadowPragma {

    constructor() {
        super()

        this.as(template)
        this.shadow.find(".article-panel").replaceWith(panel.element)

        this.injectStyles('main', 'popup')

        pragmaSpace.onDocLoad(() => {
            this.lector = _lector()
                            .on('load article', slurpArticle)
                            .on('parse article', createArticle)
                            .loadArticle()
        })

        // panel.title.listenTo('click', () => )

        this.shadow.find("#read").listenTo('click', () => {
            this.lector
                    .load()
                    .render()
        })

        this.shadow.find("#exit").listenTo('click', () => {
            this.element.hide()
        })

        this.shadow.find('.visibility').listenTo('click', ()=> {       // CHECKBOX display on websites
            this.shadow.find('#checked-checkbox').toggleClass('fade-out')
            console.log('CLICKED')
        })
    }
}

function slurpArticle(article) {
    panel.title.html(article.title)
    panel.url.html(authoredBy(article))
    panel.eta.html(article.length/5)

    // return {
    //     url: HOST.getURL(),
    //     body: article.content,
    //     saved,
    //     meta: {
    //         title: article.title,
    //         by: authoredBy(article),
    //         words: article.length/5,
    //         pages: 1
    //     }
    // }
}
function createArticle(article, saved=true) {
    console.log('creating new article')
    
    let link = {
        url: HOST.getURL(),
        body: article.content,
        saved,
        meta: {
            title: article.title,
            by: authoredBy(article),
            words: article.length/5,
            pages: 1
        }
    }

    window.bridge.request("links:create", { link })
}

function authoredBy(article) {
    return article.byline ? "by " + article.byline : article.siteName || HOST.get()
}

export function _popup(){
    return new Popup
}
