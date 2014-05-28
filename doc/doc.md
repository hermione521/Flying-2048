#Flying 2048

	课程：高级Web技术
	内容：Lab3-Web3D游戏
	姓名：干悦
	学号：11300180158
	项目地址：https://github.com/hermione521/Flying-2048
	游戏地址：http://hermione521.github.io/Flying-2048

## 项目背景

2048-Chess是因为最近非常流行的游戏[2048](http://gabrielecirulli.github.io/2048/)而产生的灵感，这个游戏最初是来源于收费的手机游戏[threes](http://asherv.com/threes/)，后来又出现了类似的免费手机游戏[1024](https://itunes.apple.com/us/app/1024!/id823499224)。

[Tetris tutorial](http://www.smashinglabs.pl/three-js-tetris-tutorial) 是一个Three.js的小教程，它使用three.js实现了一个3D的俄罗斯方块。在Flying2048的开发过程中，我们从这个教程中学到了很多。

## 技术背景

WebGL是一项利用JavaScript API呈现3D计算机图形的技术，有别于过往需加装浏览器插件，通过WebGL的技术，只需要编写网页代码即可实现3D图像的展示。

[Three.js](http://threejs.org/)是一个Javascript的3D library，这个项目是为了建立一个轻量级、简单易用的3D library，它提供了\<canvas\>、\<svg\>、CSS3D和WebGL的渲染器。

## 开发环境

Three.js r67.

## 使用方法

注意：由于Javascript的同源策略，在本地打开index.html时请设置：

 - Chrome: allow-file-access-from-files
 - Safari: 停用本地文件限制

线上使用无需设置，请直接访问[这里](http://hermione521.github.io/Flying-2048)。

键盘方向键控制上下左右，碰到等于自己分数的方块得分，碰到小于自己分数的方块变成方块的分数，碰到大于自己分数的方块无影响。（打开声音哟）

## 主要结构

flying2048.js:

	Flying2048.init
		初始化设置
		创建并渲染外框线条
		监听start按钮点击事件
	
	Flying2048.start
		隐藏菜单，显示分数
		开始animate
	
	Flying2048.animate
		在每单位时间做如下操作：
			将所有方块向外移动一格，删除已经移除视野的方块
			按一定概率产生最里层的新的方块
			如有碰撞则计算新的分数
	
	Flying2048.addStaticBlock
		计算并添加新的方块
	
	Flying2048.setPoints
		设置并显示新的分数

