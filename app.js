var express = require('express');
var bodyParser = require('body-parser');
var pg = require("pg");
db = require("./models"),
session = require("express-session"),
app = express();

var app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

var db = require("./models");

app.use(session({
  secret: 'super secret',
  resave: false,
  saveUninitialized: true
}));

app.use("/", function (req,res, next) {
	
	req.login = function (user) {
    req.session.userId = user.id;
  };

  req.currentUser = function () {
    return db.User.
      find({
        where: {
          id: req.session.userId
       }
      }).
      then(function (user) {
        req.user = user;
        return user;
      })
  };

  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  }

  next(); 
});

//our first route
app.get("/users/signup", function (req, res) {
  res.render("users/signup");
});


// where the user submits the sign-up form
app.post("/users/signup", function (req, res) {

  // grab the user from the params
  var user = req.body.user;

  // create the new user
  db.User.createSecure(user.email, user.password);
  // redirect to login
  res.redirect("/users/login");
});

app.get("/users/login", function (req, res) {
  res.render("users/login");
});

//login will authenticate a User
app.post("/login", function (req, res) {
  var user = req.body.user;

  db.User
  .authenticate(user.email, user.password).
   then(function (user) {
          req.login(user);
          res.redirect("/users/profile");
  });
});

app.get("/users/profile", function (req, res) {
	req.currentUser()
	.then(function (user) {
		res.render("users/profile", {user: user});
	})
});

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
