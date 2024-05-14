class Card extends HTMLElement {
    
    constructor() {
        super()
        this.shadow = this.attachShadow({mode: 'open'})
    }

    static get observedAttributes() {
        return ['type', 'freq']
    }

    get type() {
        return this.getAttribute('type')
    }

    get freq() {
        return this.getAttribute('freq')
    }

    connectedCallback() {
        const titleText = this.type.charAt(0).toUpperCase() + this.type.slice(1)

        const wrapper = document.createElement('div')
        wrapper.classList.add(this.type + '-div')

        const title = document.createElement('p')
        title.textContent = titleText
        title.classList.add('title')

        this.amount = document.createElement('p')
        this.getValue().then(data => {
            if (data.value === null) data.value = '0'
            this.amount.textContent = '$' + data.value
        }).catch(err => {
            this.amount.textContent = '$0'
            console.log(err)
        })
        this.amount.classList.add('amount')

        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', './css/card-style.css');
        
        this.shadow.appendChild(link)
        this.shadow.appendChild(wrapper)
        wrapper.appendChild(title)
        wrapper.appendChild(this.amount)
    }

    async getValue() {
        try {
            let type = this.type
            if (this.type === 'balance') {
                type = 'payments/' + this.type
            }

            let url = `http://localhost:3000/${type}`

            const response = await fetch(url)
            response.json().then(data => {
                console.log(data)
            })
        } catch (err) {
            console.log(err)
        }
    }

    updateValue() {
        this.getValue().then(data => {
            if (data.value === null) data.value = '0'
            this.amount.textContent = '$' + data.value
        }).catch(err => {
            this.amount.textContent = '$0'
            console.log(err)
        })
    }
}

customElements.define('my-card', Card)