const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.MONGODB_URL);


var Schema = mongoose.Schema({
    name: {type: String},
    birthday: {type: Date}
});



var BirthDay = mongoose.model('Birthday',Schema);
var urlencodeparser = bodyparser.urlencoded({ extended:true});


module.exports = function(app){

    //add

        app.post('/add', urlencodeparser, async function(req, res){
        try{ 
        var name = req.body.name;
        var birthDate = moment.utc(req.body.birthday, 'DD-MM-YYYY', true);
        
        if(!name || !birthDate.isValid()) {
          res.setHeader('Content-Type', 'application/json');
        res.status(400).json({error:'Date or Name is invalid'});
        }
        else{
          var forExistingPerson = await BirthDay.findOne({name:name});
          if(forExistingPerson){
            res.setHeader('Content-Type', 'application/json');
            res.status(409).json({error:'Person already exists'});
          }else{
           
        var AddBday = new BirthDay({name:name,birthday:birthDate.toDate()});
    
        await  AddBday.save();
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json({message:'Birthday Added'});
    
        } }}catch(err){
          res.setHeader('Content-Type', 'application/json');
            res.status(500).json({ error:'Failed to add Birthday'});
        }
        }
        );
   
 //delete
 
    app.delete('/delete/:name',async function(req,res){
     try{
     var name = req.params.name;
 
      let ToDelete= await BirthDay.findOneAndDelete({name:name});
         if(!ToDelete){
          res.setHeader('Content-Type', 'application/json');
             res.status(404).json({error:'Person not found'});
         }
         else{
          res.setHeader('Content-Type', 'application/json');
             res.status(200).json({message:'Birthday Deleted'});
         }
 
     }
    catch(err){
      res.setHeader('Content-Type', 'application/json');
     res.status(500).json({error:'Failed to deleted person'});
     }});
 
     //specific person
 
    app.get('/:name', async function(req, res){
     try{
       var name = req.params.name;
       var person = await BirthDay.findOne({ name: name });
   
       if(!person){
        res.setHeader('Content-Type', 'application/json');
         res.status(404).json({error:'Person not found'});
       }
        else{
          res.setHeader('Content-Type', 'application/json');
         res.status(200).json(person);
       }
     } catch(err){
      res.setHeader('Content-Type', 'application/json');
       res.status(500).json({error:'Could not get Birthday'});
     }
    });
   
    //update 
 
    app.put('/update/:name', urlencodeparser, async function(req, res){
    try {
     var name = req.params.name;
     var newBirthday = moment.utc(req.body.birthday,'DD-MM-YYYY',true);

     if(!newBirthday.isValid()){
      res.setHeader('Content-Type', 'application/json');
        res.status(400).json({error:'Date format is not correct'});
     }
     else{
 
     var updatedBday = await BirthDay.findOneAndUpdate({name:name},{birthday:newBirthday.toDate()},{new:true});
     if (!updatedBday) {
      res.setHeader('Content-Type', 'application/json');
       res.status(404).json({error:'Person not found'});
     }
      else{
        res.setHeader('Content-Type', 'application/json');
       res.status(200).json({message:'Birthday updated'});
     }}
    } catch(err){
      res.setHeader('Content-Type', 'application/json');
     res.status(500).json({error:'Failed to update birthday'});
    }
    });
 
    // closest birthday
     app.get('/birthday/nearest',async function(req,res){
     try{
        
    var today = moment.utc().startOf('day');
    
    var allBirthday = await BirthDay.find();
   
    
    var closestBirthday = null;
    var minimunDifference = Infinity;
 
    allBirthday.forEach(function(bday){
     var cbday = moment(bday.birthday);
     cbday.year(today.year());

     if(cbday.isBefore(today)){
        cbday.add(1,'year');
     }

     var absoluteDifference = Math.abs(cbday.diff(today, 'days'));

 
     if(absoluteDifference<minimunDifference){
       minimunDifference = absoluteDifference;
       closestBirthday = bday;
     }
    });
 
    if(!closestBirthday){
      res.setHeader('Content-Type', 'application/json');
     res.status(404).json({error: 'No closest birthday found'});
    }
    else{
      res.setHeader('Content-Type', 'application/json');
     res.status(200).json(closestBirthday);
    }
 
    }
    catch(err){
      res.setHeader('Content-Type', 'application/json');
     res.status(500).json({error: 'Could not fetch nearest birthday'});
    }
    });
 
    };