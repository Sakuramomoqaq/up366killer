var rate = 1;  // 正确率
var notification = '等待中';
var root = '/sdcard/Up366Mobile/flipbook/flipbooks/';
files.removeDir(root);

threads.start(function () {
    var window = floaty.rawWindow(
        <frame>
            <button id='main' bg='#7F000000' color='#FFFFFF' size='50px'/>
        </frame>
    );
    window.main.on('click', function () {
        window.setTouchable(false);
        notification = '等待中';
    });
    window.setTouchable(false);
    window.setPosition(0, 0);
    window.setSize(device.width, 100);
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
        if (text('交卷').className('android.view.View').exists()) {
            notification = '正在搜索';
            sleep(1000);
            var T1 = textMatches(/^1\..*\?$/).findOne(1000).text().match(/^\d+\. (.*\?)$/)[1];
            var T2 = textMatches(/^2\..*\?$/).findOne(1000).text().match(/^\d+\. (.*\?)$/)[1];
            var answer = dfs(root, T1, T2);
            if (answer) {
                notification = '答案已就绪';
                var answerText = extract(answer);
                var decision = dialogs.confirm(answerText, '确定: 自动填写\n取消: 手动填写');
                if (decision) {
                    notification = '填写中...请勿触摸屏幕';
                    sleep(1000);
                    complete(answer);
                    if(click('交卷')) {
                        sleep(500);
                        while(text('确定要交卷吗？').exists());
                    }
                } else {
                    toast('点击标题栏答案退出手动填写模式');
                    answerText = answerText.replace(/([ABC]{5})/g, '$1 ');
                    notification = answerText;
                    while(notification == answerText);
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

function extract(answer) {
    var str = '';
    for (let i = 0; i < answer.length; i++) {
        for (let j = 0; j < answer[i].length; j++) {
            str += answer[i][j];
        }
    }
    return str;
}

function dfs(dir, T1, T2) {
    var list = files.listDir(dir);
    if (~list.indexOf('page1.js')) {
        var text = files.read(dir + 'page1.js');
        if (~text.search(T1) && ~text.search(T2)) {
            var answer = [];
            eval(text);
            for (let j = 0; j < pageConfig.questionList.length; j++) {
                var q = pageConfig.questionList[j].questonObj;
                if (q.answer_text != undefined) {
                    answer[j] = [q.answer_text];
                } else {
                    answer[j] = [];
                    for (let k = 0; k < q.questions_list.length; k++) {
                        answer[j][k] = q.questions_list[k].answer_text;
                    }
                }
            }
            return answer;
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
    var q = 0;
    for (let i = 0; i < answer.length; i++) {
        for (let j = 0; j < answer[i].length; j++) {
            q++;
            var index = '#ABC'.indexOf(answer[i][j]);
            if (random() > rate) {
                var tidx = index;
                while (index == tidx) {
                    index = random(1, 3);
                }
            }
            var ui_question = textMatches(new RegExp('^' + q + '\\..*\\?$')).findOne()
            var ui_card = ui_question.parent();
            ui_card.child(index+ui_question.indexInParent()).click();
        }
    }
}
