console.log('Called Index')

let sleeping = false;
let sleep_alr = false;
let wakeup_alr = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        console.log('DOM Loaded')
        caller()
    })
} else {
    caller()
}

let called = false;
async function caller() {
    if (called === true) return;
    console.log('Calling 🚀')
    called = true;
    loadheader()
    main()
    callbtn()
}
async function loadheader() {
    fetch('./components/header.html')
            .then(res => res.text())
            .then(html => {
                document.getElementById('header').innerHTML = html;
                caller()
            })
            .catch(e => {
                console.error('Failed to fetch header', e)
            })
} 

async function callbtn() {
    console.log('Loading btn')
    const x = document.getElementById('btn')
    console.log(x)
    if (sleeping) x.textContent = '就寝'
    else x.textContent = '起床'
}

function wait(time) {
    return new Promise( (resolve) => {
        setTimeout(resolve, time)
    })
}
/*
const button = document.getElementById('sleep');
button.addEventListener('click', sleep(this))
*/

async function fire(x) {
    if (sleeping === true) {
        console.log('User is sleeping')
        wakeup(x)
        return;
    }
    if (sleeping === false) {
        console.log('User is not sleeping')
        sleep(x)
        return;
    }
    else {
        console.error('Something went wrong.')
        return;
    }
}

async function sleep(x) {
    if (sleep_alr === true) {
        console.log('Ignore')
        return;
    }
    sleep_alr = true;
    console.log('Set')
    // x.value = 'It works!'
    addList()
    x.textContent = '🔥It works!'
    sleeping = true;
    await wait(2000)
    console.log('Reset')
    // x.value ='起床'
    callbtn()
    sleep_alr = false;
}

async function wakeup(x) {
    if (wakeup_alr === true) {
        console.log('Ignore')
        return;
    }
    wakeup_alr = true;
    console.log('Set')
    addList()
    x.textContent = '🔥It works!'
    sleeping = false;
    await wait(2000)
    console.log('Reset')
    callbtn()
    wakeup_alr = false;
}

async function addList() {
    console.log(sleeping)
    if (sleeping === true) {
        console.log('fetch......')
        const row = document.getElementById('lastsleep')
        if (row) {
            const now = new Date()
            const hour = fmtTime(`${now.getHours()}`)
            const min = fmtTime(`${now.getMinutes()}`)
            const time = `${hour}:${min}`
            row.insertAdjacentHTML('beforeend', `<td>${time}</td>`)
            row.removeAttribute('id')
        } else {
            console.error('oops')
        }
    } else {
        const elem = document.getElementById('slog')
        const now = new Date()
        const year = now.getFullYear()
        const mon = fmtTime(`${now.getMonth()}`)
        const day = fmtTime(`${now.getDay()}`)
        const today = `${year}/${mon}/${day}`
        const hour = fmtTime(`${now.getHours()}`)
        const min = fmtTime(`${now.getMinutes()}`)
        const time = `${hour}:${min}`
        elem.insertAdjacentHTML(`beforeend`, `<tr id='lastsleep'><td>${today}</td><td id='start'>${time}</td></tr>`)
        shouldRemove()
        //削除
        // document.getElementById('slog').firstElementChild.children[1].remove()
    }
}

async function shouldRemove() {
    const rowCount = document.getElementById('slog')
    const len = rowCount.childNodes.length -1
    console.log(len)
    if (len > 7) {
        console.log('Removing')
        document.getElementById('slog').firstElementChild.children[1].remove()
    }
}

const fmtTime = ( val, text = "0", before = true ) => {
    const repeatText = text.repeat(2);
    const fromTo = (before) ?
                { text : repeatText + val , from : -2 , to : val.length + 2}
                : { text : val + repeatText , from : 0 , to :  2};

    return fromTo.text.slice( fromTo.from , fromTo.to );
}