const express = require('express');
const controller = require('./controller/bdaycontroller');
const PORT = 3000;

var app = express();

controller(app);

app.listen(PORT , () =>{
    console.log(`Listening to port ${PORT}`);
});

