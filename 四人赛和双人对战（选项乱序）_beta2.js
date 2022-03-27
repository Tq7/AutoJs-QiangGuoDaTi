importClass(android.database.sqlite.SQLiteDatabase);
importClass(android.database.Cursor);
auto.waitFor();
const v = dialogs.select("请选择答题竞赛", ["双人对战", "四  人  赛"]);
if (v == -1) {
    toastLog("未选择答题竞赛");
    exit();
}
log("已选答题竞赛:", v ? "四人赛" : "双人对战");
const j = parseInt(rawInput("请设定本次竞赛局数", v + 1));
if (j < 1) {
    toastLog("本次竞赛局数过少");
    exit();
}
log("本次竞赛局数:", j);
var thd = threads.start(function () {
    className("android.widget.Button").text("立即开始").findOne().click();
});
if (!requestScreenCapture()) {
    toastLog("请求截图权限失败");
    exit();
}
thd.interrupt();
log("请求截图权限成功");
if (!launch("cn.xuexi.android")) {
    toastLog("启动学习强国失败");
    exit();
}
log("启动学习强国成功");
const dev = device.brand + " " + device.model;
files.ensureDir(dir = files.cwd() + '/学习强国答题界面截图/');
var TiKu = SQLiteDatabase.openOrCreateDatabase(files.cwd() + "/TiKu.db", null);
const ci = ['选择词语的正', '选择正确的读', '下列词形正确'];
log("竞赛题库加载成功");
var S = [];
var U = [];
var u = 0;
var n = 0;
toastLog("预热PaddleOCR");
var image = captureScreen();
var words = paddle.ocrText(image, 4, false);
if (text("继续挑战").exists()) {
    text("继续挑战").findOne().click();
} else {
    if (!text("答题竞赛").exists()) {
        text("我的").findOne().click();
        sleep(500);
        text("我要答题").findOne().parent().click();
    }
    if (v) {
        text("答题竞赛").findOne().parent().child(8).click();
    } else {
        text("答题竞赛").findOne().parent().child(9).click();
    }
}
if (v) {
    text("开始比赛").findOne().click();
} else {
    sleep(500);
    text("随机匹配").findOne().parent().child(0).click();
}
sleep(500);
if (text("知道了").exists()) {
    toastLog("竞赛局数已达上限");
    exit();
}
toastLog("竞赛开始");
/*const x0 = 112;//142;//135;
const y0 = 730;//750;//723;
const w0 = 23;//1;//15;
const x1 = 85;
const y1 = 694;//694;//666;
const w1 = 910;
const h0 = 2400;
const h1 = 81;
const h2 = 159;
depth(30).waitFor();//等待首题出现
//以上9个参数与屏幕截图的检测和识别区域相关，建议根据屏幕分辨率和答题界面布局修改数值，以降低首题作答延迟，同时删除以下14行代码。*/
const b30 = depth(30).findOne().bounds();
const b28 = depth(28).findOne().bounds();
const b21 = depth(21).findOnce(1).bounds();
const x0 = parseInt(b30.left + (b30.left - b28.left) / 5);
const y0 = parseInt(b28.top + b21.height() / 34 * 3);
const w0 = parseInt(b28.width() / 42);
const x1 = parseInt(b30.left - (b30.left - b28.left) / 3);
const y1 = b28.top;
const w1 = parseInt(b30.width() + (b28.width() - b30.width()) / 3);
const h0 = device.height;
const h1 = parseInt(b21.height() / 136 * 27);
const h2 = parseInt(b21.height() / 136 * 53);
console.info("b30 =", b30, "| b28 =", b28, "| b21 =", b21);
console.info("x0 =", x0, "| y0 =", y0, "| w0 =", w0, "| x1 =", x1, "| y1 =", y1, "| w1 =", w1, "| h1 =", h1, "| h2 =", h2);//*/
do {
    var m = 0;
    do {
        do {
            var image = captureScreen();
            var f = images.findColorInRegion(image, "#1A1F25", x0, y0, w0, 1, 15);
        } while (m && f)
        while (!f) {
            var image = captureScreen();
            f = images.findColorInRegion(image, "#1A1F25", x0, y0, w0, 1, 15);
        }
        log("发现题目", f);
        if (!m) {
            if (v) {
                if (depth(24).indexInParent(3).findOnce(1).text() != 0 || depth(24).indexInParent(3).findOnce(2).text() != 0 || depth(24).indexInParent(3).findOnce(3).text() != 0) {
                    toastLog("对手作弊，本局无效，请勿作答！");
                    device.keepScreenOn(30000);
                    break;
                }
            } else {
                if (depth(24).indexInParent(2).findOnce(1).text() != 0) {
                    toastLog("对手作弊，本局无效，请勿作答！");
                    device.keepScreenOn(30000);
                    break;
                }
            }
        }
        if (depth(29).findOne().text() == '        ') {
            var h = depth(29).findOne().bounds().height();
            var l = 0;
        } else {
            var h = depth(29).text("").findOne().bounds().top - y1;
            var l = 1;
        }
        var img = images.clip(image, x1, y1, w1, h1 + 7 > h ? h1 : h2);
        words = paddle.ocrText(img, 4, false);
        img.recycle();
        try {
            if (words[0].charAt(1) == ".") {
                words[0] = words[0].slice(2);
            } else if (words[1].charAt(1) == ".") {
                var a = words[0];
                words[0] = words[1].slice(2);
                words[1] = a;
            }
        } catch (err) {
            toastLog("题目识别失败");
            continue;
        }
        var Qx = words.join("");
        var Q = Qx.replace(/[\s_]/g, "");
        var c = Q.indexOf("来源：");
        if (c != -1) {
            Q = Q.slice(0, c);
        }
        c = ci.indexOf(Q.slice(0, 6));
        var Ox = [];
        var B = className("android.widget.ListView").findOne().children().map(a => {
            return a.bounds();
        });
        var o = B.length;
        if (c != -1) {
            do {
                image = captureScreen();
            } while (!images.findColorInRegion(image, "#1A1F25", x1 + x1, B[0].top + h1, x1, 1, 15));
            var img = images.clip(image, B[0].left, B[0].top, B[0].width(), B[0].height());
            words = paddle.ocrText(img, 4, false);
            img.recycle();
            if (words[0].charAt(1) == ".") {
                words[0] = words[0].slice(2);
            } else if (words[0].charAt(0) == "A") {
                words[0] = words[0].slice(1);
            }
            Ox[0] = words.join("");
            var a = Ox[0].replace(/\s/g, "");
            if (a.charAt(0) == "防" || a.charAt(0) == "奶") {
                a = "妨碍";
            } else if (a.charAt(a.length - 1) == "江" || a.charAt(a.length - 1) == "立") {
                a = "啜chuo泣";
            } else if (a.charAt(0) == "+") {
                a = "十日";
            }
            var X = a.split("");
            var x = X.length;
            var A = "";
            var scr = 0.7;
            var cur = TiKu.query("TiKu", ["Optionsx", "Answerx"], "Questionx like '" + ci[c] + "%' and o = " + o, null, null, null, null);
            while (cur.moveToNext()) {
                a = cur.getString(0);
                var score = 0;
                for (let h = 0; h < x; h++) {
                    if (a.includes(X[h])) {
                        score++;
                    }
                }
                if (score >= scr) {
                    score = score - Math.abs(cur.getString(1).length - x) / 10;
                    if (score >= scr) {
                        A = cur.getString(1);
                        scr = score;
                        if (scr == x) {
                            break;
                        }
                    }
                }
            }
            cur.close();
            scr = scr / x;
            if (A) {
                S[0] = 0;
                for (let h = 0; h < x; h++) {
                    if (A.includes(X[h])) {
                        S[0]++;
                    }
                }
                if (S[0] == x) {
                    c = 0;
                } else {
                    var img = images.clip(image, B[1].left, B[1].top, B[1].width(), B[1].height());
                    words = paddle.ocrText(img, 4, false);
                    img.recycle();
                    if (words[0].charAt(1) == ".") {
                        words[0] = words[0].slice(2);
                    } else if (words[0].charAt(0) == "B") {
                        words[0] = words[0].slice(1);
                    }
                    Ox[1] = words.join("");
                    var a = Ox[1].replace(/\s/g, "");
                    if (a.charAt(0) == "防" || a.charAt(0) == "奶") {
                        a = "妨碍";
                    } else if (a.charAt(a.length - 1) == "江" || a.charAt(a.length - 1) == "立") {
                        a = "啜chuo泣";
                    } else if (a.charAt(0) == "+") {
                        a = "十日";
                    }
                    var X = a.split("");
                    var x = X.length;
                    S[1] = 0;
                    for (let h = 0; h < x; h++) {
                        if (A.includes(X[h])) {
                            S[1]++;
                        }
                    }
                    if (S[1] == x) {
                        c = 1;
                    } else {
                        c = S[0] >= S[1] ? 0 : 1;
                    }
                }
            } else {
                c = 1;
            }
        } else {
            var A = "";
            var scr = 1;
            if (Q.slice(0, 6) == '人力资源和社') {
                A = '全额' + '65年限' + '城乡居民收入增长' + '个人账户';
            } else if (Q.slice(0, 6) == '下列不属于二') {
                A = '《清史》' + '《左传》'; ``
            } else if (Q.includes("照宪")) {
                if (h > h1 * 6) {
                    A = '全国人民代表大会常务委员会';
                } else {
                    A = '全国人民代表大会';
                }
            } else if (Q.includes("关因")) {
                if (h > h1 * 5.4) {
                    A = '免检';
                } else {
                    A = '查验';
                }
            } else if (Q.includes("4年2")) {
                if (h > h1 * 9) {
                    A = '治理体系 治理能力';
                } else {
                    A = '十八届三中全会';
                }
            } else {
                var cur = TiKu.query("TiKu", ["Answerx"], "Questionx like '" + Q + "%' and o = " + o, null, null, null, null);
                if (cur.getCount()) {
                    cur.moveToFirst();
                    A = cur.getString(0);
                    cur.close();
                } else {
                    cur.close();
                    var X = Q.split("");
                    var x = X.length;
                    var scr = 0.7 * x;
                    var cur = TiKu.query("TiKu", ["Questionx", "Answerx"], "o = " + o, null, null, null, null);
                    while (cur.moveToNext()) {
                        var a = cur.getString(0).slice(0, x);
                        var score = 0;
                        for (let h = 0; (h != 5 || score) && h < x; h++) {
                            if (a.includes(X[h])) {
                                score++;
                            }
                        }
                        if (score > scr) {
                            A = cur.getString(1);
                            scr = score;
                        }
                    }
                    cur.close();
                    scr = scr / x;
                }
            }
            if (A) {
                for (let i = 0; i < o; i++) {
                    if (B[i].top >= h0) {
                        B.splice(i, o - i);
                        break;
                    } else if (B[i].bottom > h0) {
                        B[i].bottom = h0;
                        break;
                    }
                }
                var e = B.length;
                if (m) {
                    do {
                        image = captureScreen();
                    } while (!images.findColorInRegion(image, "#1A1F25", x1 + x1, B[0].top + h1, x1, 1, 15));
                }
                for (let i = 0; i < e; i++) {
                    var img = images.clip(image, B[i].left, B[i].top, B[i].width(), B[i].height());
                    words = paddle.ocrText(img, 4, false);
                    img.recycle();
                    try {
                        if (words[0].charAt(1) == ".") {
                            words[0] = words[0].slice(2);
                        } else if (['A', 'B', 'C', 'D'].indexOf(words[0].charAt(0)) != -1) {
                            words[0] = words[0].slice(1);
                        }
                    } catch (err) {
                        toastLog("选项识别失败");
                        do {
                            image = captureScreen();
                        } while (!images.findColorInRegion(image, "#1A1F25", x1 + x1, B[0].top + h1, x1, 1, 15));
                        i--;
                        continue;
                    }
                    Ox[i] = words.join("");
                    var a = Ox[i].replace(/\s/g, "");
                    if (a == A) {
                        c = i;
                        break;
                    }
                    var X = a.split("");
                    var x = X.length;
                    S[i] = 0;
                    for (let h = 0; h < x; h++) {
                        if (A.includes(X[h])) {
                            S[i]++;
                        }
                    }
                    if (i) {
                        c = S[c] > S[i] ? c : i;
                    } else {
                        c = 0;
                    }
                }
            } else {
                c = 1;
            }
        }
        if (m) {
            if (className("android.widget.Image").indexInParent(2).exists()) {
                break;
            }
        } else if (n < j || scr == 0.7) {
            if (v) {
                if (depth(24).indexInParent(3).findOnce(1).text() != 0 || depth(24).indexInParent(3).findOnce(2).text() != 0 || depth(24).indexInParent(3).findOnce(3).text() != 0) {
                    toastLog("对手太强，本局无效，请勿作答！");
                    device.keepScreenOn(30000);
                    break;
                }
            } else {
                if (depth(24).indexInParent(2).findOnce(1).text() != 0) {
                    toastLog("对手太强，本局无效，请勿作答！");
                    device.keepScreenOn(30000);
                    break;
                }
            }
        }
        className("android.widget.ListView").findOne().child(c).child(0).click();
        U[u + m] = ["Q" + (n + 1) + (-m - 1), scr, o, A, h, l, Qx, Ox.join("|"), Ox[c], B.join("|")];
        log(U[u + m].join(" | "));
        var date = new Date();
        date = date.getFullYear() + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + (date.getDate() < 10 ? '0' : '') + date.getDate() + '-'
            + (date.getHours() < 10 ? '0' : '') + date.getHours() + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
        //images.save(image, dir + date + '.png');
        Ox = [];
        for (let i = 0; i < o; i++) {
            if (B[i].top >= h0) {
                B.splice(i, o - i);
                break;
            } else if (B[i].bottom > h0) {
                B[i].bottom = h0;
                break;
            }
        }
        var e = B.length;
        for (let i = 0; i < e; i++) {
            var img = images.clip(image, B[i].left, B[i].top, B[i].width(), B[i].height());
            words = paddle.ocrText(img, 4, false);
            img.recycle();
            try {
                if (words[0].charAt(1) == ".") {
                    words[0] = words[0].slice(2);
                } else if (['A', 'B', 'C', 'D'].indexOf(words[0].charAt(0)) != -1) {
                    words[0] = words[0].slice(1);
                }
            } catch (err) {
                toastLog("选项识别失败");
                Ox[i] = "NULL";
                continue;
            }
            Ox[i] = words.join("");
        }
        //查重...
        TiKu.execSQL("insert into TiKu(o,Answer,h,l,Questionx,Optionsx,Answerx,Bounds,device,date) values("
            + o + ",'" + A + "'," + h + "," + l + ",'" + Qx + "','" + Ox.join("|") + "','" + Ox[c] + "','" + B.join("|") + "','" + dev + "','" + date + "')");
        m++;
        sleep(1333);
    } while (!(className("android.widget.Image").indexInParent(2).exists() || text("继续挑战").exists()))
    if (m) {
        text("回顾本局答题").findOne().click();
        L = text("温故知新").findOne().parent().parent().parent().child(1);
        m = L.childCount();
        for (let i = 0; i < m; i++) {
            if (!L.child(i).child(2).childCount()) {
                t = L.child(i).child(2).text();
            }
            else {
                t = "";
                L.child(i).child(2).children().forEach(a => {
                    t = t + a.text();
                });
            }
            if (t.includes("来源：")) {
                t = t.replace("来源：", " 来源：");
            }
            U[u + i].push(t, L.child(i).child(3).text(), L.child(i).child(4).text(), L.child(i).child(0).text().slice(0, 12));
        }
        u = U.length;
        back();
        n++;
    } else {
        sleep(3000);
    }
    if (n < j) {
        text("继续挑战").findOne().click();
        if (v) {
            text("开始比赛").findOne().click();
        }
        else {
            text("随机匹配").findOne().parent().child(0).click();
        }
        sleep(500);
    } else {
        break;
    }
} while (!text("知道了").exists())
TiKu.close();
toastLog("本次竞赛完成" + n + "局");
log(U);
exit();
