var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    bodyparser = require('body-parser'),
    app;

app =  express();
http.createServer(app).listen(3000);

var CardSchema = mongoose.Schema({
    "rank": String,
    "suit": String,
    "id": Number
});

app.use(express.urlencoded());
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

mongoose.connect('mongodb://localhost/pokerhand', function(err) {
    useMongoClient: true;
    if (err) { console.log(err) }
});

var Card = mongoose.model('Card', CardSchema);

app.post('/hands', function(req, res){
       
    var handid;
    var status = true;

    handid = generateID();

    req.body.forEach(function(c) {
        var card = new Card();
        card.rank = c.rank;
        card.suit = c.suit;
        card.id = handid;

        card.save(function(err){
            if(err !== null){
                console.log(err);
                status = false;
            } else{
                //console.log("Card Saved!");
            }
        });
    });
    if(status){
        console.log("Hand Saved Successfully");
        res.status(200).json({"id": handid });
    } else{
        res.status(500).send("Internal Error");
    }
});

app.get('/hands/:handid', function(req, res){
    var id = parseInt(req.params.handid);
    
    var handResult = {};
    var Card = mongoose.model('Card', CardSchema);

    Card.find({'id': id}, '-_id rank suit', function(err, card){
        if(err){
            console.log("ERROR: " + err);
            res.status(500).send("Internal Error");
        } else if ( card.length !== 0){
            console.log(card);
            handResult.id = id;
            handResult.cards = card;
            res.status(200).json(handResult);
        } else{
            console.log("Data Not Find!");
            res.status(404).send("Data Not Found!");
        }
    });
});

app.get('/hands/:handid/cards', function(req, res){
    var id = parseInt(req.params.handid);

    var handResult = {};
    var Card = mongoose.model('Card', CardSchema);

    Card.find({'id': id}, '-_id rank suit', function(err, card){
        if(err){
            console.log("ERROR: " + err);
            res.status(500).send("Internal Error");
        } else if ( card.length !== 0){
            console.log(card);
            res.status(200).json(card);
        } else{
            console.log("Data Not Find!");
            res.status(404).send("Data Not Found!");
        }
    });
});

app.put('/hands/:handid', function(req, res){
    var id = parseInt(req.params.handid);
    var Card = mongoose.model('Card', CardSchema);
    Card.remove({'id': id}, function(err, done){
        if(err){
            console.log(" ERROR in removing!!! " + err);
            res.status(500).send("Internall Error in PUT Operation (Phase 1)");
        } else if (done.result.n === 0){
            console.log("Hand Not Found.");
            res.status(404).send("Cannot find any hand with specified handId.");
        } else{
            console.log('Phase 1 of PUT operation did successfully.');
            req.body.forEach(function(h) {
                var card = new Card();
                card.rank = h.rank;
                card.suit = h.suit;
                card.id = id;
        
                card.save(function(err, done){
                    if(err !== null){
                        console.log(err);
                        res.status(500).send("Internall Error in PUT Operation (Phase 2)");
                    } else{
                        console.log("Data Updated Successfully");
                        
                    }
                });
            });
            res.status(204).send("Data Updated Successfully");
        }
    });
});

function generateID(){
    return Date.now();
}