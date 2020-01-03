var express = require('express');
const session = require('express-session');
var bodyParser = require('body-parser');


// UNCOMMENT THE DATABASE YOU'D LIKE TO USE
// var items = require('../database-mysql');
// var items = require('../database-mongo');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/login')
  }
  else {
    next()
  }
}

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/home')
  }
  else {
    next()
  }
}


const TWO_HOURS = 1000 * 60 * 60 * 2

const {
  PORT = 3000,
  NODE_ENV = 'development',

  SESS_NAME = 'sid',
  SESS_SECRET = 'ssh!quietmit\'asecret!',
  SESS_LIFETIME = TWO_HOURS
} = process.env

const IN_PROD = NODE_ENV === 'production'

//TODO : db

var data = data || [];
function save(email, password) {
  data.push(email, password);
  console.log(data)
}

app.use(session({
  name: SESS_NAME,
  resave: false,
  saveUninitialized: false,
  secret: SESS_SECRET,
  cookie: {
    maxAge: SESS_LIFETIME,
    sameSite: true,
    secure: IN_PROD
  }
}))

const users = [
  { id: 1, name: 'Alex', email: 'alex@gmail.com', password: 'secret' },
  { id: 2, name: 'Max', email: 'max@gmail.com', password: 'secret' },
  { id: 3, name: 'Ali', email: 'ali@gmail.com', password: 'secret' }
]

app.use((req, res, next) => {
  const { userId } = req.session
  if (userId) {
    res.locals.user = users.find(
      user => user.id === userId
    )
  }
  next();
})

app.get('/', (req, res) => {
  const { userId } = req.session
  res.send(`
  <h1>Welocome</h1>
  ${userId ? `
  <a href="/home">Home</a>
  <form method="post" action="/logout">
  <button>Logout</button>
  </form>
  ` : `
  <a href="/login">Login</a>
  <a href="/signup">Signup</a>

  `}


  `)
})

app.get('/login', redirectHome, (req, res) => {
  res.send(`
  <h1>Login</h1>
  <form method="post" action="/login">
  <input type='email' name="email" placeholder='Email' required />
  <input type='password' name="password" placeholder='Password' required />
  <input type='submit' />
  </form>
  <a href="/signup">Signup</a>
  `)
})



app.get('/home', redirectLogin, (req, res) => {
  const { user } = res.locals
  res.send(`
  <h1>Home</h1>
  <a href='/'>Main</a>
  <ul>
  <li>Name: ${user.name}</li>
  <li>Email: ${user.email}</li>
  <h1>${user.name}'s Information</h1>
  <input type='email' name="email" placeholder='Email' required />
  <input type='password' name="password" placeholder='Password' required />
  <button onClick="${save(req.email, req.body.password)}" type='submit'>Enter</button>
  </ul >
    `)
})


app.get('/profile', redirectLogin, (req, res) => {
  const { user } = res.locals
})

app.get('/signup', redirectHome, (req, res) => {
  res.send(`
    < h1 > Signup</h1 >
  <form method="post" action="/signup">
    <input name="name" placeholder='Name' required />
    <input type='email' name="email" placeholder='Email' required />
    <input type='password' name="password" placeholder='Password' required />
    <input type='submit' />
  </form>
  <a href="/login">Login</a>
  `)
})

app.post('/login', redirectHome, (req, res) => {
  const { email, password } = req.body;

  if (email && password) {//TODO VALDITION
    const user = users.find(
      user => user.email === email && user.password === password // TODO hash
    )

    if (user) {
      req.session.userId = user.id
      return res.redirect('/home')
    }
  }
  res.redirect('/login')
})

app.post('/signup', redirectHome, (req, res) => {
  const { name, email, password } = req.body;
  if (name && email && password) { //TODO VALDITION
    const exists = users.some(
      user => user.email === email
    )

    if (!exists) {
      const user = {
        id: users.length + 1,
        name,
        email,
        password //TODO hash
      }
      users.push(user)

      req.session.userId = user.id

      return res.redirect("/home")
    }
  }
  res.redirect("/signup")
})

app.post('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/home');
    }

    res.clearCookie(SESS_NAME)
    res.redirect('/login')
  })
})

// UNCOMMENT FOR REACT
// app.use(express.static(__dirname + '/../react-client/dist'));

// UNCOMMENT FOR ANGULAR
// app.use(express.static(__dirname + '/../angular-client'));
// app.use(express.static(__dirname + '/../node_modules'));

// app.get('/items', function (req, res) {
//   items.selectAll(function (err, data) {
//     if (err) {
//       res.sendStatus(500);
//     } else {
//       res.json(data);
//     }
//   });
// });

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));

