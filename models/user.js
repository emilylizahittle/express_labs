var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

module.exports = function (sequelize, DataTypes){

  var User = sequelize.define('User', {
  
    email: {  
      type: DataTypes.STRING, 
      unique: true, 
      validate: { 
        len: [6, 30], 
      }
    },
    passwordDigest: {
      type:DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    }
  },
   
  {
    instanceMethods: { 
    // these belong to a particular user 
      checkPassword: function(password) {
        return bcrypt.compareSync(password, this.passwordDigest);
      }
    },
    classMethods: {
    // these belong on the User constructor,
    //   e.g.  db.User.encryptPassword
    
      encryptPassword: function(password) {
        var hash = bcrypt.hashSync(password, salt);
        return hash;
      },
      
      // Start here to securely create a user
      createSecure: function(email, password) { 
                        //   ^ -- attrs --^  
        if(password.length < 6) {
            throw new Error("Password should be more than six characters");
        }
          // call create on User
          User.create({
            email: email,
            passwordDigest: User.encryptPassword(password) 
                            // call encryptPassword
                            // don't want to save raw Password
          })
    
      },
      authenticate: function(email, password) {
        // find a user in the DB
        return this.find({
          where: {
            email: email
          }
        }) 
        .then(function(user){
          if (user === null){
            throw new Error("Username does not exist");
          }
          else if (user.checkPassword(password)){
            return user;
          }

        });
      }   

    } // close classMethods
  }); // close define user
  return User;
}; // close User function
