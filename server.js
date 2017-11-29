/**
* Module dependencies.
*/

var express = require('express')
  , http = require('http')
  , path = require('path');
//var methodOverride = require('method-override');
var session = require('express-session');
var app = express();
// var bcrypt = require('bcrypt');
// var salt = bcrypt.genSaltSync(10);
var mysql = require('mysql');
var fs = require("fs");
var request = require('request');
var bodyParser=require("body-parser");
var Congress = require( 'propublica-congress-node' );
var client = new Congress( 'RmrxLK9M6LrHgHTjMbuoIy1sEg5nPhMMx52J4HAe' );
var cors = require('cors')
var con = mysql.createConnection({
              host     : 'localhost',
              user     : 'root',
              password : '',
              database : 'rippleDB',
              charset : 'utf8mb4',
              multipleStatements: true
              // host     : 'us-cdbr-iron-east-05.cleardb.net',
              // user     : 'be9dbda2b18efa',
              // password : 'f5254516',
              // database : 'heroku_44af54f55baae38',
              // multipleStatements: true
            });


global.db = con;

// all environments
app.use(cors());
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
              secret: 'keyboard cat',
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 60000 }
            }))
var state_abbrev = {
        "AL":"Alabama",   "AK":"Alaska",   "AZ":"Arizona",   "AR":"Arkansas",   "CA":"California",   "CO":"Colorado",
        "CT":"Connecticut",   "DE":"Delaware",   "FL":"Florida",   "GA":"Georgia",   "HI":"Hawaii",   "ID":"Idaho",   "IL":"Illinois",
        "IN":"Indiana",   "IA":"Iowa",   "KS":"Kansas",   "KY":"Kentucky",   "LA":"Louisiana",   "ME":"Maine",   "MD":"Maryland",
        "MA":"Massachusetts",   "MI":"Michigan",   "MN":"Minnesota",   "MS":"Mississippi",   "MO":"Missouri",   "MT":"Montana",
        "NE":"Nebraska",   "NV":"Nevada",   "NH":"New Hampshire",   "NJ":"New Jersey",   "NM":"New Mexico",   "NY":"New York",
        "NC":"North Carolina",   "ND":"North Dakota",   "OH":"Ohio",   "OK":"Oklahoma", "OR":"Oregon",   "PA":"Pennsylvania",
        "RI":"Rhode Island",   "SC":"South Carolina",   "SD":"South Dakota",   "TN":"Tennessee",   "TX":"Texas",   "UT":"Utah",
        "VT":"Vermont",   "VA":"Virginia",   "WA":"Washington",   "WV":"West Virginia",   "WI":"Wisconsin",   "WY":"Wyoming"};

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

  con.query("DROP TABLE IF EXISTS members; \ CREATE TABLE members ( \
            id int NOT NULL AUTO_INCREMENT, \ photo varchar(255) NOT NULL default '', \
            firstName varchar(255) NOT NULL default '', \ lastName varchar(255) NOT NULL default '', \
            party varchar(255) NOT NULL default '', \ homeState varchar(255) NOT NULL default '', \
            DoB varchar(255) NOT NULL default '', \ office varchar(255) NOT NULL default '', \
            missedVotes int NOT NULL, \ totalVotes int NOT NULL, \
            siteURL varchar(255) NOT NULL default '', \
            phoneNum varchar(255) NOT NULL default '', \ position varchar(255) NOT NULL default '', \
            PRIMARY KEY (id))ENGINE=INNODB;",
  function (err, result) {
    if (err) throw err;
    console.log("Members table created");
  });

  client.memberLists({
    congressNumber: '115',
    chamber: 'house',
    responseFormat: '.json'
  }).then(function(res) {
    num_members = res.results[0].num_results;
    for(var n = 0; n < num_members; n++)
    {
      var member=res.results[0].members[n];
      firstName= (member.first_name).replace("'", "''");
      lastName= (member.last_name).replace("'", "''");
      partyAffil= (member.party=="D") ? "Democrat" : "Republican";
      state= state_abbrev[member.state];
      phone= (member.phone);
      DoB= (member.date_of_birth);
      office= (member.office);
      siteURL= (member.url);
      missedVotes= (member.missed_votes);
      totalVotes= (member.total_votes);
      bioguide= (member.id);
      var sql = "INSERT INTO members (photo,firstName,lastName,party,homeState,DoB,office,missedVotes,totalVotes,siteURL,phoneNum,position) "
                +"VALUES ('"+bioguide+"', '"+firstName+"', '"+lastName+"', '"+partyAffil+"', '"+state+"', '"+DoB+"', '"
				+office+"', '"+siteURL+"', '"+missedVotes+"', '"+totalVotes+"', '"+phone+"', 'House of Rep.')";
      con.query(sql, function (err, result) {
        if (err) console.log(err);
      });
    }
    console.log("House portion of table filled");
  });

  client.memberLists({
    congressNumber: '115',
    chamber: 'senate',
    responseFormat: '.json'
  }).then(function(res) {
    num_members = res.results[0].num_results;
    for(var n = 0; n < num_members; n++)
    {
      var member=res.results[0].members[n];
      firstName= (member.first_name).replace(/'/g,"''");
      lastName= (member.last_name).replace(/'/g,"''");
      partyAffil= (member.party=="D") ? "Democrat" : "Republican";
      state= state_abbrev[member.state];
      phone= (member.phone);
      DoB= (member.date_of_birth);
      office= (member.office);
      siteURL= (member.url);
      missedVotes= (member.missed_votes);
      totalVotes= (member.total_votes);
      bioguide= (member.id);
      var sql = "INSERT INTO members (photo,firstName,lastName,party,homeState,DoB,office,missedVotes,totalVotes,siteURL,phoneNum,position) "
                +"VALUES ('"+bioguide+"', '"+firstName+"', '"+lastName+"', '"+partyAffil+"', '"+state+"', '"+DoB+"', '"
				+office+"', '"+siteURL+"', '"+missedVotes+"', '"+totalVotes+"', '"+phone+"', 'Senator')";
      con.query(sql, function (err, result) {
        if (err) console.log(err);
      });
    }
    console.log("Senate portion of table filled");
  });

  con.query("CREATE TABLE IF NOT EXISTS users ( \
            id int NOT NULL AUTO_INCREMENT, \ first_name text NOT NULL,\
            last_name text NOT NULL, \ email text NOT NULL,\
            user_name varchar(20) NOT NULL, \ password varchar(255) NOT NULL,\
            PRIMARY KEY (id)) ENGINE=INNODB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;",
  function (err, result) {
    if (err) throw err;
    console.log("User table created");
  });

  con.query("CREATE TABLE IF NOT EXISTS reviews ( \
            id int NOT NULL AUTO_INCREMENT, \ bioguide varchar(255), \ stars int NOT NULL,\
            voteStatus int NOT NULL, \ stance int NOT NULL,\
            PRIMARY KEY (id)) ENGINE=INNODB  DEFAULT CHARSET=latin1 ;",
  function (err, result) {
    if (err) throw err;
    console.log("Reviews table created");
  });

  con.query("DROP TABLE IF EXISTS bills; \ CREATE TABLE bills ( \
            id int NOT NULL AUTO_INCREMENT, \ billID varchar(255) NOT NULL default '', \ type varchar(255) NOT NULL default '', \
            Bnumber varchar(255) NOT NULL default '', \ title text NOT NULL, \
            sponsorTitle varchar(255) NOT NULL default '', \ sponsor varchar(255) NOT NULL default '', \
            sponsorId varchar(255) NOT NULL default '', \ sponsorState varchar(255) NOT NULL default '', \
            partyAffil varchar(255) NOT NULL default '', \ sponsorUri varchar(255) NOT NULL default '', \
            gpoPdf varchar(255) NOT NULL default '', \ congressUrl varchar(255) NOT NULL default '', \
            govtrackUrl varchar(255) NOT NULL default '', \ isActive varchar(255) NOT NULL default '', \
            lastDate varchar(255) NOT NULL default '', \ housePassage varchar(255) NOT NULL default '', \
            senatePassage varchar(255) NOT NULL default '', \ isEnacted varchar(255) NOT NULL default '', \
            isVetoed varchar(255) NOT NULL default '', \ coSponsors varchar(255) NOT NULL default '', \
            committees varchar(255) NOT NULL default '', \ committeeCodes varchar(255) NOT NULL default '', \
            subCommitteeCodes varchar(255) NOT NULL default '', \ primarySubject varchar(255) NOT NULL default '', \
            description text NOT NULL, \ shortDescription text NOT NULL, \
            latestMajorAction text NOT NULL, \ introducedDate varchar(255) NOT NULL default'',\
            latestMajorActionDate varchar(255) NOT NULL default'',\ PRIMARY KEY (id))ENGINE=INNODB;",
  function (err, result) {
    if (err) throw err;
    console.log("Bill table created");
  });

  client.billsRecent({
      congressNumber: '115',
      chamber: 'house',
      bill_type:'updated'
  }).then(function(res) {
      num_bills = res.results[0].num_results;
      for(var n = 0; n < num_bills; n++)
      {
        var bill = res.results[0].bills[n];
        billID= (bill.bill_id);
        type= (bill.bill_type);
        Bnumber= (bill.number);

        title= (bill.title).replace(/'/g,"''");
        //   BillSponsorTitle= (bill.sponsor_title);
        sponsor= (bill.sponsor_name).replace(/'/g,"''");
        sponsorId= (bill.sponsor_id);
        sponsorState= (bill.sponsor_state);
        partyAffil= (bill.sponsor_party=="D") ? "Democrat" : "Republican";
        sponsorUri= (bill.sponsor_uri);
        gpoPdf= (bill.bill_gpo_pdf_uri);
        congressUrl= (bill.sponsor_id);
        govtrackUrl= (bill.govtrack_url);
        isActive= (bill.active);
        housePassage= (bill.house_passage);
        senatePassage= (bill.senate_passage);
        isEnacted= (bill.enacted);
        isVetoed= (bill.vetoed);
        coSponsors= (bill.cosponsors);
        committees= (bill.committees);
        committeeCodes= (bill.committee_codes);
        subCommitteeCodes= (bill.subcommittee_codes);
        primarySubject= (bill.primary_subject);
        //description= (bill.summary).replace("'", "''");
        //shortDescription= (bill.summary_short).replace("'", "''");
        latestMajorAction= (bill.latest_major_action).replace(/'/g,"''");
        introducedDate= (bill.introduced_date);
        latestMajorActionDate= (bill.latest_major_action_date);


        var sql = "INSERT INTO bills (billID,type,Bnumber,title,sponsor,sponsorId,sponsorState,"+
                    "partyAffil,sponsorUri,gpoPdf,congressUrl,govtrackUrl,isActive,"+
                    "housePassage,senatePassage,isEnacted,isVetoed,coSponsors,committees,committeeCodes,"+
                    "subCommitteeCodes,primarySubject,latestMajorAction,introducedDate,latestMajorActionDate) "+
                    "VALUES ('"+billID+"', '"+type+"', '"+Bnumber+"', '"+title+"', '"+sponsor+"', '"+sponsorId+"', '"
                    +sponsorState+"', '"+partyAffil+"','"+sponsorUri+"', '"+gpoPdf+"', '"+congressUrl+"', '"
                    +govtrackUrl+"', '"+isActive+"', '"+housePassage+"', '"+senatePassage+"', '"
                    +isEnacted+"', '"+isVetoed+"', '"+coSponsors+"', '"+committees+"','"+committeeCodes+"','"
                    +subCommitteeCodes+"', '"+primarySubject+"', '"+latestMajorAction+"', '"+introducedDate+"', '"+latestMajorActionDate+"')";
        con.query(sql, function (err, result) {
        if (err) console.log(err);

      });
    }
    console.log("Bills table filled");
  });

// development only

app.get('/feed',(req,res) => {
  var sql="SELECT * FROM bills";
  var query=db.query(sql,function(err,result) {
    if(err){
      console.log(err);
    }
    var feedResult = [result.length];
    var i = 0;
    result.forEach((bill) => {
      var bill = {
        id: bill.billID,
        title: bill.title,
        active: bill.isActive,
        lastActionDate: bill.latestMajorActionDate,
        introducedDate: bill.introducedDate
      }
      feedResult[i] = bill;
      i++;
    });
    res.send({feedResult})
  });
});

/*app.get('/bill/:id',(req,res) => {
  var id=req.params.id;
  var sql="SELECT * FROM bills WHERE billID= '"+id+"'";
  var query=db.query(sql,function(err,result) {
    if(err){
      console.log(err);
    }
    var billResult = {
      photo:
    }
    res.send({billResult});

  });
});*/

app.get('/members/:state',(req, res) => {
  // Get state name from url
  var state = req.params.state;

  // QUERY DATABASE based on URL
  var sql = "SELECT * FROM members WHERE homeState= '"+state+"'";
  var query = db.query(sql, function(err, result) {
    if(err) {
      console.log(err);
    }
	console.log(result);
    // Send back an array of objects
    var membersResult = [result.length];
    var i = 0;
    result.forEach((member) => {
      var member = {
        photo: member.photo,
        name: member.firstName+" "+member.lastName,
        id: member.id,
        party: member.party,
        homeState: member.homeState,
        phone: member.phoneNum,
        position: member.position
      }
      membersResult[i] = member;
      i++;
    });
    res.send({membersResult})
  });
});

/*app.get('/members/:id',(req, res) => {
  // Get state name from url
  var id = req.params.id;

  // QUERY DATABASE based on URL
  var sql = "SELECT * FROM members WHERE id= '"+id+"'";
  var query = db.query(sql, function(err, result) {
    if(err) {
      console.log(err);
    }
    // Send back an object
    var member = {
        photo: member.photo,
        name: member.firstName+" "+member.lastName,
        id: member.id,
        party: member.party,
        homeState: member.homeState,
        phone: member.phoneNum,
        position: member.position
      }
    });
    res.send(member)
  });
});*/
//Middleware

var port = process.env.PORT || 3001;
app.listen(port);
