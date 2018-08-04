function onOpen() {
  
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Retrieve Roster Data', functionName: 'getRosterData_'},
    {name: 'Retrieve League Data', functionName: 'getLeagueData_'},
    {name: 'Retrieve Free Agent Data', functionName: 'getFreeAgentData_'},
    {name: 'Retrieve All Player Data', functionName: 'getAllPlayerData_'},
    {name: 'Retrieve Salary Adjustment Data', functionName: 'getSalaryAdjustmentData_'},
    
  ];
  spreadsheet.addMenu('MFL', menuItems);
}

function getRosterData_(){

  getRosterData("http://www76.myfantasyleague.com/2018/export?TYPE=rosters&L=42427&APIKEY=&FRANCHISE=&JSON=1");
  
}


/**
* Imports roster data from MFL to your spreadsheet Ex: getdata("http://www76.myfantasyleague.com/2018/export?TYPE=rosters&L=42427&APIKEY=&FRANCHISE=&JSON=1")
* @param url of your JSON data as string
*/
function getRosterData(url){
  
  Logger.log("funcBegin");
  var res = UrlFetchApp.fetch(url);
  var content = res.getContentText();
  var json = JSON.parse(content);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Franchise ID", "Player ID", "Salary", "Contract Year", "Contract Status", "Contract Info", "Status"]);
  
  for(var i=0; i<json.rosters.franchise.length; i++){
    
    var players = json.rosters.franchise[i].player;
    var franchiseId = json.rosters.franchise[i].id;
    //Logger.log(franchiseId);
    
    for(var j=0; j<players.length; j++){
      
      //push columm values onto the array, ensure salary is converted to a float so we can sum it with a function later
      dataDetails.push([franchiseId, players[j].id, parseFloat(players[j].salary, 10.00), players[j].contractYear, players[j].contractStatus, players[j].contractInfo, players[j].status]); 
         
    }
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActiveSheet();
  //setting range in sheet with sepecific coordinate because functions will be used in the sheet in other columns 
  /*TODO: write functions with scripts so we don't have to do this.
  */
  var range = sheet.getRange(1,5,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  Logger.log("funcEnd");
  
}

function getLeagueData_(){
  
  getLeagueData("http://www76.myfantasyleague.com/2018/export?TYPE=league&L=42427&APIKEY=&JSON=1");
  
}

/**
* Imports league data from MFL to your spreadsheet Ex: getdata("http://www76.myfantasyleague.com/2018/export?TYPE=league&L=42427&APIKEY=&JSON=1")
* @param url of your JSON data as string
*/
function getLeagueData(url){
  
  Logger.log("funcBegin");
  var res = UrlFetchApp.fetch(url);
  var content = res.getContentText();
  var json = JSON.parse(content);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Franchise ID","Franchise Name"]);
  
  for(var i=0; i<json.league.franchises.franchise.length; i++){
   
    //push columm values onto the array
    dataDetails.push([json.league.franchises.franchise[i].id, json.league.franchises.franchise[i].name]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActiveSheet();
  //setting range in sheet with sepecific coordinate because functions will be used in the sheet in other columns 
  /*TODO: write functions with scripts so we don't have to do this.
  */
  var range = sheet.getRange(1,3,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  Logger.log("funcEnd");
  
}

function getFreeAgentData_(){
  
  getFreeAgentData("http://www76.myfantasyleague.com/2018/export?TYPE=freeAgents&L=42427&APIKEY=&POSITION=&JSON=1");
  
}

/**
* Imports free agent data from MFL to your spreadsheet Ex: getFreeAgentData("http://www76.myfantasyleague.com/2018/export?TYPE=freeAgents&L=42427&APIKEY=&POSITION=&JSON=1")
* @param url of your JSON data as string
*/
function getFreeAgentData(url){
  
  Logger.log("funcBegin");
  var res = UrlFetchApp.fetch(url);
  var content = res.getContentText();
  var json = JSON.parse(content);
  var data = [];
  var dataDetails = [];
  
  //push columm header onto the array
  dataDetails.push(["Player ID"]);
 
  for(var i=0; i<json.freeAgents.leagueUnit.player.length; i++){
    
    //push columm value onto the array
    dataDetails.push([json.freeAgents.leagueUnit.player[i].id]);
    
  }
  
  data = dataDetails;
 
  var sheet = SpreadsheetApp.getActiveSheet();
  //setting range in sheet with sepecific coordinate because functions will be used in the sheet in other columns 
  /*TODO: write functions with scripts so we don't have to do this.
  */
  var range = sheet.getRange(1,5,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  Logger.log("funcEnd");
    
}

function getAllPlayerData_(){
  
  getAllPlayerData("https://www75.myfantasyleague.com/2018/export?TYPE=players&DETAILS=&SINCE=&PLAYERS=&JSON=1");
  
}

/**
* Imports all player data from MFL to your spreadsheet Ex: getAllPlayerData("https://www75.myfantasyleague.com/2018/export?TYPE=players&DETAILS=&SINCE=&PLAYERS=&JSON=1")
* @param url of your JSON data as string
*/
function getAllPlayerData(url){
  
  Logger.log("funcBegin");
  var res = UrlFetchApp.fetch(url);
  var content = res.getContentText();
  var json = JSON.parse(content);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Player ID", "Name", "Position", "Team"]);
 
  for(var i=0; i<json.players.player.length; i++){
  
    var pos = json.players.player[i].position;
  
    //push columm value onto the array, we only want the positions used in our league, so filtering here for them. 
    if (pos == "QB" || pos == "RB" || pos == "WR" || pos == "TE" || pos == "Def" || pos == "PK")
      dataDetails.push([json.players.player[i].id, json.players.player[i].name, json.players.player[i].position, json.players.player[i].team]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActiveSheet();
  //setting range in sheet with sepecific coordinate because functions will be used in the sheet in other columns 
  /*TODO: write functions with scripts so we don't have to do this.
  */
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  Logger.log("funcEnd");
  
}

function getSalaryAdjustmentData_(){
  
  var url = "http://www76.myfantasyleague.com/2017/export?TYPE=salaryAdjustments&L=42427&APIKEY=&JSON=1";
  getSalaryAdjustmentData(url);
  
}



/**
* Imports salary adjustment data from MFL to your spreadsheet Ex: getSalaryAdjustmentData("http://www76.myfantasyleague.com/2017/export?TYPE=salaryAdjustments&L=42427&APIKEY=&JSON=1")
* @param url of your JSON data as string, note, specify current year - 1
*/
function getSalaryAdjustmentData(url){
  
  Logger.log("funcBegin");
  var res = UrlFetchApp.fetch(url);
  var content = res.getContentText();
  var json = JSON.parse(content);
  var data = [];
  var dataDetails = [];
  var salary;
  var playerName;
  var currentContractYear;
  var contractLength;
  var stripSalary;
  
  //push columm headers onto the array
  dataDetails.push(["Franchise ID", "Player", "Current Salary", "Contract Year", "Contract Length"]);
 
  //this is some made up witch craft I made up because MFL does not normalize the data for the description of the adjustment.  e.g., salary, contract info, length, and current year.  Our league uses this data for as a cap penalay carryover to the next year if the player dropped was under contract.
  for(var i=0; i<json.salaryAdjustments.salaryAdjustment.length; i++){

    var descr = json.salaryAdjustments.salaryAdjustment[i].description;
    var franchiseId = json.salaryAdjustments.salaryAdjustment[i].franchise_id;
    
    if (descr){
      //we only need to process the salary adjustments that the 2017 site proceesed throughout the year, these will always end in a ")"
      if (descr.indexOf(")")>-1){
        
       var player = descr.split("(");
       //Logger.log("Player Name "+player[0]);
       playerName = player[0];
        
       player = player[1].substring(0, player[1].length-1);
         
       var valArray = player.split(",");
       
       if (valArray.length == 2) {
       
         salary = valArray[0].split(":");
         stripSalary = salary[1].substring(2);
         //Logger.log(stripSalary);
         currentContractYear = valArray[1].split(":");
	
         dataDetails.push([franchiseId, playerName, parseFloat(stripSalary,100.00), parseInt(currentContractYear[1],10),1]);
         	
       }
       
       if (valArray.length == 3 && descr.indexOf("Contract Info")==-1){
       
         
         salary = valArray[0].split(":");
         stripSalary = salary[1].substring(2);
         //Logger.log(stripSalary);
         currentContractYear = valArray[1].split(":");
         contractLength = valArray[2].split(":");
         
         dataDetails.push([franchiseId, playerName, parseFloat(stripSalary,100.00), parseInt(currentContractYear[1],10), parseInt(contractLength[1],10)]);    
         
       }
       
       if (valArray.length == 3 && descr.indexOf("Contract Info")>-1){
       
         salary = valArray[0].split(":");
         stripSalary = salary[1].substring(2);
         //Logger.log(stripSalary);
         currentContractYear = valArray[2].split(":");
         
         dataDetails.push([franchiseId, playerName, parseFloat(stripSalary,100.00), parseInt(currentContractYear[1],10), 1]);     
         
       }
       
       if (valArray.length == 4){
       
         salary = valArray[0].split(":");
         stripSalary = salary[1].substring(2);
         //Logger.log(stripSalary);
         currentContractYear = valArray[2].split(":");
         contractLength = valArray[3].split(":");
        
        dataDetails.push([franchiseId, playerName, parseFloat(stripSalary,100.00), parseInt(currentContractYear[1],10), parseInt(contractLength[1],10)]);   
         
       }
       
        
      }
    
    }
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActiveSheet();
  //setting range in sheet with sepecific coordinate because functions will be used in the sheet in other columns 
  /*TODO: write functions with scripts so we don't have to do this.
  */
  var range = sheet.getRange(1,2,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  Logger.log("funcEnd");
  
}