const url = 'http://localhost:3000/'

const incomeBtn = document.getElementById('income-btn')
const incomeForm = document.getElementById('income')
const expensesBtn = document.getElementById('expenses-btn')
const expensesForm = document.getElementById('expenses')

const selected = document.querySelector('.selected')
const selectedText = selected.querySelector('span')
const options = document.querySelector('.options')
const dropdownIcon = document.querySelector('.selected img')

selected.addEventListener('click', () => {
    toggleDropdownProperties()
})

document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', () => {
        selectedText.textContent = option.textContent
        updateCards()
        updateListItemsByFrequency()
        toggleDropdownProperties()
    })
})

const incomeCard = document.getElementById('income-card')
const expensesCard = document.getElementById('expenses-card')
const balanceCard = document.getElementById('balance-card')

updateCards()

incomeBtn.addEventListener('click', () => {
    toggleForm(incomeBtn, incomeForm)
})
expensesBtn.addEventListener('click', () => {
    toggleForm(expensesBtn, expensesForm)
})

const freqBtns = document.querySelectorAll('.freq-btn')
freqBtns.forEach(btn => {
    if (btn.value === 'weekly') {
        btn.classList.toggle('active')
    }

    btn.addEventListener('click', () => {
        btn.classList.add('active')
        freqBtns.forEach(other => {
            if (other.classList.contains('active') && other !== btn) {
                other.classList.toggle('active')
            }
        })

        const freq = btn.parentElement.querySelector('input')
        freq.value = btn.value
    })
})

const forms = document.querySelectorAll('form')
forms.forEach(form => {
    form.addEventListener('submit', event => {
        formHandler(event, form)
    })
})

const incomeList = document.querySelector('.income-list')
const incomeListNone = document.querySelector('.income-list .default-value')

getAll('income').then(res => {
    res.forEach(data => {
        createItem(data)
    })
}).catch(error => {
    console.log(error)
})

const expensesList = document.querySelector('.expense-list')
const expenseListNone = document.querySelector('.expense-list .default-value')

getAll('expenses').then(res => {
    res.forEach(data => {
        createItem(data)
    })
}).catch(error => {
    console.log(error)
})

const upcomingPayments = document.querySelector('.upcoming-list')
const upcomingListNone = document.querySelector('.upcoming-list .default-value')

updateUpcomingPayments()
checkListCount()

const incomeBar = document.querySelector('.income-overview')
const expensesBar = document.querySelector('.expenses-overview')

updateOverview()

// Functions below ------------------------------------------------------------

async function getIncomeTotal() {
    try {
        const response = await fetch((`${url}income`), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        
        if (!response.ok) {
            throw new error('Request error')
        }

        const data = await response.json()

        let total = 0
        data.forEach(income => {
            let {amount, frequency} = income
            amount = convertValueByFrequency(parseFloat(amount), frequency)
            total += amount
        })

        return total
    } catch (error) {
        console.log(error)
    }
}

async function getExpensesTotal() {
    try {
        const response = await fetch((`${url}expenses`), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        
        if (!response.ok) {
            throw new error('Request error')
        }

        const data = await response.json()

        let total = 0
        data.forEach(expense => {
            let {amount, frequency} = expense
            amount = convertValueByFrequency(parseFloat(amount), frequency)
            total += amount
        })

        return total
    } catch (error) {
        console.log(error)
    }
}

function updateCards() {
    let balance = 0

    getIncomeTotal().then(income => {
        balance += income
        income = income.toFixed(2)
        incomeCard.querySelector('.card-amount').textContent = `$${income}`
        return getExpensesTotal()
    }).then(expenses => {
        balance -= expenses
        expenses = expenses.toFixed(2)
        expensesCard.querySelector('.card-amount').textContent = `$${expenses}`

        balance = balance.toFixed(2)
        balanceCard.querySelector('.card-amount').textContent = `$${balance}`
    }).catch(error => {
        console.log(error)
    })
}

function toggleForm(btn, form) {
    btn.classList.toggle('active')
    form.classList.toggle('hide')

    if (form.classList.contains('hide')) {
        resetForm(form)
    }
}

function resetForm(form) {
    form.reset()
    freqBtns.forEach(btn => {
        if (btn.classList.contains('active')) {
            btn.classList.toggle('active')
        }

        if (btn.value === 'weekly') {
            btn.classList.toggle('active')
        }
    })

    form.querySelector('.form-msg').classList.add('hide')
}

function formHandler(event, form) {
    event.preventDefault()

    let valid = true
    const formMsg = form.querySelector('.form-msg')

    const inputs = form.querySelectorAll('input')
    inputs.forEach(input => {
        if ((input.value === '') 
            || (input.name === 'amount' && isNaN(input.value)) ) {
            valid = false
        }
    })

    if (!valid) {
        formMsg.classList.remove('hide')
        return
    }

    formMsg.classList.add('hide')

    send(form)
    form.classList.toggle('hide')
    const btn = form.previousElementSibling
    btn.classList.toggle('active')
    resetForm(form)
}

function toggleDropdownProperties() {
    selected.classList.toggle('active')
    dropdownIcon.classList.toggle('active')
    options.classList.toggle('hide')
}

async function send(form) {
    const formData = new FormData(form)
    const type = form.id

    const jsonData = {};
    for (const [key, value] of formData.entries()) {
        jsonData[key] = value;
    }

    try {
        const response = await fetch((url + type), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonData)
        })

        if (response.status === 201) {
            const data = await response.json()
            updateCards()
            createItem(data[0])
        }
    } catch (err) {
        console.log(err)
    }
}

function updateListItemsByFrequency() {
    const amounts = document.querySelectorAll('.amount-btn-container span')
    amounts.forEach(amount => {
        const value = parseFloat(amount.getAttribute('amount'))
        const freq = amount.getAttribute('frequency')
        const newValue = convertValueByFrequency(value, freq)
        amount.textContent = `$${newValue.toFixed(2)}`
    })
}

function updateUpcomingPayments() {
    const container = document.createElement('div')
    container.id = 'upcoming-container'

    getUpcomingPayments().then(res => {
        res.forEach(payment => {
            const {name, amount, date} = payment
            const listElement = document.createElement('li')

            const newDate = new Date(date);
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'};

            let formatted = newDate.toLocaleDateString('en-AU', options)
            const [weekday, day, month, year] = formatted.split(' ')
            formatted = `${weekday}, ${day} ${month} ${year}`

            listElement.textContent = `${name} - $${amount} due ${formatted}`
            container.appendChild(listElement)
        })

        const parent = upcomingPayments.children[1]
        const childToReplace = document.getElementById('upcoming-container')
        parent.replaceChild(container, childToReplace)

        const upcoming = document.getElementById('upcoming-container')
        if (upcoming.hasChildNodes()) {
            upcomingListNone.classList.add('hide')
        } else {
            upcomingListNone.classList.remove('hide')
        }
    }).catch(error => {
        console.log(error)
    })
}

async function updateOverview() {
    try {
        let incomeTotal = 0
        let expensesTotal = 0

        const incomeResponse = await fetch((url + 'income/total'), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        const expensesResponse = await fetch((url + 'expenses/total'), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        
        incomeResponse.json().then(res1 => {
            if (res1.value) incomeTotal = parseFloat(res1.value)
            return expensesResponse.json()
        }).then(res2 => {
            if (res2.value) expensesTotal = parseFloat(res2.value)
            
            const total = incomeTotal + expensesTotal

            if (incomeTotal === 0) {
                incomeBar.style.flexGrow = 0
                expensesBar.style.borderRadius = '0.5rem'
            } else {
                incomeBar.style.flexGrow = incomeTotal / total
                expensesBar.style.borderRadius = '0 0.5rem 0.5rem 0'
            }

            if (expensesTotal === 0) {
                expensesBar.style.flexGrow = 0
                incomeBar.style.borderRadius = '0.5rem'
            } else {
                expensesBar.style.flexGrow = expensesTotal / total
                incomeBar.style.borderRadius = '0.5rem 0 0 0.5rem'
            }
        })
    } catch (error) {
        console.log(error)
    }
}

function checkListCount() {
    if (incomeList.childElementCount > 1) {
        incomeListNone.classList.add('hide')
    } else {
        incomeListNone.classList.remove('hide')
    }

    if (expensesList.childElementCount > 1) {
        expenseListNone.classList.add('hide')
    } else {
        expenseListNone.classList.remove('hide')
    }
}

async function getAll(type) {
    try {
        const response = await fetch((url + type), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        
        if (!response.ok) {
            throw new error('Request error')
        }

        const jsonData = await response.json()
        return jsonData
    } catch (error) {
        console.log(error)
    }
}

async function getUpcomingPayments() {
    try {
        const response = await fetch((`${url}payments/upcoming`), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        
        if (!response.ok) {
            throw new error('Request error')
        }

        const jsonData = await response.json()
        return jsonData
    } catch (error) {
        console.log(error)
    }
}

function createItem(data) {
    const {payment_id, type, name, amount, frequency} = data

    const converted = convertValueByFrequency(parseFloat(amount), frequency)

    const itemList = document.querySelector(`.${type}-list`) 

    const container = document.createElement('div')
    const nameElement = document.createElement('span')
    const amountElement = document.createElement('span')
    amountElement.setAttribute('amount', amount)
    amountElement.setAttribute('frequency', frequency)
    
    nameElement.textContent = name
    amountElement.textContent = `$${converted.toFixed(2)}`

    const removeBtn = document.createElement('button')
    removeBtn.classList.add('remove-btn')
    removeBtn.addEventListener('click', () => {
        removeItem(type, payment_id)
    })

    container.classList.add('amount-btn-container')
    container.classList.add('wrapper-flex')
    container.appendChild(amountElement)
    container.appendChild(removeBtn)

    const item = document.createElement('li')
    item.id = `${type}_${payment_id}`
    item.classList.add('list-item')
    item.classList.add('wrapper-flex')
    item.appendChild(nameElement)
    item.appendChild(container)

    itemList.appendChild(item)
    updateUpcomingPayments()
    updateOverview()
    checkListCount()
}

async function removeItem(type, id) {
    let newUrl = `${url}${type}/${id}`
    if (type === 'expense') {
        newUrl = `${url}${type}s/${id}`
    }

    try {
        const response = await fetch(newUrl, {
            method: "DELETE"
        })

        if (!response.ok) {
            throw new error('Request error')
        }

        document.getElementById(`${type}_${id}`).remove()
        updateCards()
        updateUpcomingPayments()
        updateOverview()
        checkListCount()
    } catch (error) {
        console.log(error)
    }
}

function convertValueByFrequency(value, storedFreq) {
    const siteFreq = selectedText.textContent

    switch (siteFreq) {
        case 'Weekly':
            if (storedFreq === 'fortnightly') {
                value = value / 2
            } else if (storedFreq === 'monthly') {
                value = value / 4
            }
            break

        case 'Fortnightly':
            if (storedFreq === 'weekly') {
                value = value * 2
            } else if (storedFreq === 'monthly') {
                value = value / 2
            }
            break

        case 'Monthly':
            if (storedFreq === 'weekly') {
                value = value * 4
            } else if (storedFreq === 'fortnightly') {
                value = value * 2
            }
            break
    }

    return value
}