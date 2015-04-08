var express = require('express');
var bodyParser = require('body-parser');
var pg = require("pg");

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// Refactor connection and query code
var db = require("./models");

app.get('/articles', function(req,res) {
  console.log("GET /articles");
  db.Article.findAll({include: db.Author}).then(function (articles) {
      res.render("articles/index", {articlesList: articles});
      });
});

app.get('/articles/new', function(req,res) {
  db.Author.findAll().then(function(authors){
  res.render('articles/new', {ejsAuthors: authors});
  });
});

app.post('/articles', function(req,res) {
  var article = req.body.article;
	
	db.Article.create (article)
	.then(function (newArticle) {
	 res.redirect("/articles");
  });
});

app.get('/articles/:id', function(req, res) {
  var id = req.params.id;	 
  
  db.Article.find(id)
  .then(function(foundArticle) {
  res.render("articles/article", {articleToDisplay: foundArticle});

  });
});

// Fill in these author routes!
app.get('/authors', function(req, res) {
	db.Author.findAll().then(function (authors) {
    res.render("authors/index", {ejsAuthors: authors});
    });

});

app.get('/authors/new', function(req, res) {
	res.render('authors/new');
});

app.post('/authors', function(req, res) {
	console.log(req.body);
	var author = req.body.author;
	
	db.Author.create (author)
	.then(function (dbAuthor) {
		res.redirect("/authors");
	});
});

app.get('/authors/:id', function(req, res) {
  console.log("GET /authors/:id")
  var id = req.params.id;	 
  
  db.Author.find(id)
  .then(function(author) {
  	db.Article.findAll({where: {AuthorId: id}})
  	.then(function(foundArticles){
  		console.log("These are the articles");
  		console.log(foundArticles.dataValues);
  		res.render("authors/author", {ejsAuthor: author, authorArticles: foundArticles});
	});
  });
});

app.get('/', function(req,res) {
  res.render('site/index');
});

app.get('/about', function(req,res) {
  res.render('site/about');
});

app.get('/contact', function(req,res) {
  res.render('site/contact');
});


db.sequelize.sync().then(function(){
	app.listen(3000, function() {
		var msg = "* Listening on Port 3000 *";

	// Just for fun... what's going on in this code?
	/*
	 * When the server starts listening, it displays:
	 *
	 * 	**************************
	 *	* Listening on Port 3000 *
	 *	**************************
	 *
	*/
		console.log(Array(msg.length + 1).join("*"));
		console.log(msg);
		console.log(Array(msg.length + 1).join("*"));
	});
});
