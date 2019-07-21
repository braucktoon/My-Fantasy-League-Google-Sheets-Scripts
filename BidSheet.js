/**
* Creates main menu in google sheets called MFL and under it, 6 menu items are registered.
*/
function onOpen() {
  
  var spreadsheet = SpreadsheetApp.getActive();
  var menuItems = [
    {name: 'Retrieve Rosters', functionName: 'getRosterData_'},
    {name: 'Retrieve League', functionName: 'getLeagueData_'},
    {name: 'Retrieve Free Agents', functionName: 'getFreeAgentData_'},
    {name: 'Retrieve All Players', functionName: 'getAllPlayerDataCS_'},
    {name: 'Retrieve Salary Adjustments', functionName: 'getSalaryAdjustmentData_'},
    {name: 'Retrieve NFL Bye Weeks', functionName: 'getNFLByeWeekData_'},
    {name: 'Retrieve Player Scores', functionName: 'getPlayerScoresDataCS_'},
    {name: 'Retrieve Draft Order', functionName: 'getDraftOrder_'},
    {name: 'Retrieve All', functionName: 'getAllData_'},
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
  cell.setFormula("=VLOOKUP(F2,'Bid Sheet'!$A$2:$B$11,2, FALSE)");
  
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

  //hiding id columns
  sheet.hideColumns(6);
  sheet.hideColumns(7);  
 
  sheet.hideSheet();

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
}

/**
* Imports free agent data from MFL to your spreadsheet Ex: getFreeAgentData("http://www76.myfantasyleague.com/2018/export?TYPE=freeAgents&L=42427&APIKEY=&POSITION=&JSON=1")
* @param url of your JSON data as string
*/
function getFreeAgentData(url, sheet, settingsSheet, notation){

  var season = retrieveSeason_(settingsSheet, notation);
  url = url.replace("####", season);

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
 
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheet);
  //clear the sheet before writing
  sheet.clear({ formatOnly: false, contentsOnly: true });
  
  //setting specific range for salary adjusment data as formulas will be set to other columns below.
  var range = sheet.getRange(1,1,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  //set Player name column header
  var cell = sheet.getRange("B1");
  cell.setValue("Player");
  //set Player name column formula
  var cell = sheet.getRange(2,2,data.length-1,1);
  cell.setFormula("=VLOOKUP(A2,'All Players'!$A:$E,3, FALSE)");
  
  //se team column header
  var cell = sheet.getRange("C1");
  cell.setValue("Team");
  //set team column formula
  var cell = sheet.getRange(2,3,data.length-1,1);
  cell.setFormula("=VLOOKUP(A2,'All Players'!$A:$E,5, FALSE)");
  
  //set Position column header
  var cell = sheet.getRange("D1");
  cell.setValue("Position");
  //set Position column formula
  var cell = sheet.getRange(2,4,data.length-1,1);
  cell.setFormula("=VLOOKUP(A2,'All Players'!$A:$E,4, FALSE)");
  
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
  cell.setFormula("=iferror(VLOOKUP(A2,'Player Scores'!A:B, 2, FALSE),0)");
  
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
  cell.setFormula("=IF(COUNTIF('Bid Sheet'!C:C,B2)+COUNTIF('Rookie Draft'!E:E,B2)>0,\"Not Available\",\"Available\")");
  
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

function getSalaryAdjustmentData(url, sheet, settingsSheet, notation){

  var season = retrieveSeason_(settingsSheet, notation);
  url = url.replace("####", season);
   
  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Amount", "Timestamp", "Franchise Id", "Id", "Description"]);
  //push an empty row on to the array that will contain an array formula further down in the script
  dataDetails.push(["", "", "", "", ""]);
  
 
  for(var i=0; i<json.salaryAdjustments.salaryAdjustment.length; i++){
  
      dataDetails.push([json.salaryAdjustments.salaryAdjustment[i].amount, json.salaryAdjustments.salaryAdjustment[i].timestamp, json.salaryAdjustments.salaryAdjustment[i].franchise_id, json.salaryAdjustments.salaryAdjustment[i].id, json.salaryAdjustments.salaryAdjustment[i].description]);
    
  }
  
  data = dataDetails;
  
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheet);
  
  //clear the sheet before writing
  sheet.clear({ formatOnly: false, contentsOnly: true });
  
  //write the headers
  var range = sheet.getRange(1,2,data.length, data[0].length);
  sheet.setActiveRange(range).setValues(data);
  
  sheet.hideColumns(2, 4);
  
  //we have at least one row of data
  if (data.length-2 > 0){
  
      //set Franchise Name column header
      var cell = sheet.getRange("A1");
      cell.setValue("Franchise Name");
      //set Franchise Name column formula
      var cell = sheet.getRange(3,1,data.length-2,1);
      cell.setFormula("=VLOOKUP(D3,'Bid Sheet'!$A$2:$B$11,2, FALSE)");
      
      //set date column header
      var cell = sheet.getRange("G1");
      cell.setValue("Date");
      //set date column formula
      var cell = sheet.getRange(3,7,data.length-2,1);
      cell.setFormula("=C3/86400+date(1970,1,1)");
      
      //set salary column header
      var cell = sheet.getRange("H1");
      cell.setValue("Salary");
      //set date column formula
      var cell = sheet.getRange(2,8,1,1);
      cell.setFormula("=iferror(ArrayFormula(if(len(F2:F), split(regexreplace(F2:F, \"[^\.,0-9]\", ), \",\")+0,)))");      
      
      //set date column header
      var cell = sheet.getRange("I1");
      cell.setValue("Current Contract Year");
      
      //set date column header
      var cell = sheet.getRange("J1");
      cell.setValue("Contract Length");
      
      //se Contract Years Remaining column header
      var cell = sheet.getRange("K1");
      cell.setValue("Contract Years Remaining");
      //set Contract Years Remaining column formula
      var cell = sheet.getRange(3,11,data.length-2,1);
      cell.setFormula("=J3-I3");
      
      //set Year 2 Salary column header
      var cell = sheet.getRange("L1");
      cell.setValue("Year 2 Salary");
      //set Year 2 Salary column formula
      var cell = sheet.getRange(3,12,data.length-2,1);
      cell.setFormula("=IF((K3>=1),((H3*0.1)+H3),0)");
      
      //set Year 3 Salary column header
      var cell = sheet.getRange("M1");
      cell.setValue("Year 3 Salary");
      //set Year 3 Salary column formula
      var cell = sheet.getRange(3,13,data.length-2,1);
      cell.setFormula("=IF((K3>=2),((L3*0.1)+L3),0)");
      
      //set Year 4 Salary column header
      var cell = sheet.getRange("N1");
      cell.setValue("Year 4 Salary");
      //set Year 4 Salary column formula
      var cell = sheet.getRange(3,14,data.length-2,1);
      cell.setFormula("=IF((K3=3),((M3*0.1)+M3),0)");
      
      //set adjustment column header
      var cell = sheet.getRange("O1");
      cell.setValue("Adjustment");
      //set adjustment formula
      var cell = sheet.getRange(3,15,data.length-2,1);
      cell.setFormula("=SUM(L3,M3,N3)*0.1");
  }
  
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
function getDraftOrder(url, sheet, settingsSheet, notation){

  var season = retrieveSeason_(settingsSheet, notation);
  url = url.replace("####", season);

  var json = retrieveJsonData_(url);
  var data = [];
  var dataDetails = [];
  
  //push columm headers onto the array
  dataDetails.push(["Franchise id", "Round", "Pick", "Player id", "Comments"]);
 
  for(var i=0; i<json.draftResults.draftUnit.draftPick.length; i++){
  
    dataDetails.push([json.draftResults.draftUnit.draftPick[i].franchise, json.draftResults.draftUnit.draftPick[i].round, json.draftResults.draftUnit.draftPick[i].pick, json.draftResults.draftUnit.draftPick[i].player, json.draftResults.draftUnit.draftPick[i].comments]);
    
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
  getFreeAgentData_();
  getLeagueData_();
  getRosterData_();
  getSalaryAdjustmentData_();
  getNFLByeWeekData_();
  getPlayerScoresDataCS_();
  getDraftOrder_();
}

function getRosterData_(){
  getRosterData("http://www76.myfantasyleague.com/####/export?TYPE=rosters&L=42427&APIKEY=&FRANCHISE=&JSON=1", "Rosters", "Settings", "B1");
}

function getLeagueData_(){
  getLeagueData("http://www76.myfantasyleague.com/####/export?TYPE=league&L=42427&APIKEY=&JSON=1", "Bid Sheet", "Settings", "B1"); 
}

function getFreeAgentData_(){
   getFreeAgentData("http://www76.myfantasyleague.com/####/export?TYPE=freeAgents&L=42427&APIKEY=&POSITION=&JSON=1", "Free Agents", "Settings", "B1");
}

function getAllPlayerDataCS_(){
   getAllPlayerData("https://www75.myfantasyleague.com/####/export?TYPE=players&DETAILS=&SINCE=&PLAYERS=&JSON=1", "All Players", "Settings", "B1");
}

function getSalaryAdjustmentData_(){
  getSalaryAdjustmentData("http://www76.myfantasyleague.com/####/export?TYPE=salaryAdjustments&L=42427&APIKEY=&JSON=1", "Salary Adjustments", "Settings", "B1");
}

function getNFLByeWeekData_(){
  getNFLByeWeekData("https://www70.myfantasyleague.com/####/export?TYPE=nflByeWeeks&W=&JSON=1", "NFL Bye Weeks", "Settings", "B1");
}

function getPlayerScoresDataCS_(){
  getPlayerScoresData("http://www76.myfantasyleague.com/2018/export?TYPE=playerScores&L=42427&W=YTD&PLAYERS=&POSITION=&RULES=1&COUNT=&JSON=1", "Player Scores", "Settings", "B2", "'All Players'");
}

function getDraftOrder_(){
  getDraftOrder("http://www76.myfantasyleague.com/####/export?TYPE=draftResults&L=42427&APIKEY=&JSON=1", "Draft Order", "Settings", "B1", "'All Players'");
}

