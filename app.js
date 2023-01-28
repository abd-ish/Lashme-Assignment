const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.set("strictQuery", false);
// mongoose.connect("mongodb://localhost:27017/Assignment", {           TO CONNECT TO LOCAL HOST
//   useNewUrlParser: true,
// });

mongoose.connect(
  "mongodb+srv://abd-ish:Abhinav123@cluster0.qrjbw6w.mongodb.net/assignment?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
  }
);

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  followers: [String],
  following: [String],
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Create a new user account
app.post("/users", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.send("The account has been created successfully & is logged in!");
        });
      }
    }
  );
});

// Retrieve a specific user by username
app.get("/users/:username", function (req, res) {
  const username = req.params.username;
  //   if (req.isAuthenticated()) {
  User.findOne({ username: username }, function (err, foundUser) {
    if (err) console.log(err);
    else {
      if (!foundUser) res.send("The username do not exist!");
      else res.send("Successfully fetched the user.");
    }
  });
  //   } else {
  //     res.send("Access denied as the user is not logged in!");
  //   }
});

// Retrieve a list of followers for a specific user
app.get("/users/:username/followers", function (req, res) {
  const username = req.params.username;
  //   if (req.isAuthenticated()) {                     // Can be used for authentication & authorization
  User.findOne({ username: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        var arr = foundUser.followers;
        res.send(arr);
      } else res.send("The given username does not exist!");
    }
  });
  //   } else {
  //     res.send("Access denied as the user is not logged in!");
  //   }
});

// Retrieve a list of users a specific user is following
app.get("/users/:username/following", function (req, res) {
  const username = req.params.username;
  //   if (req.isAuthenticated()) {                   // Can be used for authentication & authorization
  User.findOne({ username: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        var arr = foundUser.following;
        res.send(arr);
      } else res.send("The given username does not exist!");
    }
  });
  //   } else {
  //     res.send("Access denied as the user is not logged in!");
  //   }
});

//  Follow a specific user
app.post("/users/:username/follow", function (req, res) {
  const username = req.params.username;
  const toFollow = req.body.username;
  //   if (req.isAuthenticated()) {                  // Can be used for authentication & authorization
  User.findOne({ username: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        User.findOne({ username: toFollow }, function (err, foundFollower) {
          if (err) console.log(err);
          else {
            if (foundFollower) {
              if (!foundUser.following.includes(toFollow)) {
                foundUser.following.push(req.body.username);
                foundUser.save(function (err) {});
                foundFollower.followers.push(username);
                foundFollower.save();
                res.send("Successfully followed!");
              } else res.send("You are already following this user!");
            } else
              res.send("The follower you are trying to follow does not exist!");
          }
        });
      } else res.send("The given username does not exist!");
    }
  });
  //   }
  //   else {
  //     res.send("Access denied as the user is not logged in!");
  //   }
});

app.delete("/users/:username/follow", function (req, res) {
  const username = req.params.username;
  const toDeleteFollowing = req.body.username;
  User.findOne({ username: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        var arr = foundUser.following;
        if (arr.includes(toDeleteFollowing)) {
          foundUser.following.pull(toDeleteFollowing);
          foundUser.save();
          User.findOne({ username: toDeleteFollowing }, function (err, found) {
            if (err) console.log(err);
            else {
              found.followers.pull(username);
              found.save();
              res.send("Successfully unfollowed!");
            }
          });
        } else res.send("You are not following this user!");
      } else res.send("The given username does not exist!");
    }
  });
});

//listen at port 3000
app.listen(3000, function (req, res) {
  console.log("Server started at port 3000");
});
