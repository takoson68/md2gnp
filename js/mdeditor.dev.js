"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var mdBoxApp = new Vue({
  el: "#mdBox",
  data: {
    urlBox: 'URL_head',
    isDefault: 'MyData.isDefault',
    mdData: '',
    renderData: [],
    endData: [],
    iArr: [['star', '00 ~ 08'], ['wb_sunny', '08 ~ 12'], ['brightness_high', '12 ~ 18'], ['brightness_2', '18 ~ 24']],
    cName: [],
    // 時間 chart
    cData: [],
    // 次數 chart
    setComment: [''],
    commentBox: [''],
    mtChart: null // 這裡是要讓外面重繪的時候叫得到

  },
  created: function created() {
    this.getMd();
  },
  watch: {
    mdData: {
      handler: function handler(newValue, oldValue) {
        if (oldValue != []) {
          this.mdToJson(newValue); // this.writeCom()
        }
      },
      immediate: false,
      deep: false
    }
  },
  computed: {},
  mounted: function mounted() {
    this.dragBox();
  },
  methods: {
    getMd: function getMd() {
      var _this = this;

      //測試用資料
      // 取得 md.text 
      axios.get('../md.text').then(function (response) {
        _this.mdData = response.data;

        _this.mdToJson(response.data); // console.log(this.mdData);

      })["catch"](function (error) {
        // 请求失败处理
        console.log(error);
      });
    },
    mdToJson: function mdToJson(data) {
      // JSON.stringify(data)
      // 清理文字資料
      var qq = data.replaceAll("\\\\n", "\n").replace('\n`', '').replace(/^\s*|\s*$/g, "");
      qq.replace('+ `', '+ `\n');
      qq = data.split('\n');
      var ww = []; // 以加號為準分條擷取成陣列

      qq.forEach(function (e) {
        ww = [].concat(_toConsumableArray(ww), [e.split('+ ')[1]]);
      }); // 刪除空陣列(修正多打了換行而無法正確顯示的問題)

      ww = ww.filter(function (el) {
        return el;
      }); // 判斷時間格式

      var regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/; // 判斷中文字

      var re = /^[0-9] .?[0-9]*/; //判斷字串是否為數字//判斷正整數/[1−9] [0−9]∗]∗/ 

      var finData = []; // 最終產物

      var ff = []; //不是時間格式的暫存區 

      ww.forEach(function (s, i) {
        if (regex.test(s.substring(1, 11))) {
          //判斷確定是時間格式
          // 時間日期格式不完整的  會塞' 25:00:00'進去  這裡把他當成特別標示處理
          if (isNaN(s.substring(12, 14) * 1)) {
            s = s.slice(0, 11) + ' 25:00:00' + s.slice(11);
          }

          if (ff.length > 0) {
            if (finData.length == 0) {
              // 又如果第一筆資料是沒有時間的
              // finData第一筆就不會產生陣列，所以這裡要加上第一個
              // 然後將資料命名為start  // start只會出現在第一筆
              finData = [{}];
              finData[0].start = ff;
            } else {
              // 將ff的資料塞到上一筆命名為ann
              finData[finData.length - 1].ann = _toConsumableArray(ff);
            }

            finData = [].concat(_toConsumableArray(finData), [{
              time: s.substring(1, 20).replace(/^\s*|\s*$/g, "").split(' '),
              con: s.substring(21).replace(/^\s*|\s*$/g, "")
            }]);
            ff = [];
          } else {
            // ff是空陣列的時候正常塞資料
            finData = [].concat(_toConsumableArray(finData), [{
              time: s.substring(1, 20).replace(/^\s*|\s*$/g, "").split(' '),
              con: s.substring(21).replace(/^\s*|\s*$/g, "")
            }]);
          }
        } else {
          // 不是時間格式的
          if (i == ww.length - 1) {
            // 此時的最後一筆塞進資料
            finData[finData.length - 1].ann = [].concat(_toConsumableArray(ff), [s]);
            ff = [];
          } else {
            ff = [].concat(_toConsumableArray(ff), [s]);
          }
        }
      }); // console.log(finData);   

      this.renderData = finData; // 排序時間跟日期

      this.filterTime(finData);
    },
    filterTime: function filterTime(finData) {
      var zData = {};
      finData.forEach(function (el, i) {
        if (!el.time) {
          zData['0000-00-00'] = [{
            start: el.start,
            time: '00:00:01'
          }];
        } else {
          if (zData[el.time[0]] == undefined) {
            zData[el.time[0]] = [];
          }

          zData[el.time[0]].push({
            time: el.time[1],
            con: el.con,
            ann: el.ann
          });
        }
      }); // 把日期排序出來

      var sortDay = Object.keys(zData).sort(function (a, b) {
        return a.replaceAll('-', '') - b.replaceAll('-', '');
      });
      var okData = [];
      sortDay.forEach(function (el) {
        var sortArr = []; // 把時間排序出來

        sortArr = zData[el].sort(function (a, b) {
          return a.time.replaceAll(':', '') - b.time.replaceAll(':', '');
        });
        okData = [].concat(_toConsumableArray(okData), [[el, sortArr]]);
      }); // 把時間 25:00:00 設為當天第一筆資料

      okData.forEach(function (e) {
        e[1].forEach(function (s) {
          if (s.time.split(':')[0] * 1 == 25) {
            e[1] = [e[1].pop()].concat(_toConsumableArray(e[1]));
          }
        });
      });
      this.endData = okData;
      this.makeChart(okData);
    },
    makeChart: function makeChart(okData) {
      var _this2 = this;

      var cat = {}; // 整理暫存

      var d = ""; // 日期

      var cutHour = 0; // 跟上一筆差多少時間

      var n = ""; // 日期加上幾點 :: 2021-08-30 10 “上一個日期”

      var v = ""; // 記住這個是幾點（比對用）

      var t = 0; // 記錄同一天裡面次數

      var save_25_Time = []; // 紀錄時間是25的日期

      okData.forEach(function (el, jj) {
        if (el[0] !== '0000-00-00') {
          el[1].forEach(function (e, i) {
            var st = e.time.split(':')[0]; // 發現時間為25的時候，讓最下面使用，這邊拆開最主要原因是不讓命名變成12

            var st_25 = false;

            if (st == '25') {
              st = '12';
              st_25 = true;
              save_25_Time.push([el[0], e.con]);
            }

            n = el[0] + ' ' + st;

            if (d !== '' && n !== '') {
              // 兩筆都有時間才能比較
              cutHour = _this2.calculatingTime(d + ' ' + v, n);

              if (cutHour > 1 && cutHour <= 6) {
                //間隔一到六小時
                var m = Math.ceil(cutHour);

                for (var ij = 1; ij < m; ij++) {
                  var g = parseInt(v) + ij;
                  cat[el[0] + ' ' + g] = 0;
                }
              }

              if (cutHour > 6 && cutHour <= 12) {
                //間隔六到十二小時
                var f = Math.ceil(cutHour / 2);

                for (var _ij = 1; _ij < f; _ij++) {
                  var _g = parseInt(v) + _ij * 2;

                  cat[el[0] + ' ' + _g] = 0;
                }
              }

              if (cutHour > 12 && cutHour <= 48) {
                //間隔十二小時到兩天
                var _m = Math.ceil(cutHour / 6);

                for (var iu = 1; iu < _m; iu++) {
                  cat[d + ' ( + ' + iu * 6 + 'hr)'] = 0;
                }
              }

              var im = 24 * 30;

              if (cutHour > 48 && cutHour <= im) {
                //間隔兩天到一格月
                var _m2 = Math.ceil(cutHour / 48);

                for (var _iu = 1; _iu < _m2; _iu++) {
                  cat[d + ' ( + ' + _iu * 2 + 'day)'] = 0;
                }
              }

              if (cutHour > im) {
                //間隔一個月以上
                var _m3 = Math.ceil(cutHour / im);

                for (var _iu2 = 1; _iu2 < _m3; _iu2++) {
                  cat[d + ' ( + ' + _iu2 + 'mo.)'] = 0;
                }
              }
            }

            if (st !== v) {
              t = 0;
              v = st;
            }

            t++;

            if (st_25) {
              // 特別標示25的時間會用12點去標示時間當此次時間
              t = 0;
              cat[el[0] + ' '] = 1;
              v = '12';
            } else {
              cat[n] = t;
            }

            d = el[0];
          });
        }

        t = 0;
      });
      this.cName = Object.keys(cat);
      var pp = [];
      this.cName.forEach(function (e) {
        pp = [].concat(_toConsumableArray(pp), [cat[e]]);
      });
      this.cData = pp;
      this.setComment = this.cName.map(function (e) {
        return e[0] !== '+' ? e : '';
      });
      this.commentBox = this.setComment.map(function () {
        return ['', -2];
      }); // console.log(this.setComment);

      save_25_Time.forEach(function (e) {
        // 折線圖註解標示
        var su = _this2.setComment.indexOf(e[0] + ' ');

        if (su >= 0) {
          _this2.commentBox[su][0] = e[1];
        }
      });
      this.renderChart();
    },
    calculatingTime: function calculatingTime(p, l) {
      // 計算兩個時間差幾小時
      var ONE_HOUR = 1000 * 60 * 60; // 1小時的毫秒數

      var d = p + ":00:00";
      var n = l + ":00:00";
      var a = d.replaceAll('-', '/');
      var b = n.replaceAll('-', '/');
      var Date_A = new Date(a);
      var Date_B = new Date(b);
      var diff = Date_B - Date_A;
      var leftHours = Math.floor(diff / ONE_HOUR);
      if (leftHours > 0) diff = diff - leftHours * ONE_HOUR;
      return leftHours;
    },
    cutTime: function cutTime(dd) {
      var time = dd.replace('-', ' ').replace('-', '/').split(' ');
      return time;
    },
    SelectＰic: function SelectIc(ss) {
      var oo = parseInt(ss.split(':')[0]);
      var icon = oo < 8 ? 'star' : oo < 12 ? 'wb_sunny' : oo < 18 ? 'brightness_high' : oo < 24 ? 'brightness_2' : 'settings_suggest';
      return icon;
    },
    renderChart: function renderChart() {
      //- 監控主機數量統計
      var ctx = document.getElementById('myChart');
      var textIndex = this.commentBox; //因為有閉包問題拉到這裡
      // 這裡是要讓外面重繪的時候叫得到

      this.mtChart = new Chart(ctx, {
        responsive: true,
        type: 'line',
        data: {
          labels: this.cName,
          datasets: [{
            label: '事件次數統計',
            data: this.cData,
            backgroundColor: 'rgba(139, 18, 219, 0.3)',
            borderColor: 'rgba(139, 18, 219, 0.8)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              stacked: true,
              id: 'y-axis-1',
              ticks: {
                min: 0,
                beginAtZero: true,
                userCallback: function userCallback(label, index, labels) {
                  if (Math.floor(label) === label) {
                    return label;
                  }
                }
              }
            }],
            xAxes: [{
              ticks: {
                minRotation: 65,
                autoskip: false,
                display: true,
                autoSkipPadding: 10
              }
            }]
          },
          elements: {
            line: {
              tension: 0.000001
            }
          },
          hover: {
            animationDuration: 0 // 防止鼠标移上去，数字闪烁

          },
          animation: {
            // 这部分是数值显示的功能实现
            onComplete: function onComplete() {
              var chartInstance = this.chart;
              ctx = chartInstance.ctx; // 以下属于canvas的属性（font、fillStyle、textAlign...）

              ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
              ctx.fillStyle = "black";
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              var hasOne = false; // 有第一筆資料

              this.data.datasets.forEach(function (dataset, i) {
                var meta = chartInstance.controller.getDatasetMeta(i);
                var last = meta.data.length; // let Previous = 0;

                meta.data.forEach(function (bar, index) {
                  var data = dataset.data[index];
                  data = data == 0 ? '' : data; // 資料是0的話就不顯示

                  ctx.fillText(data, bar._model.x, bar._model.y - 5);
                  var comm = textIndex[index][0]; //因為有閉包問題所以textIndex拉到外層

                  if (comm) {
                    var textWidth = ctx.measureText(comm).width; // 計算文字內容寬度

                    var xPos = 0;

                    if (!hasOne) {
                      // chaer.js第一筆資料寬度會比較小 bug
                      textWidth = textWidth * 1.11;
                      hasOne = true;
                    }

                    if (index == 0) {
                      ctx.textAlign = 'start';
                      xPos = bar._model.x - 5;
                    } else if (index == last - 1) {
                      ctx.textAlign = 'end';
                      xPos = bar._model.x - textWidth - 5;
                    } else {
                      ctx.textAlign = 'center';
                      xPos = bar._model.x - textWidth / 2 - 5;
                    }

                    var padding = textIndex[index][1];
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.strokeStyle = "#fc7232"; //園角矩形線匡顏色

                    ctx.lineJoin = "round";
                    ctx.lineWidth = "8";
                    ctx.fillStyle = "#fc7232";
                    var myLineH = padding > 0 ? 10 * padding + 14 : 10 * padding - 12;
                    ctx.fillRect(bar._model.x - 2, bar._model.y - myLineH, 4, 10 * padding - 6); //引導線 用小矩形做的 

                    ctx.strokeRect(xPos, bar._model.y - 10 * padding - 10, textWidth + 10, 18);
                    ctx.fillRect(xPos, bar._model.y - 10 * padding - 10, textWidth + 10, 18);
                    var grd = ctx.createLinearGradient(xPos, bar._model.y - 10 * padding - 10, xPos, bar._model.y - 10 * padding + 9);
                    grd.addColorStop(0, "#fc7232");
                    grd.addColorStop(0.5, "#e23a2e");
                    grd.addColorStop(1, "#fc7232");
                    ctx.fillStyle = grd; //填滿顏色

                    ctx.fillRect(xPos, bar._model.y - 10 * padding - 10, textWidth + 10, 18); // ctx.fillStyle = "#fc7232";

                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "10pt Arial";
                    ctx.fillText(comm, bar._model.x, bar._model.y - (4 + (padding - 1) * 10));
                    ctx.stroke();
                    ctx.fillStyle = "#000000"; // Previous = index
                  }
                });
              });
            }
          }
        }
      });
    },
    dragBox: function dragBox() {
      var x_pos,
          startX = 0;
      var printable = document.querySelector('#printable');
      var dragDiv = document.querySelector('.dragBox');
      dragDiv.addEventListener('mousedown', dragStart);

      function dragStart(e) {
        x_pos = printable.offsetWidth;
        e.preventDefault(); //記錄點擊相對被點擊物件的座標

        startX = e.clientX - dragDiv.offsetLeft;
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', stop);
      }

      function move(e) {
        //計算出拖曳物件的距離計算寬度
        var x = e.clientX - startX;
        printable.style.width = x_pos - x + 'px';
      }

      function stop() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', stop);
        mdBoxApp.writeCom();
      }
    },
    writeCom: function writeCom() {
      this.mtChart.destroy();
      this.renderChart();
    },
    pickMeWord: function pickMeWord(d) {
      //這個用字串方式
      var srt = d;
      var pickW = false;

      function wwBox() {
        pickW = !pickW;
        return pickW ? '<em>' : '</em>';
      } // IE11 沒有replaceAll方法  改用 正則 g 表示全域


      srt = srt.replace(/`/g, wwBox); // console.log(srt);

      return srt;
    }
  }
});

var fn1 = function fn1(e) {
  return Promise.resolve(e);
}; //  下載圖片


var MdText = document.querySelector('.mdTopng');
var Printable = document.querySelector('#printable');

function screenshot() {
  var name = window.prompt('請輸入檔案名稱', '');

  if (!!name) {
    var Big = window.confirm('放大攻擊次數統計圖？');

    if (Big) {
      //選大圖
      bigPic(name);
    } else {
      //直接畫
      attackHistory(name);
    }
  }
}

function bigPic(name) {
  MdText.setAttribute('style', 'flex: 0 0 0px !important; min-width: 0px !important;');
  Printable.setAttribute('style', 'width: 100% !important;');
  mdBoxApp.writeCom();
  setTimeout(function () {
    attackHistory(name);
  }, 2500);
}

function attackHistory(name) {
  TakePic('myChart', '_line', name);
  TakePic('attackHistory', '_history', name);
  setTimeout(function () {
    MdText.setAttribute('style', 'display:block;min-width: 200px !important;');
    Printable.setAttribute('style', 'width: 900px !important;');
    mdBoxApp.writeCom();
  }, 500);
}

function TakePic(who, type, name) {
  html2canvas(document.getElementById(who)).then(function (canvas) {
    document.body.appendChild(canvas);
    var a = document.createElement('a');
    a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
    a.download = name + type + '.jpg';
    a.click();
  });
}