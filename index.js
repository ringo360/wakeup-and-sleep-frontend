console.log('Called')

function wait(time) {
    return new Promise( (resolve) => {
        setTimeout(resolve, time)
    })
}
/*
const button = document.getElementById('sleep');
button.addEventListener('click', sleep(this))
*/

let sleep_alr = false;
let wakeup_alr = false;

async function sleep(x) {
    if (sleep_alr === true) {
        console.log('Ignore')
        return;
    }
    sleep_alr = true;
    console.log('Set')
    // x.value = 'It works!'
    x.textContent = '🔥It works!'
    // console.log(x) dev
    await wait(2000)
    console.log('Reset')
    // x.value ='起床'
    x.textContent = '就寝'
    sleep_alr = false;
}

async function wakeup(x) {
    if (wakeup_alr === true) {
        console.log('Ignore')
        return;
    }
    wakeup_alr = true;
    console.log('Set')
    x.textContent = '🔥It works!'
    await wait(2000)
    console.log('Reset')
    x.textContent = '起床'
    wakeup_alr = false;
}
