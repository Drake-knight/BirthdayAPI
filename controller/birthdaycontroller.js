const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.MONGODB_URL);

const Schema = mongoose.Schema({
  name: {type: String},
  birthday: {type: Date}
  });

const BirthDay = mongoose.model('Birthday',Schema);
const urlencodeparser = bodyparser.urlencoded({ extended:true});


module.exports = (app) => {
//add
app.post('/add', urlencodeparser, async (req, res) => {
    try{ 
    let name = req.body.name;
    let birthDate = moment.utc(req.body.birthday, 'DD-MM-YYYY', true);

    if(!name || !birthDate.isValid()) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400).json({error:'Date or Name is invalid'});
    }
    else{
    let forExistingPerson = await BirthDay.findOne({name:name});
    if(forExistingPerson){
    res.setHeader('Content-Type', 'application/json');
    res.status(409).json({error:'Person already exists'});
    }
    else{
    let AddBday = new BirthDay({name:name,birthday:birthDate.toDate()});
    
    await AddBday.save();
    
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({message:'Birthday Added'});
    }}}
    catch(err){
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error:'Failed to add Birthday'});
    }});
   
    //delete
 
app.delete('/delete/:name',async (req,res) => {
    try{
    let name = req.params.name;
    let toDelete= await BirthDay.findOneAndDelete({name:name});

    if(!toDelete){
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({error:'Person not found'});
    }
    else{
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({message:'Birthday Deleted'});
    }}
    catch(err){
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({error:'Failed to deleted person'});
    }});
 
     //specific person
 
app.get('/:name', async (req, res) => {
    try{
    let name = req.params.name;
    let person = await BirthDay.findOne({ name: name });

    if(!person){
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({error:'Person not found'});
    }
    else{
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(person);
    }}
    catch(err){
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({error:'Could not get Birthday'});
    }});

    //update 
 
app.put('/update/:name', urlencodeparser, async (req, res) => {
    try{
    let name = req.params.name;
    let newBirthday = moment.utc(req.body.birthday,'DD-MM-YYYY',true);

    if(!newBirthday.isValid()){
    res.setHeader('Content-Type', 'application/json');
    res.status(400).json({error:'Date format is not correct'});
    }
    else{
    let updatedBday = await BirthDay.findOneAndUpdate({name:name},{birthday:newBirthday.toDate()},{new:true});
    if (!updatedBday) {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({error:'Person not found'});
    }
    else{
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({message:'Birthday updated'});
    }}} 
    catch(err){
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({error:'Failed to update birthday'});
    }});
    
    // closest birthday

app.get('/birthday/nearest',async (req,res) => {
    try{
    let today = moment.utc().startOf('day');
    let allBirthday = await BirthDay.find();
    let closestBirthday = null;
    let minimunDifference = Infinity;
    allBirthday.forEach((bday) => {
    let cbday = moment(bday.birthday);
    cbday.year(today.year());

    if(cbday.isBefore(today)){
    cbday.add(1,'year');
    }
    let absoluteDifference = Math.abs(cbday.diff(today, 'days'));
    if(absoluteDifference<minimunDifference){
    minimunDifference = absoluteDifference;
    closestBirthday = bday;
    }});
    if(!closestBirthday){
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({error: 'No closest birthday found'});
    }
    else{
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(closestBirthday);
    }}
    catch(err){
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({error: 'Could not fetch nearest birthday'});
    }});
    };