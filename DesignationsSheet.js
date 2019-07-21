
function setDecValidation_(){

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Designations");
  var listSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Lists");
  //get entire sheet in memeory to reduce transactions.
  var listSheetValues = listSheet.getSheetValues(1, 1, listSheet.getLastRow(), listSheet.getLastColumn());
  var numRows = listSheet.getLastRow();
  
  var lists = listSheet.getRange(1, 1, 1, listSheet.getLastColumn()).getValues(); 
  var range = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
  var rules = range.getDataValidations();
  
  for (var i = 0; i < rules.length; i++) {
    
    for (var j = 0; j < rules[i].length; j++) {
    
        //only process rows >= 14 (index of 13) and we only care about reading value from column 10 (index of 9)
        if (i >= 13 && j == 9){
          
          var value = range.getCell(i+1, j+1).getValue();
          
          var listIndex = lists[0].indexOf(value);
          
          if (listIndex >= 0){
            rules[i][j+3] = SpreadsheetApp.newDataValidation().requireValueInList(listBuilder_(listSheetValues, listIndex, numRows)).build();
          }
          
          
            
        }       
    
    }
  
  }
  
  //set rules all at once for the range
  range.setDataValidations(rules);
}

function listBuilder_(values, index, numRows){

    var list = [];
    
    //this the value we are processing
    Logger.log(values[0][index]);
    
    for (var i = 0; i < numRows; i++) {
    
       list[i] = (values[i][index]);
      
    }
    
    list.splice(0, 1);
  
    return list
}

/**
* Creates main menu in google sheets called MFL and under it, 6 menu items are registered.
*/
function onOpen() {
  
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Apply designations validation', functionName: 'setDecValidation_'},
    {name: 'Get all', functionName: 'getAllData_'},
    {name: 'Get rosters', functionName: 'getRosterData_'},
    {name: 'Get league', functionName: 'getLeagueData_'},
    {name: 'Get all players', functionName: 'getAllPlayerDataCS_'},
    {name: 'Get all players (previous season)', functionName: 'getAllPlayerDataPS_'},
    {name: 'Get player scores', functionName: 'getPlayerScoresDataCS_'},
    {name: 'Get player scores (previous season)', functionName: 'getPlayerScoresDataPS_'},
    {name: 'Get NFL bye weeks', functionName: 'getNFLByeWeekData_'},
    {name: 'Get all player salaries and contracts', functionName: 'getAllPlayerSalaryContractData_'},
  ];
  
  spreadsheet.addMenu('MFL', menuItems);
  
  
}

/**
* Imports roster data from MFL to your spreadsheet Ex: getdata("http://www76.myfantasyleague.com/2018/export?TYPE=rosters&L=42427&APIKEY=&FRANCHISE=&JSON=1")
* @param url of your JSON data as string
*/
function getRosterData(url, sheet, settingsSheet, notation){

  var season = retrieveSeason_(settingsSheet, notation);
  url = url.replace("####", season);
  
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
  
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheet);
  
  //clear the sheet before writing
  sheet.clear({ formatOnly: false, contentsOnly: true });
  //setting range in sheet with sepecific coordinate because functions will set in the sheet in other columns below
  var range = sheet.getRange(1,6,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //set franchise name column header
  var cell = sheet.getRange("A1");
  cell.setValue("Franchise Name");
  //set Player name column formula
  var cell = sheet.getRange(2,1,data.length-1,1);
  cell.setFormula("=VLOOKUP(F2,'League data'!$A$2:$B$11,2, FALSE)");
  
  //se team column header
  var cell = sheet.getRange("B1");
  cell.setValue("Player Name");
  //set team column formula
  var cell = sheet.getRange(2,2,data.length-1,1);
  cell.setFormula("=VLOOKUP(G2,'All Players'!$A:$E,3, FALSE)");
  
  //set Position column header
  var cell = sheet.getRange("C1");
  cell.setValue("Team");
  //set Position column formula
  var cell = sheet.getRange(2,3,data.length-1,1);
  cell.setFormula("=VLOOKUP(G2,'All Players'!$A:$E,5, FALSE)");
  
  //set Full Player Info column header
  var cell = sheet.getRange("D1");
  cell.setValue("Position");
  //set Full Player Info column formula
  var cell = sheet.getRange(2,4,data.length-1,1);
  cell.setFormula("=VLOOKUP(G2,'All Players'!$A:$E,4, FALSE)");
  
  //set Bye week column header
  var cell = sheet.getRange("E1");
  cell.setValue("Bye week");
  //set byeweek column formula
  var cell = sheet.getRange(2,5,data.length-1,1);
  cell.setFormula("=iferror(VLOOKUP(C2,'NFL Bye Weeks'!$A:$B,2,FALSE))");
  
  //set scores column header
  var cell = sheet.getRange("M1");
  cell.setValue("Player scores");
  //set scores column formula
  var cell = sheet.getRange(2,13,data.length-1,1);
  cell.setFormula("=iferror(VLOOKUP(G2,'Player Scores'!$A$2:$B,2, FALSE),0)");
  
  //set scores previous season column header
  var cell = sheet.getRange("N1");
  cell.setValue("Player scores (previous season)");
  //set scores previous season column formula
  var cell = sheet.getRange(2,14,data.length-1,1);
  cell.setFormula("=iferror(VLOOKUP(G2,'Player Scores (previous season)'!$A$2:$B,2, FALSE),0)");
  
  //set Holdout column header
  var cell = sheet.getRange("O1");
  cell.setValue("Holdout?");
  //set Holdout season column formula
  var cell = sheet.getRange(2,15,data.length-1,1);
  cell.setFormula("=OR(AND(J2<>I2,I2>1,D2=\"QB\",M2>='Top 10 Scores'!$B$11,N2>='Top 10 Scores'!$B$24,H2<'Avg Holdout Salaries'!$B$15),AND(J2<>I2,I2>1,D2=\"RB\",M2>='Top 10 Scores'!$C$11,N2>='Top 10 Scores'!$C$24,H2<'Avg Holdout Salaries'!$C$15),AND(J2<>I2,I2>1,D2=\"WR\",M2>='Top 10 Scores'!$D$11,N2>='Top 10 Scores'!$D$24,H2<'Avg Holdout Salaries'!$D$15),AND(J2<>I2,I2>1,D2=\"TE\",M2>='Top 10 Scores'!$E$11,N2>='Top 10 Scores'!$E$24,H2<'Avg Holdout Salaries'!$E$15),AND(J2<>I2,I2>1,D2=\"PK\",M2>='Top 10 Scores'!$F$11,N2>='Top 10 Scores'!$F$24,H2<'Avg Holdout Salaries'!$F$15),AND(J2<>I2,I2>1,D2=\"Def\",M2>='Top 10 Scores'!$G$11,N2>='Top 10 Scores'!$G$24,H2<'Avg Holdout Salaries'!$G$15))");
  
  //set contract elgibility column header
  var cell = sheet.getRange("P1");
  cell.setValue("Contract Eligibility");
  //set contract elgibility column formula
  var cell = sheet.getRange(2,16,data.length-1,1);
  cell.setFormula("=IF(AND(O2,Q2=1),\"Holdout_1\", if(O2,\"Holdout\", if(K2=\"Holdout (K)\",\"Unrestricted Free Agent\", if(AND(I2=J2,J2>=2), \"RFA or Franchise Eligible\", if(OR(I2=J2,J2=\"\"), \"RFA Eligible\", \"Under Contract\")))))");

  //set contract years remaining column header
  var cell = sheet.getRange("Q1");
  cell.setValue("Contract years remaining");
  //set contract years remaining column formula
  var cell = sheet.getRange(2,17,data.length-1,1);
  cell.setFormula("=iferror(if(AND(J2<>\"\"),J2-I2,0))"); 
  
  //set RFA starting bid remaining column header
  var cell = sheet.getRange("R1");
  cell.setValue("RFA starting bid");
  //set RFA starting bid column formula
  var cell = sheet.getRange(2,18,data.length-1,1);
  cell.setFormula("=IF(AND(OR(P2 = \"RFA Eligible\",P2 = \"RFA or Franchise Eligible\")), H2*0.9,\"--\")"); 

  //hiding id columns
  sheet.hideColumns(6);
  sheet.hideColumns(7);  
 
  //sheet.hideSheet();

}

/**
* Imports league data from MFL to your spreadsheet Ex: getdata("http://www76.myfantasyleague.com/2018/export?TYPE=league&L=42427&APIKEY=&JSON=1")
* @param url of your JSON data as string
*/
function getLeagueData(url, sheet, settingsSheet, notation){

  var season = retrieveSeason_(settingsSheet, notation);
  url = url.replace("####", season);

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
  
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheet);
  
  //clear the sheet before writing
  //sheet.clear({ formatOnly: false, contentsOnly: true });
  
  //setting range in sheet with sepecific coordinate because functions will be used in the sheet in other columns 
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //hiding id column
  sheet.hideColumns(1);
  
  sheet.hideSheet();
}

/**
* Imports all player data from MFL to your spreadsheet Ex: getAllPlayerData("https://www75.myfantasyleague.com/2018/export?TYPE=players&DETAILS=&SINCE=&PLAYERS=&JSON=1")
* @param url of your JSON data as string
*/
function getAllPlayerData(url, sheet, settingsSheet, notation){

  var season = retrieveSeason_(settingsSheet, notation);
  url = url.replace("####", season);

  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Player ID", "Full Player Name", "Name", "Position", "Team"]);
 
  for(var i=0; i<json.players.player.length; i++){
  
    var pos = json.players.player[i].position;
    var team = json.players.player[i].team;
    var name = json.players.player[i].name;
    var fullPlayerName = name + " " + team + " " + pos;
  
    //push columm values onto the array, we only want the positions used in our league, so filtering here for them. 
    if (pos == "QB" || pos == "RB" || pos == "WR" || pos == "TE" || pos == "Def" || pos == "PK")
      dataDetails.push([json.players.player[i].id, fullPlayerName, json.players.player[i].name, json.players.player[i].position, json.players.player[i].team]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheet);
  
  //clear the sheet before writing
  sheet.clear({ formatOnly: false, contentsOnly: true });
  
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //hiding id columns
  sheet.hideColumns(1);
  sheet.hideColumns(2);
  
  sheet.hideSheet();

}

function getAllPlayerSalaryContractData(url, sheet, settingsSheet, notation){

  var season = retrieveSeason_(settingsSheet, notation);
  url = url.replace("####", season);
   
  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Player ID", "Salary", "Contract year", "Contract status", "Contract info"]);
 
  for(var i=0; i<json.salaries.leagueUnit.player.length; i++){
    
      dataDetails.push([json.salaries.leagueUnit.player[i].id, json.salaries.leagueUnit.player[i].salary, json.salaries.leagueUnit.player[i].contractYear, json.salaries.leagueUnit.player[i].contractStatus, json.salaries.leagueUnit.player[i].contractInfo]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheet);
  
  //clear the sheet before writing
  sheet.clear({ formatOnly: false, contentsOnly: true });
  
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //set Franchise Name column header
  var cell = sheet.getRange("F1");
  cell.setValue("Position");
  var cell = sheet.getRange(2,6,data.length-1,1);
  cell.setFormula("=iferror(VLOOKUP(A2,'All Players'!$A$2:$E,4))");
      
  sheet.hideSheet();
}

/**
* Imports free agent player scores (player id, YTD points) data from MFL to your spreadsheet Ex: getPlayerScoresData("http://www76.myfantasyleague.com/2018/export?TYPE=playerScores&L=42427&W=YTD&YEAR=2017&PLAYERS=&POSITION=&STATUS=freeagent&RULES=1&COUNT=&JSON=1")
* @param url of your JSON data as string, note, specify previous season.
*/
function getPlayerScoresData(url, sheet, settingsSheet, notation, AllPlayersSheetRef){

  var season = retrieveSeason_(settingsSheet, notation);
  url = url + "&YEAR="+season;

  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Player Id", "Last YTD points"]);
 
  for(var i=0; i<json.playerScores.playerScore.length; i++){
  
    dataDetails.push([json.playerScores.playerScore[i].id, json.playerScores.playerScore[i].score]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheet);
  
  //clear the sheet before writing
  sheet.clear({ formatOnly: false, contentsOnly: true });
  
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //set Franchise Name column header
  var cell = sheet.getRange("C1");
  cell.setValue("Position");
  var cell = sheet.getRange(2,3,data.length-1,1);
  cell.setFormula("=iferror(VLOOKUP(A2,"+AllPlayersSheetRef+"!$A$2:$E,4))");
  
  sheet.hideSheet();
 
}

/**
* Imports NFL Bye week data from MFL to your spreadsheet Ex: getNFLByeWeekData("https://www70.myfantasyleague.com/2018/export?TYPE=nflByeWeeks&W=&JSON=1")
* @param url of your JSON data as string, note, specify previous season.
*/
function getNFLByeWeekData(url, sheet, settingsSheet, notation){

  var season = retrieveSeason_(settingsSheet, notation);
  url = url.replace("####", season);

  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["NFL team id", "Bye week"]);
 
  for(var i=0; i<json.nflByeWeeks.team.length; i++){
  
    dataDetails.push([json.nflByeWeeks.team[i].id, json.nflByeWeeks.team[i].bye_week]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheet);
  
  //clear the sheet before writing
  sheet.clear({ formatOnly: false, contentsOnly: true });
  
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  sheet.hideSheet();

}

function retrieveJsonData_(url){
  var res = UrlFetchApp.fetch(url);
  var content = res.getContentText();
  var json = JSON.parse(content);
  
  return json;
}

function retrieveSeason_(settingsSheetName, notation){

  var settingsSheet = SpreadsheetApp.getActive().getSheetByName(settingsSheetName);
  var cell = settingsSheet.getRange(notation);
  var season = cell.getValue();
  
  return season;
}

function getAllData_(){
  getAllPlayerDataCS_();
  getAllPlayerDataPS_();
  getLeagueData_();
  getRosterData_();
  getPlayerScoresDataCS_();
  getPlayerScoresDataPS_();
  getNFLByeWeekData_();
  getAllPlayerSalaryContractData_();
}

function getRosterData_(){
  getRosterData("http://www76.myfantasyleague.com/####/export?TYPE=rosters&L=42427&APIKEY=&FRANCHISE=&JSON=1", "Rosters", "Settings", "B1");
}

function getLeagueData_(){
  getLeagueData("http://www76.myfantasyleague.com/####/export?TYPE=league&L=42427&APIKEY=&JSON=1", "League data", "Settings", "B1"); 
}

function getAllPlayerDataCS_(){
   getAllPlayerData("https://www75.myfantasyleague.com/####/export?TYPE=players&DETAILS=&SINCE=&PLAYERS=&JSON=1", "All Players", "Settings", "B1");
}

function getAllPlayerDataPS_(){
   getAllPlayerData("https://www75.myfantasyleague.com/####/export?TYPE=players&DETAILS=&SINCE=&PLAYERS=&JSON=1", "All Players (previous season)", "Settings", "B2");
}

function getPlayerScoresDataCS_(){
  getPlayerScoresData("http://www76.myfantasyleague.com/2018/export?TYPE=playerScores&L=42427&W=YTD&PLAYERS=&POSITION=&RULES=1&COUNT=&JSON=1", "Player Scores", "Settings", "B1", "'All Players'");
}

function getPlayerScoresDataPS_(){
  getPlayerScoresData("http://www76.myfantasyleague.com/2018/export?TYPE=playerScores&L=42427&W=YTD&PLAYERS=&POSITION=&RULES=1&COUNT=&JSON=1", "Player Scores (previous season)", "Settings", "B2", "'All Players (previous season)'");
}

function getNFLByeWeekData_(){
  getNFLByeWeekData("https://www70.myfantasyleague.com/####/export?TYPE=nflByeWeeks&W=&JSON=1", "NFL Bye Weeks", "Settings", "B1");
}

function getAllPlayerSalaryContractData_(){
  getAllPlayerSalaryContractData("https://www76.myfantasyleague.com/####/export?TYPE=salaries&L=42427&APIKEY=&JSON=1", "All Player Salaries", "Settings", "B1");
}

