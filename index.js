let sleeping = false;
let sleep_alr = false;
let wakeup_alr = false;
let can_fire = false;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        caller()
    })
} else {
    caller()
}

let called = false;
async function caller() {
    if (called === true) return;
    called = true;
    main()
	initwakeupbtn()
	setNowDate()
    console.log('Sucessfully called index.js')
}

function setNowDate() {
	const now = new Date();
    document.getElementById('wakeuphr').value = now.getHours();
    document.getElementById('wakeupmin').value = now.getMinutes();
    document.getElementById('wakeupsec').value = now.getSeconds();
}

async function initotherbtn() {
	const x = document.getElementById('sleep')
	x.textContent = '就寝'
	switchButtonbyClassName(x, false)
	const x2 = document.getElementById('breakfast')
	x2.textContent = '朝食'
	switchButtonbyClassName(x2, false)
}

async function initwakeupbtn() {
	const token = await getAccToken()
	const info = await getInfo(token)
	if (!info.ok) {
		console.error('response is not ok, returing...')
		return;
	}
	const json = await info.json()
	const res = await getAPI(token, json.res.user, '/v1/sleeping')
	const res_json = await res.json()
	const x = document.getElementById('wakeup')
	if (res_json.isSleeping) {
		sleeping = true
		x.textContent = '起床'
		switchButtonbyClassName(x, false)
		initotherbtn()
	} else {
		sleeping = false
		x.textContent = '起床'
		switchButtonbyClassName(x, false)
		initotherbtn()
	}
	await wait(50)
	can_fire = true
}


function wait(time){return new Promise((resolve)=>{setTimeout(resolve, time)})}

async function fire(x) {
	if (!can_fire) return;
    console.log(sleeping)
    if (sleeping === true) {
        wakeup(x)
        return;
    }
    if (sleeping === false) {
        sleep(x)
        return;
    }
    else {
        return;
    }
}

async function sleep(x) {
	console.log('Called sleep')
    if (sleep_alr === true) {
        return;
    }
    sleep_alr = true;
    // x.value = 'It works!'
	sleeping = true;
    await addList('sleep')
    x.textContent = '🌙'
    // x.textContent = '🌞'
    switchButtonbyClassName(x, true)
    await wait(2000)
    switchButtonbyClassName(x, false)
    // x.value ='起床'
    x.textContent = '就寝'
    sleep_alr = false;
}

async function wakeup(x) {
    if (wakeup_alr === true) {
        return;
    }
    wakeup_alr = true;
	sleeping = false;
    await addList('wakeup')
    // x.textContent = '🌙'
    x.textContent = '🌞'
    switchButtonbyClassName(x, true)
    await wait(2000)
    switchButtonbyClassName(x, false)
    x.textContent = '起床'
    wakeup_alr = false;
}

async function breakfast(x) {
    console.log('fire.')
    // Get all <td> elements in the table
    const tds = document.querySelectorAll('tr td');
    switchButtonbyClassName(x, true)
            
    // Check if there are any <td> elements
    if (tds.length > 0) {
        // Get the last <td> element
        const lastTd = tds[tds.length - 1];
        
        // Find the <input type="checkbox"> within the last <td>
        const lastCheckbox = lastTd.querySelector('input[type="checkbox"]');
        
        // Check the checkbox if it exists
        if (lastCheckbox) {
            if (lastCheckbox.checked) {
                lastCheckbox.checked = false;
                await postBreakfastBool(false)
                await wait(500)
                switchButtonbyClassName(x, false)
                

            } else {
                lastCheckbox.checked = true;
                await postBreakfastBool(true)
                await wait(500)
                switchButtonbyClassName(x, false)
            }
        }
    }
}


async function postBreakfastBool(bool) {
    const token = await getAccToken();
    const res = await getInfo(token);
    if (!res.ok) {
        console.error('response is not ok, returning...');
        return;
    }
    const json = await res.json();
	let formBody = []
	const post_token = encodeURIComponent(token)
	const user = encodeURIComponent(json.res.user)
	formBody.push('token=' + post_token)
	formBody.push('username=' + user)
	formBody.push('bool=' + bool)
	formBody = await formBody.join("&")
	const result = await postAPI(formBody, `/v1/breakfast`)
	if (result.ok) return true;
	else return false;
}

async function addList(mode) {
    const now = new Date();
    const year = now.getFullYear();
    const mon = fmtTime(`${now.getMonth() + 1}`);
    const day = fmtTime(`${now.getDate()}`);
    const hour = document.getElementById('wakeuphr').value;
    const min = document.getElementById('wakeupmin').value;
    const sec = document.getElementById('wakeupsec').value;
    const time = `${hour}:${min}`;
    const fullDate = `${year}-${mon}-${day} ${time}:${sec}`;
    const today = `${year}/${mon}/${day}`;

    const table = document.getElementById('slog');
    let existingRow = null;

    // テーブル内の行を検索し、該当する行を見つける
    for (const row of table.rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0 && cells[0].textContent === today) {
            existingRow = row;
            break;
        }
    }

    if (sleeping === false) {
        if (existingRow) {
            // 既存の行を更新
            existingRow.cells[1].textContent = time;
            // APIにデータを送信
            const token = await getAccToken();
            const res = await getInfo(token);
            const json = await res.json();
            await postSleepData(token, json.res.user, fullDate, mode);
        } else {
            // 新しい行を追加
            table.insertAdjacentHTML('beforeend', 
                `<tr>
                    <td>${today}</td>
                    <td>${time}</td>
                    <td>記録なし</td>
                    <td><input type="checkbox" id="breakfast" onclick="checkbf(this)"></td>
                </tr>`
            );
			shouldRemove()
            // APIにデータを送信
            const token = await getAccToken();
            const res = await getInfo(token);
            if (!res.ok) {
                console.error('response is not ok, returning...');
                return;
            }
            const json = await res.json();
            await postSleepData(token, json.res.user, fullDate, mode);
        }
    } else {
        // この部分は `sleeping` が `true` の場合の処理です。もし不要なら削除してください。
        if (existingRow) {
            // 既存の行を更新
			console.log(existingRow.cells)
            existingRow.cells[2].textContent = time;
            // APIにデータを送信
            const token = await getAccToken();
            const res = await getInfo(token);
            const json = await res.json();
            await postSleepData(token, json.res.user, fullDate, mode);
        } else {
            // 新しい行を追加
            table.insertAdjacentHTML('beforeend', 
                `<tr>
                    <td>${today}</td>
                    <td>記録なし</td>
                    <td>${time}</td>
                    <td><input type="checkbox" id="breakfast" onclick="checkbf(this)"></td>
                </tr>`
            );
			shouldRemove()
            // APIにデータを送信
            const token = await getAccToken();
            const res = await getInfo(token);
            if (!res.ok) {
                console.error('response is not ok, returning...');
                return;
            }
            const json = await res.json();
            await postSleepData(token, json.res.user, fullDate, mode);
        }
    }
}

async function postSleepData(token, username, date, mode) {
	let formBody = []
	const post_token = encodeURIComponent(token)
	const user = encodeURIComponent(username)
	const post_date = encodeURIComponent(date)
	formBody.push('token=' + post_token)
	formBody.push('username=' + user)
	formBody.push('date=' + post_date)
	formBody = await formBody.join("&")
	const res = await postAPI(formBody, `/v1/${mode}`)
	if (res.ok) return true;
	else return false;
}

async function shouldRemove() {
    const table = document.getElementById('slog');
    const rows = table.getElementsByTagName('tr');
    const len = rows.length - 1;  // ヘッダ行を除外してカウント
    if (len > 7) {
        const firstRow = rows[1]; // ヘッダ行の次の行を取得
		if (firstRow) {
            firstRow.remove();
		}
    }
}

const fmtTime = ( val, text = "0", before = true ) => {
    const repeatText = text.repeat(2);
    const fromTo = (before) ?
                { text : repeatText + val , from : -2 , to : val.length + 2}
                : { text : val + repeatText , from : 0 , to :  2};

    return fromTo.text.slice( fromTo.from , fromTo.to );
}

async function fetchSleepData() {
    console.log('Fetching sleep data');
    const token = await getAccToken();
    const info = await getInfo(token);

    if (!info.ok) {
        console.error('response is not ok, returning...');
        return;
    }

    const json = await info.json();
    const res = await getSleepRes(token, json.res.user);
    const data = await res.json();

    // 日付ごとに一番遅い時間を抽出し、合成する
    const latestRecords = Object.values(data).reduce((acc, record) => {
        const sleepDate = record.sleepdate ? new Date(record.sleepdate) : null;
        const wakeupDate = record.wakeupdate ? new Date(record.wakeupdate) : null;

        const dateKey = sleepDate 
            ? sleepDate.toISOString().split('T')[0] 
            : (wakeupDate ? wakeupDate.toISOString().split('T')[0] : null);

        if (!dateKey) {
            console.log('dateKey is null for record:', record);
            return acc;  // dateKeyがnullの場合はスキップ
        }

        console.log(`Computed dateKey: ${dateKey}`, record);

        if (!acc[dateKey]) {
            acc[dateKey] = { sleepdate: record.sleepdate, wakeupdate: record.wakeupdate };
            console.log(`Added new entry for ${dateKey}:`, acc[dateKey]);
        } else {
            if (sleepDate && (!acc[dateKey].sleepdate || sleepDate > new Date(acc[dateKey].sleepdate))) {
                acc[dateKey].sleepdate = record.sleepdate;
                console.log(`Updated sleepdate for ${dateKey}:`, acc[dateKey]);
            }
            if (wakeupDate && (!acc[dateKey].wakeupdate || wakeupDate > new Date(acc[dateKey].wakeupdate))) {
                acc[dateKey].wakeupdate = record.wakeupdate;
                console.log(`Updated wakeupdate for ${dateKey}:`, acc[dateKey]);
            }
        }

        return acc;
    }, {});

    console.log('Consolidated latest records:', latestRecords);

    // 結果をテーブルに追加
    const table = document.getElementById('slog');

    // 既存の行をすべて削除
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    Object.entries(latestRecords).forEach(([dateKey, record]) => {
        const sleepdate = record.sleepdate ? new Date(record.sleepdate) : null;
        const wakeupdate = record.wakeupdate ? new Date(record.wakeupdate) : null;

        const row = document.createElement('tr');

        const dateCell = document.createElement('td');
        dateCell.textContent = wakeupdate ? formatDate(wakeupdate) : formatDate(sleepdate);
        row.appendChild(dateCell);

        const wakeupTimeCell = document.createElement('td');
        wakeupTimeCell.textContent = wakeupdate 
            ? wakeupdate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) 
            : '記録なし';
        row.appendChild(wakeupTimeCell);

        const sleepTimeCell = document.createElement('td');
        sleepTimeCell.textContent = sleepdate 
            ? sleepdate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) 
            : '記録なし';
        row.appendChild(sleepTimeCell);

        const checkCell = document.createElement('td');
        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.onclick = checkbf(this);
        checkCell.appendChild(checkBox);
        row.appendChild(checkCell);

        table.appendChild(row);
        console.log(`Added row for dateKey ${dateCell.textContent}`, record);
    });
}

//TODO: うまくつかう
function calculateTimeDifference(sleepDate, wakeUpdate) {
    const sleepDateTime = new Date(sleepDate);
    const wakeUpdateDateTime = new Date(wakeUpdate);
  
    const timeDifference = wakeUpdateDateTime.getTime() - sleepDateTime.getTime();
  
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
  
    if (hours > 0) {
      return `${hours}時間`;
    } else if (minutes > 0) {
      return `${minutes}分`;
    } else {
      return `${seconds}秒`;
    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}
