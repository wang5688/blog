var lr = require('tiny-lr'),
	server = lr(),
	gulp = require('gulp'),
	livereload = require('gulp-livereload'),
	webserver = require('gulp-webserver'), // 开启服务器
	gulpSass = require('gulp-sass'), // sass框架
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	plumber = require('gulp-plumber'),
	clean = require('gulp-clean'),
	imagemin = require('gulp-imagemin'), // 无损压缩图片
	pngquant = require('imagemin-pngquant'), // 无损压缩图片
	rename = require('gulp-rename'),
	copy = require('gulp-copy'),
	tinypng = require('gulp-tinypng'), // 无损压缩图片
	opn = require('opn'),
	config = require('./config.json'),
	srcConfig = require('./gulp/gulpconfig.js'),
	gulpReplace = require("gulp-replace");;

// 搭建本地web服务
gulp.task('webserver', function(){
	gulp.src('./')
		.pipe(webserver({
			host : config.localserver.host,
			port : config.localserver.port,
			livereload : true,
			directoryListing : false
		}));
});

// 通过浏览器打开本地web服务器 路径
gulp.task('openbrowser', function(){
	opn('http://' + config.localserver.host + ':' + config.localserver.port);
});

// 编译sass代码
gulp.task('sass-css', function(){
	gulp.src(srcConfig.sassAll)
		.pipe(plumber())
		.pipe(gulpSass())
		.pipe(gulp.dest(srcConfig.buildCss));
});

// 合并css文件为style.css
gulp.task('concat-css', ['replace:img'], function(){
	return gulp.src(srcConfig.buildCss + '/*.css')
		.pipe(concat('style.css'))
		.pipe(gulp.dest(srcConfig.cssSrc));
});

// 多余文件删除
gulp.task('clean',['concat-css'], function(){
	return gulp.src('./sass-cache')
		.pipe(clean({force : true}))
		.pipe(gulp.dest('./clean'));
});

// 压缩javascript文件，压缩后放入build/js下
gulp.task('minifyjs', function(){
	gulp.src(srcConfig.jsAll)
		.pipe(uglify())
		.pipe(gulp.dest(srcConfig.buildMin));
});

// 合并 build/js 文件夹下所有js文件 重命名为main.js 放入build/js下
gulp.task('alljs',['minifyjs'], function(){
	return gulp.src(srcConfig.buildMin+'/*.js')
		.pipe(concat('main.min.js'))
		.pipe(gulp.dest(srcConfig.jsSrc));
});

// 压缩图片
gulp.task('imagemin', function(){
	return gulp.src('img/*')
		.pipe(imagemin({
			progressive : true,
			svgoPlugins : [{removeViewBox : false}],
			use : [pngquant()]
		}))
		.pipe(gulp.dest('./build/images'));
});
// 将图片copy到images目录下
gulp.task('copy:img', ['imagemin'], function(){
	return gulp.src(srcConfig.buildImg)
		.pipe(gulp.dest('./images'));
});
// 替换图片路径
gulp.task('replace:img',['sass-css','copy:img'], function(){
	return gulp.src(srcConfig.buildCss + '/*.css')
		.pipe(gulpReplace(/\.\.\/img/gi,'../images'))
		.pipe(gulp.dest(srcConfig.buildCss));
});

// // 相关文件复制到build文件夹下
// gulp.task('buildfiles', function(){
// 	// 根目录
// 	gulp.src('./*.{php,html,css,png')
// 		.pipe(gulp.dest('./build'));
// 	// css文件
// 	gulp.src('./css/*')
// 		.pipe(gulp.dest('./build/css'));
// 	// 压缩后的js文件
// 	gulp.src('./js/min/*')
// 		.pipe(gulp.dest('./build/js'));
// 	// font文件
// 	gulp.src('./fonts/*')
// 		.pipe(gulp.dest('./build/font'));
// });

// 创建watch任务
gulp.task('watch', function(){
	server.listen(35729, function(err){
		if(err){
			return console.log(err);
		}
	});
	gulp.watch(srcConfig.sassAll,['concat-css'],function(e){
		console.log('File ' + e.path + ' changed');
	});

	gulp.watch(srcConfig.jsAll,['alljs'],function(e){
		console.log('File ' + e.path + ' changed');
	});

	gulp.watch(srcConfig.htmlAll,function(e){
		console.log('File ' + e.path + ' changed');
	});

	gulp.watch(srcConfig.imgAll,['replace:img'],function(e){
		console.log('File ' + e.path + ' changed');
	});
});

// 默认任务
gulp.task('default',['webserver','watch','concat-css','alljs','replace:img','openbrowser']);

// 项目完成提交任务
gulp.task('build', function(){
	gulp.run('imagemin');
	gulp.run('concat-css');
	gulp.run('minifyjs');
	gulp.run('alljs');
	gulp.run('buildfiles');
});

// 项目完成提交任务
gulp.task('build2', function(){
	gulp.run('tinypng');
	gulp.run('concat-css');
	gulp.run('minifyjs');
	gulp.run('alljs');
	gulp.run('buildfiles');
});
