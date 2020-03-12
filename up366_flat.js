var rate = 1;  // 正确率

// ---不要乱动下面的代码---------------------------------------------------------------

var notification = '等待中';
var root = '/sdcard/Up366Mobile/flipbook/flipbooks/';
files.removeDir(root);
threads.start(function () {
    var window = floaty.rawWindow(
        <frame w='*' h='auto'>
            <button id='main' color='#FFFFFF' size='50px'bg='#7f000000'/>
        </frame>
    );
    window.main.on('click', function () {
        window.setTouchable(false);
        notification = '等待中';
    });
    window.setTouchable(false);
    window.setPosition(0, 0);
    setTimeout(function () {
        window.setSize(-1, window.getHeight());
    }, 500);
    ui.run(function () {
        setInterval(function () {
            window.main.setText(notification);
            if (notification.match(/^[ABC ]+$/)) {
                window.setTouchable(true);
            }
        }, 100);
    });
}).waitFor();

while (true) {
    try {
        notification = '等待中'
        if (desc('交卷').exists()) {
            notification = '正在搜索';
            sleep(1000);
            var T1 = descMatches(/^1\..*\?$/).findOne(1000).desc().match(/^\d+\. (.*\?)$/)[1];
            var T2 = descMatches(/^2\..*\?$/).findOne(1000).desc().match(/^\d+\. (.*\?)$/)[1];
            var answer = dfs(root, T1, T2);
            if (answer) {
                notification = '答案已就绪';
                var decision = dialogs.confirm(answer, '确定: 自动填写\n取消: 手动填写');
                if (decision) {
                    notification = '填写中...请勿触摸屏幕';
                    sleep(1000);
                    complete(answer);
                    if(desc('交卷').click()) {
                        sleep(500);
                        while(descStartsWith('确定要交卷吗').exists());
                    }
                } else {
                    toast('点击标题栏答案退出手动填写模式');
                    answer = answer.replace(/([ABC]{5})/g, '$1 ');
                    notification = answer;
                    while(notification == answer);
                }
                files.removeDir(root);
            } else {
                notification = '未搜索到答案';
                sleep(2000);
            }
        }
    } catch(e) {
        console.error(e);
    }
    sleep(300);
}

function dfs(dir, T1, T2) {
    var list = files.listDir(dir);
    if (~list.indexOf('page1.js')) {
        var text = files.read(dir + 'page1.js');
        if (~text.search(T1) && ~text.search(T2)) {
            var answer = text.match(/"answer_text": ?"[ABC]"/g);
            for (let i = 0; i < answer.length; i++) {
                answer[i] = answer[i].slice(-2, -1);
            }
            return answer.join('');
        }
    }
    for (let i = 0; i < list.length; i++) {
        var child = dir + list[i] + '/';
        if (files.isDir(child)) {
            var result = dfs(child, T1, T2);
            if (result) {
                return result;
            }
        }
    }
    return null;
}

function complete(answer) {
    function pIndex(view) {
        if (view.parent().className() == 'android.webkit.WebView') {
            return view.indexInParent();
        }
        return view.indexInParent() + 100*pIndex(view.parent());
    }
    var web = desc('听力风暴模板-mobile').findOne().children();
    var child = web.find(descMatches(/^[ABC]\.$/)), list = [];
    for (let i = 0; i < child.length; i++) {
        list.push(child[i]);
    }
    sort(list, 0, list.length, function (a, b) {
        return pIndex(a) < pIndex(b);
    });
    for (let i = 0; i < answer.length; i++) {
        var index = 'ABC'.indexOf(answer[i]);
        if (random() > rate) {
            var tidx = index;
            while (index == tidx) {
                index = random(1, 3);
            }
        }
        list[3*i + index].click();
    }
}

function sort(arr, l, r, cmp){
    if(l == r)
        return;
    var rnd = random(l, r-1);
    var tmp = arr[l];
    arr[l] = arr[rnd];
    arr[rnd] = tmp;
    var i = l, j = r-1;
    while(i < j){
        while(!cmp(arr[j], arr[l]) && j > i)
            j--;
        while(!cmp(arr[l], arr[i]) && i < j)
            i++;
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    tmp = arr[i];
    arr[i] = arr[l];
    arr[l] = tmp;
    sort(arr, l, i, cmp); sort(arr, i+1, r, cmp);
    return arr;
}