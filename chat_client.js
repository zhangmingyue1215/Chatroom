(function () {
	var d = document,
		w = window;
	var url = 'ws://localhost:3000';
	var socket = io.connect(url);
	w.CHAT = {
		msgObj: d.getElementById("message"),
		//让浏览器滚动条保持在最低部
		scrollToBottom: function () {
			w.scrollTo(0, this.msgObj.clientHeight);
		},
		submit: function () {
			var content = d.getElementById("content").value;
			if (content != '') {
				var obj = {
					userid: this.userid,
					username: this.username,
					content: content
				};
				socket.emit('message', obj);
				d.getElementById("content").value = '';
			}
			return false;
		},
		genUid: function () {
			return new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
		},
		usernameSubmit: function () {
			var username = d.getElementById("username").value;
			if (username != "") {
				d.getElementById("username").value = '';
				d.getElementById("loginbox").style.display = 'none';
				d.getElementById("chatbox").style.display = 'block';
				this.init(username);
			}else {
				alert("用户名不能为空!");
			}

		},
		//更新在线人数，并在有用户加入、退出的时候调用
		onlinenum: function (o) {
			console.log(o);
			var name = '';
			for (i in o.onlineUsers) {
				name += o.onlineUsers[i]+"、";
			}
			var onlinecount = d.getElementById("onlinecount");
			onlinecount.innerHTML = '当前共有 ' + o.onlineCount + ' 人在线，在线列表：' + name;
		},
		init: function(username){
			this.userid = this.genUid();
			this.username = username;
			//监听提交消息
			socket.on('message', function (obj) {
				var isme = (obj.userid == CHAT.userid) ? true : false;
				var contentDiv = '<div>' + obj.content + '</div>';
				var usernameDiv = '<span>' + obj.username + '</span>';
				var msg = document.getElementById("message");
				var section = d.createElement('section');
				if (isme) {
					msg.appendChild(section);
					section.className = 'user';
					section.innerHTML = contentDiv + usernameDiv;
				} else {
					msg.appendChild(section);
					section.className = 'service';
					section.innerHTML = usernameDiv + contentDiv;
				}
				CHAT.scrollToBottom();

			});

			//告诉服务器端有用户登录
			socket.emit('login', {userid: this.userid, username: this.username});

			//监听新用户登录
			socket.on('login', function (o) {
				CHAT.onlinenum(o, 'login');
				var msg = document.getElementById("message");
				var load_msg = document.createElement("section");
				msg.appendChild(load_msg);
				load_msg.classList.add('center_load');
				load_msg.innerHTML = o.user.username +"进入了聊天室";
			});

			//监听用户退出
			socket.on('logout', function (o) {
				CHAT.onlinenum(o, 'logout');
				var _msg = document.getElementById("message");
				var exit_msg = document.createElement("section");
				_msg.appendChild(exit_msg);
				exit_msg.classList.add('center_exit');
				exit_msg.innerHTML = o.user.username +"退出了聊天室";
			});

		}
	};
	//通过“回车”提交用户名
	d.getElementById("username").onkeydown = function (e) {
		e = e || event;
		if (e.keyCode === 13) {
			CHAT.usernameSubmit();
		}
	};
	//通过“回车”提交信息
	d.getElementById("content").onkeydown = function (e) {
		e = e || event;
		if (e.keyCode === 13) {
			CHAT.submit();
		}
	};

})();
