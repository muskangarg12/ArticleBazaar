const mongo = require('mongodb').MongoClient;
var express = require('express');
const bodyParser= require('body-parser');
var app = express();

var port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

app.use(express.static('./public'));
var password = process.env.PASSWORD ; // make your own password

//connect to mongo
mongo.connect('mongodb://admin:admin12@ds129811.mlab.com:29811/mydb', function(err, client){
	if(err){ 
		throw err;
	}
	console.log('MongoDB connected...');

	var articles = client.db('mydb').collection('articles');
	var comments = client.db('mydb').collection('comments');
	var news = client.db('mydb').collection('news');

	app.get('/', function(req, res){

		comments.find().toArray(function(err, comment){
			articles.find().toArray(function(err, article){
				news.find().toArray(function(err, news){
					if (err)
						throw err;

					res.render('index.ejs', {comments : comment, articles: article, news: news});
				});
			});
		});

	});

	app.get('/admin', function(req, res){

		res.render('password.ejs');

	});

	app.get('/all-articles', function(req, res){

		articles.find().toArray(function(err, result){
			if (err)
				throw err;

			res.render('allarticles.ejs', {articles: result});
		});

	});

	app.get('/comments', function(req, res){

		comments.find().toArray(function(err, result){
			if (err)
				throw err;
			res.render('comment.ejs', {comments: result});
		});

	});

	app.get("/articles/:title", function(req, res){

		articles.find().toArray(function(err, result){
			if (err)
				throw err;

			var title = req.params.title.split("-").join(" ");
			var data = result.find( article => article.title === title );
			res.render('article.ejs', {articles: data});

		});

	});

	app.get("/category/:data", function(req, res){

		articles.find().toArray(function(err, result){
			if(err)
				throw err;
			
			var x = req.params.data.charAt(0).toUpperCase() + req.params.data.slice(1);
			res.render('category.ejs', {articles: result, category: x});
		});

	});

	app.get('/about', function(req, res){
		res.render('about.ejs');
	});

	app.get('/contact', function(req, res){
		res.render('contact.ejs');
	});

	app.post('/delete-news', function(req, res){

		news.drop();
		res.redirect('/');

	});

	app.post('/password', function(req, res){

		if( req.body.password === password ){
			res.render('admin.ejs');
		}
		else{
			res.render('password.ejs');
		}
	});

	app.post('/article', function(req, res){
			
		var data = req.body;
		articles.insert({category: data.category , title: data.title , content: data.content});
		res.render('admin.ejs');

	})

	app.post('/news', function(req, res){

		var data = req.body;
		news.insert({headline: data.headline});
		res.render('admin.ejs');

	});

	app.post('/comment', function(req, res){

		var data = req.body;
		
		comments.insert({username: data.username , comment: data.comment });

		res.redirect("/");

	});

	app.listen(port);
	//console.log('You are listening to port 3000');

});

