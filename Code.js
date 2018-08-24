/**
* Creates main menu in google sheets called MFL and under it, 6 menu items are registered.
*/
function onOpen() {
  
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Retrieve Roster Data', functionName: 'getRosterData_'},
    {name: 'Retrieve League Data', functionName: 'getLeagueData_'},
    {name: 'Retrieve Free Agent Data', functionName: 'getFreeAgentData_'},
    {name: 'Retrieve All Player Data', functionName: 'getAllPlayerData_'},
    {name: 'Retrieve Salary Adjustment Data', functionName: 'getSalaryAdjustmentData_'},
    {name: 'Retrieve Player Scores Data', functionName: 'getPlayerScoresData_'},
    {name: 'Retrieve NFL Bye Week Data', functionName: 'getNFLByeWeekData_'},
    {name: 'Retrieve All Data', functionName: 'getAllData_'},   
  ];
  spreadsheet.addMenu('MFL', menuItems);
}

/**
* Imports roster data from MFL to your spreadsheet Ex: getdata("http://www76.myfantasyleague.com/2018/export?TYPE=rosters&L=42427&APIKEY=&FRANCHISE=&JSON=1")
* @param url of your JSON data as string
*/
function getRosterData(url){
  
  var json = retrieveJsonData_(url);
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
  
  var sheet = SpreadsheetApp.getActive().getSheetByName("Rosters");
  //setting range in sheet with sepecific coordinate because functions will set in the sheet in other columns below
  var range = sheet.getRange(1,6,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //set franchise name column header
  var cell = sheet.getRange("A1");
  cell.setValue("Franchise Name");
  //set Player name column formula
  var cell = sheet.getRange(2,1,data.length-1,1);
  cell.setFormula("=VLOOKUP(F2,'Bid Sheet'!$C$2:$D$11,2, FALSE)");
  
  //se team column header
  var cell = sheet.getRange("B1");
  cell.setValue("Player Name");
  //set team column formula
  var cell = sheet.getRange(2,2,data.length-1,1);
  cell.setFormula("=VLOOKUP(G2,AllPlayers!$A:$D,2, FALSE)");
  
  //set Position column header
  var cell = sheet.getRange("C1");
  cell.setValue("Team");
  //set Position column formula
  var cell = sheet.getRange(2,3,data.length-1,1);
  cell.setFormula("=VLOOKUP(G2,AllPlayers!$A:$D,4, FALSE)");
  
  //set Full Player Info column header
  var cell = sheet.getRange("D1");
  cell.setValue("Position");
  //set Full Player Info column formula
  var cell = sheet.getRange(2,4,data.length-1,1);
  cell.setFormula("=VLOOKUP(G2,AllPlayers!$A:$D,3, FALSE)");
  
  //set Bye week column header
  var cell = sheet.getRange("E1");
  cell.setValue("Bye week");
  //set byeweek column formula
  var cell = sheet.getRange(2,5,data.length-1,1);
  cell.setFormula("=iferror(VLOOKUP(C2,'NFL Bye Weeks'!$A:$B,2,FALSE))");

  //hiding id columns
  sheet.hideColumns(6);
  sheet.hideColumns(7);  
}

/**
* Imports league data from MFL to your spreadsheet Ex: getdata("http://www76.myfantasyleague.com/2018/export?TYPE=league&L=42427&APIKEY=&JSON=1")
* @param url of your JSON data as string
*/
function getLeagueData(url){

  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Franchise ID","Franchise Name"]);
  
  for(var i=0; i<json.league.franchises.franchise.length; i++){
   
    //push columm values onto the array
    dataDetails.push([json.league.franchises.franchise[i].id, json.league.franchises.franchise[i].name]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActive().getSheetByName("Bid Sheet");
  //setting range in sheet with sepecific coordinate because functions will be used in the sheet in other columns 
  /*TODO: write functions with scripts so we don't have to do this.
  */
  var range = sheet.getRange(1,3,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //hiding id column
  sheet.hideColumns(3);
}

/**
* Imports free agent data from MFL to your spreadsheet Ex: getFreeAgentData("http://www76.myfantasyleague.com/2018/export?TYPE=freeAgents&L=42427&APIKEY=&POSITION=&JSON=1")
* @param url of your JSON data as string
*/
function getFreeAgentData(url){

  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm header onto the array
  dataDetails.push(["Player ID"]);
 
  for(var i=0; i<json.freeAgents.leagueUnit.player.length; i++){
    
    //push columm value onto the array
    dataDetails.push([json.freeAgents.leagueUnit.player[i].id]);
    
  }
  
  data = dataDetails;
 
  var sheet = SpreadsheetApp.getActive().getSheetByName("Free Agents");
  //setting specific range for salary adjusment data as formulas will be set to other columns below.
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //set Player name column header
  var cell = sheet.getRange("B1");
  cell.setValue("Player");
  //set Player name column formula
  var cell = sheet.getRange(2,2,data.length-1,1);
  cell.setFormula("=VLOOKUP(A2,AllPlayers!$A:$D,2, FALSE)");
  
  //se team column header
  var cell = sheet.getRange("C1");
  cell.setValue("Team");
  //set team column formula
  var cell = sheet.getRange(2,3,data.length-1,1);
  cell.setFormula("=VLOOKUP(A2,AllPlayers!$A:$D,4, FALSE)");
  
  //set Position column header
  var cell = sheet.getRange("D1");
  cell.setValue("Position");
  //set Position column formula
  var cell = sheet.getRange(2,4,data.length-1,1);
  cell.setFormula("=VLOOKUP(A2,AllPlayers!$A:$D,3, FALSE)");
  
  //set Full Player Info column header
  var cell = sheet.getRange("E1");
  cell.setValue("Full Player Info");
  //set Full Player Info column formula
  var cell = sheet.getRange(2,5,data.length-1,1);
  cell.setFormula("=CONCATENATE(B2, \" \", C2, \" \", D2)");
  
  //set Full Player score column header
  var cell = sheet.getRange("F1");
  cell.setValue("Last YTD points");
  //set Full Player score column formula
  var cell = sheet.getRange(2,6,data.length-1,1);
  cell.setFormula("=iferror(VLOOKUP(A2,'Free Agent Scores'!A:B, 2, FALSE),0)");
  
  //set NFL Bye week column header
  var cell = sheet.getRange("G1");
  cell.setValue("Bye week");
  //set Full Player score column formula
  var cell = sheet.getRange(2,7,data.length-1,1);
  cell.setFormula("=iferror(vlookup(C2,'NFL Bye Weeks'!$A:$B,2, FALSE))");
  
  //set Full Player score column header
  var cell = sheet.getRange("H1");
  cell.setValue("Status");
  //set Full Player score column formula
  var cell = sheet.getRange(2,8,data.length-1,1);
  cell.setFormula("=IF(COUNTIF('Bid Sheet'!A:A,E2)+COUNTIF('Rookie Draft'!E:E,E2)>0,\"Not Available\",\"Available\")");
  
  //hiding id column
  sheet.hideColumns(1);
  //hiding available column
  sheet.hideColumns(8);
  sheet.sort(6, false);
}

/**
* Imports all player data from MFL to your spreadsheet Ex: getAllPlayerData("https://www75.myfantasyleague.com/2018/export?TYPE=players&DETAILS=&SINCE=&PLAYERS=&JSON=1")
* @param url of your JSON data as string
*/
function getAllPlayerData(url){

  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Player ID", "Name", "Position", "Team"]);
 
  for(var i=0; i<json.players.player.length; i++){
  
    var pos = json.players.player[i].position;
  
    //push columm values onto the array, we only want the positions used in our league, so filtering here for them. 
    if (pos == "QB" || pos == "RB" || pos == "WR" || pos == "TE" || pos == "Def" || pos == "PK")
      dataDetails.push([json.players.player[i].id, json.players.player[i].name, json.players.player[i].position, json.players.player[i].team]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActive().getSheetByName("AllPlayers");
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //hiding id columns
  sheet.hideColumns(1);
}

/**
* Imports salary adjustment data from MFL to your spreadsheet Ex: getSalaryAdjustmentData("http://www76.myfantasyleague.com/2017/export?TYPE=salaryAdjustments&L=42427&APIKEY=&JSON=1")
* @param url of your JSON data as string, note, specify previous season.
*/
function getSalaryAdjustmentData(url){

  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  var salary;
  var playerName;
  var currentContractYear;
  var contractLength;
  var stripSalary;
  
  //push columm headers onto the array
  dataDetails.push(["Franchise ID", "Player", "Current Salary", "Contract Year", "Contract Length"]);
 
  //this is some witch craft I made up because MFL does not normalize the data for the description of the adjustment.  e.g., salary, contract info, length, and current year.  Our league uses this data for as a cap penalty carryover to the next season, if the player dropped was under contract.
  for(var i=0; i<json.salaryAdjustments.salaryAdjustment.length; i++){

    var descr = json.salaryAdjustments.salaryAdjustment[i].description;
    var franchiseId = json.salaryAdjustments.salaryAdjustment[i].franchise_id;
    
    //we are going to parse the shit out of descr, and it's going to be raw and ugly and will one day break.  I obviously don't have a good grasp on regex :-)
    if (descr){
      //we only need to process the salary adjustments that the site automaticaly proceesed throughout the year, these will always end in a ")" (convention)
      if (descr.indexOf(")")>-1){
        
       //there will also always be a "(" in the description, to it's left will be the player "name".
       var player = descr.split("(");
       playerName = player[0];
       
       //to the right side of player is where the witch craft starts.
       player = player[1].substring(0, player[1].length-1);
         
       var valArray = player.split(",");
       
       if (valArray.length == 2) {
       
         salary = valArray[0].split(":");
         //need to drop leading space and dollar sign
         stripSalary = salary[1].substring(2);
         currentContractYear = valArray[1].split(":");
	
         dataDetails.push([franchiseId, playerName, parseFloat(stripSalary,100.00), parseInt(currentContractYear[1],10),1]);
         	
       }
       
       if (valArray.length == 3 && descr.indexOf("Contract Info")==-1){
       
         
         salary = valArray[0].split(":");
         stripSalary = salary[1].substring(2);
         currentContractYear = valArray[1].split(":");
         contractLength = valArray[2].split(":");
         
         dataDetails.push([franchiseId, playerName, parseFloat(stripSalary,100.00), parseInt(currentContractYear[1],10), parseInt(contractLength[1],10)]);    
         
       }
       
       if (valArray.length == 3 && descr.indexOf("Contract Info")>-1){
       
         salary = valArray[0].split(":");
         stripSalary = salary[1].substring(2);
         currentContractYear = valArray[2].split(":");
         
         dataDetails.push([franchiseId, playerName, parseFloat(stripSalary,100.00), parseInt(currentContractYear[1],10), 1]);     
         
       }
       
       if (valArray.length == 4){
       
         salary = valArray[0].split(":");
         stripSalary = salary[1].substring(2);
         currentContractYear = valArray[2].split(":");
         contractLength = valArray[3].split(":");
        
        dataDetails.push([franchiseId, playerName, parseFloat(stripSalary,100.00), parseInt(currentContractYear[1],10), parseInt(contractLength[1],10)]);   
         
       }
       
       //end witch craft, it's not witch craft because it's anything hard, just unconventional.
       
      }
    
    }
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActive().getSheetByName("Salary Adjustments");
  //setting specific range for salary adjusment data as formulas will be set to other columns below.
  var range = sheet.getRange(1,2,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //set Franchise Name column header
  var cell = sheet.getRange("A1");
  cell.setValue("Franchise Name");
  //set Franchise Name column formula
  var cell = sheet.getRange(2,1,data.length-1,1);
  cell.setFormula("=VLOOKUP(B2,'Bid Sheet'!$C$2:$D$11,2, FALSE)");
  
  //se Contract Years Remaining column header
  var cell = sheet.getRange("G1");
  cell.setValue("Contract Years Remaining");
  //set Contract Years Remaining column formula
  var cell = sheet.getRange(2,7,data.length-1,1);
  cell.setFormula("=F2-E2");
  
  //set Year 2 Salary column header
  var cell = sheet.getRange("H1");
  cell.setValue("Year 2 Salary");
  //set Year 2 Salary column formula
  var cell = sheet.getRange(2,8,data.length-1,1);
  cell.setFormula("=IF((G2>=1),((D2*0.1)+D2),0)");
  cell.setNumberFormat("00.00");
  
  //set Year 3 Salary column header
  var cell = sheet.getRange("I1");
  cell.setValue("Year 3 Salary");
  //set Year 3 Salary column formula
  var cell = sheet.getRange(2,9,data.length-1,1);
  cell.setFormula("=IF((G2>=2),((H2*0.1)+H2),0)");
  cell.setNumberFormat("00.00");
  
  //set Year 4 Salary column header
  var cell = sheet.getRange("J1");
  cell.setValue("Year 4 Salary");
  //set Year 4 Salary column formula
  var cell = sheet.getRange(2,10,data.length-1,1);
  cell.setFormula("=IF((G2=3),((I2*0.1)+I2),0)");
  cell.setNumberFormat("00.00");
  
  //set adjustment column header
  var cell = sheet.getRange("K1");
  cell.setValue("Adjustment");
  //set adjustment formula
  var cell = sheet.getRange(2,11,data.length-1,1);
  cell.setFormula("=SUM(H2,I2,J2)*0.1");
  cell.setNumberFormat("00.00");
  
  //hiding id column
  sheet.hideColumns(2);  
}

/**
* Imports free agent player scores (player id, YTD points) data from MFL to your spreadsheet Ex: getPlayerScoresData("http://www76.myfantasyleague.com/2018/export?TYPE=playerScores&L=42427&W=YTD&YEAR=2017&PLAYERS=&POSITION=&STATUS=freeagent&RULES=1&COUNT=&JSON=1")
* @param url of your JSON data as string, note, specify previous season.
*/
function getPlayerScoresData(url){

  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Player Id", "Last YTD points"]);
 
  for(var i=0; i<json.playerScores.playerScore.length; i++){
  
    dataDetails.push([json.playerScores.playerScore[i].id, json.playerScores.playerScore[i].score]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActive().getSheetByName("Free Agent Scores");
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
}

/**
* Imports NFL Bye week data from MFL to your spreadsheet Ex: getNFLByeWeekData("https://www70.myfantasyleague.com/2018/export?TYPE=nflByeWeeks&W=&JSON=1")
* @param url of your JSON data as string, note, specify previous season.
*/
function getNFLByeWeekData(url){

  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["NFL team id", "Bye week"]);
 
  for(var i=0; i<json.nflByeWeeks.team.length; i++){
  
    dataDetails.push([json.nflByeWeeks.team[i].id, json.nflByeWeeks.team[i].bye_week]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActive().getSheetByName("NFL Bye Weeks");
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
}

function retrieveJsonData_(url){
  var res = UrlFetchApp.fetch(url);
  var content = res.getContentText();
  var json = JSON.parse(content);
  
  return json;
}

function getAllData_(){
  getAllPlayerData("https://www75.myfantasyleague.com/2018/export?TYPE=players&DETAILS=&SINCE=&PLAYERS=&JSON=1");
  getFreeAgentData("http://www76.myfantasyleague.com/2018/export?TYPE=freeAgents&L=42427&APIKEY=&POSITION=&JSON=1");
  getLeagueData("http://www76.myfantasyleague.com/2018/export?TYPE=league&L=42427&APIKEY=&JSON=1");
  getRosterData("http://www76.myfantasyleague.com/2018/export?TYPE=rosters&L=42427&APIKEY=&FRANCHISE=&JSON=1");
  getSalaryAdjustmentData("http://www76.myfantasyleague.com/2017/export?TYPE=salaryAdjustments&L=42427&APIKEY=&JSON=1");
  getPlayerScoresData("http://www76.myfantasyleague.com/2018/export?TYPE=playerScores&L=42427&W=YTD&YEAR=2017&PLAYERS=&POSITION=&STATUS=freeagent&RULES=1&COUNT=&JSON=1");
  getNFLByeWeekData("https://www70.myfantasyleague.com/2018/export?TYPE=nflByeWeeks&W=&JSON=1");
}

function getRosterData_(){
  getRosterData("http://www76.myfantasyleague.com/2018/export?TYPE=rosters&L=42427&APIKEY=&FRANCHISE=&JSON=1");
}

function getLeagueData_(){
  getLeagueData("http://www76.myfantasyleague.com/2018/export?TYPE=league&L=42427&APIKEY=&JSON=1"); 
}

function getFreeAgentData_(){
   getFreeAgentData("http://www76.myfantasyleague.com/2018/export?TYPE=freeAgents&L=42427&APIKEY=&POSITION=&JSON=1");
}

function getAllPlayerData_(){
   getAllPlayerData("https://www75.myfantasyleague.com/2018/export?TYPE=players&DETAILS=&SINCE=&PLAYERS=&JSON=1");
}

function getSalaryAdjustmentData_(){
  getSalaryAdjustmentData("http://www76.myfantasyleague.com/2017/export?TYPE=salaryAdjustments&L=42427&APIKEY=&JSON=1");
}

function getPlayerScoresData_(){
  getPlayerScoresData("http://www76.myfantasyleague.com/2018/export?TYPE=playerScores&L=42427&W=YTD&YEAR=2017&PLAYERS=&POSITION=&STATUS=freeagent&RULES=1&COUNT=&JSON=1");
}

function getNFLByeWeekData_(){
  getNFLByeWeekData("https://www70.myfantasyleague.com/2018/export?TYPE=nflByeWeeks&W=&JSON=1");
}
