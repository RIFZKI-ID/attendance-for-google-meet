const MDCRipple = mdc.ripple.MDCRipple
const MDCList = mdc.list.MDCList
const MDCDialog = mdc.dialog.MDCDialog
const MDCMenu = mdc.menu.MDCMenu
const MDCSnackbar = mdc.snackbar.MDCSnackbar
const MDCLinearProgress = mdc.linearProgress.MDCLinearProgress
const MDCTextField = mdc.textField.MDCTextField
const MDCChipSet = mdc.chips.MDCChipSet

const peopleObserver = new MutationObserver(function (mutations, me) {
    const container = document.getElementsByClassName(
        'HALYaf tmIkuc s2gQvd KKjvXb'
    )[0]
    if (!container) {
        document.getElementsByClassName('gV3Svc')[1].click()
        tabObserver.observe(document.getElementsByClassName('mKBhCf')[0], {
            childList: true,
            subtree: true,
        })
    } else {
        listObserver.observe(
            document.getElementsByClassName('HALYaf tmIkuc s2gQvd KKjvXb')[0],
            {
                childList: true,
                subtree: true,
            }
        )
    }
})

const tabObserver = new MutationObserver(function (mutations, me) {
    const numAttendees =
        parseInt(
            document.querySelector("[jsname='EydYod']").textContent.slice(1, -1)
        ) - 1
    const names = document.getElementsByClassName('cS7aqe NkoVdd')
    if (numAttendees === 0) {
        takeAttendance()
        me.disconnect()
    } else {
        if (names[1] != undefined) {
            listObserver.observe(
                document.getElementsByClassName(
                    'HALYaf tmIkuc s2gQvd KKjvXb'
                )[0],
                {
                    childList: true,
                    subtree: true,
                }
            )
            me.disconnect()
        }
    }
})

const listObserver = new MutationObserver(function (mutations, me) {
    takeAttendance()
    me.disconnect()
})

const closedObserver = new MutationObserver(function (mutations, me) {
    if (
        !document.getElementsByClassName(
            'VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ IWtuld wBYOYb'
        )[0]
    ) {
        document.getElementById('card').style.borderRadius = '0 0 0 8px'
        me.disconnect()
    }
})

const trayObserver = new MutationObserver(function (mutations, me) {
    const tray = document.getElementsByClassName('NzPR9b')[0]
    if (tray) {
        const trayWidth = tray.offsetWidth
        document.getElementById('card').style.width = trayWidth + 'px'
    }
})

for (let i = 1; i <= 2; i++) {
    document
        .getElementsByClassName('uArJ5e UQuaGc kCyAyd kW31ib foXzLb')
        [i].addEventListener('click', () => {
            document.getElementById('card').style.borderRadius = '8px 0 0 8px'
            closedObserver.observe(
                document.getElementsByClassName('mKBhCf')[0],
                {
                    childList: true,
                    subtree: true,
                }
            )
        })
}

trayObserver.observe(document.getElementsByClassName('NzPR9b')[0], {
    childList: true,
    subtree: true,
})
peopleObserver.observe(document.getElementsByClassName('wnPUne N0PJ8e')[0], {
    childList: true,
})

for (const helpButton of document.querySelectorAll('[aria-label="Help"]')) {
    helpButton.addEventListener('click', function () {
        chrome.runtime.sendMessage({
            data: 'open-url',
            url: 'https://github.com/tytot/attendance-for-google-meet#usage',
        })
    })
}

const attendanceButton = document.getElementById('attendance')
attendanceButton.addEventListener('click', showCard)
attendanceButton.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        showCard()
    }
})

for (const closeButton of document.getElementsByClassName('close-card')) {
    closeButton.addEventListener('click', hideCard)
}

const exportButton = document.getElementById('export')
exportButton.addEventListener('click', function () {
    port.postMessage({ data: 'export', auto: false, code: getMeetCode() })
    exportButton.disabled = true
    console.log('Exporting...')
})
window.addEventListener('beforeunload', function () {
    chrome.storage.local.get('auto-export', function (result) {
        if (result['auto-export']) {
            port.postMessage({
                data: 'export',
                auto: true,
                code: getMeetCode(),
            })
        }
    })
})

const classList = new MDCList(document.querySelector('#class-list'))
classList.singleSelection = true
const selectButton = document.getElementById('select-button')
document
    .querySelector('#dialog-content')
    .addEventListener('click', function () {
        if (classList.selectedIndex === -1) {
            selectButton.disabled = true
        } else {
            selectButton.disabled = false
        }
    })

const selectDialog = new MDCDialog(document.getElementById('select'))
selectDialog.scrimClickAction = ''
selectDialog.escapeKeyAction = ''
selectDialog.open()
selectDialog.autoStackButtons = false
selectDialog.listen('MDCDialog:closed', (event) => {
    const element = document.getElementById('select')
    element.parentNode.removeChild(element)
    prepareChips('card-class-view', 'card-default-view', 'card-edit-view')

    forceStatusUpdate()
})

const confirmDeleteDialog = new MDCDialog(
    document.getElementById('delete-dialog')
)
const deleteButton = document.getElementById('confirm-delete')
confirmDeleteDialog.listen('MDCDialog:opening', (event) => {
    document.getElementById(
        'delete-dialog-content'
    ).innerText = `Are you sure you want to delete class ${deleteButton.classToDelete}?`
})
deleteButton.addEventListener('click', function () {
    const className = deleteButton.classToDelete
    deleteClass(className)
    classList.selectedIndex = -1
    selectButton.disabled = true
    snackbar.labelText = `Successfully deleted class ${className}.`
    removeSnackbarButtons()
    snackbar.open()
})

const sortMenuEl = document.getElementById('sort-menu')
const sortMenu = new MDCMenu(sortMenuEl)
document.querySelector('.more').addEventListener('click', function () {
    sortMenu.open = true
})
const sortOptions = new MDCList(sortMenuEl.querySelector('.mdc-list'))
let sortMethod = 'lastName'
for (const listEl of sortOptions.listElements) {
    new MDCRipple(listEl)
    listEl.addEventListener('click', function () {
        sortMethod = listEl.id
        forceStatusUpdate()
    })
}

const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'))

const sbHelp = document.getElementById('snackbar-help')
sbHelp.addEventListener('click', troubleshoot)
const sbOpen = document.getElementById('snackbar-open')
sbOpen.addEventListener('click', openSpreadsheet)
const sbUndo = document.getElementById('snackbar-undo')
sbUndo.addEventListener('click', undo)

const linearProgress = new MDCLinearProgress(
    document.querySelector('#progress-bar')
)
linearProgress.progress = 0
let port = chrome.runtime.connect()
port.onMessage.addListener(function (msg) {
    linearProgress.progress = msg.progress
    if (msg.done) {
        removeSnackbarButtons()
        exportButton.disabled = false
        const error = msg.error
        if (error) {
            snackbar.labelText = error
            sbHelp.style.display = 'inline-flex'
        } else {
            snackbar.labelText = 'Successfully exported to Google Sheets™!'
            sbOpen.style.display = 'inline-flex'
        }
        snackbar.open()
    }
})

let classTextField, stuTextFieldEl, stuTextField, chipSetEl, chipSet
let nameArray = []
prepareChips(null, 'dialog-default-view', 'dialog-edit-view')

document.getElementById('later').addEventListener('click', () => {
    document.getElementById('card-class-view').hidden = false
    document.getElementById('card-default-view').hidden = true
})
selectButton.addEventListener('click', () => {
    const className = classList.listElements[classList.selectedIndex].name
    const code = getMeetCode()
    chrome.storage.local.get(code, function (result) {
        let res = result[code]
        res.class = className
        chrome.storage.local.set({ [code]: res })
        document.getElementById('class-label').innerText = className
    })
})

document.getElementById('default-back').addEventListener('click', function () {
    document.getElementById('card-class-view').hidden = false
    document.getElementById('card-default-view').hidden = true
})

document.getElementById('edit-back').addEventListener('click', function () {
    const cardTitle = document.getElementById('class-label')
    if (cardTitle.adding) {
        document.getElementById('card-class-view').hidden = false
        delete cardTitle.adding
    } else {
        document.getElementById('card-default-view').hidden = false
        cardTitle.innerText = classTextField.value
    }
    document.getElementById('card-edit-view').hidden = true
})

document.getElementById('cancel-class').addEventListener('click', function () {
    document.getElementById('dialog-default-view').hidden = false
    document.getElementById('dialog-edit-view').hidden = true
})

document.addEventListener('keydown', function (event) {
    if (event.keyCode === 8 || event.key === 'Backspace') {
        const chips = chipSet.chips
        if (chips.length > 0) {
            const chipAction = chips[chips.length - 1].root.querySelector(
                '.mdc-chip__primary-action'
            )
            const chipClose = chips[chips.length - 1].root.querySelector(
                '.mdc-chip__icon--trailing'
            )
            const activeEl = document.activeElement
            if (activeEl === chipAction) {
                chipClose.focus()
            } else if (activeEl === chipClose) {
                removeChip()
            }
        }
    }
})

for (const button of document.getElementsByClassName('mdc-button')) {
    new MDCRipple(button)
}

let currentHandler = null
let rostersCache = null

function getMeetCode() {
    return document.title.substring(7)
}

function removeSnackbarButtons() {
    sbHelp.style.display = 'none'
    sbOpen.style.display = 'none'
    sbUndo.style.display = 'none'
}

function takeAttendance() {
    if (currentHandler) {
        currentHandler.restart()
    } else {
        currentHandler = attendanceHandler()
        currentHandler.promise.then(() => {
            currentHandler = null
        })
    }
}

function attendanceHandler() {
    let names = []
    const container = document.getElementsByClassName(
        'HALYaf tmIkuc s2gQvd KKjvXb'
    )[0]
    const promise = new Promise(async (resolve, reject) => {
        let lastNumNames = 0
        await getVisibleAttendees(container, names)
        while (names.length !== lastNumNames) {
            lastNumNames = names.length
            await getVisibleAttendees(container, names, 100)
        }
        container.scrollTop = 0
        storeNames(names)
        resolve()
    })
    const restart = () => {
        names = []
        container.scrollTop = 0
    }
    return { promise, restart }
}

function storeNames(names) {
    const code = getMeetCode()
    chrome.storage.local.get(null, function (result) {
        const timestamp = ~~(Date.now() / 1000)

        let res = result[code]
        if (res == undefined) {
            res = {
                attendance: {},
                'start-timestamp': timestamp,
            }
        }
        let currentData = res.attendance
        res.timestamp = timestamp

        for (const name of names) {
            if (currentData[name] == undefined) {
                currentData[name] = [timestamp]
            } else if (currentData[name].length % 2 === 0) {
                currentData[name].push(timestamp)
            }
            if (names.includes(name)) {
                if (currentData[name].length % 2 === 0) {
                    currentData[name].push(timestamp)
                }
            } else {
                if (currentData[name].length % 2 === 1) {
                    currentData[name].push(timestamp)
                }
            }
        }
        for (const name in currentData) {
            if (!names.includes(name) && currentData[name]) {
                if (currentData[name].length % 2 === 1) {
                    currentData[name].push(timestamp)
                }
            }
        }

        const className = res.class
        if (className) {
            updateRosterStatus(currentData, result.rosters, className)
        }

        chrome.storage.local.set({ [code]: res })

        for (const key in result) {
            const data = result[key]
            if (data.hasOwnProperty('timestamp')) {
                if (timestamp - data.timestamp >= 43200) {
                    chrome.storage.local.remove([key])
                }
            }
        }
    })
}

function getVisibleAttendees(container, names, delay) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const labels = document.getElementsByClassName('cS7aqe NkoVdd')
            for (const label of labels) {
                const name = label.innerHTML
                if (
                    !names.includes(name) &&
                    !name.endsWith(' (You)') &&
                    !name.endsWith(' (Your Presentation)') &&
                    !name.endsWith(' (Presentation)')
                ) {
                    names.push(name)
                }
            }
            container.scrollTop = 56 * names.length

            resolve()
        }, delay)
    })
}

function updateRosterStatus(attendance, rosters, className) {
    const rosterStatus = document.getElementById('roster-status')
    rosterStatus.innerHTML = ''
    let entries = []

    const roster = rosters[className]
    const bigRoster = roster.map((name) => name.toLocaleUpperCase())
    for (const name in attendance) {
        const arr = attendance[name]
        if (bigRoster.includes(name.toLocaleUpperCase())) {
            if (arr.length % 2 === 1) {
                entries.push({
                    name: name,
                    color: 'green',
                    tooltip: 'Present',
                    icon: 'check_circle',
                    text: `Joined at ${toTimeString(arr[0])}`,
                    index: 2,
                })
            } else {
                entries.push({
                    name: name,
                    color: 'yellow',
                    tooltip: 'Previously Present',
                    icon: 'watch_later',
                    text: `Last seen at ${toTimeString(arr[arr.length - 1])}`,
                    index: 1,
                })
            }
        } else {
            entries.push({
                name: name,
                color: 'gray',
                tooltip: 'Not on List',
                icon: 'error',
                text: `Joined at ${toTimeString(arr[0])}`,
                index: -1,
            })
        }
    }
    const bigAttendance = Object.keys(attendance).map((key) =>
        key.toLocaleUpperCase()
    )
    for (const name of roster) {
        if (!bigAttendance.includes(name.toLocaleUpperCase())) {
            entries.push({
                name: name,
                color: 'red',
                tooltip: 'Absent',
                icon: 'cancel',
                text: 'Not here',
                index: 0,
            })
        }
    }
    let single = false
    if (entries.length === 1) {
        single = true
    }

    if (!single) {
        if (sortMethod === 'firstName') {
            compare = (a, b) => {
                return compareFirst(a.name, b.name)
            }
        } else if (sortMethod === 'lastName') {
            compare = (a, b) => {
                return compareLast(a.name, b.name)
            }
        } else if (sortMethod === 'presentFirst') {
            compare = (a, b) => {
                return b.index - a.index
            }
        } else {
            compare = (a, b) => {
                if (a.index === -1) {
                    a.index = 3
                }
                if (b.index === -1) {
                    b.index = 3
                }
                return a.index - b.index
            }
        }
        entries.sort(compare)
    }

    for (const entry of entries) {
        if (!single) {
            if (entry.index === -1) {
                var metaIcon = 'add_circle'
                var metaTooltip = 'Add to Class'
            } else {
                metaIcon = 'remove_circle'
                metaTooltip = 'Remove from Class'
            }
            var meta = `<div class="mdc-list-item__meta">
                    <button
                        class="mdc-icon-button material-icons"
                        aria-label="${metaTooltip}"
                        jscontroller="VXdfxd"
                        jsaction="mouseenter:tfO1Yc; mouseleave:JywGue;"
                        tabindex="0"
                        data-tooltip="${metaTooltip}"
                        data-tooltip-vertical-offset="-12"
                        data-tooltip-horizontal-offset="0"
                    >
                        ${metaIcon}
                    </button>
                </div>`
        } else {
            meta = ''
        }
        rosterStatus.insertAdjacentHTML(
            'beforeend',
            `<li class="mdc-list-divider" role="separator"></li>
            <li class="mdc-list-item" tabindex="0">
                <span
                    class="mdc-list-item__graphic material-icons ${entry.color}"
                    jscontroller="VXdfxd"
                    jsaction="mouseenter:tfO1Yc; mouseleave:JywGue;"
                    tabindex="0"
                    aria-label="${entry.tooltip}"
                    data-tooltip="${entry.tooltip}"
                    data-tooltip-vertical-offset="-12"
                    data-tooltip-horizontal-offset="0"
                >
                    ${entry.icon}
                </span>
                <span class="mdc-list-item__text">
                    <span class="mdc-list-item__primary-text">
                        ${entry.name}
                    </span>
                    <span class="mdc-list-item__secondary-text">
                        ${entry.text}
                    </span>
                </span>
                ${meta}
            </li>`
        )
        const metaButton = rosterStatus.lastChild.querySelector(
            '.mdc-icon-button'
        )
        if (!single) {
            if (entry.index === -1) {
                metaButton.addEventListener('click', function () {
                    removeSnackbarButtons()
                    rostersCache = rosters
                    addStudent(entry.name)
                    snackbar.labelText = `Added ${entry.name} to class.`
                    sbUndo.style.display = 'inline-flex'
                    snackbar.open()
                })
            } else if (roster.length > 1) {
                metaButton.addEventListener('click', function () {
                    removeSnackbarButtons()
                    rostersCache = rosters
                    removeStudent(entry.name)
                    snackbar.labelText = `Removed ${entry.name} from class.`
                    sbUndo.style.display = 'inline-flex'
                    snackbar.open()
                })
            }
        }
    }
}

function troubleshoot() {
    chrome.runtime.sendMessage({
        data: 'open-url',
        url: 'https://github.com/tytot/attendance-for-google-meet#troubleshoot',
    })
}

function openSpreadsheet() {
    chrome.storage.local.get('spreadsheet-id', function (result) {
        const id = result['spreadsheet-id']
        const url = `https://docs.google.com/spreadsheets/d/${id}`
        chrome.runtime.sendMessage({
            data: 'open-url',
            url: url,
        })
    })
}

function showCard() {
    document.getElementsByClassName('NzPR9b')[0].style.borderRadius = '0px'
    const attendanceButton = document.getElementById('attendance')
    attendanceButton.classList.remove('IeuGXd')
    document.getElementById('card').style.visibility = 'visible'
}

function hideCard() {
    document.getElementsByClassName('NzPR9b')[0].style.borderRadius =
        '0 0 0 8px'
    const attendanceButton = document.getElementById('attendance')
    attendanceButton.classList.add('IeuGXd')
    document.getElementById('card').style.visibility = 'hidden'
}

function getClassHTML(className) {
    return `<li
        class="mdc-list-item mdc-list-item--class"
        role="option"
        tabindex="0"
    >
        <span class="mdc-list-item__ripple"></span>
        <span
            class="mdc-list-item__graphic material-icons"
            aria-hidden="true"
        >
            perm_identity
        </span>
        <span class="mdc-list-item__text class-entry">
            ${className}
        </span>
        <div class="mdc-list-item__meta">
            <button
                class="mdc-icon-button material-icons edit-class"
                aria-label="Edit"
                jscontroller="VXdfxd"
                jsaction="mouseenter:tfO1Yc; mouseleave:JywGue;"
                tabindex="0"
                data-tooltip="Edit"
                data-tooltip-vertical-offset="-12"
                data-tooltip-horizontal-offset="0"
            >
                edit
            </button>
            <button
                class="mdc-icon-button material-icons delete-class"
                aria-label="Delete"
                jscontroller="VXdfxd"
                jsaction="mouseenter:tfO1Yc; mouseleave:JywGue;"
                tabindex="0"
                data-tooltip="Delete"
                data-tooltip-vertical-offset="-12"
                data-tooltip-horizontal-offset="0"
            >
                delete
            </button>
        </div>
    </li>`
}

function initializeClasses() {
    return new Promise((resolve) => {
        chrome.storage.local.get('rosters', function (result) {
            let res = result['rosters']
            if (res == undefined) {
                res = {}
                chrome.storage.local.set({ rosters: res })
            }

            const classList = document.getElementById('class-list')
            let classes = []
            for (const className in res) {
                classList.insertAdjacentHTML(
                    'beforeend',
                    getClassHTML(className)
                )
                const classEl = classList.lastChild
                classEl.name = className
                classEl.roster = res[className]
                classes.push(classEl)
            }
            resolve(classes)
        })
    })
}

function undo() {
    return new Promise((resolve) => {
        if (rostersCache == null) {
            resolve()
        }
        chrome.storage.local.set({ rosters: rostersCache }, function () {
            forceStatusUpdate()
            snackbar.labelText = 'Undo successful.'
            removeSnackbarButtons()
            snackbar.open()
            resolve()
        })
    })
}

function addClass(className, roster, set = false) {
    return new Promise((resolve) => {
        chrome.storage.local.get(null, function (result) {
            let res = result['rosters']
            res[className] = roster
            chrome.storage.local.set({ rosters: res })
            if (set) {
                const code = getMeetCode()
                result[code].class = className
                chrome.storage.local.set({ [code]: result[code] })
            }

            const classList = document.getElementById('class-list')
            classList.insertAdjacentHTML('beforeend', getClassHTML(className))
            const classEl = classList.lastChild
            classEl.name = className
            classEl.roster = res[className]

            resolve(classEl)
        })
    })
}

function deleteClass(className) {
    return new Promise((resolve) => {
        chrome.storage.local.get('rosters', function (result) {
            let res = result['rosters']
            delete res[className]
            chrome.storage.local.set({ rosters: res })

            const classList = document.getElementById('class-list')
            const classEls = classList.getElementsByTagName('li')
            for (const classEl of classEls) {
                if (classEl.name === className) {
                    classList.removeChild(classEl)
                }
            }
            resolve()
        })
    })
}

function addStudent(name) {
    chrome.storage.local.get(null, function (result) {
        const code = getMeetCode()
        const className = result[code].class
        let res = result.rosters
        res[className].push(name)
        chrome.storage.local.set({ rosters: res })
        updateRosterStatus(result[code].attendance, res, className)
    })
}

function removeStudent(name) {
    chrome.storage.local.get(null, function (result) {
        const code = getMeetCode()
        const className = result[getMeetCode()].class
        let res = result.rosters
        res[className] = res[className].filter((n) => n !== name)
        chrome.storage.local.set({ rosters: res })
        updateRosterStatus(result[code].attendance, res, className)
    })
}

function forceStatusUpdate() {
    chrome.storage.local.get(null, function (result) {
        const res = result[getMeetCode()]
        const className = res.class
        if (className) {
            updateRosterStatus(res.attendance, result.rosters, className)
        }
    })
}

function editClass(className) {
    classTextField.value = className
    classTextField.initValue = className
    chipSetEl.innerHTML = ''
    chipSet = new MDCChipSet(chipSetEl)
    for (const name of nameArray) {
        addChip(name)
    }
    stuTextField.value = getNewFieldValue()
}

function addChip(name) {
    const chipEl = document.createElement('div')
    chipEl.className = 'mdc-chip'
    chipEl.setAttribute('role', 'row')
    chipEl.innerHTML = `<div class="mdc-chip__ripple"></div>
    <span role="gridcell">
        <span role="button" tabindex="0" class="mdc-chip__primary-action">
            <span class="mdc-chip__text">${name}</span>
        </span>
        <span role="gridcell">
            <i
                class="material-icons mdc-chip__icon mdc-chip__icon--trailing"
                tabindex="0"
                role="button"
                style="margin-left: 0;"
                >cancel</i
            >
        </span>
    </span>`
    chipSetEl.appendChild(chipEl)
    chipSet.addChip(chipEl)

    chipEl
        .querySelector('.mdc-chip__icon')
        .addEventListener('click', function () {
            removeChip(name)
        })
}

function removeChip(name = nameArray[nameArray.length - 1]) {
    const i = nameArray.indexOf(name)
    const chip = chipSet.chips[i]
    chip.beginExit()
    nameArray.splice(i, 1)
    stuTextField.value = getNewFieldValue(true)
}

function prepareChips(_cardView, defaultView, editView) {
    cardView = _cardView || defaultView

    const textFields = document.getElementsByClassName('mdc-text-field')
    classTextField = new MDCTextField(textFields[0])
    stuTextFieldEl = textFields[1]
    stuTextField = new MDCTextField(stuTextFieldEl)
    chipSetEl = document.getElementsByClassName('mdc-chip-set')[0]
    chipSet = new MDCChipSet(chipSetEl)

    initializeClasses().then((classes) => {
        for (const classEl of classes) {
            addDefaultEventListeners(
                classEl,
                cardView,
                defaultView,
                editView,
                _cardView
            )
            new MDCRipple(classEl)
        }
    })

    document.getElementById('add-class').addEventListener('click', function () {
        document.getElementById('class-label').adding = true
        document.getElementById(cardView).hidden = true
        document.getElementById(editView).hidden = false
        nameArray = []
        editClass('')
    })

    document
        .getElementById('save-class')
        .addEventListener('click', function () {
            const className = classTextField.value
            const initClassName = classTextField.initValue

            chrome.storage.local.get('rosters', function (result) {
                let res = result['rosters']
                removeSnackbarButtons()
                if (className === '') {
                    snackbar.labelText =
                        'Error: The class name cannot be empty.'
                    snackbar.open()
                } else if (nameArray.length === 0) {
                    snackbar.labelText =
                        'Error: You must have at least 1 student in a class.'
                    snackbar.open()
                } else if (
                    res.hasOwnProperty(className) &&
                    className !== initClassName
                ) {
                    snackbar.labelText =
                        'Error: You already have a class with that name.'
                    snackbar.open()
                } else {
                    deleteClass(initClassName)
                        .then(() => {
                            delete classTextField.initValue
                            return addClass(
                                className,
                                nameArray,
                                !selectDialog.isOpen
                            )
                        })
                        .then((classEl) => {
                            addDefaultEventListeners(
                                classEl,
                                cardView,
                                defaultView,
                                editView,
                                _cardView
                            )
                            if (selectButton) {
                                selectButton.disabled = true
                            }

                            const cardTitle = document.getElementById(
                                'class-label'
                            )
                            if (cardTitle.adding) {
                                document.getElementById(cardView).hidden = false
                                document.getElementById(editView).hidden = true
                                delete cardTitle.adding
                            } else {
                                if (className !== initClassName) {
                                    port.postMessage({
                                        data: 'rename',
                                        code: getMeetCode(),
                                        oldClassName: initClassName,
                                        newClassName: className,
                                    })
                                }

                                cardTitle.innerText = className
                                document.getElementById(
                                    defaultView
                                ).hidden = false
                                document.getElementById(editView).hidden = true
                                forceStatusUpdate()
                            }
                            new MDCRipple(classEl)

                            snackbar.labelText = `Successfully saved class ${className}.`
                            snackbar.open()
                        })
                }
            })
        })

    document
        .getElementById('edit-roster')
        .addEventListener('click', function () {
            chrome.storage.local.get(null, function (result) {
                let res = result[getMeetCode()]
                const className = res.class
                document.getElementById(defaultView).hidden = true
                document.getElementById(editView).hidden = false
                nameArray = Array.from(result.rosters[className])
                editClass(className)
            })
        })

    stuTextFieldEl.addEventListener('input', function (event) {
        const rawInput = stuTextField.value
        const input = rawInput.trimLeft()
        const newValue = getNewFieldValue()
        if (rawInput + ' ' === newValue) {
            const chips = chipSet.chips
            const chipAction = chips[chips.length - 1].root.querySelector(
                '.mdc-chip__primary-action'
            )
            chipAction.focus()
            stuTextField.value = newValue
        } else {
            if (input.includes('\n') || input.includes(',')) {
                let names = input
                    .split(/\r?\n|,/)
                    .map((name) => name.trim().replace(/\s+/g, ' '))
                    .filter((name) => name !== '')
                for (const name of names) {
                    nameArray.push(name)
                    addChip(name)
                }
                stuTextField.value = getNewFieldValue()
            } else {
                stuTextField.value = newValue + input
            }
        }
    })

    const input = document.getElementsByClassName('mdc-text-field__input')[1]
    input.addEventListener('scroll', function () {
        const scrollY = input.scrollTop
        chipSetEl.style.top = '-' + scrollY + 'px'
    })
}

function addDefaultEventListeners(
    classEl,
    cardView,
    defaultView,
    editView,
    clickable
) {
    if (clickable) {
        classEl.addEventListener('click', function (event) {
            const target = event.target
            if (
                !target.classList.contains('edit-class') &&
                !target.classList.contains('delete-class')
            ) {
                const code = getMeetCode()
                chrome.storage.local.get(getMeetCode(), function (result) {
                    let res = result[code]
                    res.class = classEl.name
                    chrome.storage.local.set({ [code]: res })

                    document.getElementById(cardView).hidden = true
                    document.getElementById(defaultView).hidden = false

                    document.getElementById('class-label').innerText =
                        classEl.name

                    forceStatusUpdate()
                })
            }
        })
    }
    classEl
        .querySelector('.delete-class')
        .addEventListener('click', function () {
            deleteButton.classToDelete = classEl.name
            confirmDeleteDialog.open()
        })
    classEl.querySelector('.edit-class').addEventListener('click', function () {
        document.getElementById(cardView).hidden = true
        document.getElementById(defaultView).hidden = true
        document.getElementById(editView).hidden = false
        nameArray = Array.from(classEl.roster)
        editClass(classEl.name)
    })
}

function getNewFieldValue(removal = false) {
    const chipRows = (chipSetEl.offsetHeight - 8) / 40

    let newValue = ''
    for (let i = 0; i < chipRows - 1; i++) {
        newValue += ' '.repeat(100) + '\n'
    }

    let lastHeight = -1
    let counter = 0
    let chips = chipSet.chips.map((chip) => chip.root)
    if (removal) {
        chips.pop()
    }
    for (let i = chips.length - 1; i >= 0; i--) {
        const chip = chips[i]
        const top = chip.getBoundingClientRect().top
        if (lastHeight != -1 && Math.abs(top - lastHeight) > 10) {
            break
        }
        lastHeight = top
        const text = chip.querySelector('.mdc-chip__text').innerHTML
        for (let i = 0; i < text.length + 7; i++) {
            counter++
        }
    }
    newValue += ' '.repeat(Math.max(0, counter - 1))
    return newValue
}
