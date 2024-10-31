const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const JWTSecret = "90fwe09fasd09fi0asd9f0i-3213215351tdfsvloasjdoiasjdoiasjasoidjsapadsofjdsap"

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function auth(req, res, next){
  const authToken = req.headers['authorization'];
  console.log(authToken);

  if(authToken != undefined){

    const bearer = authToken.split(' ');
    const token = bearer[1];

    jwt.verify(token,JWTSecret, (err, data)=> {
      if(err){
        res.status(401);
        res.json({err: "Token inválido!"});

      }else{
        req.token = token;
        req.loggedUser = {id: data.id, email: data.email};
        next();
      }
    })

  }else{
    res.status(401);
    res.json({err: "Token inválido!"});
  }

  
}

var DB = {
  games: [
    {
      id: 23,
      title: "Call of Duty",
      year: 2019,
      price: 60,
    },
    {
      id: 65,
      title: "Sea of thieves",
      year: 2018,
      price: 40,
    },
    {
      id: 2,
      title: "Minecraft",
      year: 2012,
      price: 20,
    },
  ],
  users: [
    {
      id: 1, 
      name: "Diego Diniz",
      email: "diego@email.com",
      password: "nodejs<3"
    },
    {
      id: 20, 
      name: "Jose da Silva",
      email: "jose@email.com",
      password: "nodejsjs"
    }
  ]
};

app.get("/games",auth, (req, res) => {

  var HATEOAS = [
    {
      href: "https://localhost:45678/game/:id",
      method:"DELETE",
      rel: "delete_game"

    },
    {
      href: "https://localhost:45678/game/:id",
      method:"GET",
      rel: "get_game"
    },
    {
      href: "https://localhost:45678/auth",
      method:"POST",
      rel: "login"
    }
  ]
  
  res.statusCode = 200;
  res.json({games: DB.games, _links: HATEOAS});

});

app.get("/game/:id",auth, (req, res) => {
  
  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    var id = parseInt(req.params.id);

    var HATEOAS = [
      {
        href: "https://localhost:45678/game/"+id,
        method:"DELETE",
        rel: "delete_game"
  
      },
      {
        href: "https://localhost:45678/game/"+id,
        method:"PUT",
        rel: "edit_game"
  
      },
      {
        href: "https://localhost:45678/game/"+id,
        method:"GET",
        rel: "get_game"
      },
      {
        href: "https://localhost:45678/games",
        method:"GET",
        rel: "get_all_games"
      }
    ]

    var game = DB.games.find((g) => g.id == id);
    if (game != undefined) {
      res.json({game, _links: HATEOAS});
      res.statusCode = 200;
    } else {
      res.sendStatus(404);
    }
  }
});

app.post("/game",auth, (req, res) => {
  var { title, price, year } = req.body;
  DB.games.push({
    id: 2323,
    title,
    price,
    year
  });

  res.sendStatus(200)
});

app.delete("/game/:id",auth, (req,res) => {
    if (isNaN(req.params.id)) {
        res.sendStatus(400);
      } else {
        var id = parseInt(req.params.id);
        var index = DB.games.findIndex(g => g.id == id);

        if(index == -1){
            res.sendStatus(404);
        }else{
            DB.games.splice(index,1);
            res.sendStatus(200);
        }
      }
});

app.put("/game/:id",auth, (req, res) => {
    if (isNaN(req.params.id)) {
        res.sendStatus(400);
      } else {
        var id = parseInt(req.params.id);
        var game = DB.games.find((g) => g.id == id);
        if (game != undefined) {
            var { title, price, year } = req.body;

            if(title != undefined){
                game.title = title;
            }
            if(price != undefined){
                game.price = price;
            }
            if(year != undefined){
                game.year = year;
            }

            res.sendStatus(200);
            


        } else {
          res.sendStatus(404);
        }
      }
});

app.post("/auth", (req, res) => {
  var {email, password} = req.body;

  if(email != undefined){
    var user = DB.users.find(u => u.email = email);
    if(user != undefined){

      if(user.password === password){

        jwt.sign({id: user.id, email: user.email},JWTSecret,{expiresIn:'1h'}, (err, token) => {
          if(err){
            res.status(400);
            res.json({err:"Falha interna"});
          }else{
            res.status(200);
        res.json({token: token});
          }
        })
        
      }else{
        res.status(401);
        res.json({err: "Credenciais inválidas!"})
      }

    }else{
      res.status(404);
      res.json({err: "O email enviado não existe na base de dados!"})
    }

  }else{
    res.status(400);
    res.json({err: "O e-mail enviado é invalido"})
  }
});

app.listen(45678, () => {
  console.log("API RODANDO BELEZINHA!");
});
