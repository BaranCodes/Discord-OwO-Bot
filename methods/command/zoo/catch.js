const CommandInterface = require('../../commandinterface.js');

var animals = require('../../../../tokens/owo-animals.json');
var global = require('../../../util/global.js');
var pet = require('../battle/petutil.js');

module.exports = new CommandInterface({
	
	alias:["hunt","catch"],

	args:"",

	desc:"Hunt for some animals for your zoo!\nHigher ranks are harder to find!",

	example:[],

	related:["owo zoo","owo sell"],

	cooldown:15000,
	half:80,
	six:500,

	execute: function(p){
		var msg=p.msg,con=p.con;
		var sql = "SELECT money FROM cowoncy WHERE id = "+msg.author.id+";";
		sql += "SELECT name,nickname,lvl,xp FROM cowoncy NATURAL JOIN animal WHERE id = "+msg.author.id+" AND name = pet;";
		con.query(sql,function(err,result){
			if(err) throw err;
			if(result[0][0]==undefined||result[0][0].money<animals.rollprice){
				p.send("**🚫 | "+msg.author.username+"**, You don't have enough cowoncy!",3000);
			}else{
				var animal = randAnimal();
				var type = animal[2];
				var xp = animal[3];
				var lvlup = false;
				sql = "INSERT INTO animal (id,name,count,totalcount) VALUES ("+msg.author.id+",'"+animal[1]+"',1,1) ON DUPLICATE KEY UPDATE count = count + 1,totalcount = totalcount + 1;"+
					"UPDATE cowoncy SET money = money - 5 WHERE id = "+msg.author.id+";"+
					"INSERT INTO animal_count (id,"+type+") VALUES ("+msg.author.id+",1) ON DUPLICATE KEY UPDATE "+type+" = "+type+"+1;";
				if(result[1][0]!=undefined){
					var lvlup = pet.givexp(con,{
						id:msg.author.id,
						pet:result[1][0].name,
						lvl:result[1][0].lvl,
						xp:result[1][0].xp,
						gxp:animal[3]
					});
				}
				con.query(sql,function(err,result2){
					if(err) throw err;
					var text = "**🌱 | "+msg.author.username+"** spent **<:cowoncy:416043450337853441> 5**, and found a "+animal[0]+" "+global.unicodeAnimal(animal[1])+"!";
					if(result[1][0]){
						text += "\n**<:blank:427371936482328596> |** "+result[1][0].name+" "+((result[1][0].nickname==null)?"":"**"+result[1][0].nickname+"**")+" gained **"+animal[3]+" xp**";
						if(lvlup)
							text += " and leveled up";
						text += "!";
					}
					p.send(text);
				});
			}
		});
	}

})

/**
 * Picks a random animal from secret json file
 */
function randAnimal(){
	var rand = Math.random();
	var result = [];

	if(rand<parseFloat(animals.special[0])){
		rand = 1;
		result.push("**special**"+animals.ranks.special);
		result.push(animals.special[rand]);
		result.push("special");
		result.push(100);
	}else if(rand<parseFloat(animals.common[0])){
		rand = Math.ceil(Math.random()*(animals.common.length-1));
		result.push("**common**"+animals.ranks.common);
		result.push(animals.common[rand]);
		result.push("common");
		result.push(1);
	}else if(rand<parseFloat(animals.uncommon[0])){
		rand = Math.ceil(Math.random()*(animals.uncommon.length-1));
		result.push("**uncommon**"+animals.ranks.uncommon);
		result.push(animals.uncommon[rand]);
		result.push("uncommon");
		result.push(3);
	}else if(rand<parseFloat(animals.rare[0])){
		rand = Math.ceil(Math.random()*(animals.rare.length-1));
		result.push("**rare**"+animals.ranks.rare);
		result.push(animals.rare[rand]);
		result.push("rare");
		result.push(8);
	}else if(rand<parseFloat(animals.epic[0])){
		rand = Math.ceil(Math.random()*(animals.epic.length-1));
		result.push("**epic**"+animals.ranks.epic);
		result.push(animals.epic[rand]);
		result.push("epic");
		result.push(25);
	}else if(rand<parseFloat(animals.mythical[0])){
		rand = Math.ceil(Math.random()*(animals.mythical.length-1));
		result.push("**mythic**"+animals.ranks.mythical);
		result.push(animals.mythical[rand]);
		result.push("mythical");
		result.push(500);
	}else if(rand<parseFloat(animals.legendary[0])){
		rand = Math.ceil(Math.random()*(animals.legendary.length-1));
		result.push("**legendary**"+animals.ranks.legendary);
		result.push(animals.legendary[rand]);
		result.push("legendary");
		result.push(1500);
	}else{
		rand = Math.ceil(Math.random()*(animals.fabled.length-1));
		result.push("**fabled**"+animals.ranks.fabled);
		result.push(animals.fabled[rand]);
		result.push("fabled");
		result.push(25000);
	}
	return result;
}

//Levels a pet
function givexp(xpgain,cxp,clvl,id,animal){
	var totalxp = xpgain+cxp;

	var neededxp = maxxp(clvl);
	var lvlup = 0;
	var att = 0;
	var hp = 0;
	if(totalxp/neededxp>=1){
		lvlup = 1;
		totalxp -= neededxp;
		animal = global.validAnimal(animal);
		if(animal==undefined)
			return "";
		att = animal.attr;
		hp = animal.hpr;
	}
	
	var result = ["UPDATE animal NATURAL JOIN cowoncy SET lvl = lvl + "+lvlup+",xp = "+totalxp+",att = att + "+att+",hp = hp + "+hp+" WHERE id = "+id+" AND name = pet;",
		lvlup]

	return result;
}

//Gets xp needed for that lvl
function maxxp(lvl){
	return 25*lvl*lvl*Math.trunc((lvl+10)/10);
}
