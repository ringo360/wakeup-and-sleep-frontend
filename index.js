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
    showmsg(sleep_randomStr())
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
    showmsg(wakeup_randomStr())
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
                showmsg(breakfastmsg[Math.floor(Math.random() * breakfastmsg.length)])
                launchFireworks(3000)
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
            // APIにデー���������を送信
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
  let data = await res.json();

  // データが配列でない場合は、オブジェクトの値を配列にする
  if (!Array.isArray(data)) {
    data = Object.values(data);
  }

  console.log('Raw data:', data);

  // 日付が有効かどうかチェックする関数
  function isValidDate(dateString) {
    if (!dateString) return false;

    const dateParts = dateString.split(' ');
    const [year, month, day] = dateParts[0].split('-').map(Number);
    const [hour, minute, second] = dateParts[1].split(':').map(Number);

    const date = new Date(year, month - 1, day, hour, minute, second);
    return !isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  // 日付が有効なものだ��をフィルタリング
  const validData = data.filter(item => {
    return isValidDate(item.sleepdate) || isValidDate(item.wakeupdate);
  });

  console.log('Valid data:', validData);

  // グループ化と合計計算を行う
  const groupedData = {};
  validData.forEach(record => {
    let dateKey;
    if (record.sleepdate && isValidDate(record.sleepdate)) {
      const nowtime = new Date(record.sleepdate)
      const jstDate = getJSTISO(nowtime)
      dateKey = jstDate.split('T')[0];
    } else if (record.wakeupdate && isValidDate(record.wakeupdate)) {
      const nowtime = new Date(record.wakeupdate)
      const jstDate = getJSTISO(nowtime)
      dateKey = jstDate.split('T')[0];
    } else {
      return;
    }

    if (!groupedData[dateKey]) {
      groupedData[dateKey] = {
        sleepEvents: [],
        wakeEvents: []
      };
    }

    if (record.sleepdate && isValidDate(record.sleepdate)) {
      groupedData[dateKey].sleepEvents.push(new Date(record.sleepdate));
    }

    if (record.wakeupdate && isValidDate(record.wakeupdate)) {
      groupedData[dateKey].wakeEvents.push(new Date(record.wakeupdate));
    }

    if (record.breakfast !== null) {
      groupedData[dateKey].breakfast = record.breakfast;
    }
  });

  console.log('Grouped data:', groupedData);

  // 合計データを計算
  const aggregatedData = Object.entries(groupedData).map(([dateKey, item]) => ({
    date: dateKey,
    sleepTime: item.sleepEvents.length > 0 ? item.sleepEvents.sort((a, b) => a - b)[0] : null,
    wakeTime: item.wakeEvents.length > 0 ? item.wakeEvents.sort((a, b) => a - b)[0] : null,
    sleepCount: item.sleepEvents.length,
    wakeCount: item.wakeEvents.length
  }));

  console.log('Aggregated data:', aggregatedData);

  // テーブル更新
  const table = document.getElementById('slog');
  
  // 既存の行を削除
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  aggregatedData.forEach(item => {
    const row = document.createElement('tr');
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(new Date(item.date));

    const wakeTimeCell = document.createElement('td');
    wakeTimeCell.textContent = item.wakeTime ? formatTime(item.wakeTime) : '記録なし';

    const sleepTimeCell = document.createElement('td');
    sleepTimeCell.textContent = item.sleepTime ? formatTime(item.sleepTime) : '記録なし';

    const checkCell = document.createElement('td');
    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.id = `breakfast-${item.date.replace(/\D/g, '')}`;
    checkBox.disabled = 'disabled'

    if (item.date in groupedData && groupedData[item.date].breakfast) {
      checkBox.checked = true;
    }

    checkCell.appendChild(checkBox);
    row.appendChild(dateCell);
    row.appendChild(wakeTimeCell);
    row.appendChild(sleepTimeCell);
    row.appendChild(checkCell);
    table.appendChild(row);
  });

  console.log('テーブルの更新が完了しました');
}

function formatDate(date) {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}時間 ${minutes % 60}分`;
}

function getJSTISO(nowtime) {
	// UTCとローカルタイムゾーンとの差を取得し、分からミリ秒に変換
	const diff = nowtime.getTimezoneOffset() * 60 * 1000    // -540 * 60 * 1000 = -32400000

	// toISOString()で、UTC時間になってしまう（-9時間）ので��日本時間に9時間足しておく
	const plusLocal = new Date(nowtime - diff)    // Thu Apr 23 2020 07:39:03 GMT+0900 (Japan Standard Time)

	// ISO形式に変換（UTCタイムゾーンで日本時間、というよくない状態）
	let iso = plusLocal.toISOString()   // "2020-04-22T22:39:03.397Z"

	// UTCタイムゾーン部分は消して、日本のタイムゾーンの表記を足す
	iso = iso.slice(0, 19) + '+09:00'    // "2020-04-22T22:39:03+09:00"
	return iso;
}
