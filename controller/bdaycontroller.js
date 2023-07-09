var bodyparser = require('body-parser');
var mongoose = require('mongoose');


mongoose.connect('mongodb+srv://test:test@cluster0.5gdil8c.mongodb.net/?retryWrites=true&w=majority');


var BdaySchema = mongoose.Schema({
    name: {type: String},
    birthday: {type: Date}
});



var BirthDay = mongoose.model('Birthday',BdaySchema);
var urlencodeparser = bodyparser.urlencoded({ extended: false });


module.exports = function(app){

    //add

    app.post('/add', urlencodeparser, async function(req, res){
    try{ 
     var P = req.body.name;
     var birthday = req.body.birthday;
     var Q = new Date(birthday);
     
     if(!P || isNaN(Q)) {
       res.json({error:'Name or Birthday is not valid'});
     }
      else{
 
         var existingPerson = await BirthDay.findOne({name:P});
         if(existingPerson){
          res.json({error:'Person already exists'});
         }else{
       var AddBday = new BirthDay({name:P,birthday:Q});
   
       AddBday.save();
       res.json({message:'Birthday Added'});
 
    } }}catch(err){
         res.json({ error: 'Failed to add Birthday' });
     }
     }
     );
   
 //delete
 
    app.delete('/person/delete/:name',async function(req,res){
     try{
     var P = req.params.name;
 
      let ToDelete= await BirthDay.findOneAndDelete({name: P});
         if(!ToDelete){
             res.json({error:'Person not found'});
         }
         else{
             res.json({message: 'Birthday Deleted'});
         }
 
     }
    catch(err){
     res.json({error:'Failed to deleted person'});
     }});
 
     //specific person
 
    app.get('/person/:name', async function(req, res){
     try{
       var P = req.params.name;
       var Person = await BirthDay.findOne({ name: P });
   
       if(!Person){
         res.json({error:'Person not found'});
       }
        else{
         res.json({name:Person.name,birthday:Person.birthday});
       }
     } catch(error){
       res.json({error:'Could not get Birthday'});
     }
    });
   
    //update 
 
    app.put('/person/update/:name', urlencodeparser, async function(req, res){
    try {
     var name = req.params.name;
     var newBdayStr = req.body.birthday;
     var newbirthday = new Date(newBdayStr);
 
     var updatedBday = await BirthDay.findOneAndUpdate({name:name},{birthday:newbirthday},{new:true});
     if (!updatedBday) {
       res.json({error:'Person not found'});
     }
      else{
       res.json({message:'Birthday updated'});
     }
    } catch(error){
     res.json({error:'Failed to update birthday'});
    }
    });
 
    // closest birthday
     app.get('/birthday/nearest',async function(req,res){
     try{
        
    var today = new Date();
    today.setUTCHours(0,0,0,0);
   
 
    var allbday = await BirthDay.find();
   
    
    var closestbday = null;
    var mindiff = Infinity;
 
    allbday.forEach(function(bday){
     var cbday = new Date(bday.birthday);
     cbday.setFullYear(today.getFullYear());
    
     var abdiff = Math.abs(today - cbday);

 
     if(abdiff<mindiff){
       mindiff = abdiff;
       closestbday = bday;
     }
    });
 
    if(!closestbday){
     res.json({error: 'No closest birthday found'});
    }
    else{
     res.json({name:closestbday.name,birthday:closestbday.birthday});
    }
 
    }
    catch(err){
     res.json({error: 'Could not fetch birthday'});
    }
    });
 
    };