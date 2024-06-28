// Local
const url = 'http://localhost:3000/'

// Index page -----------------------------------------------------------------
if (document.getElementById('index-body')) {
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
            paymentFormHandler(event, form)
        })
    })

    const incomeList = document.querySelector('.income-list')
    const incomeListNone = incomeList.querySelector('.default-value')

    getAll('income').then(res => {
        res.forEach(data => {
            createItem(data)
        })
    }).catch(error => {
        console.log(error)
    })

    const expensesList = document.querySelector('.expense-list')
    const expenseListNone = expensesList.querySelector('.default-value')

    getAll('expenses').then(res => {
        res.forEach(data => {
            createItem(data)
        })
    }).catch(error => {
        console.log(error)
    })

    const upcomingPayments = document.querySelector('.upcoming-list')
    const upcomingListNone = upcomingPayments.querySelector('.default-value')

    updateUpcomingPayments()
    checkListCount()

    const incomeBar = document.querySelector('.income-overview')
    const expensesBar = document.querySelector('.expenses-overview')

    updateOverview()

    // Functions --------------------------------------------------------------

    /**
     * Sends a request to the database for the total of all income items.
     * 
     * @returns {number} total of all income items.
     */
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

    /**
     * Sends a request to the database for the total of all expenses items.
     * 
     * @returns {number} total of all expense items.
     */
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

    /**
     * Utilises asynchronous functions above and handles each promise
     * fulfilment to fill the value cards with appropriate totals.
     */
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
            const expenseAmount = expensesCard.querySelector('.card-amount')
            expenseAmount.textContent = `$${expenses}`

            balance = balance.toFixed(2)
            const balanceAmount = balanceCard.querySelector('.card-amount')
            balanceAmount.textContent = `$${balance}`
        }).catch(error => {
            console.log(error)
        })
    }

    /**
     * Makes the given button's corresponding form visible when clicked.
     * 
     * @param {HTMLElement} btn 
     * @param {HTMLElement} form 
     */
    function toggleForm(btn, form) {
        btn.classList.toggle('active')
        form.classList.toggle('hide')

        if (form.classList.contains('hide')) {
            resetForm(form)
        }
    }


    /**
     * Resets all form values including form feedback message.
     * 
     * @param {HTMLElement} form 
     */
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

    /**
     * Handles the manual submission for the form when the corresponding
     * submit button is clicked.
     * 
     * @param {SubmitEvent} event 
     * @param {HTMLElement} form 
     * 
     * @returns {null} When the form values are not valid and displays message.
     */
    function paymentFormHandler(event, form) {
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

        sendPaymentItem(form)
        form.classList.toggle('hide')
        const btn = form.previousElementSibling
        btn.classList.toggle('active')
        resetForm(form)
    }

    /**
     * Used for the frequency dropdown.
     * Handles button shaping and layout.
     */
    function toggleDropdownProperties() {
        selected.classList.toggle('active')
        dropdownIcon.classList.toggle('active')
        options.classList.toggle('hide')
    }

    /**
     * Parses income/expense form data as json and prepares request for entry.
     * On success, updates the appropriate value cards and adds item to page.
     * 
     * @param {HTMLElement} form 
     */
    async function sendPaymentItem(form) {
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

    /**
     * Passes value and frequency to invoke conversion function.
     */
    function updateListItemsByFrequency() {
        const amounts = document.querySelectorAll('.amount-btn-container span')
        amounts.forEach(amount => {
            const value = parseFloat(amount.getAttribute('amount'))
            const freq = amount.getAttribute('frequency')
            const newValue = convertValueByFrequency(value, freq)
            amount.textContent = `$${newValue.toFixed(2)}`
        })
    }

    /**
     * Replaces (if any) the current upcoming payments on the page
     * with the new top 3 payments.
     */
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
                
                const listText = `${name} - $${amount} due ${formatted}`
                listElement.textContent = listText
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

    /**
     * Calculates the ratio between income and expenses.
     * Styles the overview bar according to their ratio.
     */
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

    /**
     * If the list has any items, hides the 'None' label.
     * Checks for all lists on the dashboard page.
     */
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

    /**
     * Sends a request to the end point which gives the top 3 upcoming expenses
     * in the database.
     * 
     * @returns {Promise} jsonData - data to be handled externally upon success
     */
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

    /**
     * Constructs the necessary containers for each item to display on the page.
     * Includes a remove button for each item.
     * 
     * Updates dynamic values on the page.
     * 
     * @see updateUpcomingPayments
     * @see updateOverview
     * @see checkListCount
     * 
     * @param {Object} data 
     */
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

    /**
     * Corresponds to the remove button given to income/expense items.
     * Constructs and sends a delete request for the appropriate item.
     * 
     * Updates necessary dynamic values on the page.
     * 
     * @param {String} type 
     * @param {String} id 
     */
    async function removeItem(type, id) {
        let newUrl = `${url}${type}/${id}`
        if (type === 'expense') {
            newUrl = `${url}${type}s/${id}`
        }

        try {
            const response = await fetch(newUrl, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
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

    /**
     * Converts a given value depending on its stored frequency.
     * i.e $10 weekly = $20 fortnightly
     * 
     * @param {Number} value 
     * @param {String} storedFreq
     *  
     * @returns {number} Converted value according to frequency
     */
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
}

// Schedule -------------------------------------------------------------------

if (document.getElementById('schedule-body')) {
    const calendar = document.getElementById('calendar-content')
    const monthYear = document.getElementById('month-year')
    const dateLeft = document.getElementById('date-left')
    const dateRight = document.getElementById('date-right')

    // Primary date value used for generation and indicator logic
    const pageDate = new Date()
    setMonthYear(pageDate)

    dateLeft.addEventListener('click', () => {
        pageDate.setMonth(prevMonth(pageDate))
        setMonthYear(pageDate)
        generateCalendar(pageDate)
        generatePaymentIndicators(pageDate)
        generateTaskIndicators(pageDate)
        updateDateClickEvents(pageDate)
    })

    dateRight.addEventListener('click', () => {
        pageDate.setMonth(nextMonth(pageDate))
        setMonthYear(pageDate)
        generateCalendar(pageDate)
        generatePaymentIndicators(pageDate)
        generateTaskIndicators(pageDate)
        updateDateClickEvents(pageDate)
    })

    generateCalendar(pageDate)
    generatePaymentIndicators(pageDate)
    generateTaskIndicators(pageDate)

    const sideBar = document.getElementById('sidebar')
    const dateTitle = document.getElementById('date-title')
    const closeBtn = document.getElementById('sidebar-close')
    const paymentList = document.getElementById('payment-list')
    const paymentNone = document.querySelector('#payment-list .default-value')
    const taskList = document.getElementById('task-list')
    const taskNone = document.querySelector('#task-list .default-value')
    const taskForm = document.getElementById('task-form')

    updateDateClickEvents(pageDate)

    closeBtn.addEventListener('click', () => {
        sideBar.classList.add('hide')
        sideBar.classList.remove('show')
    })

    taskForm.addEventListener('submit', event => {
        taskFormHandler(event, taskForm, dateTitle.textContent)
    })

    // Functions --------------------------------------------------------------

    /**
     * Creates a new date object with the current date.
     * 
     * @returns {Date} generic date object.
     */
    function currentDate() {
        return new Date()
    }

    /**
     * Creates a new date object started at the first date to ensure no
     * overlap for date indexing.
     * 
     * @param {Date} date 
     * @returns {Date} Month index of the previous month
     */
    function prevMonth(date) {
        newDate = new Date(date.getFullYear(), date.getMonth(), 1)
        return newDate.getMonth() - 1
    }

    /**
     * Creates a new date object started at the first date to ensure no
     * overlap for date indexing.
     * 
     * @param {Date} date 
     * @returns {Date} Month index of the next month
     */
    function nextMonth(date) {
        newDate = new Date(date.getFullYear(), date.getMonth(), 1)
        return newDate.getMonth() + 1
    }

    /**
     * Used to update the page's calendar title.
     * 
     * @param {Date} date 
     */
    function setMonthYear(date) {
        const month = date.toLocaleDateString('en-au', {month: 'long'})
        monthYear.textContent = `${month}, ${date.getFullYear()}`
    }

    /**
     * Handles click events for date numbers to display the sidebar.
     * Changes the date title in the sidebar according to clicked date.
     * 
     * Displays payments and tasks for that date.
     * 
     * @see displayPayments
     * @see displayTasks
     * 
     * @param {Date} date 
     */
    function updateDateClickEvents(date) {
        const dates = document.querySelectorAll('p')
        dates.forEach(day => {
            if (day.textContent !== '') {
                day.addEventListener('click', () => {
                    if (sideBar.classList.contains('hide')) {
                        sideBar.classList.add('show')
                        sideBar.classList.remove('hide')
                    }

                    const title = `${day.textContent} ${monthYear.textContent}`
                    dateTitle.textContent = title
                    displayPayments(date, day.textContent)
                    displayTasks(date, day.textContent)
                })
            }
        })
    }

    /**
     * Generates the structure and content of the calendar using a table.
     * Create a column for each day of the week and cycles through five rows
     * to fit all dates.
     * 
     * @param {Date} date 
     */
    function generateCalendar(date) {
        const currentTable = document.querySelector('table')
        const currentDate = new Date()
        const newTable = document.createElement('table')

        const dayLabels = document.createElement('tr')
        dayLabels.setAttribute('id', 'weekdays')
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for (let i = 0; i < 7; i++) {
            const header = document.createElement('th')
            header.textContent = weekdays[i]
            dayLabels.appendChild(header)
        }

        newTable.appendChild(dayLabels)

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        const lastDay = new Date(date.getFullYear(), nextMonth(date), 0)
        const firstWeekDay = (firstDay.getDay() + 6) % 7

        let dayCount = 0
        let start = false // Flag used to only count cells that will have dates
        for (let i = 0; i < 5; i++) {
            const row = document.createElement('tr')

            for (let j = 0; j < 7; j++) {

                // Starts the count when the weekdays match
                if (j === firstWeekDay && dayCount === 0) {
                    start = true
                    dayCount = 1
                }
                const data = document.createElement('td')

                const day = document.createElement('p')
                if (start) day.textContent = dayCount

                // Adds a circle to the current day
                if (dayCount === currentDate.getDate() 
                    && date.getMonth() === currentDate.getMonth() 
                    && date.getFullYear() == currentDate.getFullYear()) {
                    day.classList.add('date-highlight-dark')
                }

                const container = document.createElement('div')
                container.setAttribute('id', `day-${dayCount}`)
                container.classList.add('circle-container')

                data.appendChild(day)
                data.appendChild(container)
                row.appendChild(data)

                if (start) dayCount++
                if (dayCount > lastDay.getDate()) start = false
            }

            newTable.appendChild(row)
        }

        calendar.replaceChild(newTable, currentTable)
    }

    /**
     * Makes a request to the database to get all expense items for that date.
     * Creates a list item for each payment and removes any children 
     * previously appended by other click events.
     * 
     * @param {Date} date 
     * @param {String} selectedDay 
     */
    function displayPayments(date, selectedDay) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = selectedDay.padStart(2, '0')
        const searchDate = `${date.getFullYear()}-${month}-${day}`

        getItemByDate(searchDate, 'expenses').then(res => {
            while (paymentList.children.length > 1) {
                paymentList.removeChild(paymentList.children[1])
            }

            res.forEach(expense => {
                const {name, amount} = expense
                const listElement = document.createElement('li')
                listElement.textContent = `${name} - $${amount}`

                paymentList.appendChild(listElement)
            })

            updatePaymentNone()
        }).catch(error => {
            console.log(error)
        })
    }

    /**
     * Displays the 'None' label if there are no expenses in the list.
     */
    function updatePaymentNone() {
        if (paymentList.children.length > 1) {
            paymentNone.classList.add('hide')
        } else {
            paymentNone.classList.remove('hide')
        }
    }

    /**
     * Generates pink circles for any dates that will have an expense/payment
     * that is due. Includes recurring payments.
     * 
     * Only displays indicators starting from the specified date of the item.
     * 
     * @param {Date} date 
     */
    function generatePaymentIndicators(date) {
        getAll('expenses').then(res => {
            const dates = new Set()
            
            res.forEach(expense => {
                const frequency = expense.frequency
                const expenseDate = expense.date
                let first = new Date(expenseDate)
                const weekday = first.getDay()

                if (date.getMonth() > first.getMonth()) {
                    let offset = new Date(first)
                    while (offset.getMonth() !== date.getMonth()) {
                        offset = nextDate(offset, frequency)
                    }

                    while (offset.getDay() !== weekday) {
                        offset.setDate(offset.getDate() - 1)
                    }

                    first = offset
                }

                if (date.getMonth() >= first.getMonth()) {
                    dates.add(first.getDate())

                    let next = nextDate(first, frequency)
                    while (next.getMonth() === date.getMonth()) {
                        dates.add(next.getDate())
                        next = nextDate(next, frequency)
                    }
                }
            })

            dates.forEach(day => {
                addPaymentIndicator(day)
            })
        }).catch(error => {
            console.log(error)
        })
    }

    /**
     * Generates gold circles for any dates that have tasks.
     * 
     * @param {Date} date 
     */
    function generateTaskIndicators(date) {
        getAll('tasks').then(res => {
            const dates = new Set()
            res.forEach(task => {
                const taskDate = task.date
                const newDate = new Date(taskDate)

                if (newDate.getMonth() === date.getMonth()) {
                    dates.add(newDate.getDate())
                }
            })

            dates.forEach(day => {
                addTaskIndicator(day)
            })
        }).catch(error => {
            console.log(error)
        })
    }


    /**
     * Used to calculate the next date occurence of an expense item based on
     * its frequency.
     * 
     * @param {Date} date 
     * @param {String} frequency
     *  
     * @returns {Date} next occurence of payment from the specified date.
     */
    function nextDate(date, frequency) {
        const newDate = new Date(date)

        if (frequency === 'weekly') {
            newDate.setDate(newDate.getDate() + 7)
        } else if (frequency ==='fortnightly') {
            newDate.setDate(newDate.getDate() + 14)
        } else if (frequency === 'monthly') {
            newDate.setMonth(nextMonth(newDate))
        }
        
        return newDate
    }

    /**
     * Creates a request to the database for any items in the given date.
     * 
     * @param {Date} date 
     * @param {String} type 
     * 
     * @returns {Promise} item data to be parsed externally on success
     */
    async function getItemByDate(date, type) {
        try {
            const response = await fetch((`${url}${type}/date/${date}`), {
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

    /**
     * Handles the manual submission for the task form.
     * Resets form and hides message (if displayed) on success.
     * 
     * @param {SubmitEvent} event 
     * @param {HTMLElement} form 
     * @param {String} selectedDay
     *  
     * @returns {null} If the task description is invalid and displays message.
     */
    function taskFormHandler(event, form, selectedDay) {
        event.preventDefault()

        let valid = true
        const formMsg = form.querySelector('.form-msg')

        const input = form.querySelector('input')
        if (input.value === '') {
            valid = false
        }

        if (!valid) {
            formMsg.classList.remove('hide')
            return
        }

        formMsg.classList.add('hide')

        sendTaskItem(form, selectedDay)
        form.reset()
    }

    /**
     * Creates a post request to the database by constructing an object based
     * on form values.
     * Uses (parses) the title of the sidebar to set the date for the request.
     * 
     * @param {HTMLElement} form 
     * @param {String} selectedDay 
     */
    async function sendTaskItem(form, selectedDay) {
        const formData = new FormData(form)
        const type = 'tasks'

        const jsonData = {};
        jsonData['description'] = formData.get('description')
        
        const month = (pageDate.getMonth() + 1).toString().padStart(2, '0')
        const day = selectedDay.split(' ')[0].padStart(2, '0')
        jsonData['date'] = `${pageDate.getFullYear()}-${month}-${day}`

        try {
            const response = await fetch((url + type), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            })

            if (response.status === 201) {
                response.json().then(res => {
                    addTask(res)
                }).catch(error => {
                    console.log(error)
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Makes a request to the database to get all tasks for the given date.
     * Lists all tasks in the sidebar.
     * 
     * @param {Date} date 
     * @param {String} selectedDay 
     */
    function displayTasks(date, selectedDay) {
        const month = (nextMonth(date)).toString().padStart(2, '0')
        const day = selectedDay.padStart(2, '0')
        const searchDate = `${date.getFullYear()}-${month}-${day}`

        getItemByDate(searchDate, 'tasks').then(res => {
            while (taskList.children.length > 1) {
                taskList.removeChild(taskList.children[1])
            }

            res.forEach(task => {
                addTask(task)
            })

            updateTaskNone()
        }).catch(error => {
            console.log(error)
        })
    }

    /**
     * Constructs the necessary containers to form task content.
     * Includes remove button for the corresponding task.
     * Creates indicators for the task.
     * 
     * @param {Object} task 
     */
    function addTask(task) {
        const {task_id, description} = task
        const listElement = document.createElement('li')
        listElement.setAttribute('id', `task_${task_id}`)
        const spanElement = document.createElement('span')
        spanElement.textContent = `${description}`

        const deleteBtn = document.createElement('button')
        deleteBtn.classList.add('remove-btn')
        deleteBtn.addEventListener('click', () => {
            removeTask(task_id)
        })
        
        listElement.appendChild(spanElement)
        listElement.appendChild(deleteBtn)
        taskList.appendChild(listElement)

        updateTaskNone()
        updateTaskIndicator()
    }

    /**
     * Displays the 'None' label if there are no tasks in the list.
     */
    function updateTaskNone() {
        if (taskList.children.length > 1) {
            taskNone.classList.add('hide')
        } else {
            taskNone.classList.remove('hide')
        }
    }

    /**
     * Used to dynamicallly display task indicators for any days that contain
     * tasks.
     */
    function updateTaskIndicator() {
        const day = dateTitle.textContent.split(' ')[0]

        if (taskList.children.length > 1) {
            addTaskIndicator(day)
        } else {
            removeTaskIndicator(day)
        }        
    }

    /**
     * Adds a task indicator for the given day.
     * 
     * @param {String} day 
     */
    function addTaskIndicator(day) {
        const container = document.getElementById(`day-${day}`)
        const indicator = document.createElement('div')
        indicator.classList.add('circle-task')

        if (container.querySelector('.circle-task') === null) {
            container.appendChild(indicator)
        }
    }

    /**
     * Removes the task indicator from the specified day.
     * 
     * @param {String} day 
     */
    function removeTaskIndicator(day) {
        const indicator = document.querySelector(`#day-${day} .circle-task`)
        indicator.remove()
    }

    /**
     * Adds a payment indicator for the given day.
     * 
     * @param {String} day 
     */
    function addPaymentIndicator(day) {
        const container = document.getElementById(`day-${day}`)
        const indicator = document.createElement('div')
        indicator.classList.add('circle-payment')

        if (container.querySelector('.circle-payment') === null) {
            container.appendChild(indicator)
        }
    }
    
    /**
     * Deletes a task from the database based on its id.
     * 
     * @param {String} id 
     */
    async function removeTask(id) {
        try {
            const response = await fetch(`${url}tasks/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                throw new error('Request error')
            }

            document.getElementById(`task_${id}`).remove()
            updateTaskNone()
            updateTaskIndicator()
        } catch (error) {
            console.log(error)
        }
    }
}

// Functions ------------------------------------------------------------------

/**
 * Primary request which gets all items of the specified type from the
 * database.
 * 
 * @param {String} type
 *  
 * @returns {Promise} List of item objects to be parsed externally on success
 */
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