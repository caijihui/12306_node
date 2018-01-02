var https = require('https');
var http = require('http');
var fs = require('fs');
var ca = fs.readFileSync('./cert/srca.cer.pem');
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');
var scanf = require('scanf');
var program = require('commander');
var UA = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36";

// var config = {
//     time:'2018-01-21',//日期格式必须是这样
//     from_station:{code:'SNH'},
//     end_station:{code:'FCG'},//
//     train_num:['K527'],//车次
//     ticket_type:"ADULT",
//     your_mail:'xxxxx@163.com',//你自己的邮箱，我这里用的是163邮箱，如果你要改其他类型的邮箱的话，那请你修改transporter里的服务器信息
//     mail_pass:'xxxxxx'//放心写吧
// };

var config={};

program
	.version('0.0.1')
	.option('-r, --rewrite', 'rewrite config')
	.parse(process.argv);

// fs.readFile('config.json', 'utf-8', function (err, data) {
// 	if (err || !data || program.rewrite) {
// 		console.log('输入日期-time(如:2017-01-27)：');
// 		config.time = scanf('%s');
//
// 		var _stations = JSON.parse(fs.readFileSync('station.json', 'utf-8'));
// 		console.log('输入始发站拼音-from_station(如:shanghai)：');
// 		var _start = scanf("%s");
// 		while (!_stations.stationInfo[_start]) {
// 			console.log('没有这个车站哦，请重新输入：');
// 			_start = scanf("%s");
// 		}
// 		config.from_station = _stations.stationInfo[_start];
// 		console.log('输入终点站拼音-end_station(如:hefei)：');
// 		var _end = scanf('%s');
// 		while (!_stations.stationInfo[_end]) {
// 			console.log('没有这个车站哦，请重新输入：');
// 			_end = scanf("%s");
// 		}
// 		config.end_station = _stations.stationInfo[_end];
//
// 		console.log('输入车次-train_num(如:K1209，多个车次用|分开)：');
// 		config.train_num = scanf('%s').split('|');
//
// 		console.log('输入邮箱-your_mail(如:123456789@163.com)：');
// 		config.your_mail = scanf('%s');
//
// 		console.log('输入密码或者邮箱授权码-mail_pass：');
// 		config.mail_pass = scanf('%s');
//
// 		console.log('是否购买学生票?(y/n)：');
// 		config.ticket_type = scanf('%s') == 'y' ? '0X00' : 'ADULT';
//
// 		console.log('输入收件人邮箱(如果与上面的邮箱一致请直接回车)：');
// 		config.receive_mail = scanf('%s');
// 		// console.log(config);
// 		fs.writeFile('config.json', JSON.stringify(config));
// 	} else {
// 		// console.log(data);
// 		config = JSON.parse(data);
// 	}
// 	var rule = new schedule.RecurrenceRule();
// 	rule.second = [0];
// 	queryTickets(config);
// 	schedule.scheduleJob(rule, function () {
// 		queryTickets(config);
// 	});
// });


var rule = new schedule.RecurrenceRule();
rule.second = [0];
queryTickets(config);
schedule.scheduleJob(rule, function () {
    queryTickets(config);
});

var yz_temp = [], yw_temp = [];//保存余票状态
/*
* 查询余票
*/
function queryTickets(config) {
	/*设置请求头参数*/
	var options = {
		hostname: 'kyfw.12306.cn',//12306
		port: 443,
		method: 'GET',
		path: '/otn/leftTicket/queryO?leftTicketDTO.train_date=' + config.time + '&leftTicketDTO.from_station=' + config.from_station.code + '&leftTicketDTO.to_station=' + config.end_station.code + '&purpose_codes=' + config.ticket_type,
		headers: {
			'User-Agent': UA,
			'Cache-Control':'no-cache',
			'Connection':'keep-alive',
			'Cookie':'JSESSIONID=48469A944878BB7B2834B4C430EEEA50; route=6f50b51faa11b987e576cdb301e545c4; BIGipServerotn=401080586.50210.0000; RAIL_EXPIRATION=1515208179281; RAIL_DEVICEID=jCAO3lfrjxe3sREX0lQg4mmFz8MqPAEZNOOWJ4ci9ctcegeZFuZSMSHEtChjxUPRCg-CkpJhQL1v-a42jYKSeAEOVR5TdB2bbGffbTSMB1pe4q4yy0tCyjCuryOhqG0c1YSxIkD8QH7qLq8Lfg5Ev_HlcqPzQGQZ; _jc_save_fromStation=%u4E0A%u6D77%u5357%2CSNH; _jc_save_toStation=%u4E30%u57CE%2CFCG; _jc_save_fromDate=2018-01-19; _jc_save_toDate=2018-01-02; _jc_save_wfdc_flag=dc',
			'Host':'kyfw.12306.cn',
			'If-Modified-Since':0,
			'Referer':'https://kyfw.12306.cn/otn/leftTicket/init',
			'X-Requested-With':'XMLHttpRequest'
		}
	};
	function b4(ct, cv) {
		var cs = [];
		for (var cr = 0; cr < ct.length; cr++) {
			var cw = [];
			var cq = ct[cr].split("|");
			cw.secretHBStr = cq[36];
			cw.secretStr = cq[0];
			cw.buttonTextInfo = cq[1];
			var cu = [];
			cu.train_no = cq[2];
			cu.station_train_code = cq[3];
			cu.start_station_telecode = cq[4];
			cu.end_station_telecode = cq[5];
			cu.from_station_telecode = cq[6];
			cu.to_station_telecode = cq[7];
			cu.start_time = cq[8];
			cu.arrive_time = cq[9];
			cu.lishi = cq[10];
			cu.canWebBuy = cq[11];
			cu.yp_info = cq[12];
			cu.start_train_date = cq[13];
			cu.train_seat_feature = cq[14];
			cu.location_code = cq[15];
			cu.from_station_no = cq[16];
			cu.to_station_no = cq[17];
			cu.is_support_card = cq[18];
			cu.controlled_train_flag = cq[19];
			cu.gg_num = cq[20] ? cq[20] : "--";
			cu.gr_num = cq[21] ? cq[21] : "--";
			cu.qt_num = cq[22] ? cq[22] : "--";
			cu.rw_num = cq[23] ? cq[23] : "--";
			cu.rz_num = cq[24] ? cq[24] : "--";
			cu.tz_num = cq[25] ? cq[25] : "--";
			cu.wz_num = cq[26] ? cq[26] : "--";
			cu.yb_num = cq[27] ? cq[27] : "--";
			cu.yw_num = cq[28] ? cq[28] : "--";
			cu.yz_num = cq[29] ? cq[29] : "--";
			cu.ze_num = cq[30] ? cq[30] : "--";
			cu.zy_num = cq[31] ? cq[31] : "--";
			cu.swz_num = cq[32] ? cq[32] : "--";
			cu.srrb_num = cq[33] ? cq[33] : "--";
			cu.yp_ex = cq[34];
			cu.seat_types = cq[35];
			cu.exchange_train_flag = cq[36];
			cu.from_station_name = cv[cq[6]];
			cu.to_station_name = cv[cq[7]];
			cw.queryLeftNewDTO = cu;
			cs.push(cw)
		}
		return cs
	}
	/*请求开始*/
	var req = https.get(options, function (res) {
		console.log(options.path);
		var data = '';
		/*设置邮箱信息*/
		var transporter = nodemailer.createTransport({
			host: "smtp.163.com",//邮箱的服务器地址，如果你要换其他类型邮箱（如QQ）的话，你要去找他们对应的服务器，
			secureConnection: true,
			port: 25,//端口，这些都是163给定的，自己到网上查163邮箱的服务器信息
			auth: {
				user: config.your_mail,//邮箱账号
				pass: config.mail_pass,//邮箱密码
			}
		});
		res.on('data', function (buff) {
			data += buff;//查询结果（JSON格式）
		});
		res.on('end', function () {
			var jsonData;
			var trainData;
			//用来保存返回的json数据
			var trainMap;
			try {
				var _data = JSON.parse(data).data;
				trainData = _data.result;
				trainMap = _data.map;
			} catch (e) {
				console.log('JSON数据出错', e);
				return;
			}
			console.log(trainMap);

			jsonData = b4(trainData, trainMap);
			if (!jsonData || jsonData.length == 0) {
				console.log('没有查询到余票信息');
				return;
			}

			/*获取车次与车辆代码的映射表*/
			var jsonMap = {};
			for (var i = 0; i < jsonData.length; i++) {
				var cur = jsonData[i];
				jsonMap[cur.queryLeftNewDTO.station_train_code] = cur.queryLeftNewDTO;
			}
			/*过滤不需要的车次*/
			var train_arr = config.train_num;
			for (var j = 0; j < train_arr.length; j++) {
				var cur_train = jsonMap[train_arr[j]];//当前车次
				if (!cur_train) {
					console.log('当天没有' + train_arr[j] + '这趟车次');
					continue;
				}
				var yz = cur_train.yz_num;//硬座数目
				var yw = cur_train.yw_num;//硬卧数目
				var trainNum = cur_train.station_train_code;//车次
				console.log('\n ' + trainNum + ' 车次的硬座余票数:', yz, ', 硬卧余票数:', yw, '。当前时间：' + getTime());
				if (yz != '无' && yz != '--' || yw != '无' && yw != '--') {
					if (yw_temp[j] == yw && yz_temp[j] == yz) {//当余票状态发生改变的时候就不发送邮件
						console.log(' ' + trainNum + '车次状态没改变，不重复发邮件');
						continue;
					}
					var mailOptions = {
						from: config.your_mail, // 发件邮箱地址
						to: config.receive_mail || config.your_mail, // 收件邮箱地址，可以和发件邮箱一样
						subject: trainNum + '有票啦，硬座：' + yz + '，硬卧：' + yw, // 邮件标题
						text: trainNum + '有票啦\n' + cur_train.from_station_name + '=============>' + cur_train.to_station_name + '\n出发日期：' + config.time + ',\n出发时间：' + cur_train.start_time + ',\n到达时间：' + cur_train.arrive_time + ',\n历时：' + cur_train.lishi, // 邮件内容
					};

					// 发邮件部分
					(function (j, yz, yw) {
						transporter.sendMail(mailOptions, function (error, info) {
							if (error) {
								return console.log(error);
							}
							console.log(' 邮件已发送: ====================> ' + mailOptions.to);
							yw_temp[j] = yw;//保存当前列车的余票数量
							yz_temp[j] = yz;
						});
					})(j, yz, yw);
				} else {
					console.log(trainNum + '硬座/硬卧无票');
				}
			}
			// fs.writeFile('./train.json',data);
		});
	});

	req.on('error', function (err) {
		console.error(err.code);
	});
}

/*
* 爬取全国车站信息并生成JSON文件
*/
function stationJson() {
	var _opt = {
		hostname: 'kyfw.12306.cn',
		path: '/otn/resources/js/framework/station_name.js?station_version=1.8964',
		ca: [ca]
	};
	var _data = '';
	var _req = https.get(_opt, function (res) {
		res.on('data', function (buff) {
			_data += buff;
		});
		res.on('end', function () {
			// console.log(_data);
			try {
				var re = /\|[\u4e00-\u9fa5]+\|[A-Z]{3}\|\w+\|\w+\|\w+@\w+/g;
				// console.log('data',_data.match(re));
				var stationMap = {};
				var stationArray = [];
				var temp = _data.match(re);
				[].forEach.call(temp, function (item, i) {
					// console.log(item,i);
					var t = item.split("|");
					stationArray.push(t[3]);
					stationMap[t[3]] = {
						name: t[1],
						code: t[2],
						pinyin: t[3],
						suoxie: t[4],
						other: t[5]
					}
				});
				// console.log(stationMap["hefei"]);
				fs.writeFile('station.json', JSON.stringify({ stationName: stationArray, stationInfo: stationMap }));
			} catch (e) {
				console.log(e);
				return null;
			}
		});
	});
	_req.on('error', function (err) {
		console.error(err.code);
	});
}
function getTime() {
	var T = new Date();
	return T.getFullYear() + '-' + (parseInt(T.getMonth()) + 1) + '-' + T.getDate() + ' ' + T.getHours() + ":" + T.getMinutes() + ":" + T.getSeconds();
}


