var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var moment = require('moment');

mongoose.connect('mongodb+srv://test:test@cluster0.5gdil8c.mongodb.net/?retryWrites=true&w=majority');


var BdaySchema = mongoose.Schema({
    name: {type: String},
    birthday: {type: Date}
});



var BirthDay = mongoose.model('Birthday',BdaySchema);
var urlencodeparser = bodyparser.urlencoded({ extended:true});


module.exports = function(app){

    //add

        app.post('/add', urlencodeparser, async function(req, res){
        try{ 
        var P = req.body.name;
        var Q = moment.utc(req.body.birthday, 'DD-MM-YYYY', true);
        
        if(!P) {
          res.set('Content-Type', 'application/json');
        res.status(400).json({error:'No name entered'});
        }
        else{
            var existingPerson = await BirthDay.findOne({name:P});
            if(existingPerson){
              res.set('Content-Type', 'application/json');
            res.status(409).json({error:'Person already exists'});
            }else{
           
          var AddBday = new BirthDay({name:P,birthday:Q.toDate()});
    
        AddBday.save();
        res.set('Content-Type', 'application/json');
        res.status(201).json({message:'Birthday Added'});
    
        } }}catch(err){
          res.set('Content-Type', 'application/json');
            res.status(500).json({ error:'Failed to add Birthday'});
        }
        }
        );
   
 //delete
 
    app.delete('/person/delete/:name',async function(req,res){
     try{
     var P = req.params.name;
 
      let ToDelete= await BirthDay.findOneAndDelete({name: P});
         if(!ToDelete){
          res.set('Content-Type', 'application/json');
             res.status(404).json({error:'Person not found'});
         }
         else{
          res.set('Content-Type', 'application/json');
             res.status(200).json({message: 'Birthday Deleted'});
         }
 
     }
    catch(err){
      res.set('Content-Type', 'application/json');
     res.status(500).json({error:'Failed to deleted person'});
     }});
 
     //specific person
 
    app.get('/person/:name', async function(req, res){
     try{
       var P = req.params.name;
       var Person = await BirthDay.findOne({ name: P });
   
       if(!Person){
        res.set('Content-Type', 'application/json');
         res.status(404).json({error:'Person not found'});
       }
        else{
          res.set('Content-Type', 'application/json');
         res.status(200).json({name:Person.name,birthday:Person.birthday});
       }
     } catch(err){
      res.set('Content-Type', 'application/json');
       res.status(500).json({error:'Could not get Birthday'});
     }
    });
   
    //update 
 
    app.put('/person/update/:name', urlencodeparser, async function(req, res){
    try {
     var name = req.params.name;
     var newbirthday = moment.utc(req.body.birthday,'DD-MM-YYYY',true);

     if(!newbirthday.isValid()){
      res.set('Content-Type', 'application/json');
        res.status(400).json({error:'Date format is not correct'});
     }
     else{
 
     var updatedBday = await BirthDay.findOneAndUpdate({name:name},{birthday:newbirthday.toDate()},{new:true});
     if (!updatedBday) {
      res.set('Content-Type', 'application/json');
       res.status(404).json({error:'Person not found'});
     }
      else{
        res.set('Content-Type', 'application/json');
       res.status(200).json({message:'Birthday updated'});
     }}
    } catch(err){
      res.set('Content-Type', 'application/json');
     res.status(500).json({error:'Failed to update birthday'});
    }
    });
 
    // closest birthday
     app.get('/birthday/nearest',async function(req,res){
     try{
        
    var today = moment.utc().startOf('day');
    
    var allbday = await BirthDay.find();
   
    
    var closestbday = null;
    var mindiff = Infinity;
 
    allbday.forEach(function(bday){
     var cbday = moment(bday.birthday);
     cbday.year(today.year());

     if(cbday.isBefore(today)){
        cbday.add(1,'year');
     }

     var abdiff = Math.abs(cbday.diff(today, 'days'));

 
     if(abdiff<mindiff){
       mindiff = abdiff;
       closestbday = bday;
     }
    });
 
    if(!closestbday){
      res.set('Content-Type', 'application/json');
     res.status(404).json({error: 'No closest birthday found'});
    }
    else{
      res.set('Content-Type', 'application/json');
     res.status(200).json({name:closestbday.name,birthday:closestbday.birthday});
    }
 
    }
    catch(err){
      res.set('Content-Type', 'application/json');
     res.status(500).json({error: 'Could not fetch birthday'});
    }
    });
 
    };